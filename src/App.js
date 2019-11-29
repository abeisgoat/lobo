import React from "react";
import { connect } from "react-redux";

import YelpContainer from "./yelp/Yelp";

export class App extends React.Component {
  render() {
    return (
      <div className="walls">
        <YelpContainer />
      </div>
    );
  }
}

const AppContainer = connect(
  // State fields to pass as props
  state => ({}),
  // Actions to pass as props
  {}
)(App);

export default AppContainer;
