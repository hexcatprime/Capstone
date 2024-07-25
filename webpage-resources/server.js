const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');   
const multer = require('multer');
const cors = require('cors');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

// configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'csv'));
    },
    filename: (req, file, cb) => {
        cb(null, 'latest.csv');
    }
});

const upload = multer({ storage: storage });

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '..')));
app.use('/pkg', express.static(path.join(__dirname, '..', 'pkg')));

app.get('/latest-csv', (req, res) => {
    const latestCsvPath = path.join(__dirname, '..', 'csv', 'latest.csv');


    if (fs.existsSync(latestCsvPath)) {
        res.send('/csv/latest.csv');
    } else {
        res.status(404).send('CSV file not found.');
    }
});

// for updateCsv.js
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

// for updateCsv.js
app.get('/fetchLatestCsv', (req, res) => {
    const csvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    res.sendFile(csvPath);
});

// for newMovie.js
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

// for importCsv.js
app.post('/upload', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.send('File uploaded and saved');
});

// for updateCsv.js
app.post('/save-csv-data', (req, res) => {
    // path
    const csvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    const data = req.body;

    // check invalid data format
    if (!Array.isArray(data) || data.length === 0 || !data[0] || typeof data[0] !== 'object') {
        console.error('Invalid data format received.');
        return res.status(400).send('Invalid data format.');
    }

    // join
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

    // replace data in the csv file
    fs.writeFile(csvPath, csvLines, (err) => {
        if (err) {
            console.error('Error writing CSV file:', err);
            return res.status(500).send('Error writing CSV file.');
        }
        console.log('CSV data updated successfully.');
        res.status(200).send('CSV data updated successfully.');
    });
});

// port 3000    
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});