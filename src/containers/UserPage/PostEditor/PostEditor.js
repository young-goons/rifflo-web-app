import React, { Component } from 'react';
import { Grid, Button, Modal, Dimmer, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';

import axios from '../../../config/axios';
import styles from './PostEditor.module.css';
import SongUploader from '../SongUploader/SongUploader';
// import { sharePost } from '../../../store/actions/upload';

// TODO: for edit, change to confirm instead of upload - do not upload song again
class PostEditor extends Component {
    state = {
        songInfo: {
            track: '',
            artist: '',
            album: '',
            spotifyUrl: '',
            youtubeUrl: '',
            soundcloudUrl: '',
            bandcampUrl: '',
            applemusicUrl: '',
            otherUrl: '',
        },
        songFile: null,
        startTime: 0,
        endTime: 15,
        warning: '',
        songId: null,
        songS3Path: null,
        
        songUploaded: false,
        uploadingSong: false,
        uploadingPost: false,

        content: '',
        tags: '',

        songUploadWarning: false,
        modalOpen: false
    };

    trackInputHandler = (event) => {
        // if (event.target.value.length > 3) {
        //     this.getCandidates(event.target.value, this.state.songInfo.artist);
        // }
        this.setState({
            songInfo: { ...this.state.songInfo, track: event.target.value },
            songId: null
        });
    };

    artistInputHandler = (event) => {
        // if (this.state.songInfo.track.length > 3) {
        //     this.getCandidates(this.state.songInfo.track, event.target.value);
        // }
        this.setState({
            songInfo: { ...this.state.songInfo, artist: event.target.value },
            songId: null
        });
    };

    albumInputHandler = (event) => {
        this.setState({ songInfo: { ...this.state.songInfo, album: event.target.value } });
    };

    releaseDateInputHandler = (event) => {
        this.setState({ songInfo: { ...this.state.songInfo, releaseDate: event.target.value } });
    };

    spotifyUrlInputHandler = (event) => {
        this.setState({ songInfo: { ...this.state.songInfo, spotifyUrl: event.target.value } });
    };

    youtubeUrlInputHandler = (event) => {
        this.setState({ songInfo: { ...this.state.songInfo, youtubeUrl: event.target.value } });
    };

    soundcloudUrlInputHandler = (event) => {
        this.setState({ songInfo: { ...this.state.songInfo, soundcloudUrl: event.target.value } });
    };

    bandcampUrlInputHandler = (event) => {
        this.setState({ songInfo: { ...this.state.songInfo, bandcampUrl: event.target.value } });
    };

    applemusicUrlInputHandler = (event) => {
        this.setState({ songInfo: { ...this.state.songInfo, applemusicUrl: event.target.value } });
    };

    contentInputHandler = (event) => {
        this.setState({
            content: event.target.value
        });
    };

    tagsInputHandler = (event) => {
        this.setState({ tags: event.target.value });
    };

    handleOpen = () => {
        this.setState({modalOpen: true});
    };

    handleClose = () => {
        this.setState({modalOpen: false});
    };

    uploadClickHandler = (songFile, startTime, endTime) => {
        if (endTime - startTime > 15.01 || endTime - startTime < 11.99) {
            this.setState({warning: "Clip length must be between 12 to 15 seconds"});
        } else {
            const song_post_url = '/song';
            const headers = {
                'Authorization': this.props.jwtToken
            };
            let songS3Path;
            this.setState({uploadingSong: true, songFile: songFile}, () => {
                // get presigned post url for s3 upload
                axios({method: 'POST', url: song_post_url, headers: headers, data: {filename: songFile.name}})
                    .then(response => {
                        songS3Path = response.data.res.fields.key;
                        const formData = new FormData();
                        const fields = response.data.res.fields;
                        for (let key in fields) {
                            if (fields.hasOwnProperty(key)) {
                                formData.append(key, fields[key]);
                            }
                        }
                        formData.append('file', songFile)
                        // upload full song to s3
                        return axios({
                            method: 'POST',
                            url: response.data.res.url,
                            data: formData,
                            headers: {'content-type': 'multipart/form-data'}
                        });
                    })
                    .then(() => {
                        // call endpoint to invoke Labmda function to upload clip to S3
                        const clipUrl = '/clip';
                        const clipInfo = {
                            startTime: startTime.toFixed(2),
                            endTime: endTime.toFixed(2),
                            songFile: songFile.name
                        };
                        return axios({
                            method: 'POST',
                            url: clipUrl,
                            headers: headers,
                            data: clipInfo
                        });
                    })
                    .then(() => {
                        // upload song info to RDS
                        const song_info_url = '/song/info';
                        return axios({
                            method: 'POST',
                            url: song_info_url,
                            headers: headers,
                            data: {songInfo: this.state.songInfo, songPath: songS3Path}
                        });
                    })
                    .then(response => {
                        this.setState({
                            songS3Path: songS3Path,
                            startTime: startTime.toFixed(2),
                            endTime: endTime.toFixed(2),
                            modalOpen: false,
                            warning: null,
                            songUploaded: true,
                            uploadingSong: false,
                            songId: response.data.songId
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        this.setState({
                            uploadingSong: false
                        });
                    });
            });
        }
    };

    // TODO: error handling (if the content is too long)
    // TODO: change to the following system
    // upload song with a modal and you can cut it from the userpage i.e.
    // separate song upload request and song cutting request into separate operation instead of changing it
    sharePostHandler = () => {
        const postUrl = '/post';
        const headers = {
            'Authorization': this.props.jwtToken
        };
        const songFileName = this.state.songFile.name;
        const clipFileName = songFileName.split('.').slice(0, -1).join('.') + '_' + this.state.startTime + '_' + this.state.endTime + '.' + songFileName.split('.').slice(-1);
        const postParams = {
            content: this.state.content,
            tags: this.state.tags,
            songId: this.state.songId,
            startTime: this.state.startTime,
            endTime: this.state.endTime,
            songFile: songFileName,
            clipFile: clipFileName
        };
        this.setState({uploadingPost: true}, () => {
            axios({method: 'POST', url: postUrl, headers: headers, data: postParams})
                .then(() => {
                    this.setState({
                        // reset state
                        songInfo: {
                            track: '', artist: '', album: '',
                            spotifyUrl: '', youtubeUrl: '', soundcloudUrl: '',
                            bandcampUrl: '', applemusicUrl: '', otherUrl: '',
                        },
                        songFile: null,
                        startTime: 0,
                        endTime: 15,
                        warning: '',
                        songId: null,
                        songS3Path: null,
                        
                        songUploaded: false,
                        uploadingSong: false,
                        uploadingPost: false,

                        content: '',
                        tags: '',

                        songUploadWarning: false,
                        modalOpen: false
                    })
                })
                .catch(error => {
                    console.log(error);
                    this.setState({
                        uploadingPost: false
                    });
                });
        });
    };

    render() {
        let browseButton;
        if (!this.state.songFile) {
            browseButton = (
                <div className={styles.browseButtonDiv}>
                    <Button onClick={this.handleOpen}>Browse</Button>
                </div>
            );
        }

        const songUploadModal = (
            <Modal trigger={ browseButton } size="tiny"
                   open={this.state.modalOpen} onClose={this.handleClose}>
                <SongUploader
                    songInfo={this.state.songInfo}
                    trackInputHandler={this.trackInputHandler}
                    artistInputHandler={this.artistInputHandler}
                    albumInputHandler={this.albumInputHandler}
                    releaseDateInputHandler={this.releaseDateInputHandler}
                    spotifyUrlInputHandler={this.spotifyUrlInputHandler}
                    youtubeUrlInputHandler={this.youtubeUrlInputHandler}
                    soundcloudUrlInputHandler={this.soundcloudUrlInputHandler}
                    bandcampUrlInputHandler={this.bandcampUrlInputHandler}
                    applemusicUrlInputHandler={this.applemusicUrlInputHandler}
                    warning={this.state.warning}
                    uploadingSong={this.state.uploadingSong}
                    uploadClickHandler={this.uploadClickHandler}
                />
            </Modal>
        );

        let songUploadDiv = (
            <div className={styles.uploadSongDiv}>
                <div className={styles.browseHeaderDiv}>Upload Your Song (.mp3, .wav)</div>
                { songUploadModal }
            </div>
        );
        if (this.state.songUploaded) {
            const songInfoDiv = (
                <Grid>
                    <Grid.Row className={styles.songInfoFirstRow}>
                        <Grid.Column width="5" textAlign="left" className={styles.songInfoLabelColumn}>
                            Track
                        </Grid.Column>
                        <Grid.Column width="11" textAlign="left" className={styles.songInfoColumn}>
                            {this.state.songInfo.track}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className={styles.songInfoRow}>
                        <Grid.Column width="5" textAlign="left" className={styles.songInfoLabelColumn}>
                            Artist
                        </Grid.Column>
                        <Grid.Column width="11" textAlign="left" className={styles.songInfoColumn}>
                            {this.state.songInfo.artist}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className={styles.songInfoRow}>
                        <Grid.Column width="5" textAlign="left" className={styles.songInfoLabelColumn}>
                            Clip Start
                        </Grid.Column>
                        <Grid.Column width="11" textAlign="left" className={styles.songInfoColumn}>
                            {this.state.startTime}
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className={styles.songInfoRow}>
                        <Grid.Column width="5" textAlign="left" className={styles.songInfoLabelColumn}>
                            Clip End
                        </Grid.Column>
                        <Grid.Column width="11" textAlign="left" className={styles.songInfoColumn}>
                            {this.state.endTime}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            );
            songUploadDiv = (
                <div className={styles.uploadSongDiv}>
                    { songInfoDiv }
                    { songUploadModal }
                </div>
            )
        }

        let uploadingSpinner;
        if (this.state.uploadingPost) {
            uploadingSpinner = (
                <Dimmer active inverted>
                    <Loader>Sharing</Loader>
                </Dimmer>
            );
        }

        return (
            <Grid columns="2">
                { uploadingSpinner }
                <Grid.Column>
                    { songUploadDiv }
                </Grid.Column>
                <Grid.Column>
                    <Grid.Row>
                        <div className={styles.tagInputDiv}>
                            <input
                                placeholder="Write tags"
                                className={styles.uploadInput}
                                onChange={this.tagsInputHandler}
                                value={this.state.tags}
                            />
                        </div>
                    </Grid.Row>
                    <Grid.Row className={styles.songUploadRow}>
                        <div className={styles.postInputDiv}>
                            <textarea
                                placeholder="Write post"
                                className={styles.postTextArea}
                                onChange={this.contentInputHandler}
                                value={this.state.content}
                            />
                            <div className={styles.shareButtonDiv}>
                                <Button fluid onClick={this.sharePostHandler} color="orange" disabled={!this.state.songFile}>
                                    Share
                                </Button>
                            </div>
                        </div>
                    </Grid.Row>
                </Grid.Column>
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

export default connect(mapStateToProps, null)(PostEditor);