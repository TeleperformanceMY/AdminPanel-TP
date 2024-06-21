const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { Octokit } = require("@octokit/rest");
const XLSX = require('xlsx');
const app = express();
const port = 3000;

// Initialize Octokit with personal access token
const octokit = new Octokit({
    auth: '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'
});

const owner = 'TeleperformanceMY';
const rafRepo = 'RAF_multilingual';
const landingPageRepo = 'multilingual_LPTP';

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Function to update file on GitHub
async function updateGitHubFile(repo, filePath, content) {
    try {
        const { data: { sha } } = await octokit.repos.getContent({
            owner,
            repo,
            path: filePath
        });

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: filePath,
            message: `Update ${filePath}`,
            content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
            sha
        });
    } catch (error) {
        console.error('Error updating GitHub file:', error);
    }
}

// Endpoint to get RAF JSON data
app.get('/api/raf-data', (req, res) => {
    fs.readFile('raf-data.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(JSON.parse(data));
    });
});

// Endpoint to update RAF JSON data
app.post('/api/raf-data', upload.single('jsonFile'), async (req, res) => {
    let jsonData;
    if (req.file) {
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        jsonData = JSON.parse(fileContent);
    } else if (req.body.jsonData) {
        jsonData = JSON.parse(req.body.jsonData);
    }

    fs.writeFile('raf-data.json', JSON.stringify(jsonData, null, 2), async (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Update JSON on GitHub
        await updateGitHubFile(rafRepo, 'raf-data.json', jsonData);
        res.send({ message: 'RAF data updated successfully' });
    });
});

// Endpoint to update RAF video
app.post('/api/update-raf-video', upload.single('videoFile'), async (req, res) => {
    const videoFile = req.file ? req.file.path : null;

    if (!videoFile) {
        return res.status(400).send('No video file uploaded.');
    }

    fs.copyFile(videoFile, 'raf-video.mp4', async (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Update video on GitHub
        await updateGitHubFile(rafRepo, 'raf-video.mp4', videoFile);
        res.send({ message: 'RAF video updated successfully' });
    });
});

// Endpoint to update Landing Page content
app.post('/api/update-landing-page', upload.fields([
    { name: 'videoEn', maxCount: 1 },
    { name: 'videoJp', maxCount: 1 },
    { name: 'videoCn', maxCount: 1 },
    { name: 'background', maxCount: 1 },
    { name: 'excelFile', maxCount: 1 }
]), async (req, res) => {
    const { text, text2 } = req.body;
    const videoEn = req.files['videoEn'] ? req.files['videoEn'][0].path : null;
    const videoJp = req.files['videoJp'] ? req.files['videoJp'][0].path : null;
    const videoCn = req.files['videoCn'] ? req.files['videoCn'][0].path : null;
    const background = req.files['background'] ? req.files['background'][0].path : null;

    let landingPageData = {
        text,
        text2,
        videoEn,
        videoJp,
        videoCn,
        background
    };

    if (req.files['excelFile']) {
        const filePath = req.files['excelFile'][0].path;
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        landingPageData.jsonData = jsonData;
    }

    fs.writeFile('landing-page-data.json', JSON.stringify(landingPageData, null, 2), async (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Update JSON on GitHub
        await updateGitHubFile(landingPageRepo, 'landing-page-data.json', landingPageData);
        res.send({ message: 'Landing Page content updated successfully' });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
