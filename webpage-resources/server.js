const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');   
const multer = require('multer');
const cors = require('cors');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

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
        // Use original file name for video
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
            console.error('Error reading CSV file:', err);
            res.status(500).send('Error reading CSV file.');
        });
});

app.get('/fetchLatestCsv', (req, res) => {
    const csvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    res.sendFile(csvPath);
});

app.get('/get-video', (req, res) => {
    // Replace 'your_video_file.mp4' with dynamic filename if needed
    const videoPath = path.join(__dirname, '..', 'uploads', 'your_video_file.mp4');
    
    console.log('Request for video file:', videoPath);

    if (fs.existsSync(videoPath)) {
        res.sendFile(videoPath);
    } else {
        res.status(404).send('Video file not found.');
    }
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
            console.error('Error appending to CSV file:', err);
            return res.status(500).send('Error appending to CSV file.');
        }
        console.log('Row appended successfully.');
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
        console.error('Invalid data format received.');
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
            console.error('Error writing CSV file:', err);
            return res.status(500).send('Error writing CSV file.');
        }
        console.log('CSV data updated successfully.');
        res.status(200).send('CSV data updated successfully.');
    });
});

// new route for video uploads
app.post('/upload-video', uploadVideo.single('videoFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No video file uploaded');
    }

    // Log file information
    console.log('Received upload-video request');
    console.log('File info:', req.file);

    // No need to manually move file, multer does it for you
    res.send('Video file uploaded successfully');
});

// port 3000    
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
