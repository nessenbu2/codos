import { createRequire } from 'module'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { BASE_WORDS } from './words.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Used for reading CSVs. Is there a better way? Maybe!
const fs = require('fs');
const parse = require('csv-parse');

// This defines the main game logic. Things like generating maps,
// tracking players, tracking who's turn it is, and making updates
// to the game.

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function findPlayer(playerId, playerArray) {
  return playerArray.findIndex(player => player.id === playerId);
}

// Single tile on the board
class Tile {
  constructor(word, color) {
    this.word = word;
    this.color = color;
    this.selected = false;
  }
}

// Player object. No color since that is organized by
// the board class itself
class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
  }
}

export default class Codies {
  generateBoard() {
    // Shuffle the board
    var words = shuffleArray(BASE_WORDS);

    // Pick which team goes first
    const redFirst = Math.random() > 0.5;
    var redTiles = [];
    var blueTiles = [];

    // Which ever team goes first gets 9 words
    if (redFirst) {
      words.slice(0, 9).forEach(word => redTiles.push(new Tile(word, "red")));
      words.slice(9, 17).forEach(word => blueTiles.push(new Tile(word, "blue")));
    } else {
      words.slice(0, 8).forEach(word => redTiles.push(new Tile(word, "red")));
      words.slice(8, 17).forEach(word => blueTiles.push(new Tile(word, "blue")));
    }

    var grayTiles = [];
    words.slice(17, 24).forEach(word => grayTiles.push(new Tile(word, "gray")));

    var blackTiles = [new Tile(words[24], "black")];
    this.tiles = shuffleArray(redTiles.concat(blueTiles, grayTiles, blackTiles));
  }

  constructor() {
    this.redTeam = [];
    this.blueTeam = [];
    this.generateBoard();
  }

  addPlayer(playerName, playerId) {
    if (this.redTeam.length > this.blueTeam.length) {
        this.blueTeam.push(new Player(playerName, playerId));
    } else {
        this.redTeam.push(new Player(playerName, playerId));
    }
  }

  removePlayer(playerId) {
    const index = findPlayer(playerId, this.redTeam);
    if (index > -1) {
      this.redTeam.splice(index, 1);
    } else {
      const index = findPlayer(playerId, this.redTeam);
      if (index > -1) {
        this.blueTeam.splice(index, 1);
      }
    }
  }

  selectTile(word, playerName) {
    const tileIndex = this.tiles.findIndex(tile => tile.word === word);
    if (tileIndex > -1) {
      this.tiles[tileIndex].selected = true;
    }
  }

  resetBoard() {
    this.generateBoard();
  }

  shuffleTeams() {
    var allPlayers = this.redTeam.concat(this.blueTeam);
    var redTeamCount = allPlayers.length / 2;

    if (allPlayers.length % 2 === 1) {
      redTeamCount += Math.random() > 0.5 ? 1 : 0;
    }

    this.redTeam = allPlayers.slice(0, redTeamCount);
    this.blueTeam = allPlayers.slice(redTeamCount);
  }

  swapTeams(playerId) {
    const index = findPlayer(playerId, this.redTeam);
    if (index > -1) {
      var player = this.redTeam[index];
      this.redTeam.splice(index, 1);
      this.blueTeam.push(player);
    } else {
      const index = findPlayer(playerId, this.blueTeam);
      if (index > -1) {
        var player = this.blueTeam[index];
        this.blueTeam.splice(index, 1);
        this.redTeam.push(player);
      }
    }
  }
}

