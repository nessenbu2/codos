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

const sockets = new Map();

wss.on('connection', (ws) => {
  const playerId = uuid.v4();
  sockets.set(ws, playerId);

  ws.on('close', () => {
    console.log(sockets.size);
    codies.removePlayer(playerId);
    wss.clients.forEach(client => {
      if (client.readyState == WebSocket.OPEN) {
        const resetSpymasters = false;
        client.send(JSON.stringify({
          codies,
          playerId,
          resetSpymasters,
        }));
      }
    });
    for (let socket of sockets.keys()) {
      // Hopefully removing an object from a map mid iteration
      // doesn't break js maps :)
      if (socket.readyState === WebSocket.CLOSED) {
        sockets.delete(ws);
      }
    }
  });

  ws.on('message', (message) => {
    var obj = JSON.parse(message);

    let resetSpymasters = false;
    if (obj.action === "click") {
      codies.selectTile(obj.word, playerId);
    } else if (obj.action === "reset") {
      codies.resetBoard();
      resetSpymasters = true;
    } else if (obj.action === "addPlayer") {
      codies.addPlayer(obj.player, playerId);
    } else if (obj.action === "shuffleTeams") {
      codies.shuffleTeams();
      codies.resetBoard();
      resetSpymasters = true;
    } else if (obj.action === "swapTeams") {
      codies.swapTeams(obj.playerId);
    }

    wss.clients.forEach(client => {
      if (client.readyState == WebSocket.OPEN) {
        const playerId = sockets.get(client);
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
