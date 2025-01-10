const express = require('express');
const fs = require('fs');
const axios = require('axios');
const app = express();
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const port = 3000;
const path = require("path");


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

// Google Drive setup
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: "titan-fun@fluted-elf-444710-u5.iam.gserviceaccount.com",
        private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC4aqq6XoYjG5Ee
CXbvNgyT05lK2cnv27XE2BUri2bWOJ65yql0/MtyjkIGsXvQ2wfjk0R7X7APh4R8
5bRnuFH8j4MEs33JqtrX3PJ6JKsDzxJQ0GT6T43AKxe0E92So2kCCC6v3rdWaW3H
Co/Pl33UjQ3I6ia35Iopb4AAnIHMV+BXCPeFhLp3H27TA5AZrRPALd8UiCJcZlhS
VBapX7XIXoH+L+4jAkO5eZUBShVBTxdW0yQfNRiHNsULgsNUaahWQ+Bt1n+Y0p2F
j/kAB3LNgEkTe9Y/HdQJhDJ8OEiNMhCzMUuYdIRWRnr8spysu1MN8juf9bmQGtN9
zcxIJCGxAgMBAAECggEAOGkwhkfJwk15a3W7stqWqFVuq63JDpznkioC98nxkA/L
xctPYKC/XvBTFBcQZ8fINv3iUdboVSfACDB/qcaBFb+UdUiubpTb0nIcne4/fa/G
y3+jk8nn82N7IbN98JAZ2+xC07tN25nuYZdCfF67t9vZ3p55b4DyHlCkGAvHzIiC
b1KP9Ijh54FTN4KtXys5kTgy17u1q4OrOviEQsbr9HS6GHVC84cLiJagT+HtaJg6
2mA+wpYdVl8zRraVQ0V0T+Ol+/9NKEstyP6rGPW9UbgZh+i5jbvhTCPTagFr6bL3
M9jPT+gZI7Q6PtHF3tEpFxI7QduijwB4t/3VWJcUHQKBgQD9ZZOyosj96Pp5oTEw
xCq0dCkkABjLwHNh9lVpoL27tZJdzi2wLGLp0/gV5POe7ew3iXU3/9dvz98xblS3
g+KiT0sxcGYHqICW5EDPuduva/bDgVVBGyqaMok3Vix/2SHd5q5LiLnmtu1hz+H4
G/hoRaDVPw9mN28hDhkKp//hRwKBgQC6T6zT6IhyWAj07bU+3KV+O6M35QNMjmvb
7hl6J4IbO3YNQ1aEzRt2QCUrt1Y6h6vSzrGW76Ibb4EIUe2YqBnsDHaIjo3JU7sB
yb75Xag0BOyC8/PrCc3spRlnpQUoTEh6HyVrcqplsUJ4dtEeiXGcnUqxBJl++Sne
O0P0aAmhRwKBgDylQ+0cAqiqStAzYPd/64yWxIXmNAkHvVWzxAtsuhwjv60NvGeO
p/m4joaG7juaS8+a6WAGrkQHZy6IbmQhf2tDOQbTFMg+btAuPsi4fbiFSWDPIl1b
qB2RfL+usyXCDNXz8MEJLxzlqPig7T8ZSqGCEJUY65GWMNWjbyDaxmXfAoGBAJNb
z0twAPPHc5YdqRwGMpLsIoVkCj7z6pVx9g6qzvoxBoco+nZhL9ZQl9XC1V3HzvwW
ZVoHQQVIJRtqiW0TkCUmGl6ZucVCB4g7hGQBUreKKXLN9t+wyoHgd36Fg9XCuBR3
LAaXE/UIxZU4DOCFPynrMpdeFvXZpubRo0bdPrijAoGACwdDLN2+1BecT52kKdY/
JjBiwgbDe8a6bM6zn/kECk0i59Pu0yZYZlQtvmvyMKKn6F1zHehqkINUVsPI/c3
LTozSJOs5PwoKimOmo4gNcAzbP/MbsLpaPwCSnrPePO+sRG3d+qqaeVYAmrXFjzh
YpPGmemG0PxLqz6SjvwOYuw=
-----END PRIVATE KEY-----`,
    },
    scopes: SCOPES,
});
const drive = google.drive({ version: 'v3', auth });

let titanFunFolderId = null;

// Function to check or create the TitanFun Stories folder
async function getOrCreateFolder() {
    if (titanFunFolderId) return titanFunFolderId;

    try {
        const searchResponse = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='TitanFun Stories'`,
            fields: 'files(id, name)',
        });

        if (searchResponse.data.files.length > 0) {
            titanFunFolderId = searchResponse.data.files[0].id;
            console.log('Folder exists with ID:', titanFunFolderId);
            return titanFunFolderId;
        }

        const createResponse = await drive.files.create({
            requestBody: {
                name: 'TitanFun Stories',
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id',
        });

        titanFunFolderId = createResponse.data.id;
        console.log('Folder created with ID:', titanFunFolderId);
        return titanFunFolderId;
    } catch (error) {
        console.error('Error creating or retrieving folder:', error);
        throw error;
    }
}

