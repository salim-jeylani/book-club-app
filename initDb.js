import { db } from "./db.js";

export default function initiateDatabase() {
    db.exec(`
    PRAGMA foreign_keys = ON;
    
    -- Users
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Books
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        cover_url TEXT,
        description TEXT,
        added_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
    );
    
    -- Reading Progress
    CREATE TABLE IF NOT EXISTS reading_progress (
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('not_started', 'reading', 'completed')),
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER,
        PRIMARY KEY (user_id, book_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );
    
    -- Reviews
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        body TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        UNIQUE(user_id, book_id)
    );
    
    -- Indexes (performance)
    CREATE INDEX IF NOT EXISTS idx_books_added_by ON books(added_by);
    CREATE INDEX IF NOT EXISTS idx_progress_user ON reading_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_book ON reading_progress(book_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_book ON reviews(book_id);
`);
}

