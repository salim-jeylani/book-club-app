# **Phase 1 — Project Setup**

-  [x] Create the project folder and initialize it as a Node.js project with a `package.json`

-  [x] Install core dependencies: Express, EJS, and a session manager

-  [x] Set up the entry point file (`app.js` or `server.js`)

-  [x] Configure Express to serve static files from a `public/` folder

-  [x] Set up EJS as the templating engine

-  [x] Create the base folder structure (`routes/`, `views/`, `public/`, `models/`, `middleware/`)

-  [x] Create a base EJS layout with a shared header and navigation bar

-  [x] Add a simple home page route that renders a welcome view

-  [x] Verify the server starts and the home page loads correctly

**✅  Checkpoint — ***Server starts, home page renders, folder structure is in place*****

# **Phase 2 — Data Layer**

- [x] Choose and install a lightweight database (SQLite via `better-sqlite3` is recommended)

- [x] Create a database initialization script that runs on server startup

- [x] Define the `users` table schema (id, username, email, password hash, created_at)

- [x] Define the `books` table schema (id, title, author, cover URL, description, added_by, created_at)

- [x] Define the `reading_progress` table schema (user_id, book_id, status, current_page, total_pages)

- [x] Define the `reviews` table schema (id, user_id, book_id, rating, body, created_at)

- [x] Create a central `db.js` module that connects to the database and exports it for use across the app

- [x] Verify all tables are created correctly on startup

**✅  Checkpoint — ***All database tables are created and accessible*****


# **Phase 3 — Authentication**

- [x] Create a registration page view with a form (username, email, password)

- [x] Create a route to render the registration page

- [x] Create a route to handle the registration form submission

- [x] Hash the user password before saving it to the database

- [x] Create a login page view with a form (email, password)

- [x] Create a route to render the login page

- [x] Create a route to handle login, verify credentials, and start a session

- [x] Create a route to handle logout and destroy the session

- [x] Create an authentication middleware that protects routes from unauthenticated access

- [x] Add login/logout links to the navigation bar that reflect session state

- [x] Verify registration, login, and logout work end to end
  - [ ] protect forms (register, login, logout) with csrf token

**✅  Checkpoint — ***Users can register, log in, and log out successfully*****

# **Phase 4 — Book Management**

- [ ] Create a page that lists all books in the database

- [ ] Create a route to render the book list page

- [ ] Create a form page for adding a new book (title, author, cover URL, description)

- [ ] Create a route to render the add-book form (protected)

- [ ] Create a route to handle the add-book form submission and save to the database

- [ ] Create a book detail page that shows full info for a single book

- [ ] Create a route to render the book detail page by book ID

- [ ] Create an edit-book form page pre-filled with existing data

- [ ] Create routes to render and handle the edit-book form (only for the user who added it)

- [ ] Create a route to handle book deletion (only for the user who added it)

- [ ] Verify full CRUD for books works correctly

**✅  Checkpoint — ***Books can be added, viewed, edited, and deleted*****