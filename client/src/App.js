import React, { Component } from 'react';
import DarkModeButton from './colors.js';
import './App.css';

// TODO: try to reconnect on errors/disconnects
const url = process.env.NODE_ENV === 'development' ? "ws://localhost:5001" : "ws://codos.nessenbu.com:5001";
const connection = new WebSocket(url);

class Score extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redCount: props.redCount,
      blueCount: props.blueCount
    };
  }

  // See the TODO below in the Tile component :3
  componentWillReceiveProps(props) {
    this.setState({
      redCount: props.redCount,
      blueCount: props.blueCount
    });
  }

  render() {
    return (
      <div className="score-board">
        <h1 className="score-red">{this.state.redCount}</h1>
        <h1 className="score-dash"> - </h1>
        <h1 className="score-blue">{this.state.blueCount}</h1>
      </div>
    );
  }
}

class Tile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      color: props.tileColor,
      selected: props.selected,
      isSpymaster: props.isSpymaster,
      playerId: props.playerId,
    };
  }

  // TODO: I guess this is promotes poor coding practice according to the react devs.
  //       look into moving away from this later (but I finally got this to work, so
  //     I'm leaving it for now: https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
  componentWillReceiveProps(props) {
    this.setState({
      value: props.value,
      color: props.tileColor,
      selected: props.selected,
      isSpymaster: props.isSpymaster
    });
  }

  render() {
    var className = "";
    if (this.state.isSpymaster) {
      className = "tile " + (this.state.selected ? "selected-" + this.state.color : "spymaster-not-selected-" + this.state.color)
    } else {
      className = "tile " + (this.state.selected ? "selected-" + this.state.color : "not-selected")
    }
    return (
      <button
        className={className}
        onClick={async () => {
          connection.send(JSON.stringify({ action: "click", playerId: this.state.playerId, word: this.state.value}));
          this.setState({selected: true})}
        }
      >
        {this.state.value}
      </button>
    );
  }
}

class Board extends Component {
  constructor() {
    super();
    this.state = {
      isSpymaster: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
    connection.onmessage = message => {
      if (this._isMounted) {
        let parsed = JSON.parse(message.data);
        this.setState({
          tiles: parsed.codies.tiles,
          playerId: parsed.playerId,
          isSpymaster: parsed.resetSpymasters ? false : this.state.isSpymaster,
        });
      }
    };
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    var display = []
    var redCount = 0;
    var blueCount = 0;
    if (this.state.tiles !== undefined) {
      var index = 0;
      var row = [];
      for (const tile of this.state.tiles) {
        row.push(<Tile
          isSpymaster={this.state.isSpymaster}
          value={tile.word}
          tileColor={tile.color}
          selected={tile.selected}
          playerId={this.state.playerId}
        />)
        index++;
        if (index % 5 === 0) {
          display.push(<div className="board-row">{row}</div>);
          row = [];
        }
        if (!tile.selected) {
          if (tile.color === "blue") {
            blueCount = blueCount + 1;
          } else if (tile.color === "red") {
            redCount++;
          }
        }
      }
    }
    return (
      <div>
        <Score blueCount={blueCount} redCount={redCount}/>
        <div className="game-area">
          <div className="board">
            {display}
            <button
              className="toggle-spymaster-button"
              onClick={async () => {
                this.setState({isSpymaster: !this.state.isSpymaster})}
              }
            >
              Toggle Spymaster
            </button>
            <button
              className="reset-button"
              onClick={async () => {
                connection.send(JSON.stringify({ action: "reset", playerId: this.state.playerId }))
              }}
            >
              Reset Board
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="codos">
        <div className="toggle-button">
          <DarkModeButton />
        </div>
        <Board />
      </div>
    );
  }
}

export default App;
