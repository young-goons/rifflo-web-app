import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Icon, Button, Message, Dimmer, Loader } from 'semantic-ui-react';

import axios from '../../../config/axios';
// import { uploadSong } from '../../../store/actions/upload';
import { getEndTimeStr, getCurrentTimeStr,
         getCurrentTimeFloatStr, convertTimeStrToTime } from "../../../utils/musicUtils";
import { DEFAULT_CLIP_LENGTH } from "../../../config/constants";
import SongInfoEditor from "./SongInfoEditor";
import styles from './SongUploader.module.css';

// TODO: make slider to help changing start point
//       forward 5 seconds backward 5 seconds
//       preload so that even if the user accidentally closes modal, the song is still there

class SongUploader extends Component {
    state = {
        termsChecked: false,
        songId: null,
        candidateArr: [],
        candidateBoxOn: false,
        src: null,
        songFile: null,
        startTime: 0,
        startTimeStr: '00:00.00',
        endTime: 15,
        endTimeStr: '00:15.00',
        currentTimeStr: '00:00',
        progressPercent: 0,
        audioLength: null,
        isPlaying: false,
    };

    audioRef = React.createRef();

    trackInputHandler = (event) => {
        if (event.target.value.length > 3) {
            this.getCandidates(event.target.value, this.state.songInfo.artist);
        }
        this.setState({
            songInfo: { ...this.state.songInfo, track: event.target.value },
            songId: null
        });
    };

    // artistInputHandler = (event) => {
    //     if (this.state.songInfo.track.length > 3) {
    //         this.getCandidates(this.state.songInfo.track, event.target.value);
    //     }
    //     this.setState({
    //         songInfo: { ...this.state.songInfo, artist: event.target.value },
    //         songId: null
    //     });
    // };

    getCandidates = (title, artist) => {
        const url = "/song";
        const params = {
            title: title,
            artist: artist,
            numResults: 10
        };
        axios({method: 'GET', url: url, params: params})
            .then(response => {
                this.setState({
                    candidateBoxOn: true,
                    candidateArr: response.data.results
                });
            })
            .catch(error => {
                console.log(error);
            });
    };

    termsCheckHandler = () => {
        this.setState({
            termsChecked: !this.state.termsChecked
        });
    };

