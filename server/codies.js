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

// Single tile on the board
class Tile {
  constructor(word, color) {
    this.word = word;
    this.color = color;
    this.selected = false;
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
    console.log(words.slice(0, 9));
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

    console.log(this.tiles);
  }

  constructor() {
    this.redTeam = [];
    this.blue_team = [];
    this.generateBoard();
  }

  addRedPlayer(player_name) {
    this.redTeam.push(player_name);
  }

  addBluePlayer(player_name) {
    this.blue_team.push(player_name);
  }

  removeRedPlayer(player_name) {
    const index = this.redTeam.indexOf(player_name);
    if (index > -1) {
      this.redTeam.splice(index, 1);
    }
  }

  removeBluePlayer(player_name) {
    const index = this.blue_team.indexOf(player_name);
    if (index > -1) {
      this.blue_team.splice(index, 1);
    }
  }

  selectTile(x, y, player_name) {
  }
}

