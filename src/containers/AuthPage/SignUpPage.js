import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Button, Form, Grid, Icon, Image, Segment, Message, Modal } from 'semantic-ui-react';
import { Auth } from "aws-amplify";

import axios from '../../config/axios';
import styles from './AuthPage.module.css';
import { containsNum, containsLowercase, containsSpecialChar } from "../../utils/stringUtils";

class SignUpPage extends Component {
    state = {
        email: "",
        password: "",
        passwordConfirm: "",
        confirmCode: "",
        passwordValid: false,
        passwordMatchWarning: false,
        warning: "",
        isAuthenticated: false,
        needVerification: false,
        isVerified: false,
    };

    emailInputHandler = (event) => {
        this.setState({
            email: event.target.value
        });
    };

    passwordInputHandler = (event) => {
        let warning = "";
        let passwordValid = false;
        if (!containsNum(event.target.value)) {
            warning = "Password must contain a number";
        } else if (!containsLowercase(event.target.value)) {
            warning = "Password must contain a lowercase letter";
        } else if (!containsSpecialChar(event.target.value)) {
            warning = "Password must contain a special character";
        } else if (event.target.value.length < 8) {
            warning = "Password must be at least 8 characters long";
        } else {
            passwordValid = true;
        }

        let passwordMatch;
        if (this.state.passwordConfirm !== '' && event.target.value !== this.state.passwordConfirm) {
            passwordMatch = false;
        } else {
            passwordMatch = true;
        }
        this.setState({
            password: event.target.value,
            warning: warning,
            passwordValid: passwordValid,
            passwordMatchWarning: !passwordMatch
        });
    };

    passwordConfirmInputHandler = (event) => {
        let passwordMatchWarning = false;
        if (event.target.value.length > 0 && event.target.value !== this.state.password) {
            passwordMatchWarning = true;
        }
        this.setState({
            passwordConfirm: event.target.value,
            passwordMatchWarning: passwordMatchWarning
        });
    };

    confirmCodeInputHandler = (event) => {
        this.setState({
            confirmCode: event.target.value
        })
    };

    // TODO: check email format and email confirmation(?)
    // TODO: check password constraints
    // TODO: wait loading spinner to prevent double click
    // TODO: make email unchangeable between signup and confirm code
    signUpHandler = () => {
        if (this.state.password === this.state.passwordConfirm) {
            Auth.signUp({
                    username: this.state.email,
                    password: this.state.password
                })
                .then(() => {
                    this.setState({
                        needVerification: true,
                    });
                })
                .catch(error => {
                    console.log(error);
                    this.setState({warning: error.message});
                });
        } else {
            this.setState({passwordMatchWarning: true});
        }
    };

    confirmCodeHandler = () => {
        Auth.confirmSignUp(this.state.email, this.state.confirmCode, {
            // Optional. Force user confirmation irrespective of existing alias. By default set to True.
                forceAliasCreation: true
            })
            .then(() => {
                console.log("signin")
                Auth.signIn({username: this.state.email, password: this.state.password});
            })
            .then(() => {
                console.log('signed in');
                // this.setState({isAuthenticated: true});
            })
            .catch((error) => {
                console.log(error);
                this.setState({warning: error.message});
            });
    };

    render() {
        let warningDiv = <div></div>;
        if (this.state.passwordMatchWarning) {
            warningDiv = (
                <div className={styles.authWarningDiv}>
                    <Message attached="bottom" negative>
                        Passwords do not match
                    </Message>
                </div>
            );
        } else if (this.state.warning !== '') {
            warningDiv = (
                <div className={styles.authWarningDiv}>
                    <Message attached="bottom" negative>
                        { this.state.warning }
                    </Message>
                </div>
            );
        }

        let verificationForm;
        let signUpButton;
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
            signUpButton = (
                <Button
                    color="orange" fluid size="large"
                    onClick={this.confirmCodeHandler}>
                    Confirm Verification Code
                </Button>
            );
        } else {
            signUpButton = (
                <Button
                    color="orange" fluid size="large"
                    disabled={!this.state.passwordValid || this.state.passwordMatchWarning}
                    onClick={this.signUpHandler}>
                    Sign Up
                </Button>
            )
        }

        let authRedirect;
        if (this.state.isAuthenticated) {
            console.log('isAuthenticated');
            authRedirect = <Redirect to="/"/>;
        }

        const signUpDiv = (
            <Grid centered columns={3} verticalAlign="middle" style={{height: '100%'}}>
                <Grid.Column className={styles.signUpForm}>
                    <div className={styles.signUpHeader}>
                        Sign Up
                    </div>
                    <div className={styles.signUpSubHeader}>
                        Discover and Share Music
                    </div>
                    <Segment>
                        <Form size="large">
                            <Form.Input
                                fluid
                                icon="mail"
                                iconPosition="left"
                                placeholder="Email address"
                                type="email"
                                value={this.state.email}
                                onChange={this.emailInputHandler}
                                disabled={this.state.needVerification}
                            />
                            <Form.Input
                                fluid
                                icon="lock"
                                iconPosition="left"
                                placeholder="Password"
                                type="password"
                                value={this.state.password}
                                onChange={this.passwordInputHandler}
                                disabled={this.state.needVerification}
                            />
                            <Form.Input
                                fluid
                                icon="lock"
                                iconPosition="left"
                                placeholder="Confirm Password"
                                type="password"
                                value={this.state.passwordConfirm}
                                onChange={this.passwordConfirmInputHandler}
                                disabled={this.state.needVerification}
                            />
                            { verificationForm }
                            { signUpButton }
                        </Form>
                        { warningDiv }
                    </Segment>
                    Resend Verification Code
                    <div className={styles.orDiv}>Or</div>
                    <Button color='facebook' fluid onClick={() => Auth.federatedSignIn({provider: 'Facebook'})}>
                        Continue with Facebook
                    </Button>
                    <div className={styles.signInDiv}>
                        Already have an account?
                        <span className={styles.signInLink} onClick={this.props.signInClickHandler}>
                            Sign In!
                        </span>
                    </div>
                </Grid.Column>
            </Grid>
        );

        return (
            <div className={styles.containerDiv}>
                { signUpDiv }
                { authRedirect }
            </div>
        );
    }
}

export default SignUpPage;