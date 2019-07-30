import React, { Component } from 'react';
import { Auth } from 'aws-amplify';
import { Route, withRouter, Redirect } from 'react-router-dom';

class ProtectedRoute extends Component {
    state = {
        isAuthenticated: false,
        loaded: false
    };

    componentDidMount() {
        this.authenticate();
        this.unlisten = this.props.history.listen(() => {
            Auth.currentAuthenticatedUser()
                .then((user) => {
                    console.log('user: ', user);
                })
                .catch(() => {
                    if (this.state.isAuthenticated) {
                        this.setState({ isAuthenticated: false });
                    }
                })
        });
    }

    componentWillUnmount() {
        this.unlisten();
    }

    authenticate = () => {
        Auth.currentAuthenticatedUser()
            .then(() => {
                this.setState({loaded: true, isAuthenticated: true});
            })
            .catch(error => {
                this.props.history.push('/auth');
                console.log(error);
            })
    };

    render() {
        const { component: Component, ...rest } = this.props;
        if (!this.state.loaded) {
            return null;
        }
        return (
            <Route { ...rest }
                render={
                    props => {
                        return this.state.isAuthenticated ?
                            <Component {...props} /> :
                            <Redirect to={{
                                pathname: "/auth",
                                state: {from: props.location}
                            }}/>
                    }}
            />
        )
    }
}

export default withRouter(ProtectedRoute);

// References

// https://gist.github.com/dabit3/36eb8f10a0f67b601402a2ef614a3075