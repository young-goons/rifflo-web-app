import React, { Component } from 'react';
import { Sticky, Grid, Search, Icon, Image, List } from 'semantic-ui-react';
import { Auth } from 'aws-amplify';

import styles from './SiteHeader.module.css';
import defaultProfileImg from '../../resources/defaultProfileImg.png';
import axios from '../../config/axios';

class SiteHeader extends Component {
    state = {
        userId: '',
        email: '',
        username: '',
        jwtToken: '',
        profileImgSrc: null,
        imageLoadFail: false
    };

    componentWillReceiveProps(nextProps) {
        if (this.state.userId === '' && this.state.email === '' && this.state.username === '' && this.state.jwtToken === '') {
            this.setState({
                userId: nextProps.userId,
                email: nextProps.email,
                username: nextProps.username,
                jwtToken: nextProps.jwtToken
            });
            const headers = {
                'Authorization': nextProps.jwtToken
            };
            const url = '/user/' + nextProps.userId  +'/profile/image';
            axios({method: 'GET', url: url, headers: headers})
                .then(response => {
                    console.log(response);
                    this.setState({profileImgSrc: response.data.url});
                })
                .catch(error => {
                    console.log(error);
                })
        }
    }

    signOutClickHandler = () => {
        Auth.signOut()
            .then(() => {
                // this.setState({
                //     userId: '',
                //     email: '',
                //     username: '',
                //     jwtToken: '',
                //     profileImgSrc: '',
                //     imageLoadFail: false
                // });
                console.log(this.state);
                this.props.history.push('/auth');
            })
            .catch(error => {
                console.log(error);
            });
    };

    render() {
        console.log(this.props);
        // let image;
        // if (this.state.imageLoadFail || !this.state.profileImgSrc) {
        //     image = <Image circular fluid size="mini" src={defaultProfileImg}/>;
        // }
        // else {
        //     image = <Image circular fluid size="mini" src={this.state.profileImgSrc}
        //              onError={(e) => {
        //                  if (!this.state.imageLoadFail) {
        //                      this.setState({imageLoadFail: true});
        //                  }
        //              }}/>;
        // }

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
                            <Icon name="user" size="large" />
                        </Grid.Column>
                        <Grid.Column width={1} textAlign="center">
                            <Icon name="add user" size="large"/>
                        </Grid.Column>
                        <Grid.Column width={1} textAlign="center" className={styles.settingsItem}>
                            <Icon name="setting" size="large" className={styles.settingsIcon}/>
                            <div className={styles.dropdownContent}>
                                <span
                                    className={styles.dropdownItemSpan}
                                    onClick={this.signOutClickHandler}>Sign Out
                                </span>
                                <span className={styles.dropdownItemSpan}>
                                    <a href="/help">Help</a>
                                </span>
                                <span className={styles.dropdownItemSpan}>
                                    <a href="/contact">Contact</a>
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

export default SiteHeader;