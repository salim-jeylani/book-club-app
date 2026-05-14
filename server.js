import express from 'express';
import path from "path";
import { db } from "./db.js";
import { fileURLToPath } from "url";
import expressLayouts from "express-ejs-layouts";
import morgan from "morgan";
import favicon from "serve-favicon";
import formidable from "formidable";
import passwordHasher from "pbkdf2-password";
import initiateDatabase from "./initDb.js";
import session from "express-session";

// initializing
const app = express();
const password_hasher = passwordHasher();
const port = 3000;
const env = {
    session_secret: "e3856b6b4332f334fd839cfe901a5ce9037958df2b03d00db8bc116143a51459",
    cookie_name: "sessionId",
    cookie_domain: "localhost"
}
//initiateDatabase();

// app settings
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("layout", path.join(__dirname, "views/layouts/base"))
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");


// middlewares
app.use(session({
    secret: env.session_secret,
    unset: "destroy",
    name: env.cookie_name,
    proxy: false,
    resave: false,
    rolling: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 10 * 60 * 1000, // 10 min in ms
        httpOnly: true,
        secure: false,
        path: "/",
        domain: env.cookie_domain,
        sameSite: "lax"
    }
}));
app.use((req, res, next) => {
    res.locals.user= req.session.user;
    next();
})
app.use(favicon(path.join(__dirname,"public", "favicon.ico"))); // has to be before morgan middleware
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname,"public")));
app.use(expressLayouts);


function isAuthenticated(req, res, next) {
    if(req.session && req.session.user) {
        next()
    } else {
        req.session.returnTo = req.originalUrl;
        req.session.save((err) => {
            if(err) return next(err);
            res.redirect("/auth/login")
        })
    }
}

function isNotAuthenticated(req, res, next) {
    if(req.session && req.session.user) {
        res.redirect("/")
    } else {
        return next();
    }
}

// routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { title: "Book Club App" });
})

app.get("/restricted", isAuthenticated, (req, res) => {
    res.render("restricted", { title: "restricted" });
})

app.get("/auth/register", isNotAuthenticated, (req, res) => {
    if(req.session && req.session.user) {
        res.redirect("/restricted");
    } else {
        res.render("auth/register", { title: "Registration" });
    }
})

app.post("/auth/register", isNotAuthenticated, (req, res, next) => {
    let form = formidable();

    form.parse(req)
    .then(([fields, files]) => {
        let input = {
            username:fields["username"][0],
            email: fields["email"][0],
            password: fields["password"][0],
        };

        // hash password
        password_hasher({ password: input.password }, (err, pass, salt, hash) => {
            if(err) {
                throw err;
            }

            let output = {
                username: input.username,
                email: input.email,
                password_hash: hash,
                password_salt: salt
            }

            // save user to db
            let stmt = db.prepare("INSERT INTO users (username, email, password_hash, password_salt) VALUES(@username, @email, @password_hash, @password_salt)");
            stmt.run(output);

            // redirect to log in
            res.redirect(303, "/auth/login");
        });

    })
    .catch(err => {
        next(err);
    });
});

app.get("/auth/login", isNotAuthenticated, (req, res) => {
    res.render("auth/login", { title: "Login" });
})

app.post("/auth/login", isNotAuthenticated, (req, res, next) => {
    let form = formidable();
    form.parse(req)
        .then(([fields, files]) => {
            let input = {
                email: fields["email"][0],
                password: fields["password"][0],
            }

            // check if user exist
            let stmt = db.prepare("SELECT id, username, email, password_hash, password_salt FROM users WHERE email = @email");
            let user_get = stmt.get({ email: input.email });
            // user does not exist
            if(!user_get) {
                res.redirect("/auth/login");
                return;
            }

            // then check if password hash match
            password_hasher({ password: input.password, salt: user_get.password_salt }, (err, pass, salt, hash) => {
                if(err) return next(err);

                // password did not match
                if(hash !== user_get.password_hash) {
                    res.redirect("/auth/login");
                    return;
                }

                // everything good? regenerate session
                let returnTo = req.session.returnTo || "/";
                req.session.regenerate((err) => {
                    if(err) return next(err);
                    req.session.user = {
                        id: user_get.id,
                        username: user_get.username,
                        email: user_get.email
                    }
                    req.session.save((err) => {
                        if(err) return next(err);
                        res.redirect(returnTo);
                    })
                })

            })
        })
        .catch(err => next(err));
});

app.post("/auth/logout", (req, res, next) => {
    // destroy user session
    req.session.destroy((err) => {
        if(err) return next(err);
        res.clearCookie("sessionId")
        res.redirect("/auth/login");
    })
})


// listening
const server = app.listen(port, "localhost", () => {
    console.log(`app listening on port ${port}`);
})
// cleaning up
const gracefulShutdown = (signal) => () => {
    try {
        console.log(`\n${signal} signal received: \n\tclosing database connection \n\tclosing HTTP server`)
        // closing db
        db.close();
        console.log("Database connection closed")
        // closing http server
        server.close(() => {
            console.log('HTTP server closed');
            process.exit();
        });
        server.closeAllConnections();
        server.closeIdleConnections();
    } catch(e) {
        console.error(e.message);
    }
}

process.on('SIGHUP', gracefulShutdown("SIGHUP"));
process.on('SIGINT', gracefulShutdown("SIGINT"));
process.on('SIGTERM', gracefulShutdown("SIGTERM"));
