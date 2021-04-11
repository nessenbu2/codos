import React, { Component } from 'react';
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
      selected: false
    };
  }
  render() {
    return (
      <button
        className={"tile " + (this.state.selected ? "selected-" + this.state.color : "not-selected")}
        onClick={() => this.setState({selected: true})}
      >
        {this.state.value}
      </button>
    );
  }
}

class Board extends Component {

  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.callBackendAPI()
      .then(res => this.setState({ data: JSON.parse(res.codies)}))
      .catch(err => console.log(err));
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
      for (const tile of this.state.data.tiles) {
        row.push(<Tile value={tile.word} tileColor={tile.color}/>)
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

        //<div className="board">
        //  <div className="board-row">
        //    <Tile value={"ABCD"} tileColor={"gray"}/>
        //    <Tile value={"ABCD"} tileColor={"gray"}/>
        //    <Tile value={"ABCD"} tileColor={"red"}/>
        //    <Tile value={"ABCD"} tileColor={"black"}/>
        //    <Tile value={"ABCD"} tileColor={"blue"}/>
        //  </div>
        //  <div className="board-row">
        //    <Tile value={"ABCD"} tileColor={"blue"}/>
        //    <Tile value={"ABCD"} tileColor={"gray"}/>
        //    <Tile value={"ABCD"} tileColor={"red"}/>
        //    <Tile value={"ABCD"} tileColor={"black"}/>
        //    <Tile value={"ABCD"} tileColor={"blue"}/>
        //  </div>
        //  <div className="board-row">
        //    <Tile value={"ABCD"} tileColor={"blue"}/>
        //    <Tile value={"ABCD"} tileColor={"gray"}/>
        //    <Tile value={"ABCD"} tileColor={"red"}/>
        //    <Tile value={"ABCD"} tileColor={"black"}/>
        //    <Tile value={"ABCD"} tileColor={"blue"}/>
        //  </div>
        //  <div className="board-row">
        //    <Tile value={"ABCD"} tileColor={"blue"}/>
        //    <Tile value={"ABCD"} tileColor={"gray"}/>
        //    <Tile value={"ABCD"} tileColor={"red"}/>
        //    <Tile value={"ABCD"} tileColor={"black"}/>
        //    <Tile value={"ABCD"} tileColor={"blue"}/>
        //  </div>
        //  <div className="board-row">
        //    <Tile value={"ABCD"} tileColor={"blue"}/>
        //    <Tile value={"ABCD"} tileColor={"gray"}/>
        //    <Tile value={"ABCD"} tileColor={"red"}/>
        //    <Tile value={"ABCD"} tileColor={"black"}/>
        //    <Tile value={"ABCD"} tileColor={"blue"}/>
        //  </div>
        //</div>
