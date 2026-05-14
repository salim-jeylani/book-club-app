import kkk from "pbkdf2-password";

let hash = kkk();

let opts = {
    pasword:"pass123"
}

hash(opts, (err, pass, salt, hash) => {
    console.log({ err, pass, salt, hash })
})
