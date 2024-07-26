const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const csv = require('csv-parser');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true});
}

// configure multer for CSV file storage
const csvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'csv'));
    },
    filename: (req, file, cb) => {
        cb(null, 'latest.csv');
    }
});

// configure multer for video file storage
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const uploadCsv = multer({ storage: csvStorage });
const uploadVideo = multer({ storage: videoStorage });

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '..')));
app.use('/pkg', express.static(path.join(__dirname, '..', 'pkg')));

// existing CSV-related routes
app.get('/latest-csv', (req, res) => {
    const latestCsvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    if (fs.existsSync(latestCsvPath)) {
        res.send('/csv/latest.csv');
    } else {
        res.status(404).send('CSV file not found.');
    }
});

app.get('/get-csv-data', (req, res) => {
    const csvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    const results = [];
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
        })
        .on('error', (err) => {
            res.status(500).send('Error reading CSV file.');
        });
});

app.get('/fetchLatestCsv', (req, res) => {
    const csvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    res.sendFile(csvPath);
});

app.post('/append-csv', (req, res) => {
    const { row } = req.body;
    if (!row || !Array.isArray(row)) {
        return res.status(400).send('Invalid row data.');
    }
    const csvLine = row.join(',') + '\n';
    const csvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    fs.appendFile(csvPath, csvLine, (err) => {
        if (err) {
            return res.status(500).send('Error appending to CSV file.');
        }
        res.status(200).send('Row appended successfully.');
    });
});

app.post('/upload', uploadCsv.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.send('File uploaded and saved');
});

app.post('/save-csv-data', (req, res) => {
    const csvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0 || !data[0] || typeof data[0] !== 'object') {
        return res.status(400).send('Invalid data format.');
    }

    const header = Object.keys(data[0]);
    const csvLines = [
        header.join(','),
        ...data.map(row => {
            return header.map(fieldName => {
                const value = row[fieldName] || '';
                return `"${value.replace(/"/g, '""')}"`;
            }).join(',');
        })
    ].join('\n');

    fs.writeFile(csvPath, csvLines, (err) => {
        if (err) {
            return res.status(500).send('Error writing CSV file.');
        }
        res.status(200).send('CSV data updated successfully.');
    });
});

// new route for video uploads
app.post('/upload-video', uploadVideo.single('videoFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No video file uploaded');
    }

    const filename = path.basename(req.file.originalname);
    const targetPath = path.join(__dirname, '..', 'uploads', filename);
    const normalizedPath = path.normalize(targetPath);

    fs.rename(req.file.path, normalizedPath, (err) => {
        if (err) {
            console.error("Error renaming file:", err);
            return res.status(500).send('Error renaming file');
        }

        ffmpeg.setFfprobePath(ffprobeStatic.path);

        ffmpeg.ffprobe(normalizedPath, (err, metadata) => {
            if (err) {
                console.error("ffprobe error:", err);
                return res.status(500).send('Error processing video file.');
            }

            const format = metadata.format || {};
            const tags = format.tags || {};
            const title = tags.title ? tags.title : 'Unknown Title';
            const year = tags.date || tags.date ? tags.date.split('-')[0] : 'Unknown Year';
            
            res.json({ filename: filename, title: title, year: year });
        });
    });
});



// New route for deleting a video file
app.delete('/delete-video/:filename', (req, res) => {
    const filename = req.params.filename;
    const videoPath = path.join(__dirname, '..', 'uploads', filename);

    fs.unlink(videoPath, (err) => {
        if (err) {
            return res.status(500).send('Error deleting video file.');
        }
        res.status(200).send('Video file deleted successfully.');
    });
});

// port 3000    
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
