import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import authReducer from "./reducers/auth";
import thunk from "redux-thunk";

const composeEnhancers = process.env.NODE_ENV === 'development' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : null || compose;

const rootReducer = combineReducers({
    auth: authReducer
});

// const store = createStore(rootReducer, composeEnhancers(
//     applyMiddleware(thunk)
// ));
const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;