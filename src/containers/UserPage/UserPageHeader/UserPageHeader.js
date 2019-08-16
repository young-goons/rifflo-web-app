import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Button, Label, Modal, Icon } from 'semantic-ui-react';

import axios from '../../../config/axios';
import styles from './UserPageHeader.module.css';
import defaultProfileImg from '../../../resources/defaultProfileImg.png';
import defaultHeaderImg from '../../../resources/defaultHeaderImg.png';
import ImageUploader from "../../ImageUploader/ImageUploader";
import EditInfoModal from "./EditInfoModal/EditInfoModal";
// import UserInfoModal from "./UserInfoModal/UserInfoModal";

class UserPageHeader extends Component {
    /* UserPageHeader rendered after getting authUserId and userId
     * Guaranteed that this.props.authUserId !== null and this.props.userId !== null
     */

    state = {
        // userInfoModalOpen: false

        profileImgSrc: null,
        profileImgLoadFail: false,
        profileImgModalOpen: false,
        profileImgDeleting: false,

        headerImgSrc: null,
        headerImgLoadFail: false,
        headerImgModalOpen: false,
        headerImgDeleting: false,

        editInfoModalOpen: false
    };

    componentDidMount() {
        this.getProfileImgSrc();
        this.getHeaderImgSrc();
    }

    getProfileImgSrc = () => {
        const profileImgUrl = '/user/' + this.props.userId  + '/profile/image';
        const headers = {
            'Authorization': this.props.jwtToken
        };
        axios({method: 'GET', url: profileImgUrl, headers: headers})
            .then(response => {
                this.setState({
                    profileImgSrc: response.data.url,
                    profileImgLoadFail: false,
                    profileImgModalOpen: false,
                });
            })
            .catch(error => {
                // console.log(error.response);
            });
    };

    uploadProfileImage = (blob, blobName) => {
        const uploadUrl = "/user/" + this.props.authUserId + "/profile/image";
        const headers = {
            'Authorization': this.props.jwtToken
        };
        axios({method: 'POST', url: uploadUrl, headers: headers})
            .then(response => {
                const formData = new FormData();
                const fields = response.data.res.fields;
                for (let key in fields) {
                    if (fields.hasOwnProperty(key)) {
                        formData.append(key, fields[key]);
                    }
                }
                formData.append('file', blob, blobName);

                return axios({
                    method: 'POST',
                    url: response.data.res.url,
                    headers: {'content-type': 'multipart/form-data'},
                    data: formData
                });
            })
            .then(() => {
                return this.getProfileImgSrc();
            })
            .catch(error => {
                // console.log(error.response);
            });
    };

    deleteProfileImage = () => {
        const url = "/user/" + this.props.authUserId + "/profile/image";
        const headers = {
            'Authorization': this.props.jwtToken
        };
        this.setState({
            profileImgDeleting: true
        }, () => {
            axios({method: 'DELETE', url: url, headers: headers})
            .then(response => {
                this.setState({
                    profileImgSrc: null,
                    profileImgLoadFail: false,
                    profileImgDeleting: false,
                    profileImgModalOpen: false
                });
            })
            .catch(error => {
                console.log(error.response);
                this.setState({
                    profileImgDeleting: false,
                });
            });
        });
    };

    getHeaderImgSrc = () => {
        const headerImgUrl = '/user/' + this.props.userId + '/header/image';
        const headers = {
            'Authorization': this.props.jwtToken
        };
        axios({method: 'GET', url: headerImgUrl, headers: headers})
            .then(response => {
                this.setState({
                    headerImgSrc: response.data.url,
                    headerImgLoadFail: false,
                    headerImgModalOpen: false
                });
            })
            .catch(error => {
                // console.log(error.response);
            });
    };

    uploadHeaderImage = (blob, blobName) => {
        const uploadUrl = "/user/" + this.props.authUserId + "/header/image";
        const headers = {
            'Authorization': this.props.jwtToken
        };
        axios({method: 'POST', url: uploadUrl, headers: headers})
            .then(response => {
                const formData = new FormData();
                const fields = response.data.res.fields;
                for (let key in fields) {
                    if (fields.hasOwnProperty(key)) {
                        formData.append(key, fields[key]);
                    }
                }
                formData.append('file', blob, blobName);

                return axios({
                    method: 'POST',
                    url: response.data.res.url,
                    headers: {'content-type': 'multipart/form-data'},
                    data: formData
                });
            })
            .then(() => {
                return this.getHeaderImgSrc();
            })
            .catch(error => {
                // console.log(error.response);
            });
    }

