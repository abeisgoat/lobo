import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import thunkMiddleware from "redux-thunk";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

import AppContainer from "./App";
import "./index.scss";
import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {
  firebaseReducer,
  ReactReduxFirebaseProvider
} from "react-redux-firebase";
import { search } from "./Firata";
import { example_data } from "./Example";
import { yelp_data } from "./yelp/Yelp";

const fbConfig = {
  apiKey: "AIzaSyCdLN1gpqB78g-foh3gAKbUmb8tOl-76To",
  authDomain: "abe-today.firebaseapp.com",
  databaseURL: "https://abe-today.firebaseio.com",
  projectId: "abe-today",
  storageBucket: "abe-today.appspot.com",
  messagingSenderId: "780082191189",
  appId: "1:780082191189:web:16b6c8cba766ff111b2ddc",
  measurementId: "G-JQJ1PKW9KT"
};

firebase.initializeApp(fbConfig);

const rootReducer = combineReducers({
  firebase: firebaseReducer,
  example_data,
  yelp_data,
  search
});

const initialState = {};
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export const store = createStore(
  rootReducer,
  initialState,
    composeEnhancers(
  applyMiddleware(thunkMiddleware))
);

const rrfProps = {
  firebase,
  config: {},
  dispatch: store.dispatch
};

ReactDOM.render(
  <Provider store={store}>
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <AppContainer />
      </ReactReduxFirebaseProvider>
    </Provider>
  </Provider>,
  document.getElementById("root")
);
