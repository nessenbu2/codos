import { createRequire } from 'module'
const require = createRequire(import.meta.url);
import Codies from './codies.js';

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const fs = require('fs');
const parse = require('csv-parse');

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' });
});

var codies = new Codies();
