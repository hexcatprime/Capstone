const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');   
const multer = require('multer');
const cors = require('cors');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'csv')); // Path to save the uploaded file
    },
    filename: (req, file, cb) => {
        cb(null, 'latest.csv'); // Rename the uploaded file to 'latest.csv'
    }
});

const upload = multer({ storage: storage });

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from the root directory
app.use('/pkg', express.static(path.join(__dirname, '..', 'pkg'))); // Serve pkg directory

// Route to get the latest CSV file path
app.get('/latest-csv', (req, res) => {
    const latestCsvPath = path.join(__dirname, '..', 'csv', 'latest.csv');

    console.log('Checking CSV path:', latestCsvPath); // Debugging

    if (fs.existsSync(latestCsvPath)) {
        console.log('CSV file found, sending path:', '/csv/latest.csv'); // Debugging
        res.send('/csv/latest.csv');
    } else {
        console.error('CSV file not found:', latestCsvPath); // Debugging
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

// Route to serve the latest CSV file
app.get('/fetchLatestCsv', (req, res) => {
    const csvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    res.sendFile(csvPath);
});

// Route to append a new row to the CSV file
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

// Route to handle file upload
app.post('/upload', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    res.send('File uploaded and saved');
});


app.post('/save-csv-data', express.json(), (req, res) => {
    const csvPath = path.join(__dirname, '..', 'csv', 'latest.csv');
    const data = req.body;

    if (!Array.isArray(data) || data.length === 0) {
        return res.status(400).send('Invalid data format.');
    }

    // Use headers from the first data entry
    const header = Object.keys(data[0]).map(key => ({ id: key, title: key }));

    const writer = createObjectCsvWriter({
        path: csvPath,
        header: header
    });

    writer.writeRecords(data)
        .then(() => {
            res.status(200).send('CSV data updated successfully.');
        })
        .catch(err => {
            console.error('Error writing CSV file:', err);
            res.status(500).send('Error writing CSV file.');
        });
});




app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
