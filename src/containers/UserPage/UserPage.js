import React, { Component } from 'react';
import { connect } from 'react-redux';

import axios from '../../config/axios';

import SiteHeader from '../SiteHeader/SiteHeader';
import UserPageHeader from './UserPageHeader/UserPageHeader';
// import SharedPost from './SharedPost/SharedPost';
// import History from './History/History';
// import FollowList from './FollowList/FollowList';
import NoUserPage from './NoUserPage/NoUserPage';
// import PostEditor from './PostEditor/PostEditor';
import styles from './UserPage.module.css';

class UserPage extends Component {
    state = {
        userId: null,
        username: null,
        userInfo: null,
        checkUsernameExists: false,
    };

    componentDidMount() {
        // check if username exists
        const url = '/user/username/' + this.props.match.params.username + '/id';
        axios({method: 'GET', url: url})
            .then(response => {
                this.setState({
                    userId: response.data.userId,
                    checkUsernameExists: true
                });
            })
            .catch(error => {
                console.log(error);
            });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.jwtToken && this.state.username === null) { // loading userinfo
            const url = '/user/username/' + this.props.match.params.username;
            const headers = {
                'Authorization': nextProps.jwtToken
            };
            axios({method: 'GET', url: url, headers: headers})
                .then(response => {
                    this.setState({
                        username: this.props.match.params.username,
                        userInfo: response.data.userInfo
                    })
                })
                .catch(error => {
                    console.log(error);
                });
        } else if (this.state.username === this.props.authUsername) { // when own page
            if (this.props.username !== nextProps.authUsername) { // when authusername is changed
                this.setState({username: nextProps.authUsername});
            }
        }
    }

    // componentDidUpdate() {
    //     if (!this.props.postLoaded && this.state.userId && this.state.authUserInfo && !this.state.postLoadReq) {
    //         console.log("load user posts");
    //         this.setState({postLoadReq: true});
    //         this.props.onLoadUserPosts(this.state.userId);
    //     }
    // }

    sharesClickHandler = () => {
        this.setState({pageContent: 'shares'});
    };

    historyClickHandler = () => {
        this.setState({pageContent: 'history'});
    };

    followersClickHandler = () => {
        this.setState({pageContent: 'followers'});
    };

    followingClickHandler = () => {
        this.setState({pageContent: 'following'});
    };

    startPlayingClip = (postId) => {
        this.setState({isClipPlaying: postId});
    };

    endPlayingClip = () => {
        this.setState({isClipPlaying: null});
    };

    render() {
        let renderDiv;
        // // TODO: psuedo-randomize the order
        // const postDivArr = this.state.postArr.map((post, idx) => {
        //     return (
        //         <div key={idx} className={styles.postListDiv}>
        //             <SharedPost
        //                 postId={post.postId}
        //                 songName={post.songName}
        //                 artist={post.artist}
        //                 tags={post.tags}
        //                 urlObj={post.urlObj}
        //                 startPlayingClip={this.startPlayingClip}
        //                 endPlayingClip={this.endPlayingClip}
        //                 isClipPlaying={this.state.isClipPlaying}
        //             />
        //         </div>
        //     );
        // });
        //
        // if (this.state.pageContent === 'shares') {
        //     contentDiv = postDivArr;
        // } else if (this.state.pageContent === 'followers') {
        //     contentDiv = <FollowList followType='followers' userId={this.state.userId}/>;
        // } else if (this.state.pageContent === 'following') {
        //     contentDiv = <FollowList followType='following' userId={this.state.userId}/>;
        // } else if (this.state.pageContent === 'history') {
        //     contentDiv = <History authUserId={this.state.authUserId} userId={this.state.userId}/>
        // }

        if (this.props.authUserId) {
            let userPageDiv;
            if (this.state.checkUsernameExists && this.state.userId === null) {
                userPageDiv = <NoUserPage/>;
            } else {

                // userPageDiv = <div>{this.state.userId}</div>
                // let postUploadDiv;
                // if (this.props.authUserInfo.username === username) {
                //     postUploadDiv = (
                //         <PostEditor/>
                //     );
                // }
                userPageDiv = (
                    <div className={styles.userPageContainerDiv}>
                        <UserPageHeader
                            userId={this.state.userId}
                            username={this.state.username}
                            userInfo={this.state.userInfo}
                            // shareCnt={this.state.postArr.length}
                            history={this.props.history}
                            sharesClickHandler={this.sharesClickHandler}
                            historyClickHandler={this.historyClickHandler}
                            followersClickHandler={this.followersClickHandler}
                            followingClickHandler={this.followingClickHandler}
                        />
                        {/*<div className={styles.userPageContentDiv}>*/}
                        {/*    { this.state.pageContent === 'shares' ? postUploadDiv : null }*/}
                        {/*    { contentDiv }*/}
                        {/*</div>*/}
                    </div>
                );
            }
            renderDiv = (
                <div className={styles.containerDiv} ref={this.contextRef}>
                    { userPageDiv }
                </div>
            );
        } else {
            renderDiv = <div></div>;
        }

        return (
            <div className={styles.containerDiv}>
                <SiteHeader history={this.props.history}/>
                { renderDiv }
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        authUserId: state.auth.authUserId,
        authUsername: state.auth.authUsername,
        authUserInfo: state.auth.authUserInfo,
        jwtToken: state.auth.jwtToken
    };
};

// const mapDispatchToProps = dispatch => {
//     return {
//         onLoadAuthUser: (userId) => dispatch(loadAuthUser(userId)),
//         onLoadUserPosts: (userId) => dispatch(loadUserPosts(userId)),
//         onLoadUserUpdatedPosts: (postId, postArr) => dispatch(loadUserUpdatedPosts(postId, postArr))
//     };
// };

export default connect(mapStateToProps, null)(UserPage);
