import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Auth } from 'aws-amplify';
import { Sticky, Grid, Search, Icon } from 'semantic-ui-react';

import styles from './SiteHeader.module.css';

class SiteHeader extends Component {
    signOutClickHandler = () => {
        Auth.signOut()
            .then(() => {
                this.props.history.push('/auth');
            })
            .catch(error => {
                console.log(error);
            });
    };

    userPageClickHandler = () => {
        if (this.props.authUsername) {
            this.props.history.push('/user/' + this.props.authUsername);
            window.location.reload();
        }
    };

    userFindPageClickHandler = () => {

    };

    render() {
        return (
            <Sticky context={this.props.contextRef} >
                <div className={styles.stickyDiv}>
                    <Grid verticalAlign="middle">
                        <Grid.Column width={1} textAlign="center">
                        </Grid.Column>
                        <Grid.Column width={5} textAlign="center">
                            <a href="/">Rifflo</a>
                        </Grid.Column>
                        <Grid.Column width={4} textAlign="center" className={styles.centerColumn}>
                            <Search size="tiny" placeholder="Search Users & Tags"/>
                        </Grid.Column>
                        <Grid.Column width={1}>
                        </Grid.Column>
                        <Grid.Column width={1} textAlign="center">
                            <Icon name="newspaper outline" size="large"/>
                        </Grid.Column>
                        <Grid.Column width={1} textAlign="center">
                            <Icon name="user" size="large" color="black" onClick={this.userPageClickHandler}
                                  className={this.props.authUsername ? styles.userPageIcon : null}
                            />
                        </Grid.Column>
                        <Grid.Column width={1} textAlign="center">
                            <Icon name="add user" size="large" onClick={this.userFindPageClickHandler}
                                  className={styles.userPageIcon}
                            />
                        </Grid.Column>
                        <Grid.Column width={1} textAlign="center" className={styles.settingsItem}>
                            <Icon name="setting" size="large" className={styles.settingsIcon}/>
                            <div className={styles.dropdownContent}>
                                <span
                                    className={styles.dropdownItemSpan}
                                    onClick={this.signOutClickHandler}>Sign Out
                                </span>
                                <span className={styles.dropdownItemSpan}>
                                    <a className={styles.dropDownItemA} href="/help">Help</a>
                                </span>
                                <span className={styles.dropdownItemSpan}>
                                    <a className={styles.dropDownItemA} href="/contact">Contact</a>
                                </span>
                            </div>
                        </Grid.Column>
                        <Grid.Column width={1}></Grid.Column>
                    </Grid>
                </div>
            </Sticky>
        );
    }
}

const mapStateToProps = state => {
    return {
        authUsername: state.auth.authUsername
    }
};

export default connect(mapStateToProps, null)(SiteHeader);