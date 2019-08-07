import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {Auth, Hub} from 'aws-amplify';

import SignUpPage from './SignUpPage';
import SignInPage from './SignInPage';
import PasswordRecoveryPage from './PasswordRecoveryPage';
import styles from './AuthPage.module.css';

class AuthPage extends Component {
    state = {
        isSignedIn: false,
        pageType: 'signUp'
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
        this.setState({pageType: 'signUp'});
    };

    signInClickHandler = () => {
        this.setState({pageType: 'signIn'});
    };

    forgotPasswordClickHandler = () => {
        this.setState({pageType: 'passwordRecovery'});
    };

    render () {
        let authPageDiv;
        if (this.state.pageType === 'signUp') {
            authPageDiv = (
                <SignUpPage signInClickHandler={this.signInClickHandler}/>
            );
        } else if (this.state.pageType === 'signIn') {
            authPageDiv = (
                <SignInPage
                    forgotPasswordClickHandler={this.forgotPasswordClickHandler}
                    signUpClickHandler={this.signUpClickHandler}
                />
            );
        } else if (this.state.pageType === 'passwordRecovery') {
            authPageDiv = (
                <PasswordRecoveryPage
                    forgotPasswordClickhandler={this.forgotPasswordClickHandler}
                    signInClickHandler={this.signInClickHandler}
                />
            );
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
