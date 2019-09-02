import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List, Grid, Button } from 'semantic-ui-react';

import { FOLLOW_N_LOAD, FOLLOW_N_COL } from "../../../config/constants";
import FollowItem from "./FollowItem";
import styles from './FollowList.module.css';

class FollowList extends Component {
    /* Guaranteed that this.props.followArr !== null */
    state = {
        followLoadCnt: 0, // index to obtain in the next step or the number of elements loaded currently
    };

    componentDidMount() {
        let loadCnt;
        if (this.props.followArr.length < FOLLOW_N_LOAD) {
            loadCnt = this.props.followArr.length;
        } else {
            loadCnt = FOLLOW_N_LOAD;
        }
        this.setState({followLoadCnt: loadCnt});
    }

    loadClickHandler = () => {
        console.log("clicked");
        if (this.followLoadCnt + FOLLOW_N_LOAD >= this.props.followArr.length) {
            this.setState({followLoadCnt: this.props.followArr.length})
        } else {
            this.setState({followLoadCnt: this.state.followLoadCnt + FOLLOW_N_LOAD});
        }
    };

    render() {
        const followItemArr = this.props.followArr.slice(0, this.state.followLoadCnt)
            .map((userId, idx) => {
                return (
                    <FollowItem
                        key={idx}
                        userId={userId}
                        jwtToken={this.props.jwtToken}
                    />
                );
            });

        let loadButton;
        if (this.state.followLoadCnt < this.props.followArr.length) {
            loadButton = (
                <Button onClick={this.loadClickHandler}>Load</Button>
            );
        }

        return (
            <div>
                <Grid columns={FOLLOW_N_COL} className={styles.listDiv}>
                    <Grid.Column>
                        <List verticalAlign="middle">
                            { followItemArr.filter((_, i) => i % FOLLOW_N_COL === 0) }
                        </List>
                    </Grid.Column>
                    <Grid.Column>
                        <List verticalAlign="middle">
                            { followItemArr.filter((_, i) => i % FOLLOW_N_COL === 1) }
                        </List>
                    </Grid.Column>
                    {/* <Grid.Column>
                        <List verticalAlign="middle">
                            { followItemArr.filter((_, i) => i % FOLLOW_N_COL === 2) }
                        </List>
                    </Grid.Column> */}
                </Grid>
                { loadButton }
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        authUserId: state.auth.authUserId,
        jwtToken: state.auth.jwtToken
    };
};

export default connect(mapStateToProps, null)(FollowList);