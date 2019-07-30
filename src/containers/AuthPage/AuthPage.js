import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {Auth, Hub} from 'aws-amplify';

import SignUpPage from './SignUpPage';
import SignInPage from './SignInPage';
import styles from './AuthPage.module.css';

class AuthPage extends Component {
    state = {
        isSignUpPage: true,
        isSignedIn: false,
    };

    componentDidMount() {
        Auth.currentAuthenticatedUser()
            .then((user) => {
                this.setState({isSignedIn: true});
                console.log('user: ', user);
            })
            .catch(() => {
                console.log('Not signed in');
            });

        Hub.listen('auth', (data) => {
            switch (data.payload.event) {
                case 'signIn':
                    console.log('now the user is signed in');
                    this.setState({isSignedIn: true});
                    break;
                default:
                    break;
            }
        });
    }

    signUpClickHandler = () => {
        this.setState({isSignUpPage: true});
    };

    signInClickHandler = () => {
        this.setState({isSignUpPage: false});
    };

    render () {
        let authPageDiv;
        if (this.state.isSignUpPage) {
            authPageDiv = <SignUpPage signInClickHandler={this.signInClickHandler}/>
        } else {
            authPageDiv = <SignInPage signUpClickHandler={this.signUpClickHandler}/>
        }

        let authRedirect;
        if (this.state.isSignedIn) {
            console.log('redirect');
            authRedirect = <Redirect to="/"/>
        }

        return (
            <div className={styles.containerDiv}>
                { authPageDiv }
                { authRedirect }
            </div>
        );
    }
}

export default AuthPage;