// Fetch all stories (titles only)
app.get('/api/stories', async (req, res) => {
    try {
        const folderId = await getOrCreateFolder();

        const filesResponse = await drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/json'`,
            fields: 'files(id, name)',
        });

        const stories = filesResponse.data.files.map(file => ({
            id: file.id,
            title: file.name.replace('.json', ''), // Remove the .json extension
        }));

        res.json(stories);
    } catch (err) {
        console.error('Error fetching stories:', err);
        res.status(500).json({ error: 'Error fetching stories.' });
    }
});

// Fetch a full story and increment views
app.get('/api/stories/:id', async (req, res) => {
    const storyId = req.params.id;

    try {
        const fileResponse = await drive.files.get({
            fileId: storyId,
            alt: 'media',
        });

        const story = JSON.parse(fileResponse.data);

        if (!story) {
            return res.status(404).json({ error: 'Story not found.' });
        }

        // Increment the views count
        story.views = (story.views || 0) + 1;

        // Update the story on Google Drive
        await drive.files.update({
            fileId: storyId,
            media: {
                mimeType: 'application/json',
                body: JSON.stringify(story),
            },
        });

        res.json(story);
    } catch (err) {
        console.error('Error fetching the story:', err);
        res.status(500).json({ error: 'Error fetching the story.' });
    }
});

// Submit a new story
app.post('/api/stories', async (req, res) => {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const folderId = await getOrCreateFolder();

        const story = {
            title,
            content,
            category,
            views: 0,
        };

        // Create a new JSON file on Google Drive
        const createResponse = await drive.files.create({
            requestBody: {
                name: `${title}.json`,
                parents: [folderId],
                mimeType: 'application/json',
            },
            media: {
                mimeType: 'application/json',
                body: JSON.stringify(story),
            },
        });

        res.status(201).json({ message: 'Story added successfully.', storyId: createResponse.data.id });
    } catch (err) {
        console.error('Error saving story:', err);
        res.status(500).json({ error: 'Error saving story.' });
    }
});

// Fetch trending stories
app.get('/api/stories/trending', async (req, res) => {
    try {
        const folderId = await getOrCreateFolder();

        const filesResponse = await drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/json'`,
            fields: 'files(id, name)',
        });

        const storiesPromises = filesResponse.data.files.map(async file => {
            const fileResponse = await drive.files.get({
                fileId: file.id,
                alt: 'media',
            });
            const story = JSON.parse(fileResponse.data);
            return { id: file.id, title: story.title, views: story.views || 0 };
        });

        const stories = await Promise.all(storiesPromises);

        const trending = stories
            .sort((a, b) => b.views - a.views) // Sort by views (descending)
            .slice(0, 5); // Take top 5

        res.json(trending);
    } catch (err) {
        console.error('Error fetching trending stories:', err);
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
    gpt4omini: "https://api.davidcyriltech.my.id/ai/gpt4omini?text=",
    letmegpt: "https://api.giftedtech.web.id/api/ai/letmegpt?apikey=gifted&query=",
    simsimi: "https://api.giftedtech.web.id/api/ai/simsimi?apikey=gifted&query=",
    luminai: "https://api.giftedtech.web.id/api/ai/luminai?apikey=gifted&query=",
    wwdgpt: "https://api.giftedtech.web.id/api/ai/wwdgpt?apikey=gifted&prompt="
};

app.get("/api/chatbot", async (req, res) => {
    const { chatbot, query } = req.query;

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
        if (chatbot === "chatgpt" || chatbot === "letmegpt") {
            return res.json({ message: responseData.result });
        } else if (chatbot === "blackbox") {
            return res.json({ message: responseData.response });
        } else if (["llama3", "metaai", "gpt3", "gpt4omini", "simsimi", "luminai", "wwdgpt"].includes(chatbot)) {
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

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
