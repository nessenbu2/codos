import { createRequire } from 'module'
import * as uuid from 'uuid';
const require = createRequire(import.meta.url);
import Codies from './codies.js';

const port = process.env.PORT || 5000;

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 5001 });

var codies = new Codies();

const app = require('express')();
const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
});

wss.on('connection', (ws) => {
  console.log('you are connected');
  const playerId = uuid.v4();
  // TODO: add user to a team in codies
  ws.send(JSON.stringify({ codies, playerId }));
  ws.on('message', (message) => {
    var obj = JSON.parse(message);

    let resetSpymasters = false;
    if (obj.action === "click") {
      codies.selectTile(obj.word, obj.player);
    } else if (obj.action === "reset") {
      codies.resetBoard();
      resetSpymasters = true;
    } else if (obj.action === "addPlayer") {
      codies.addPlayer(obj.player);
      client.send(JSON.stringify(codies));
      console.log(JSON.stringify(codies));
    }

    wss.clients.forEach(client => {
      if (client.readyState == WebSocket.OPEN) {
        client.send(JSON.stringify({
          codies,
          playerId,
          resetSpymasters,
        }));
      }
    });
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
