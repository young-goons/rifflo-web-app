import React, { Component } from 'react';
import { withAuthenticator, SignIn, SignUp, ConfirmSignUp, ForgotPassword } from 'aws-amplify-react';
import { Route, Switch, Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { federationConfig, authPageTheme, signUpConfig } from "./config/signInConfig";

import ProtectedRoute from "./ProtectedRoute";
import HelpPage from './containers/HelpPage/HelpPage';
import UserPage from './containers/UserPage/UserPage';
import AuthPage from './containers/AuthPage/AuthPage';

import { I18n } from 'aws-amplify';

const authScreenLabels = {
    en: {
        'Username': 'Email'
    }
};

I18n.setLanguage('en');
I18n.putVocabularies(authScreenLabels);

class App extends Component {
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

// export default withAuthenticator(App, false, [
//     <SignIn/>,
//     <SignUp/>,
//     <ConfirmSignUp/>,
//     <ForgotPassword/>
// ], federationConfig, authPageTheme, signUpConfig, {usernameAttributes: 'email'});

export default App;

