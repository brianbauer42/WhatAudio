import React, { Component } from 'react';
import MenuSlider from './MenuSlider';
import Playlist from './Playlist';
import AdminPanel from './AdminPanel';

class Main extends Component {
  render() {
    return (
      <div className="main">
        <h1>This is the Main!</h1>
        <MenuSlider />
        <Switch>
          <Route exact path='/' component={Playlist}/>
          <Route path='/admin' component={AdminPanel}/>
        </Switch>
      </div>
    );
  }
}

export default Main;