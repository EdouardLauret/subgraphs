import React, { Component } from 'react';
import { HashRouter, Route } from 'react-router-dom';
import Home from './Pages/Home';
import About from './Pages/About';
import Guide from './Pages/Guide';
import Editor from './Editor/Editor';
import Login from './User/Login';
import Profile from './User/Profile';
import Navigation from './Navigation/Navigation';
import theUserService from '../Services/UserService';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      user: {}
    };
  }

  componentDidMount() {
    theUserService.subscribe(this.onUpdateUser);
  }

  componentWillUnmount() {
    theUserService.unsubscribe(this.onUpdateUser)
  }

  onUpdateUser = (user) => {
    this.setState({
      user: user
    });
  };

  onToggleDialog = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  render() {
    return (
      <HashRouter>
        <div>
          <Navigation user={this.state.user} />
          <Route exact path="/" component={Home}></Route>
          <Route path="/About" component={About}></Route>
          <Route path="/Guide" component={Guide}></Route>
          <Route path="/Editor/:i?/:o?" component={Editor}></Route>
          <Route path="/Login" component={Login}></Route>
          <Route path="/Profile" render={props => (
            <Profile user={this.state.user}/>
          )}>
          </Route>
        </div>
      </HashRouter>
    );
  }
}

export default App;