    deleteHeaderImage = () => {
        const url = "/user/" + this.props.authUserId + "/header/image";
        const headers = {
            'Authorization': this.props.jwtToken
        };
        this.setState({
            headerImgDeleting: true
        }, () => {
            axios({method: 'DELETE', url: url, headers: headers})
            .then(response => {
                this.setState({
                    headerImgSrc: null,
                    headerImgLoadFail: false,
                    headerImgDeleting: false,
                    headerImgModalOpen: false
                });
            })
            .catch(error => {
                console.log(error.response);
                this.setState({
                    headerImgDeleting: false,
                });
            });
        });
    };

    profileImgHandleOpen = () => {
        this.setState({profileImgModalOpen: true});
    };

    profileImgHandleClose = () => {
        this.setState({profileImgModalOpen: false});
    };

    headerImgHandleOpen = () => { 
        this.setState({headerImgModalOpen: true});
    };

    headerImgHandleClose = () => {
        this.setState({headerImgModalOpen: false});
    };

    userInfoHandleOpen = () => {
        this.setState({userInfoModalOpen: true});
    };

    userInfoHandleClose = () => {
        this.setState({userInfoModalOpen: false});
    };

    editInfoHandleOpen = () => {
        this.setState({editInfoModalOpen: true});
    };

    editInfoHandleClose = () => {
        this.setState({editInfoModalOpen: false});
    };

