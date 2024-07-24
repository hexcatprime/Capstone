const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'csv', 'test.csv');

const data = [
    { column1: 'Value1', column2: 'Value2' },
    { column1: 'Value3', column2: 'Value4' }
];

const header = Object.keys(data[0]).map(key => ({ id: key, title: key }));

const writer = createObjectCsvWriter({
    path: csvPath,
    header: header
});

writer.writeRecords(data)
    .then(() => console.log('Test CSV file written successfully'))
    .catch(err => console.error('Error writing test CSV file:', err));