    uploadFileHandler = (event) => {
        if (window.FileReader){
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (r) => {
                    this.setState({
                        src: r.target.result,
                        songFile: file
                    });
                    this.audioRef.current.onloadedmetadata = () => {
                        const audioLength = this.audioRef.current.duration;
                        this.setState({audioLength: audioLength});
                    }
                };
                reader.readAsDataURL(file);
            }
        } else {
            alert('Sorry, your browser does\'nt support for preview');
        }

    };

    startTimeInputHandler = (event) => {
        // TODO: make it easier to write valid time format
        const timeStr = event.target.value,
              pattern = "^[0-5][0-9]\\:[0-5][0-9]\\.[0-9]{2}$";
        if (timeStr.match(pattern)) {
            const time = convertTimeStrToTime(timeStr);
            this.setState({
                startTime: time,
                startTimeStr: getCurrentTimeFloatStr(time),
                endTime: time + DEFAULT_CLIP_LENGTH,
                endTimeStr: getCurrentTimeFloatStr(time + DEFAULT_CLIP_LENGTH)
            });
        } else {
            this.setState({startTimeStr: event.target.value});
        }
    };

    endTimeInputHandler = (event) => {
        this.setState({endTime: event.target.value});
    };

    playClickHandler = () => {
        // not sure how to wait until the song is fully loaded
        // this.audioRef.current.currentTime = this.state.startTime;
        const player = this.audioRef.current;
        player.currentTime = this.state.startTime;
        player.play();
        this.setState({isPlaying: true});
    };

    pauseClickHandler = () => {
        const player = this.audioRef.current;
        player.pause();
        this.setState({
            startTime: player.currentTime,
            isPlaying: false
        });
    };

    playRangeClickHandler = () => {
        // only if both start and end time match the format
        const player = this.audioRef.current;
        player.currentTime = this.state.startTime;
        player.play();
        this.setState({isPlaying: true});
    };

    initProgressBar = () => {
        const player = this.audioRef.current;
        if (this.audioRef.current.currentTime > this.state.endTime) {
            this.audioRef.current.pause();
            this.setState({isPlaying: false});
        }
        const currentTime = player.currentTime;
        const currentTimeStr = getCurrentTimeStr(currentTime);
        this.setState({
            currentTime: currentTime,
            currentTimeStr: currentTimeStr,
            progressPercent: currentTime / this.state.audioLength
        });
    };

    onProgressBarClick = (event) => {
        const player = this.audioRef.current;
        const percent = event.nativeEvent.offsetX / event.nativeEvent.target.offsetWidth;
        player.currentTime = this.state.audioLength * percent;
        this.setState({
            progressPercent: percent,
            startTime: this.state.audioLength * percent,
            startTimeStr: getCurrentTimeFloatStr(this.state.audioLength * percent),
            endTime: this.state.audioLength * percent + DEFAULT_CLIP_LENGTH,
            endTimeStr: getCurrentTimeFloatStr(this.state.audioLength * percent + DEFAULT_CLIP_LENGTH)
        });
    };

    candidateClickHandler = (idx) => {
        const candidateInfo = this.state.candidateArr[idx];
        this.setState({
            songInfo: {
                ...this.state.songInfo,
                track: candidateInfo.title,
                artist: candidateInfo.artist,
                spotifyUrl: candidateInfo.spotifyUrl ? candidateInfo.spotifyUrl : '',
                youtubeUrl: candidateInfo.youtubeUrl ? candidateInfo.youtubeUrl: '',
                soundcloudUrl: candidateInfo.soundCloudUrl ? candidateInfo.soundCloudUrl : '',
                bandcampUrl: candidateInfo.bandcampUrl ? candidateInfo.bandcampUrl : '',
                applemusicUrl: candidateInfo.applemusicUrl ? candidateInfo.applemusicUrl : '',
            },
            candidateBoxOn: false,
            songId: candidateInfo.songId
        })
    };

    render() {
        let audioDiv, progressDiv;
        if (this.state.src) {
            audioDiv = (
                <div>
                    <audio src={this.state.src} ref={this.audioRef}
                           onTimeUpdate={this.initProgressBar} preload="metadata"/>
                </div>
            );
            if (this.state.audioLength && this.state.src) { // when metadata is loaded
                const clipLengthStr = getEndTimeStr(this.state.audioLength);
                progressDiv = (
                    <div>
                        { this.state.isPlaying ?
                            <Icon name="pause" size="big" onClick={this.pauseClickHandler}/> :
                            <Icon name="play" size="big" onClick={this.playClickHandler}/>
                        }
                        <progress value={this.state.progressPercent} max="1" className={styles.progressBar}
                                  onClick={this.onProgressBarClick}/>
                        <br/>
                        <span className={styles.currTimeDiv}>{this.state.currentTimeStr}</span>
                        <span className={styles.clipLengthDiv}>{clipLengthStr}</span>
                        <div className={styles.timeInputDiv}>
                            <input type="text" className={styles.timeInput} value={this.state.startTimeStr}
                                   onChange={this.startTimeInputHandler}
                            />
                            <span className={styles.tildeSpan}> ~ </span>
                            <input type="text" className={styles.timeInput} value={this.state.endTimeStr}
                                   onChange={this.endTimeInputHandler}/>
                            <span className={styles.playRangeSpan}
                                  onClick={this.playRangeClickHandler}>
                                Play Selected Range
                            </span>
                        </div>
                    </div>
                );
            }
        }

        let candidateBox, candidateDivArr;
        if (this.state.candidateArr) {
            candidateDivArr = this.state.candidateArr.map((candidate, idx) => {
                return (
                    <Grid.Row key={idx} className={styles.candidateRow}>
                        <Grid.Column width={8}>
                            <span
                                className={styles.candidateInfoSpan}
                                onClick={() => this.candidateClickHandler(idx)}
                            > {candidate.title}
                            </span>
                        </Grid.Column>
                        <Grid.Column width={8}>
                            <span
                                className={styles.candidateInfoSpan}
                                onClick={() => this.candidateClickHandler(idx)}
                            > {candidate.artist}
                            </span>
                        </Grid.Column>
                    </Grid.Row>
                );
            });
        }
        if (this.state.candidateBoxOn) {
            candidateBox = (
                <div className={styles.candidateBoxDiv}>
                    <Grid>
                        <Grid.Row textAlign="left" className={styles.candidateBoxLabelRow}>
                            <Grid.Column width={8}>
                                Title
                            </Grid.Column>
                            <Grid.Column width={8}>
                                Artist
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                    <Grid className={styles.candidateBox}>
                        { candidateDivArr }
                    </Grid>
                </div>
            );
        }

        let warningDiv;
        if (this.props.warning) {
            warningDiv = (
                <div className={styles.warningDiv}>
                    <Message attached="bottom" negative>
                        {this.props.warning}
                    </Message>
                </div>
            );
        }

        let uploadingSpinner;
        if (this.props.uploadingSong) {
            uploadingSpinner = (
                <Dimmer active inverted>
                    <Loader>Uploading</Loader>
                </Dimmer>
            );
        }

        return (
            <div className={styles.songUploadDiv}>
                { uploadingSpinner }
                <div className={styles.fileUploaderDiv}>
                    <input type="file" accept=".mp3, .wav" className={styles.songFileInput}
                        onChange={this.uploadFileHandler}/>
                </div>
                { audioDiv }
                <div className={styles.audioPlayDiv}>
                    { progressDiv }
                </div>
                { candidateBox }
                <SongInfoEditor
                    track={this.props.songInfo.track}
                    trackInputHandler={this.props.trackInputHandler}
                    artist={this.props.songInfo.artist}
                    artistInputHandler={this.props.artistInputHandler}
                    album={this.props.songInfo.album}
                    albumInputHandler={this.props.albumInputHandler}
                    spotifyUrl={this.props.songInfo.spotifyUrl}
                    spotifyUrlInputHandler={this.props.spotifyUrlInputHandler}
                    youtubeUrl={this.props.songInfo.youtubeUrl}
                    youtubeUrlInputHandler={this.props.youtubeUrlInputHandler}
                    soundcloudUrl={this.props.songInfo.soundcloudUrl}
                    soundcloudUrlInputHandler={this.props.soundcloudUrlInputHandler}
                    bandcampUrl={this.props.songInfo.bandcampUrl}
                    bandcampUrlInputHandler={this.props.bandcampUrlInputHandler}
                    applemusicUrl={this.props.songInfo.applemusicUrl}
                    applemusicUrlInputHandler={this.props.applemusicUrlInputHandler}
                    termsChecked={this.state.termsChecked}
                    termsCheckHandler={this.termsCheckHandler}
                />
                { warningDiv }
                <div className={styles.buttonDiv}>
                    <Button color="orange" fluid size="small"
                            onClick={() => {this.props.uploadClickHandler(this.state.songFile, this.state.startTime, this.state.endTime)}}
                            disabled={!this.state.termsChecked || !this.props.songInfo.track || !this.props.songInfo.artist ||
                                    !this.state.src || !this.state.audioLength || this.props.uploadingSong}>
                        Upload
                    </Button>
                </div>
            </div>
            
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        // onUploadSong: (songFile, clipRange, songId, songInfo) => dispatch(uploadSong(songFile, clipRange, songId, songInfo))
    };
};

export default connect(null, mapDispatchToProps)(SongUploader);

// references
// http://jsfiddle.net/lun471k/KfzM6/
