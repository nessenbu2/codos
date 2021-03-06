import React, { Component } from 'react';
import DarkModeButton from './colors.js';
import _ from 'lodash';
import './App.css';

// TODO: try to reconnect on errors/disconnects
const url = process.env.NODE_ENV === 'development' ? "ws://localhost:5001" : "ws://codos.nessenbu.com:5001";
const connection = new WebSocket(url);

class UserNameModal extends Component {
  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.handleClick = this.handleClick.bind(this);
    this.callback = props.callback
  }

  handleClick = function() {
    this.callback(this.textInput.current.value);
  }

  render() {
    return (
      <div className="user-name-prompt">
        <p> Input ur name: </p>
        <input type="text" ref={this.textInput}/><br/>
        <input
          type="button"
          value="Submit"
          onClick={ this.handleClick }
        />
      </div>
    )
  }
}

class Players extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redPlayers: props.redPlayers === undefined ? [] : props.redPlayers,
      bluePlayers: props.bluePlayers === undefined ? [] : props.bluePlayers,
      playerId: props.playerId
    };

    this.swapTeams = this.swapTeams.bind(this);
  }

  // See the TODO below in the Tile component :3
  componentWillReceiveProps(props) {
    this.setState({
      redPlayers: props.redPlayers === undefined ? [] : props.redPlayers,
      bluePlayers: props.bluePlayers === undefined ? [] : props.bluePlayers
    });
  }

  swapTeams = () => {
    connection.send(JSON.stringify({ action: "swapTeams", playerId: this.state.playerId}));
  }

  render() {
    const redPlayers = this.state.redPlayers.map(player => <p className="score-red">{player.name}</p>);
    const bluePlayers = this.state.bluePlayers.map(player => <p className="score-blue">{player.name}</p>);

    const shuffleTeams = () => {
      connection.send(JSON.stringify({ action: "shuffleTeams" }));
    }

    return (
      <div>
        <div className="player-area">
          <h3 className="player-name-header"> Players </h3>
          <div className="red-team">
            {redPlayers}
          </div>
          <div className="blue-team">
            {bluePlayers}
          </div>
        </div>
        <button className="player-button" onClick={shuffleTeams}>Shuffle Teams</button>
        <button className="player-button" onClick={this.swapTeams}>Swap Team</button>
      </div>
    );
  }
}

