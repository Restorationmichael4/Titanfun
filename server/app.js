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

// API route for comebacks
app.get('/api/comeback', (req, res) => {
    const comebacks = JSON.parse(fs.readFileSync('./server/data/comebacks.json', 'utf8'));

    // Select a random comeback
    const randomComeback = comebacks[Math.floor(Math.random() * comebacks.length)];
    res.json({ comeback: randomComeback });
});


// Chatbot API base URLs
const CHATBOT_APIS = {
    chatgpt: "https://api.davidcyriltech.my.id/ai/chatbot?query=",
    blackbox: "https://api.davidcyriltech.my.id/blackbox?q=",
    llama3: "https://api.davidcyriltech.my.id/ai/llama3?text=",
    metaai: "https://api.davidcyriltech.my.id/ai/metaai?text=",
    gpt3: "https://api.davidcyriltech.my.id/ai/gpt3?text=",
    gpt4omini: "https://api.davidcyriltech.my.id/ai/gpt4omini?text="
};

// Chatbot route
app.post("/api/chatbot", async (req, res) => {
    const { model, query } = req.body;

    // Validate input
    if (!model || !query) {
        return res.status(400).json({ error: "Model and query are required." });
    }

    // Get the API URL for the selected model
    const apiUrl = CHATBOT_APIS[model];
    if (!apiUrl) {
        return res.status(400).json({ error: "Invalid chatbot model selected." });
    }

    // Construct the full API URL
    const fullUrl = `${apiUrl}${encodeURIComponent(query)}`;

    try {
        console.log(`Fetching response from: ${fullUrl}`); // Debugging log

        // Fetch response from the chatbot API
        const apiResponse = await axios.get(fullUrl);

        // Handle different response formats
        const responseText = apiResponse.data.response || apiResponse.data.answer || "No response available.";
        res.json({ response: responseText });
    } catch (error) {
        console.error("Chatbot API error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch response from the chatbot." });
    }
});

// API Endpoints for Different Platforms
const DOWNLOAD_APIS = {
    ytmp3: "https://api.davidcyriltech.my.id/download/ytmp3?url=",
    ytmp4: "https://api.davidcyriltech.my.id/download/ytmp4?url=",
    facebook: "https://api.davidcyriltech.my.id/facebook?url=",
    instagram: "https://api.davidcyriltech.my.id/instagram?url=",
    tiktok: "https://api.davidcyriltech.my.id/download/tiktok?url=",
    mediafire: "https://api.davidcyriltech.my.id/mediafire?url=",
    twitter: "https://api.davidcyriltech.my.id/twitter?url=",
    spotifydl: "https://api.davidcyriltech.my.id/spotifydl?url=",
    gdrive: "https://api.davidcyriltech.my.id/gdrive?url="
};

