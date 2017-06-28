import React, { Component } from 'react';
import Main from './components/Main.js';
import Header from './components/Header.js';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Main />
      </div>
    );
  }
}

export default App;
