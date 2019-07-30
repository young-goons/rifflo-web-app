import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Form, Grid, Message, Icon, Image, Segment, Modal } from 'semantic-ui-react';
import { Auth } from 'aws-amplify';

import styles from './AuthPage.module.css';

class AuthPage extends Component {
    state = {
        email: '',
        password: '',
        confirmCode: '',
        isAuthenticated: false,
        warning: "",
        needVerification: false,
        isVerified: false
    };

    emailInputHandler = (event) => {
        this.setState({email: event.target.value});
    };

    passwordInputHandler = (event) => {
        this.setState({password: event.target.value});
    };

    confirmCodeInputHandler = (event) => {
        this.setState({confirmCode: event.target.value});
    };

    signInHandler = () => {
        Auth.signIn({username: this.state.email, password: this.state.password})
            .then(() => {
                console.log('log in success');
                this.setState({isAuthenticated: true});
            })
            .catch(error => {
                console.log(error);
                if (error.code === 'UserNotConfirmedException') {
                    Auth.resendSignUp(this.state.email)
                        .then(() => {
                            this.setState({needVerification: true});
                        })
                        .catch(err => {
                            console.log(err);
                        });
                } else {
                    this.setState({warning: error.message});
                }
            });
    };

    confirmCodeHandler = () => {
        Auth.confirmSignUp(this.state.email, this.state.confirmCode, {
            // Optional. Force user confirmation irrespective of existing alias. By default set to True.
            forceAliasCreation: true
        })
            .then((data) => {
                this.setState({isVerified: true});
            })
            .catch((error) => {
                this.setState({warning: "Error in Confirming"});
            });
    };

    render() {
        // const { from } = this.props.location.state || { from: { pathname: '/' } };
        // const from = {pathname: '/'};
        // if (this.state.isAuthenticated) {
        //     console.log('auth redirect');
        //     return (
        //         <Redirect to={from}/>
        //     );
        // }

        let warningDiv;
        if (this.state.warning !== '') {
            warningDiv = (
                <div className={styles.authWarningDiv}>
                    <Message attached="bottom" negative>
                        { this.state.warning }
                    </Message>
                </div>
            );
        }

        let verificationForm;
        let signInButton;
        if (this.state.needVerification) {
            verificationForm = (
                <Form.Input
                    fluid
                    icon="exclamation"
                    iconPosition="left"
                    placeholder="Verification Code"
                    value={this.state.confirmCode}
                    onChange={this.confirmCodeInputHandler}
                />
            );
            signInButton = (
                <Button
                    color="orange" fluid size="large"
                    onClick={this.confirmCodeHandler}>
                    Confirm Verification Code
                </Button>
            );
        } else {
            signInButton = (
                <Button
                    color="orange" fluid size="large"
                    onClick={this.signInHandler}>
                    Sign In
                </Button>
            );
        }

        return (
            <Grid centered columns={3} verticalAlign="middle" style={{height: '100%'}}>
                <Grid.Column className={styles.signInForm}>
                    <div className={styles.signInHeader}>
                        Sign In
                    </div>
                    <div className={styles.signInSubHeader}>
                        Discover and Share Music
                    </div>
                    <Segment>
                        <Form size="large">
                            <Form.Input
                                fluid
                                icon="mail"
                                iconPosition="left"
                                type="email"
                                placeholder="Email address"
                                value={this.state.email}
                                onChange={this.emailInputHandler}
                            />
                            <Form.Input
                                fluid
                                icon="lock"
                                iconPosition="left"
                                placeholder="Password"
                                type="password"
                                value={this.state.password}
                                onChange={this.passwordInputHandler}
                            />
                            { verificationForm }
                            Resend Verification Code
                            { signInButton }
                        </Form>
                        { warningDiv }
                    </Segment>
                    <Button color='facebook' fluid onClick={() => Auth.federatedSignIn({provider: 'Facebook'})}>
                        Continue with Facebook
                    </Button>
                    <div className={styles.orDiv}>Or</div>
                    <div className={styles.passwordRecoveryDiv}>
                        Forgot your password?
                    </div>
                    <div className={styles.signUpDiv}>
                        Don't have an account yet?
                        <span className={styles.signUpLink} onClick={this.props.signUpClickHandler}>
                                Sign Up!
                        </span>
                    </div>
                </Grid.Column>
            </Grid>
        );
    }
}

export default AuthPage;