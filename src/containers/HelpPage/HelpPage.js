import React, { Component } from 'react';
import axios from 'axios';
import { Auth } from 'aws-amplify';

import SiteHeader from '../SiteHeader/SiteHeader';

class HelpPage extends Component {
    state = {
        currentSession: null
    };

    async componentDidMount() {
        try {
            const currentSession = await Auth.currentSession();
            this.setState({currentSession: currentSession});
        }
        catch(e) {
            if (e !== 'No current user') {
                alert(e);
            }
        }

    }

    render () {
        return (
            <div>
                <SiteHeader
                    email={this.state.currentSession ? this.state.currentSession['idToken']['payload']['email'] : null}
                    userId={this.state.currentSession ? this.state.currentSession['idToken']['payload']['cognito:username'] : null}
                    username={this.state.currentSession? this.state.currentSession['idToken']['payload']['preferred_username'] : null}
                    jwtToken={this.state.currentSession? this.state.currentSession['idToken']['jwtToken'] : null}
                    history={this.props.history}
                />
                Help
            </div>
        )
    }
}

export default HelpPage