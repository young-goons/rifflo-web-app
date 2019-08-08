import React, { Component } from 'react';
import { Auth } from "aws-amplify";

import SiteHeader from '../SiteHeader/SiteHeader';

import styles from './UserPage.module.css';
import axios from "../../config/axios";

class UserPage extends Component {
    state = {
        authUserId: null,
        authUserEmail: null,
        authUsername: null,
        jwtToken: null
    };

    componentDidMount() {
        Auth.currentSession()
            .then(currentSession => {
                this.setState({
                    authUserId: currentSession['idToken']['payload']['cognito:username'],
                    authUserEmail: currentSession['idToken']['payload']['cognito:username'],
                    jwtToken: currentSession['idToken']['jwtToken'],
                });
                const url = ''
            })
            .catch(error => {
                console.log(error);
            });

    }
    render() {
        const renderDiv = (
            <div className={styles.containerDiv} ref={this.contextRef}>
                <SiteHeader
                    userId={this.state.authUserId}
                    username={this.state.authUsername}
                />
            </div>
        );

        console.log(this.state.currentSession);

        return (
            <div className={styles.containerDiv}>
                { renderDiv }
            </div>
        );
    }
}

export default UserPage;