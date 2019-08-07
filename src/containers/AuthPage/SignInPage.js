import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import {Button, Form, Grid, Message, Icon, Image, Segment, Modal, Dimmer, Loader} from 'semantic-ui-react';
import { Auth } from 'aws-amplify';

import styles from './AuthPage.module.css';

class AuthPage extends Component {
    state = {
        email: '',
        password: '',
        confirmCode: '',
        isAuthenticated: false,
        warning: '',
        needVerification: false,
        resendCodeMessage: '',
        processing: false
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
        this.setState({processing: true}, () => {
            Auth.signIn({username: this.state.email, password: this.state.password})
                .catch(error => {
                    console.log(error);
                    if (error.code === 'UserNotConfirmedException') {
                        Auth.resendSignUp(this.state.email)
                            .then(() => {
                                this.setState({needVerification: true, processing: false, warning: ''});
                            })
                            .catch(err => {
                                console.log(err);
                                this.setState({warning: err.message, processing: false});
                            });
                    } else {
                        this.setState({warning: error.message});
                    }
                });
        });
    };

    resendCodeHandler = () => {
        if (!this.state.processing) {
            this.setState({processing: true}, () => {
                Auth.resendSignUp(this.state.email)
                    .then(() => {
                        this.setState({resendCodeMessage: "Verification Code Sent!", processing: false, warning: ''});
                    })
                    .catch(error => {
                        this.setState({warning: error.message, processing: false});
                    });
            });
        }
    };

    confirmCodeHandler = () => {
        this.setState({processing: true, resendCodeMessage: ''}, () => {
            Auth.confirmSignUp(this.state.email, this.state.confirmCode, {forceAliasCreation: true})
                .then((data) => {
                    this.setState({needVerification: false});
                    return Auth.signIn({
                        username: this.state.email,
                        password: this.state.password
                    });
                })
                .catch((error) => {
                    console.log(error);
                    this.setState({warning: error.message, processing: false, resendCodeMessage: ''});
                });
        });
    };

    render() {
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

        let forgotPasswordDiv, resendCodeDiv;
        if (this.state.needVerification) {
            resendCodeDiv = (
                <div className={styles.resendCodeDiv}>
                    <span onClick={this.resendCodeHandler} className={this.state.processing ? '' : styles.resendCodeSpan}>
                        Resend Verification Code
                    </span>
                </div>
            );
        } else {
            forgotPasswordDiv = (
                <div className={styles.forgotPasswordDiv}>
                    <span onClick={this.props.forgotPasswordClickHandler} className={styles.signUpLink}>
                        Forgot your password?
                    </span>
                </div>
            );
        }

        let resendCodeMessageDiv;
        if (this.state.resendCodeMessage !== '') {
            resendCodeMessageDiv = (
                <div className={styles.authWarningDiv}>
                    <Message attached="bottom" positive>
                        { this.state.resendCodeMessage }
                    </Message>
                </div>
            )
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
                    <Dimmer.Dimmable as={Segment} dimmed={this.state.processing}>
                        <Dimmer active={this.state.processing} inverted>
                            <Loader>Processing</Loader>
                        </Dimmer>
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
                                { signInButton }
                                { resendCodeDiv }
                            </Form>
                            { warningDiv }
                            { resendCodeMessageDiv }
                            { forgotPasswordDiv }
                        </Segment>
                    </Dimmer.Dimmable>
                    <div className={styles.orDiv}>Or</div>
                    <Button color='facebook' fluid onClick={() => Auth.federatedSignIn({provider: 'Facebook'})}>
                        Continue with Facebook
                    </Button>
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