import { createRequire } from 'module'
const require = createRequire(import.meta.url);
import Codies from './codies.js';

const port = process.env.PORT || 5000;

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 5432 });

var codies = new Codies();

const app = require('express')();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    var obj = JSON.parse(message);

    if (obj.action === "click") {
      codies.selectTile(obj.word, obj.player);
    } else if (obj.action === "reset") {
      codies.resetBoard();
    }

    wss.clients.forEach( client => {
      if (client.readyState == WebSocket.OPEN) {
        client.send(JSON.stringify(codies));
      }
    });

  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

// GET route for initial data because I Can't g
app.get('/express_backend', (req, res) => {
  res.send({ codies: JSON.stringify(codies)});
});

