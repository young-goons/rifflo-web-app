import axios from '../../config/axios';

import * as actionTypes from './actionTypes';

export const loadAuthSuccess = (authUser) => {
    return {
        type: actionTypes.LOAD_AUTH_SUCCESS,
        authUserId: authUser.userId,
        authUsername: authUser.username,
        authUserEmail: authUser.email,
        authUserInfo: authUser.userInfo
    };
};

export const loadAuthUser = (jwtToken) => {
    return dispatch => {
        const url = '/auth/info';
        const headers = {
            'Authorization': jwtToken
        };
        axios({method: 'GET', url: url, headers: headers})
            .then(response => {
                console.log(response);
                dispatch(loadAuthSuccess(response.data.authUser));
            })
            .catch(error => {
                console.log(error);
            });
    };
};