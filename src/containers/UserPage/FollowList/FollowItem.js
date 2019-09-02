import React, { Component } from 'react';
import { List, Image, Item } from 'semantic-ui-react';

import axios from '../../../config/axios';
import styles from './FollowList.module.css';
import defaultProfileImg from '../../../resources/defaultProfileImg.png';

class FollowItem extends Component {
    state = {
        username: null,
        profileImgSrc: null,
        profileImgLoadFail: false,
        postCnt: null
    };

    componentDidMount() {
        const userInfoUrl = "/user/id/" + this.props.userId;
        const headers = {
            'Authorization': this.props.jwtToken
        };
        axios({method: 'GET', url: userInfoUrl, headers: headers})
            .then(response => {
                console.log(response);
                this.setState({username: response.data.username});
            })
            .catch(error => {
                console.log(error);
            });

        const userProfileImgUrl = "/user/" + this.props.userId + "/profile/image";
        axios({method: 'GET', url: userProfileImgUrl, headers: headers})
            .then(response => {
                this.setState({profileImgSrc: response.data.url});
            })
            .catch(error => {
                console.log(error);
            });

        if (!this.state.postCnt) {
            const url = "/user/" + this.props.userId + "/posts";
            axios({method: 'GET', url: url})
                .then(response => {
                    this.setState({postCnt: response.data.postIdArr.length});
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    render() {
        let profileImg;
        if (this.state.profileImgLoadFail || !this.state.profileImgSrc) {
            profileImg = (
                <Image className={styles.followImg} alt={'profileImage_' + this.props.userId} src={defaultProfileImg}/>
            );
        } else {
            profileImg = (
                <Image className={styles.followImg} alt={'profileImage_' + this.props.userId} src={this.state.profileImgSrc}
                    onError={(e) => {
                        if (!this.state.profileImgLoadFail) {
                            this.setState({profileImgLoadFail: true});
                        }}}
                />
            );
        }

        let usernameStr;
        if (this.state.username) {
            if (this.state.username.length > 23) {
                usernameStr = this.state.username.substring(0, 23) + '...';
            } else {
                usernameStr = this.state.username;
            }
        }

        return (
            <List.Item className={styles.listItem}>
                { profileImg }
                <List.Content>
                    <List.Header size="large">
                        <div className={styles.followUsernameDiv}>
                            <a href={"/" + this.state.username}>
                                { usernameStr }
                            </a>
                        </div>
                    </List.Header>
                    <List.Description>
                        <div className={styles.shareNumDiv}>
                            { this.state.postCnt } { this.state.postCnt <= 1 ? "share" : "shares" }
                        </div>
                    </List.Description>
                </List.Content>
            </List.Item>
            // <Item>
            //     <Item.Image/>
            //     <Item.Meta>Shares</Item.Meta>
            // </Item>
        );
    }
}

export default FollowItem