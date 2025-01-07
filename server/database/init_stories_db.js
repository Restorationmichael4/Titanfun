const sqlite3 = require('sqlite3').verbose();

// Create a new database instance
const db = new sqlite3.Database('./server/database/stories.db');

// Create the `stories` table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS stories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL
        )
    `);

    // Insert sample curated stories
    const insertStmt = db.prepare(`
        INSERT INTO stories (title, content, category) VALUES (?, ?, ?)
    `);

    insertStmt.run(
        "The Time I Forgot My Wallet",
        "I once went to a fancy restaurant and realized halfway through the meal that I forgot my wallet. My best friend covered for me, but I’ll never live it down!",
        "Funny"
    );
    insertStmt.run(
        "Chasing Dreams",
        "I quit my job and pursued my dream of becoming a writer. After years of hard work, I finally published my first book. It was all worth it.",
        "Inspirational"
    );
    insertStmt.run(
        "A Love Across Borders",
        "We met during a backpacking trip across Europe. Despite the distance, we made it work and now we’re happily married.",
        "Romantic"
    );

    insertStmt.finalize();
});

// Close the database connection
db.close();

console.log("stories.db has been initialized with sample data.");
