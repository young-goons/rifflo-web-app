import React, { Component } from 'react';
import { Route, Switch, Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { connect } from 'react-redux';
import { Auth } from 'aws-amplify';

import { loadAuthUser } from "./store/actions/auth";

import ProtectedRoute from "./ProtectedRoute";
import HelpPage from './containers/HelpPage/HelpPage';
import UserPage from './containers/UserPage/UserPage';
import AuthPage from './containers/AuthPage/AuthPage';

class App extends Component {
    componentDidMount() {
        Auth.currentSession()
            .then((currentSession) => {
                console.log(currentSession);
                this.props.onLoadAuthUser(currentSession['idToken']['jwtToken'])
            })
            .catch(error => {
                console.log(error);
            })
    }

    render() {
        const routes = (
            <Switch>
                <Route path="/auth" component={AuthPage}/>
                <ProtectedRoute path="/help" component={HelpPage}/>
                <ProtectedRoute path="/:username" component={UserPage}/>
                <ProtectedRoute path="/" component={HelpPage}/>
            </Switch>
        );

        return (
            <Router history={createBrowserHistory()}>
                { routes }
            </Router>
        );
    }
}


const mapDispatchToProps = dispatch => {
    return {
        onLoadAuthUser: (jwtToken) => dispatch(loadAuthUser(jwtToken))
    }
};

export default connect(null, mapDispatchToProps)(App);

