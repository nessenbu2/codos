import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
import './App.css';

class Score extends Component {
  render() {
    return (
      <div className="score-board">
        <h1 className="score-red">8</h1>
        <h1> - </h1>
        <h1 className="score-blue">9</h1>
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
      selected: props.selected
    };
  }

  // TODO: I guess this is promotes poor coding practice according to the react devs.
  //       look into moving away from this later (but I finally got this to work, so
  //     I'm leaving it for now: https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
  componentWillReceiveProps(props) {
    this.setState({
      value: props.value,
      color: props.tileColor,
      selected: props.selected
    });
  }

  render() {
    return (
      <button
        className={"tile " + (this.state.selected ? "selected-" + this.state.color : "not-selected")}
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

  componentDidMount() {
    console.log("mounted");
    this._isMounted = true;
    console.log("mounted");
    const socket = socketIOClient("localhost:5000");
    socket.on("BoardState", data => {
      if (this._isMounted) {
        let parsed= JSON.parse(data.codies);
        this.setState({ tiles: parsed.tiles})
        console.log(parsed);
      }
    });

    // Call our fetch function below once the component mounts
    this.callBackendAPI()
      .then(res => {
        let data = JSON.parse(res.codies);
        this.setState({ tiles: data.tiles})
        console.log(JSON.parse(res.codies));
      })
      .catch(err => console.log(err));
  }

  componentWillUnmount() {
    console.log("unmounted");
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
    if (this.state !== null) {
      var index = 0;
      var row = [];
      for (const tile of this.state.tiles) {
        row.push(<Tile value={tile.word} tileColor={tile.color} selected={tile.selected}/>)
        index++;
        if (index % 5 === 0) {
          display.push(<div className="board-row">{row}</div>);
          row = [];
        }
      }
    }
    return (
      <div className="game-area">
        <div className="board">
          {display}
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="Codos">
        <Score />
        <Board />
      </div>
    );
  }
}

export default App;