// Downloader Route
app.post("/api/downloader", async (req, res) => {
    const { platform, url } = req.body;

    // Validate Input
    if (!platform || !url) {
        return res.status(400).json({ error: "Platform and URL are required." });
    }

    const apiUrl = DOWNLOAD_APIS[platform];
    if (!apiUrl) {
        return res.status(400).json({ error: "Invalid platform selected." });
    }

    try {
        // Call External API
        const fullUrl = `${apiUrl}${encodeURIComponent(url)}`;
        console.log(`Fetching from: ${fullUrl}`);
        const apiResponse = await axios.get(fullUrl);
        const responseData = apiResponse.data;

        // Parse Response Based on Platform
        if (platform === "ytmp3" || platform === "ytmp4") {
            if (responseData.status === 200 && responseData.success && responseData.result) {
                const { quality, title, thumbnail, download_url } = responseData.result;
                return res.json({
                    downloadUrl: download_url,
                    quality,
                    title,
                    thumbnail
                });
            }
        } else if (platform === "facebook") {
            if (responseData.status === 200 && responseData.success && responseData.video) {
                const { thumbnail, downloads } = responseData.video;
                const bestQuality = downloads.find((item) =>
                    item.quality.toLowerCase().includes("hd")
                ) || downloads[0];
                if (bestQuality) {
                    return res.json({
                        downloadUrl: bestQuality.downloadUrl,
                        quality: bestQuality.quality,
                        thumbnail
                    });
                }
            }
        } else if (platform === "instagram") {
            if (responseData.status === 200 && responseData.success) {
                return res.json({
                    downloadUrl: responseData.downloadUrl,
                    thumbnail: responseData.thumbnail
                });
            }
        } else if (platform === "tiktok") {
            if (responseData.status === 200 && responseData.success && responseData.result) {
                const { video, music, desc, author } = responseData.result;
                return res.json({
                    downloadUrl: video,
                    description: desc,
                    thumbnail: author.avatar,
                    authorName: author.nickname,
                    musicDownloadUrl: music
                });
            }
        } else if (platform === "mediafire") {
            if (responseData.success) {
                const { downloadLink, fileName, size, mimeType } = responseData;
                return res.json({
                    downloadUrl: downloadLink,
                    fileName,
                    size,
                    mimeType
                });
            }
        } else if (platform === "spotifydl") {
            if (responseData.status === 200 && responseData.success) {
                const { DownloadLink, title, channel, duration, thumbnail } = responseData;
                return res.json({
                    downloadUrl: DownloadLink,
                    title,
                    channel,
                    duration,
                    thumbnail
                });
            }
        } else if (platform === "twitter") {
            if (responseData.status === 200 && responseData.success) {
                const { video_hd, video_sd, audio, thumbnail, description } = responseData;
                return res.json({
                    downloadUrl: video_hd || video_sd || audio,
                    thumbnail,
                    description
                });
            }
        } else if (platform === "gdrive") {
            if (responseData.status === 200 && responseData.success) {
                const { download_link, name } = responseData;
                return res.json({
                    downloadUrl: download_link,
                    fileName: name
                });
            }
        }

        // No valid response
        return res.status(400).json({ error: "Failed to process the request." });
    } catch (error) {
        console.error("Downloader API error:", error.message);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});



// API Endpoints for Tools
const TOOL_APIS = {
    imgscan: "https://api.davidcyriltech.my.id/imgscan?url=",
    lyrics: "https://api.davidcyriltech.my.id/lyrics?t={title}&a={artist}",
    remini: "https://api.davidcyriltech.my.id/remini?url=",
    tts: "https://api.davidcyriltech.my.id/tts?text={text}&voice=Bianca",
    voiceai: "https://api.davidcyriltech.my.id/voiceai?text={text}&model={model}",
    weather: "https://api.davidcyriltech.my.id/weather?city=",
    bible: "https://api.davidcyriltech.my.id/bible?reference={reference}",
    diffusion: "https://api.davidcyriltech.my.id/diffusion?prompt=",
    flux: "https://api.davidcyriltech.my.id/flux?prompt="
};

// Universal Tool Handler
app.post("/api/tools", async (req, res) => {
    const { tool, inputs } = req.body;

    // Validate input
    if (!tool || !TOOL_APIS[tool]) {
        return res.status(400).json({ error: "Invalid tool selected." });
    }

    try {
        let apiUrl = TOOL_APIS[tool];

        // Build dynamic URL for APIs that require additional parameters
        if (tool === "lyrics") {
            apiUrl = apiUrl.replace("{title}", encodeURIComponent(inputs.title)).replace("{artist}", encodeURIComponent(inputs.artist));
        } else if (tool === "tts") {
            apiUrl = apiUrl.replace("{text}", encodeURIComponent(inputs.text));
        } else if (tool === "voiceai") {
            apiUrl = apiUrl.replace("{text}", encodeURIComponent(inputs.text)).replace("{model}", inputs.model);
        } else if (tool === "bible") {
            apiUrl = apiUrl.replace("{reference}", encodeURIComponent(inputs.reference));
        } else if (tool === "diffusion" || tool === "flux") {
            apiUrl = `${apiUrl}${encodeURIComponent(inputs.prompt)}`;
        } else if (tool === "weather") {
            apiUrl = `${apiUrl}${encodeURIComponent(inputs.city)}`;
        } else if (tool === "imgscan" || tool === "remini") {
            apiUrl = `${apiUrl}${encodeURIComponent(inputs.url)}`;
        }

        console.log(`Fetching from: ${apiUrl}`);
        const apiResponse = await axios.get(apiUrl);
        const responseData = apiResponse.data;

        // Handle response based on tool type
        if (tool === "remini" || tool === "diffusion" || tool === "flux") {
            return res.json({ mediaUrl: apiUrl });
        } else if (tool === "tts" || tool === "voiceai") {
            return res.json({
                mediaUrl: responseData.audioUrl || responseData.audio_url,
                voiceName: responseData.voice_name || responseData.model
            });
        } else if (tool === "lyrics") {
            return res.json({
                title: responseData.title,
                artist: responseData.artist,
                lyrics: responseData.lyrics
            });
        } else if (tool === "weather") {
            return res.json(responseData.data);
        } else if (tool === "bible") {
            return res.json({
                reference: responseData.reference,
                text: responseData.text,
                translation: responseData.translation
            });
        } else if (tool === "imgscan") {
            return res.json({ description: responseData.result });
        } else {
            return res.json(responseData);
        }
    } catch (error) {
        console.error("API error:", error.message);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});

const FUN_APIS = {
    truth: "https://api.davidcyriltech.my.id/truth",
    dare: "https://api.davidcyriltech.my.id/dare",
    pickupline: "https://api.davidcyriltech.my.id/pickupline",
    fact: "https://api.davidcyriltech.my.id/fact"
};

app.post("/api/fun", async (req, res) => {
    const { feature } = req.body;

    if (!feature || !FUN_APIS[feature]) {
        return res.status(400).json({ error: "Invalid feature selected." });
    }

    try {
        const apiUrl = FUN_APIS[feature];
        console.log(`Fetching from: ${apiUrl}`);

        const apiResponse = await axios.get(apiUrl);
        const responseData = apiResponse.data;

        if (feature === "truth" || feature === "dare") {
            return res.json({
                type: responseData.type,
                question: responseData.question
            });
        } else if (feature === "pickupline") {
            return res.json({ pickupline: responseData.pickupline });
        } else if (feature === "fact") {
            return res.json({ fact: responseData.fact });
        }
    } catch (error) {
        console.error("Fun Feature API error:", error.message);
        res.status(500).json({ error: "An error occurred while processing your request." });
    }
});
         
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