class Score extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redCount: props.redCount,
      blueCount: props.blueCount,
      activeTeamColor: props.activeTeamColor,
      winningTeam: props.winningTeam
    };
  }

  // See the TODO below in the Tile component :3
  componentWillReceiveProps(props) {
    this.setState({
      redCount: props.redCount,
      blueCount: props.blueCount,
      activeTeamColor: props.activeTeamColor,
      winningTeam: props.winningTeam
    });
  }

  render() {
    // Displays the state of the game (who's turn/if the game is over)
    var teamDisplay;
    if (this.state.winningTeam !== undefined) {
      if (this.state.winningTeam === "RED") {
        teamDisplay = <h2 className="score-red">Red Team Wins!</h2>;
      } else {
        teamDisplay = <h2 className="score-blue">Blue Team Wins!</h2>;
      }
    } else if (this.state.activeTeamColor === "RED") {
      teamDisplay = <h2 className="score-red">Red Team's Turn</h2>;
    } else if (this.state.activeTeamColor === "BLUE") {
      teamDisplay = <h2 className="score-blue">Blue Team's Turn</h2>;
    } else {
      teamDisplay = <br/>;
    }
    return (
      <div>
        <div className="score-board">
          <h1 className="score-red">{this.state.redCount}</h1>
          <h1 className="score-dash"> - </h1>
          <h1 className="score-blue">{this.state.blueCount}</h1>
        </div>
        {teamDisplay}
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
      active: props.active
    };
  }

  // TODO: I guess this is promotes poor coding practice according to the react devs.
  //       look into moving away from this later (but I finally got this to work, so
  //       I'm leaving it for now: https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
  componentWillReceiveProps(props) {
    this.setState({
      value: props.value,
      color: props.tileColor,
      selected: props.selected,
      isSpymaster: props.isSpymaster,
      active: props.active
    });
  }

  render() {
    var className = "";
    if (this.state.value && this.state.value.length > 8) {
      className += "tile-small-font ";
    } else {
      className += "tile ";
    }

    if (this.state.active) {
      className += " clickable ";
    } else {
      className += " not-clickable ";
    }
    if (this.state.isSpymaster) {
      className += (this.state.selected ? "selected-" + this.state.color : "spymaster-not-selected-" + this.state.color)
    } else {
      className += (this.state.selected ? "selected-" + this.state.color : "not-selected")
    }
    return (
      <button
        className={className}
        onClick={async () => {
          connection.send(JSON.stringify({ action: "click", word: this.state.value}));
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
          redTeam: parsed.codies.redTeam,
          blueTeam: parsed.codies.blueTeam,
          playerId: parsed.playerId,
          isSpymaster: parsed.resetSpymasters ? false : this.state.isSpymaster,
          activeTeamColor: parsed.codies.activeTeamColor,
          isComplete: parsed.codies.isComplete,
          winningTeam: parsed.codies.winningTeam
        });
      }
    };
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // Tiles should not be clickable if:
  //   The player is a spymaster, the player's team
  //   The active team is not the player's team
  //   The game is over (blackTile slected or all red/blue tiles are selected)
  shouldTilesBeClickable(activeTeamColor, redTeam, blueTeam, playerId) {
    if (this.state.isSpymaster === true || this.state.isComplete) {
      return false;
    }

    if (_.find(redTeam, (player) => player.id === playerId) !== undefined) {
      return activeTeamColor === "RED";
    } else {
      return activeTeamColor === "BLUE";
    }
  }

  render() {
    var display = []
    var redCount = 0;
    var blueCount = 0;

    var makeTilesClickable = this.shouldTilesBeClickable(this.state.activeTeamColor,
                                                         this.state.redTeam,
                                                         this.state.blueTeam,
                                                         this.state.playerId);

    var swapTeamsClassName = makeTilesClickable ? "clickable" : "not-clickable";

    if (this.state.tiles !== undefined) {
      var index = 0;
      var row = [];
      for (const tile of this.state.tiles) {
        row.push(<Tile
          isSpymaster={this.state.isSpymaster || this.state.isComplete}
          value={tile.word}
          tileColor={tile.color}
          selected={tile.selected}
          active={makeTilesClickable}
        />)
        index++;
        if (index % 5 === 0) {
          display.push(<div className="board-row">{row}</div>);
          row = [];
        }
        if (!tile.selected) {
          if (tile.color === "blue") {
            blueCount++;
          } else if (tile.color === "red") {
            redCount++;
          }
        }
      }

    } else {
      return(
        // if the board isn't defined, we probably just haven't heard from the server yet.
        // Don't render anything or you get a weird state where the board is empry
        <div/>
      );
    }
    return (
      <div>
        <Score
          blueCount={blueCount}
          redCount={redCount}
          activeTeamColor={this.state.activeTeamColor}
          winningTeam={this.state.winningTeam}/>
        <div className="game-area">
          <button
            className={swapTeamsClassName}
            onClick={async () => {
              connection.send(JSON.stringify({action: "pass", playerId: this.state.playerId }))
            }}
          >
            Pass Turn
          </button>
          <div className="board">
            <div className="players">
              <Players
                playerId={this.state.playerId}
                redPlayers={this.state.redTeam}
                bluePlayers={this.state.blueTeam}
              />
            </div>
            <div className="tiles">
              {display}
            </div>
            <div className="right">
            </div>
          </div>
          <button
            className="clickable"
            onClick={async () => {
              this.setState({isSpymaster: !this.state.isSpymaster})}
            }
          >
            Toggle Spymaster
          </button>
          <button
            className="clickable"
            onClick={async () => {
              connection.send(JSON.stringify({ action: "reset", playerId: this.state.playerId }))
            }}
          >
            Reset Board
          </button>
        </div>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      playerName: ""
    };
    this.setPlayerName = this.setPlayerName.bind(this);
  }

  setPlayerName = function(name) {
    connection.send(JSON.stringify({ action: "addPlayer", player: name}))
    this.setState({playerName: name});
  }

  render() {
    var displayModal = this.state.playerName === "";
    return (
      <div className="codos">
        <div className="toggle-button">
          <DarkModeButton />
        </div>
        {displayModal &&
          <UserNameModal callback={this.setPlayerName}/>
        }
        {!displayModal &&
          <Board />
        }
      </div>
    );
  }
}

export default App;
