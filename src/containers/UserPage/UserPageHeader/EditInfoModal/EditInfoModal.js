import React, { Component } from 'react';
import { Button, Input, Message, Grid, Dimmer, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';

import axios from '../../../../config/axios';
import styles from './EditInfoModal.module.css';
// import { loadUser } from '../../../../store/actions/user';
import { loadAuthUser } from '../../../../store/actions/auth';
import { validateUsername, validateName, validateLocation } from '../../../../utils/inputUtils';

class EditInfoModal extends Component {
    /* Guaranteed this.props.username and this.props.name is not null
     */
    state = {
        username: this.props.authUsername,
        name: this.props.authUserInfo.name ? this.props.authUserInfo.name : '',
        location: this.props.authUserInfo.location ? this.props.authUserInfo.location : '',

        validUsername: true,
        validName: true,
        validLocation: true,

        invalidInputMessage: null,
        usernameExists: false,
        updating: false,

        needUpdate: false,
        updatedUserInfo: null
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.userInfo && !this.props.userInfo) {
            this.setState({
                name: nextProps.userInfo.name ? nextProps.userInfo.name : '',
                location: nextProps.userInfo.location ? nextProps.userInfo.location : ''
            });
        }
    }

    componentDidUpdate() {
        if (this.state.needUpdate) {
            const url = "/user/" + this.props.userId + "/info";
            axios({method: 'PUT', url: url, data: this.state.updatedUserInfo})
                .then(response => {
                    if (response.data.newUsername) {
                        this.props.history.push("/" + response.data.newUsername);
                        this.props.onLoadAuthUser(this.props.userId);
                    }
                    this.props.onLoadUserInfo(this.props.userId);
                })
                .catch(error => {
                    alert(error);
                });
            this.props.handleClose();
        }
    }

    usernameInputHandler = (event) => {
        const usernameValidityObj = validateUsername(event.target.value);
        this.setState({
            username: event.target.value,
            validUsername: usernameValidityObj.valid,
            invalidInputMessage: usernameValidityObj.msg
        });
    };

    nameInputHandler = (event) => {
        const nameValidityObj = validateName(event.target.value);
        this.setState({
            name: event.target.value,
            validName: nameValidityObj.valid,
            invalidInputMessage: nameValidityObj.msg
        });
    };

    locationInputHandler = (event) => {
        const locationValidityObj = validateLocation(event.target.value);
        this.setState({
            location: event.target.value,
            validLocation: locationValidityObj.valid,
            invalidInputMessage: locationValidityObj.msg
        });
    };

    getUpdatedUserInfo = () => {
        /* Gets user info to update */
        const updatedUserInfo = {};
        if (this.state.name !== this.props.authUserInfo.name) {
            updatedUserInfo['name'] = this.state.name;
        }
        if (this.state.location !== this.props.authUserInfo.location) {
            updatedUserInfo['location'] = this.state.location;
        }
        return updatedUserInfo;
    };

    updateClickHandler = () => {
        if (this.state.username !== this.props.authUsername) { // update username
            const usernameExistsUrl = "/user/username/" + this.state.username + "/id";
            this.setState({updating: true}, () => {
                axios({method: 'GET', url: usernameExistsUrl})
                    .then(response => {
                        if (response.data.userId) { // username exists
                            this.setState({
                                usernameExists: true,
                                updating: false
                            });
                        } else { // username does not exist
                            const updatedUserInfo = this.getUpdatedUserInfo();
                            updatedUserInfo['username'] = this.state.username;
                            const url = '/user/' + this.props.authUserId + '/info';
                            const headers = {
                                'Authorization': this.props.jwtToken
                            }
                            axios({method: 'PUT', url: url, headers: headers, data: updatedUserInfo})
                                .then(() => {
                                    this.props.history.push("/user/" + this.state.username);
                                    this.setState({
                                        updating: false
                                    });
                                    return this.props.onLoadAuthUser(this.props.jwtToken);
                                });
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
        } else { // only update other information
            const updatedUserInfo = this.getUpdatedUserInfo();
            if (Object.keys(updatedUserInfo).length > 0) {
                const url = '/user/' + this.props.authUserId + '/info';
                const headers = {
                    'Authorization': this.props.jwtToken
                }
                this.setState({updating: true}, () => {
                    axios({method: 'PUT', url: url, headers: headers, data: updatedUserInfo})
                        .then(response => {
                            this.setState({updating: false});
                            return this.props.onLoadAuthUser(this.props.jwtToken);
                        })
                        .catch(error => {
                            console.log(error);
                            // TODO: set error message
                        });
                });
            }
        }
    };

    render() {
        let warningDiv;
        if (!this.state.validUsername || !this.state.validName || !this.state.validLocation) {
            warningDiv = (
                <div className={styles.authWarningDiv}>
                    <Message attached="bottom" negative>
                        { this.state.invalidInputMessage }
                    </Message>
                </div>
            )
        } else if (this.state.usernameExists) {
            warningDiv = (
                <div className={styles.authWarningDiv}>
                    <Message attached="bottom" negative>
                        Username is already used
                    </Message>
                </div>
            );
        }

        let updateSpinner;
        if (this.state.updating) {
            updateSpinner = (
                <Dimmer active inverted>
                    <Loader size="medium">Updating User Information</Loader>
                </Dimmer>
            );
        } else {
            updateSpinner = null;
        }

        return (
            <div>
                <div className={styles.editInfoHeader}>
                    Edit User Info
                </div>
                { updateSpinner }
                <Grid verticalAlign="middle" textAlign="center">
                    <Grid.Row className={styles.editInfoRow}>
                        <Grid.Column width={4}>
                            <span className={styles.labelSpan}>Username</span>
                        </Grid.Column>
                        <Grid.Column width={12}>
                            <div className={styles.inputDiv}>
                                <Input
                                    size="large"
                                    placeholder="Username"
                                    value={this.state.username}
                                    onChange={this.usernameInputHandler}
                                    fluid
                                />
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className={styles.editInfoRow}>
                        <Grid.Column width={4}>
                            <span className={styles.labelSpan}>Name</span>
                        </Grid.Column>
                        <Grid.Column width={12}>
                            <div className={styles.inputDiv}>
                                <Input
                                    size="large"
                                    placeholder="Name of the User"
                                    value={this.state.name}
                                    onChange={this.nameInputHandler}
                                    fluid
                                />
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className={styles.editInfoRow}>
                        <Grid.Column width={4}>
                            <span className={styles.labelSpan}>Location</span>
                        </Grid.Column>
                        <Grid.Column width={12}>
                            <div className={styles.inputDiv}>
                                <Input
                                    size="large"
                                    placeholder="Location"
                                    value={this.state.location}
                                    onChange={this.locationInputHandler}
                                    fluid
                                />
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <div className={styles.editButtonDiv}>
                    <Button color="orange" fluid size="large" onClick={this.updateClickHandler}
                            disabled={!this.state.validUsername || !this.state.validName || !this.state.validLocation || this.state.updating}
                    >
                        Update User Info
                    </Button>
                </div>
                { warningDiv }
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        authUserId: state.auth.authUserId,
        authUserInfo: state.auth.authUserInfo,
        authUsername: state.auth.authUsername,
        jwtToken: state.auth.jwtToken
    };
};

const mapDispatchToProps = dispatch => {
    return {
        // onLoadUserInfo: (userId) => dispatch(loadUser(userId)),
        onLoadAuthUser: (jwtToken) => dispatch(loadAuthUser(jwtToken))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(EditInfoModal);