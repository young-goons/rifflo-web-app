import React, { Component } from 'react';
import {Auth} from "aws-amplify";

import SiteHeader from '../SiteHeader/SiteHeader';

import styles from './UserPage.module.css';

class UserPage extends Component {
    state = {
        currentSession: null
    };

    componentDidMount() {
        // try {
        //     const currentSession = await Auth.currentSession();
        //     this.setState({currentSession: currentSession});
        //     console.log(this.state.currentSession);
        // }
        // catch(e) {
        //     if (e !== 'No current user') {
        //         alert(e);
        //     }
        // }
        Auth.currentSession()
            .then(currentSession => {
                this.setState({currentSession: currentSession});
            })

    }
    render() {
        const renderDiv = (
            <div className={styles.containerDiv} ref={this.contextRef}>
                <SiteHeader
                    email={this.state.currentSession['idToken']['payload']['email']}
                    userId={this.state.currentSession['idToken']['payload']['cognito:username']}
                    username={this.state.currentSession['idToken']['payload']['preferred_username']}
                    jwtToken={this.state.currentSession['idToken']['jwtToken']}
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