const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

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

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