    render () {
        let followButtonDiv;
        let profileImgModal, profileImg;
        let headerImgModal, headerImg;
        let editInfoModal, editInfoIcon;
        let userInfoModal, userInfoIcon;

        let displayedUsername = "";
        if (this.props.username) {
            if (this.props.username.length < 20) {
                displayedUsername = this.props.username;
            } else {
                displayedUsername = this.props.username.substring(0, 20) + '...';
            }
        }

        let ownPage, profileImgClass, headerImgClass;
        if (this.props.authUserId === this.props.userId) {
            ownPage = true;
            profileImgClass = styles.profileImg + ' ' + styles.profileImgModal;
            headerImgClass = styles.headerImg + ' ' + styles.headerImgModal;
        } else {
            ownPage = false;
            profileImgClass = styles.profileImg;
            headerImgClass = styles.headerImg;
        }

        if (this.state.profileImgLoadFail || !this.state.profileImgSrc) {
            profileImg = (
                <img className={profileImgClass} alt='profileImage' src={defaultProfileImg}        
                    onClick={ownPage ? this.profileImgHandleOpen : null }
                />
            );
        } else {
            profileImg = (
                <img className={profileImgClass} alt='profileImage' src={this.state.profileImgSrc}
                    onError={(e) => {
                        if (!this.state.profileImgLoadFail) {
                            this.setState({profileImgLoadFail: true});
                        }}}
                    onClick={ownPage ? this.profileImgHandleOpen : null}
                />);
        }

        if (this.state.headerImgLoadFail || !this.state.headerImgSrc) {
            headerImg = (
                <img className={headerImgClass} alt='headerImage' src={defaultHeaderImg}
                    onClick={ownPage ? this.headerImgHandleOpen : null}
                />
            );
        } else {
            headerImg = (
                <img className={headerImgClass} alt='headerImage' src={this.state.headerImgSrc}
                    onError={(e) => {
                        if (!this.state.headerImgLoadFail) {
                            this.setState({headerImgLoadFail: true});
                        }}}
                    onClick={ownPage ? this.headerImgHandleOpen : null}
                />
            );
        }

        if (ownPage) {
            editInfoIcon = (
                <span className={styles.userIconSpan}>
                    <Icon name="pencil" size="tiny" onClick={this.editInfoHandleOpen}/>
                </span>
            );
            profileImgModal = (
                <Modal trigger={profileImg} size="small" centered={false}
                       open={this.state.profileImgModalOpen} onClose={this.profileImgHandleClose}>
                    <ImageUploader
                        userId={this.props.userId}
                        onUploadImage={this.uploadProfileImage}
                        onDeleteImage={this.deleteProfileImage}
                        imgDeleting={this.state.profileImgDeleting}
                        aspectRatio={1 / 1}
                        newFilename="profileImage.jpeg"
                        headerSentence="Upload New Profile Picture"
                        cropDefaultWidth={150}
                        maxWidth={700}
                        maxHeight={700}
                        imageSrc={this.state.profileImgSrc}
                    />
                </Modal>
            );
            headerImgModal = (
                <Modal trigger={headerImg} size="large" centered={false}
                       open={this.state.headerImgModalOpen} onClose={this.headerImgHandleClose}>
                    <ImageUploader
                        userId={this.props.userId}
                        onUploadImage={this.uploadHeaderImage}
                        onDeleteImage={this.deleteHeaderImage}
                        imgDeleting={this.state.headerImgDeleting}
                        aspectRatio={796 / 180}
                        newFilename="headerImage.jpeg"
                        headerSentence="Upload New Header Picture"
                        cropDefaultWidth={400}
                        maxwidth={1500}
                        maxHeight={1500}
                        imageSrc={this.state.headerImgSrc}
                    />
                </Modal>
            );
            if (this.props.username && this.props.userInfo) {
                editInfoModal = (
                    <Modal trigger={editInfoIcon} size="tiny" centered={true}
                           open={this.state.editInfoModalOpen} onClose={this.editInfoHandleClose}>
                        <EditInfoModal
                            history={this.props.history}
                            handleClose={this.editInfoHandleClose}
                        />
                    </Modal>
                )
            }
        } else { // other user's page
            if (this.props.followerArr) {
                followButtonDiv = (
                    <div className={styles.followButtonDiv}>
                        <Button as='div' labelPosition='right' size='large' compact className={styles.followButton}>
                            <Button size='medium' compact color={this.props.isFollowed ? "grey" : "teal"}
                                    onClick={() => {this.props.followClickHandler(this.props.userId, this.props.jwtToken)}}
                                    disabled={this.props.followProcessing}
                            >
                                        <span className={styles.buttonSpan}>
                                            {this.props.isFollowed ? "following" : "follow"}
                                        </span>
                            </Button>
                            <Label size='medium' basic pointing='left'
                                    color={this.props.isFollowed ? "grey" : "teal"}>
                                {this.props.followerArr ? this.props.followerArr.length : 0}
                            </Label>
                        </Button>
                    </div>
                );
            }
            // userInfoIcon = (
            //     <span className={styles.userIconSpan}>
            //             <Icon name="info" size="tiny" onClick={this.userInfoHandleOpen}/>
            //         </span>
            // );
            // userInfoModal = (
            //     <Modal trigger={userInfoIcon} size="tiny" centered={true}
            //             open={this.state.userInfoModalOpen} onClose={this.userInfoHandleClose}>
            //         <UserInfoModal
            //             userId={this.props.userId}
            //         />
            //     </Modal>
            // );
        }

        return (
            <Grid>
                <Grid.Row>
                    <div className={styles.usernameDiv}>
                        { displayedUsername }
                        { editInfoModal }
                        {/*{ userInfoModal }*/}
                    </div>
                    { ownPage ? profileImgModal : profileImg }
                    { followButtonDiv }
                    <Grid.Column width={16}>
                        <div className={styles.headerImgDiv}>
                            { ownPage ? headerImgModal : headerImg }
                        </div>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row centered className={styles.userPageMenuRow}>
                    <Grid.Column width={3} textAlign="center">
                        <div className={styles.userPageLeftmostMenuEntry}>"</div>
                    </Grid.Column>
                    <Grid.Column width={3} textAlign="center" className={styles.userPageMenu}>
                        <div className={styles.userPageMenuEntry}>
                            <span className={styles.pageSubheader} onClick={this.props.sharesClickHandler}>
                                {/*{this.props.shareCnt} { this.state.shareCnt <= 1 ? "share" : "shares" }*/}
                            </span>
                        </div>
                    </Grid.Column>
                    <Grid.Column width={3} textAlign="center" className={styles.userPageMenu}>
                        <div className={styles.userPageMenuEntry}>
                            <span className={styles.pageSubheader} onClick={this.props.historyClickHandler}>
                                History
                            </span>
                        </div>
                    </Grid.Column>
                    <Grid.Column width={3} textAlign="center" className={styles.userPageMenu}>
                        <div className={styles.userPageMenuEntry}>
                            <span className={styles.pageSubheader} onClick={this.props.followersClickHandler}>
                                {this.props.followerArr ? this.props.followerArr.length : 0} followers
                            </span>
                        </div>
                    </Grid.Column>
                    <Grid.Column width={3} textAlign="center" className={styles.userPageMenu}>
                        <div className={styles.userPageMenuEntry}>
                            <span className={styles.pageSubheader} onClick={this.props.followingClickHandler}>
                                {this.props.followingArr ? this.props.followingArr.length : 0} following
                            </span>
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

const mapStateToProps = state => {
    return {
        authUserId: state.auth.authUserId,
        jwtToken: state.auth.jwtToken
    };
};

export default connect(mapStateToProps, null)(UserPageHeader);