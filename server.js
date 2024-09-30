const express = require('express');
const fs = require('fs');
const path = require('path');
const { getDate } = require('./modules/utils');
const messages = require('./locals/en/en.json');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000; 
        this.setupRoutes();
    }

    setupRoutes() {
        this.app.get('/getDate', this.getDateHandler.bind(this));
        this.app.get('/writeFile', this.writeFileHandler.bind(this));
        this.app.get('/readFile/:filename', this.readFileHandler.bind(this));
    }

    getDateHandler(req, res) {
        console.log('Received request:', req.query);
        const name = req.query.name || 'Guest';
        const currentTime = getDate();
        const message = messages.greeting.replace('%1', name).replace('%2', currentTime);
        console.log('Sending response:', message);
        res.send(`<p style="color: blue;">${message}</p>`);
    }

    writeFileHandler(req, res) {
        const text = req.query.text;
        if (!text) {
            return res.status(400).send('Bad Request: text query parameter is required');
        }
        const filePath = path.join(__dirname, 'file.txt');
        fs.appendFile(filePath, text + '\n', (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.send('Text appended to file successfully');
        });
    }

    readFileHandler(req, res) {
        const filename = req.params.filename;
        const filePath = path.join(__dirname, filename);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    return res.status(404).send(`File not found: ${filename}`);
                }
                console.error('Error reading file:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.send(`<pre>${data}</pre>`);
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server is running at http://localhost:${this.port}`);
        });
    }
}

const server = new Server();
server.start();