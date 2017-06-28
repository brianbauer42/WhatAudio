import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import MenuSlider from './MenuSlider';
import Playlist from './Playlist';
import AdminPanel from './AdminPanel';
import Contact from './Contact';

class Main extends Component {
  render() {
    return (
      <div className="main">
        <MenuSlider />
        <Switch>
          <Route exact path='/' component={Playlist}/>
          <Route path='/admin' component={AdminPanel}/>
          <Route path='/contact' component={Contact}/>
        </Switch>
      </div>
    );
  }
}

export default Main;