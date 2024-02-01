// Budget API

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

app.use(cors());

const budget = {
    myBudget: [
        {
            title: 'Eat out',
            budget: 25
        },
        {
            title: 'Rent',
            budget: 275
        },
        {
            title: 'Grocery',
            budget: 110
        },
    ]
};

app.use('/', express.static('public'));

app.get('/budget', (req, res) => {
    // Based on https://stackoverflow.com/a/51655919
    // Set the correct content type header for JSON
    res.header("Content-Type", "application/json");

    // Send the JSON file by concatenating the current directory with the file name to get the
    // absolute path
    res.sendFile(path.join(__dirname, "budget.json"));
});

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});