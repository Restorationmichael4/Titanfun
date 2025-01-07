const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const port = 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());


// Load horoscope data
const horoscopes = JSON.parse(fs.readFileSync('./server/data/horoscopes.json', 'utf8'));

// API route for horoscope
app.get('/api/horoscope', (req, res) => {
    const birthDate = req.query.birthdate;

    if (!birthDate) {
        return res.status(400).json({ error: 'Birthdate is required.' });
    }

    // Simple validation
    const today = new Date().toISOString().split('T')[0];
    const userKey = `${birthDate}-${today}`;
    const userLogs = JSON.parse(fs.readFileSync('./server/data/logs.json', 'utf8'));

    if (userLogs[userKey]) {
        return res.status(403).json({ error: 'You can only check your horoscope once per day.' });
    }

    // Determine the horoscope
    const [day, month] = birthDate.split('/').map(Number);
    const horoscope = horoscopes.find(h => h.start.month <= month && h.end.month >= month &&
                                            h.start.day <= day && h.end.day >= day);

    if (!horoscope) {
        return res.status(404).json({ error: 'Invalid date. No horoscope found.' });
    }

    // Log user request
    userLogs[userKey] = true;
    fs.writeFileSync('./server/data/logs.json', JSON.stringify(userLogs, null, 2));

    res.json({ horoscope: horoscope.prediction });
});

// API route for pick-up lines
app.get('/api/pickup-line', (req, res) => {
    const pickupLines = JSON.parse(fs.readFileSync('./server/data/pickup-lines.json', 'utf8'));

    // Select a random line
    const randomLine = pickupLines[Math.floor(Math.random() * pickupLines.length)];
    res.json({ line: randomLine });
});

// Dictionary API route
app.get('/api/dictionary', async (req, res) => {
    const word = req.query.word;
    if (!word) {
        return res.status(400).json({ error: 'Word is required.' });
    }

    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        const data = response.data;

        // Parse the API response
        const result = {
            word: data[0].word,
            phonetic: data[0].phonetic || 'N/A',
            meanings: data[0].meanings.map(meaning => ({
                partOfSpeech: meaning.partOfSpeech,
                definitions: meaning.definitions.map(def => def.definition),
                examples: meaning.definitions.map(def => def.example).filter(Boolean)
            }))
        };

        res.json(result);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'Word not found.' });
        }
        res.status(500).json({ error: 'Error fetching data from the dictionary API.' });
    }
});

// API route for memes
app.get('/api/meme', (req, res) => {
    const memes = JSON.parse(fs.readFileSync('./server/data/memes.json', 'utf8'));

    // Select a random meme
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    res.json(randomMeme);
});

// Initialize SQLite database
const db = new sqlite3.Database('./server/database/stories.db');

// Create stories table if not exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS stories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            category TEXT
        )
    `);
});

// API route to fetch stories
app.get('/api/stories', (req, res) => {
    db.all('SELECT * FROM stories', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching stories.' });
        }
        res.json(rows);
    });
});

// API route to submit a new story
app.post('/api/stories', (req, res) => {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    db.run(
        'INSERT INTO stories (title, content, category) VALUES (?, ?, ?)',
        [title, content, category],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Error saving story.' });
            }
            res.status(201).json({ message: 'Story added successfully.' });
        }
    );
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
