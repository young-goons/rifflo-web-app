import React, { Component } from 'react';
import {Button, Dimmer, Form, Grid, Loader, Message, Segment} from "semantic-ui-react";
import {Auth} from "aws-amplify";

import { containsNum, containsLowercase, containsSpecialChar } from "../../utils/stringUtils";
import styles from "./AuthPage.module.css";

class PasswordRecoveryPage extends Component {
    state = {
        email: '',
        code: '',
        newPassword: '',
        newPasswordValid: false,
        resetPassword: false,
        processing: false,
        warning: '',
        resendCodeMessage: ''
    };

    emailInputHandler = (event) => {
        this.setState({email: event.target.value});
    };

    codeInputHandler = (event) => {
        this.setState({code: event.target.value});
    };

    newPasswordInputHandler = (event) => {
        let warning = '';
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
        this.setState({
            newPassword: event.target.value,
            warning: warning,
            newPasswordValid: passwordValid
        });
    };

    resetPasswordHandler = () => {
        this.setState({processing: true}, () => {
            Auth.forgotPassword(this.state.email)
                .then(() => {
                    this.setState({processing: false, resetPassword: true});
                })
                .catch(error => {
                    console.log(error);
                    this.setState({warning: error.message, processing: false});
                })
        });
    };

    resendCodeHandler = () => {
        this.setState({processing: true}, () => {
            Auth.forgotPassword(this.state.email)
                .then(() => {
                    this.setState({
                        processing: false,
                        newPassword: '',
                        code: '',
                        newPasswordValid: false,
                        warning: '',
                        resendCodeMessage: "Verification Code Sent!"
                    });
                })
                .catch(error => {
                    console.log(error);
                    this.setState({warning: error.message, processing: false, resendCodeMessage: ''});
                })
        })
    };

    confirmNewPasswordHandler = () => {
        this.setState({processing: true}, () => {
            Auth.forgotPasswordSubmit(this.state.email, this.state.code, this.state.newPassword)
                .then(() => {
                    this.props.signInClickHandler();
                })
                .catch(error => {
                    console.log(error);
                    this.setState({warning: error.message, processing: false, resendCodeMessage: ''});
                })
        });
    };

    render() {
        let verificationCodeForm;
        if (this.state.resetPassword) {
            verificationCodeForm = (
                <Form.Input
                    fluid
                    icon="exclamation"
                    iconPosition="left"
                    placeholder="Verification Code"
                    value={this.state.code}
                    onChange={this.codeInputHandler}
                    disabled={this.state.processing}
                />
            );
        }

        let newPasswordForm;
        if (this.state.resetPassword) {
            newPasswordForm = (
                <Form.Input
                    fluid
                    icon="lock"
                    iconPosition="left"
                    placeholder="New Password"
                    type="password"
                    value={this.state.password}
                    onChange={this.newPasswordInputHandler}
                    disabled={this.state.processing}
                />
            );
        }

        let resetPasswordButton;
        if (this.state.resetPassword) {
            resetPasswordButton = (
                <Button color="orange" fluid size="large"
                        onClick={this.confirmNewPasswordHandler}
                        disabled={!this.state.newPasswordValid}>
                    Confirm New Password
                </Button>
            );
        } else {
            resetPasswordButton = (
                <Button color="orange" fluid size="large"
                        onClick={this.resetPasswordHandler}>
                    Reset Password
                </Button>
            );
        }

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

        let resendCodeDiv;
        if (this.state.resetPassword) {
            resendCodeDiv = (
                <div className={styles.resendCodeDiv}>
                    <span onClick={this.resendCodeHandler} className={this.state.processing ? '' : styles.resendCodeSpan}>
                        Resend Verification Code
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

        const passwordRecoveryDiv = (
            <Grid centered columns={3} verticalAlign="middle" style={{height: '100%'}}>
                <Grid.Column className={styles.signUpForm}>
                    <div className={styles.signUpHeader}>
                        Reset Password
                    </div>
                    <div className={styles.signUpSubHeader}>
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
                                    placeholder="Email address"
                                    type="email"
                                    value={this.state.email}
                                    onChange={this.emailInputHandler}
                                    disabled={this.state.resetPassword || this.state.processing}
                                />
                                { verificationCodeForm }
                                { newPasswordForm }
                                { resetPasswordButton }
                                { resendCodeDiv }
                            </Form>
                            { warningDiv }
                            { resendCodeMessageDiv }
                        </Segment>
                    </Dimmer.Dimmable>
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

        return passwordRecoveryDiv;
    }
}

export default PasswordRecoveryPage;