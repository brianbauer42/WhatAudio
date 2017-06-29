import React, { Component } from 'react';

class Player extends Component {
  render() {
    return (
      <div className="player">
        <h3>Spoon - Chicago at Night</h3>
        <div className="audioControls"><i className='fa fa-step-backward fa-2x' /></div>
        <div className="audioControls"><i className='fa fa-caret-square-o-right fa-2x' /></div>
        <div className="audioControls"><i className='fa fa-step-forward fa-2x' /></div>
      </div>
    );
  }
}

export default Player;