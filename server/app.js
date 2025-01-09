const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const BetterSQLite3 = require('better-sqlite3');
const bodyParser = require('body-parser');
const port = 3000;
const path = require("path");
const bodyParser = require('body-parser');


app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());

// Load Horoscope Data
const horoscopeData = JSON.parse(fs.readFileSync(path.join(__dirname, "horoscope.json"), "utf-8"));

// Helper Function to Determine Zodiac Sign
const getZodiacSign = (month, day) => {
    for (let horoscope of horoscopeData) {
        const { start, end, sign, prediction } = horoscope;
        if (
            (month === start.month && day >= start.day) ||
            (month === end.month && day <= end.day)
        ) {
            return { sign, prediction };
        }
    }
    return null;
};

// Horoscope API
app.post("/api/horoscope", (req, res) => {
    const { month, day } = req.body;

    if (!month || !day) {
        return res.status(400).json({ error: "Month and day are required." });
    }

    const result = getZodiacSign(month, day);

    if (result) {
        return res.json(result);
    } else {
        return res.status(400).json({ error: "Invalid date provided." });
    }
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

// Serve the JSON file
app.get("/api/memes", (req, res) => {
    res.sendFile(path.join(__dirname, "memes.json"));
});

// Initialize SQLite database
const db = new BetterSQLite3('./server/database/stories.db');


// Ensure the stories table exists with the `views` column
db.prepare(`
    CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        category TEXT,
        views INTEGER DEFAULT 0
    )
`).run();

// API route to fetch only story titles
app.get('/api/stories', (req, res) => {
    try {
        const stories = db.prepare('SELECT id, title FROM stories').all();
        res.json(stories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching stories.' });
    }
});

// API route to fetch a full story and increment views
app.get('/api/stories/:id', (req, res) => {
    const storyId = req.params.id;

    try {
        // Increment the view count
        db.prepare('UPDATE stories SET views = views + 1 WHERE id = ?').run(storyId);

        // Fetch the full story
        const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(storyId);

        if (!story) {
            return res.status(404).json({ error: 'Story not found.' });
        }

        res.json(story);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching the story.' });
    }
});

// API route to submit a new story
app.post('/api/stories', (req, res) => {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const insert = db.prepare(
            'INSERT INTO stories (title, content, category) VALUES (?, ?, ?)'
        );
        insert.run(title, content, category);
        res.status(201).json({ message: 'Story added successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error saving story.' });
    }
});

// API route to fetch trending stories
app.get('/api/stories/trending', (req, res) => {
    try {
        const trending = db.prepare(
            'SELECT id, title, views FROM stories ORDER BY views DESC LIMIT 5'
        ).all();
        res.json(trending);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching trending stories.' });
    }
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

app.post("/api/chatbot", async (req, res) => {
    const { chatbot, query } = req.body;

    if (!chatbot || !CHATBOT_APIS[chatbot]) {
        return res.status(400).json({ error: "Invalid chatbot selected." });
    }
    if (!query) {
        return res.status(400).json({ error: "Query is required." });
    }

    try {
        const apiUrl = `${CHATBOT_APIS[chatbot]}${encodeURIComponent(query)}`;
        console.log(`Fetching from: ${apiUrl}`);

        const apiResponse = await axios.get(apiUrl);
        const responseData = apiResponse.data;

        // Parse response based on chatbot
        if (chatbot === "chatgpt") {
            return res.json({ message: responseData.result });
        } else if (chatbot === "blackbox") {
            return res.json({ message: responseData.response });
        } else if (["llama3", "metaai", "gpt3", "gpt4omini"].includes(chatbot)) {
            return res.json({ message: responseData.message });
        } else {
            return res.status(400).json({ error: "Failed to process chatbot response." });
        }
    } catch (error) {
        console.error("Chatbot API error:", error.message);
        res.status(500).json({ error: "An error occurred while processing your request." });
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

// Define Fun Feature Endpoints
const funEndpoints = {
    jokes: "https://api.giftedtech.web.id/api/fun/jokes?apikey=gifted",
    advice: "https://api.giftedtech.web.id/api/fun/advice?apikey=gifted",
    quotes: "https://api.giftedtech.web.id/api/fun/quotes?apikey=gifted",
    motivation: "https://api.giftedtech.web.id/api/fun/motivation?apikey=gifted",
    thankyou: "https://api.giftedtech.web.id/api/fun/thankyou?apikey=gifted",
    gratitude: "https://api.giftedtech.web.id/api/fun/gratitude?apikey=gifted",
    friendship: "https://api.giftedtech.web.id/api/fun/friendship?apikey=gifted",
    christmas: "https://api.giftedtech.web.id/api/fun/christmas?apikey=gifted",
    newyear: "https://api.giftedtech.web.id/api/fun/newyear?apikey=gifted",
    mothersday: "https://api.giftedtech.web.id/api/fun/mothersday?apikey=gifted",
    fathersday: "https://api.giftedtech.web.id/api/fun/fathersday?apikey=gifted",
};

// Fetch Fun Feature Data
app.get("/api/fun/:category", async (req, res) => {
    const { category } = req.params;
    const endpoint = funEndpoints[category];

    if (!endpoint) {
        return res.status(400).json({ error: "Invalid category" });
    }

    try {
        const { data } = await axios.get(endpoint);
        return res.json(data);
    } catch (error) {
        console.error(`Error fetching ${category}:`, error);
        return res.status(500).json({ error: `Failed to fetch ${category}` });
    }
});

const tempMailEndpoints = {
    create: "https://api.giftedtech.web.id/api/tempmail/create?apikey=gifted",
    check: "https://api.giftedtech.web.id/api/tempmail/check?apikey=gifted",
    content: "https://api.giftedtech.web.id/api/tempmail/content?apikey=gifted",
    delete: "https://api.giftedtech.web.id/api/tempmail/delete?apikey=gifted",
};

// Create Temporary Email
app.get("/api/tempmail/create", async (req, res) => {
    try {
        const { data } = await axios.get(tempMailEndpoints.create);
        res.json(data);
    } catch (error) {
        console.error("Error creating temporary email:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create temporary email." });
    }
});

// Check for New Mail
app.get("/api/tempmail/check", async (req, res) => {
    const { username, domain } = req.query;
    if (!username || !domain) {
        return res.status(400).json({ error: "Username and domain are required." });
    }
    const url = `${tempMailEndpoints.check}&username=${encodeURIComponent(username)}&domain=${encodeURIComponent(domain)}`;
    try {
        const { data } = await axios.get(url);
        res.json(data);
    } catch (error) {
        console.error("Error checking temporary email:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to check temporary email." });
    }
});

// Get Email Content
app.get("/api/tempmail/content", async (req, res) => {
    const { username, domain, emailId } = req.query;
    if (!username || !domain || !emailId) {
        return res.status(400).json({ error: "Username, domain, and email ID are required." });
    }
    const url = `${tempMailEndpoints.content}&username=${encodeURIComponent(username)}&domain=${encodeURIComponent(domain)}&emailId=${encodeURIComponent(emailId)}`;
    try {
        const { data } = await axios.get(url);
        res.json(data);
    } catch (error) {
        console.error("Error retrieving email content:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to retrieve email content." });
    }
});

// Delete Temporary Email
app.get("/api/tempmail/delete", async (req, res) => {
    const { username, domain } = req.query;
    if (!username || !domain) {
        return res.status(400).json({ error: "Username and domain are required." });
    }
    const url = `${tempMailEndpoints.delete}&username=${encodeURIComponent(username)}&domain=${encodeURIComponent(domain)}`;
    try {
        const { data } = await axios.get(url);
        res.json(data);
    } catch (error) {
        console.error("Error deleting temporary email:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to delete temporary email." });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
