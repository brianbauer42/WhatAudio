import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom'
import MenuSlider from './MenuSlider';
import Playlist from './Playlist';
import AdminPanel from './AdminPanel';
import Contact from './Contact';
import Login from './Login';
import Register from './Register';

class ContentArea extends Component {
  render() {
    return (
      <div className="main">
        <Switch>
          <Route exact path='/' component={Playlist}/>
          <Route path='/admin' component={AdminPanel}/>
          <Route path='/contact' component={Contact}/>
          <Route path='/login' component={Login}/>
          <Route path='/register' component={Register}/>
        </Switch>
      </div>
    );
  }
}

export default ContentArea;