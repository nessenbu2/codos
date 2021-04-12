import { createRequire } from 'module'
const require = createRequire(import.meta.url);
import Codies from './codies.js';

const port = process.env.PORT || 5000;

var codies = new Codies();

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const app = require('express')();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});

io.on("connection", (socket) => {
  console.log("new connection");

  socket.on("disconnect", () => {
    console.log("disconnected:");
  });
});

const getApiAndEmit = socket => {
  socket.emit("StateUpdated", {codies: JSON.stringify(codies)});
}

// console.log that your server is up and running
server.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
  res.send({ codies: JSON.stringify(codies)});
});

app.post('/update_board', jsonParser, (req, res) => {
  codies.selectTile(req.body.word, req.body.player);
  io.emit("BoardState", {codies: JSON.stringify(codies)});
  console.log(codies);
});
