import * as actionTypes from '../actions/actionTypes';

const initialState = {
    authUserId: null,
    authUsername: null,
    authUserEmail: null,
    authUserInfo: null,
    jwtToken: null
};

const loadAuthSuccess = (state, action) => {
    return {
        ...state,
        authUserId: action.authUserId,
        authUsername: action.authUsername,
        authUserEmail: action.authUserEmail,
        authUserInfo: action.authUserInfo,
        jwtToken: action.jwtToken
    }
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.LOAD_AUTH_SUCCESS: return loadAuthSuccess(state, action);
        default:
            return state;
    }
};

export default reducer;