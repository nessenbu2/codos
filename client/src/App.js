import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';

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
        <h1> - </h1>
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
      isSpymaster: props.isSpymaster
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
      className = "tile " + (this.state.selected ? "selected-" + this.state.color : "not-selected")
    } else {
      className = "tile " + (this.state.selected ? "selected-" + this.state.color : "spymaster-not-selected-" + this.state.color)
    }
    return (
      <button
        className={className}
        onClick={async () => {
          const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ player: "nick", word: this.state.value})
          };
          fetch('/update_board', options);
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
    const socket = socketIOClient("10.0.0.238:5000");
    socket.on("BoardState", data => {
      if (this._isMounted) {
        let parsed= JSON.parse(data.codies);
        this.setState({ tiles: parsed.tiles})
      }
    });

    // Call our fetch function below once the component mounts
    this.callBackendAPI()
      .then(res => {
        let data = JSON.parse(res.codies);
        this.setState({ tiles: data.tiles})
      })
      .catch(err => console.log(err));
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  callBackendAPI = async () => {
    const response = await fetch('/express_backend');
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message) 
    }
    return body;
  };

  render() {
    var display = []
    var redCount = 0;
    var blueCount = 0;
    if (this.state.tiles !== undefined) {
      var index = 0;
      var row = [];
      for (const tile of this.state.tiles) {
        row.push(<Tile isSpymaster={this.state.isSpymaster} value={tile.word} tileColor={tile.color} selected={tile.selected}/>)
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
                const options = {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json'},
                  body: JSON.stringify({ player: "nick"})
                };
                fetch('/reset_board', options)}
              }
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
      <div className="Codos">
        <Board />
      </div>
    );
  }
}

export default App;
