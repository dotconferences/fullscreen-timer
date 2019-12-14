import React, { Component } from 'react';
import clsx from 'clsx';
// import logo from './logo.svg';
import './App.css';

const pad = (n) => (n < 10)? `0${n}` : n;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      t: 0,
      paused: true,
      mode: 'stopwatch',
      fullscreen: false,
      adjusting: false,
      editing: null, // minute, second, null
      showCursor: false,
      redblink: null,
      redCursor: false,
    }
    this.timer = null;
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.tick();
    }, 500);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillMount() {
    clearInterval(this.timer);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  tick() {
    const { mode, paused, showCursor, redCursor, editing, redblink } = this.state;
    if (editing) {
      this.setState({ showCursor: !showCursor });
    }
    if (redblink) {
      this.setState({ redCursor: !redCursor });
    }
    if (paused) return;
    this.setState((prevState) => {
      const t = prevState.t + (mode === 'stopwatch' ? -1 : 1) * 0.5;
      if (t <= 0) {
        return {
          t: 0,
          paused: true,
        }
      }
      else if (t <= 60) {
        return {
          t: t,
          paused: false,   
          redblink: true,
        }
        
      } else {
        return {
          t,
        }
      }
    });
  }

  toggleFullScreen = () => {
    const { fullscreen } = this.state;
    if (!fullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen(); 
      }
    }
    this.setState({ fullscreen: !fullscreen });
  }

  resetTimer = () => {
    this.setState({
      t: 0,
      paused: true
    });
  }

  setTimerto18 = () => {
    this.setState({
      t: 60*18,
      paused: true
    });
  }

  setTimerto4 = () => {
    this.setState({
      t: 60*4,
      paused: true
    });
  }

  // switchMode = (mode) => {
  //   this.setState({
  //     mode: mode || (this.state.mode === 'stopwatch' ? 'countdown' : 'stopwatch'),
  //   })
  // }

  pauseTimer = () => {
    this.setState({
      paused: !this.state.paused,
      editing: false,
    })
  }

  toggleEditing = () => {
    const { editing } = this.state;
    this.setState({
      editing: editing ? null : 'second',
    });
  }

  handleCursorMove(direction) {
    const state = { ...this.state };
    state.paused = true;
    switch (direction) {
      case 'up':
      case 'down':
        if (!state.editing) {
          state.editing = 'second';
        }
        state.t += (direction === 'up' ? 1 : -1) * (state.editing === 'second' ? 1 : 60);
        if (state.t < 0) {
          state.t = 0;
        }
        break;
      case 'left':
        state.editing = 'minute';
        break;
      case 'right':
        state.editing = 'second';
        break;
      default:
        break;
    }
    this.setState(state);
  }

  handleKeyDown = (event) => {
    switch (event.key) {
      case 'F':
      case 'f':
        this.toggleFullScreen();
        break;
      case 'R':
      case 'r':
        this.resetTimer();
        break;
      case 'S':
      case 's':
        this.switchMode();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleCursorMove(event.key.toLowerCase().replace('arrow', ''))
        break;
      case 'Enter':
        this.toggleEditing();
        break;
      case ' ':
        this.pauseTimer();
        break;
      case 'K':
      case 'k':
        this.setTimerto18();
        break;
      case 'L':
      case 'l':
        this.setTimerto4();
        break;
      default:
        break;
    }
  }

  render() {
    const { t, paused, editing, redblink, mode, showCursor, redCursor, fullscreen } = this.state;
    const second = parseInt(t % 60);
    const minute = parseInt((t - second) / 60);
    return (
      <div className="App">
        <div
          className={clsx('clock', { 'show-cursor': showCursor }, { 'show-cursor-red': redCursor })}
          onDoubleClick={() => this.toggleFullScreen()}
        >
          <span className={clsx('time minute', { editing: editing === 'minute' }, { redblink: redblink === true })}>{pad(minute)}</span>
          <span className={clsx('time', { redblink: redblink === true })}>:</span>
          <span className={clsx('time second', { editing: editing === 'second' }, { redblink: redblink === true })}>{pad(second)}</span>
        </div>
        <ul className="tips">
          <div class="col-left">
            <li>
              <button onClick={this.toggleFullScreen}>F</button>
              -
              <span className="tip">{fullscreen ? 'exit': 'enter'} fullscreen</span>
            </li>
            <li>
              <button onClick={() => this.handleCursorMove('left')}>←</button>
              <button onClick={() => this.handleCursorMove('right')}>→</button>
              <button onClick={() => this.handleCursorMove('up')}>↑</button>
              <button onClick={() => this.handleCursorMove('down')}>↓</button>
              -
              <span className="tip">edit timer</span>
            </li>
            <li>
              <button onClick={this.resetTimer}>R</button>
              -
              <span className="tip">reset timer</span>
            </li>
            {/* <li>
              <button onClick={this.switchMode}>S</button>
              -
              {mode === 'countdown' ?
                <span className="tip"><span>countdown ✓</span> or <button onClick={() => this.switchMode('stopwatch')}>stopwatch</button></span>
                :
                <span className="tip"><button onClick={() => this.switchMode('countdown')}>countdown</button> or <span>stopwatch ✓</span></span>
              }
            </li> */}
          </div>
          <div className="col-right">
            <li>
              <button onClick={this.pauseTimer}>Space</button>
              -
              <span className="tip">{paused ? 'start' : 'pause'} timer</span>
            </li>
            <li>
              <button onClick={this.setTimerto18}>K</button>
              -
              <span className="tip">Set to 18min</span>
            </li>
            <li>
              <button onClick={this.setTimerto4}>L</button>
              -
              <span className="tip">Set to 4min</span>
            </li>
          </div>
        </ul>

        <div className="credits">
          <a href="https://github.com/dotconferences/fullscreen-timer">
            <span class="icon-github">
              <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 24 24" fill="#666"><path d="M12,2.2467A10.00042,10.00042,0,0,0,8.83752,21.73419c.5.08752.6875-.21247.6875-.475,0-.23749-.01251-1.025-.01251-1.86249C7,19.85919,6.35,18.78423,6.15,18.22173A3.636,3.636,0,0,0,5.125,16.8092c-.35-.1875-.85-.65-.01251-.66248A2.00117,2.00117,0,0,1,6.65,17.17169a2.13742,2.13742,0,0,0,2.91248.825A2.10376,2.10376,0,0,1,10.2,16.65923c-2.225-.25-4.55-1.11254-4.55-4.9375a3.89187,3.89187,0,0,1,1.025-2.6875,3.59373,3.59373,0,0,1,.1-2.65s.83747-.26251,2.75,1.025a9.42747,9.42747,0,0,1,5,0c1.91248-1.3,2.75-1.025,2.75-1.025a3.59323,3.59323,0,0,1,.1,2.65,3.869,3.869,0,0,1,1.025,2.6875c0,3.83747-2.33752,4.6875-4.5625,4.9375a2.36814,2.36814,0,0,1,.675,1.85c0,1.33752-.01251,2.41248-.01251,2.75,0,.26251.1875.575.6875.475A10.0053,10.0053,0,0,0,12,2.2467Z"/></svg>
            </span>
            GitHub project
          </a>
        </div>
      </div>
    );
  }
}

export default App;
