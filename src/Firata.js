import React from "react";
import { connect, useSelector } from "react-redux";
import { isEmpty, isLoaded, useFirebaseConnect } from "react-redux-firebase";

import Fuse from "fuse.js";
import { updateSearchQuery } from "./redux";

const books = [
  {
    title: "Old Man's War",
    author: {
      firstName: "John",
      lastName: "Scalzi"
    },
    tags: ["fiction"]
  },
  {
    title: "The Lock Artist",
    author: {
      firstName: "Steve",
      lastName: "Hamilton"
    },
    tags: ["thriller"]
  }
];

const fuse = new Fuse(books, { keys: ["title", "author"] });

export const search = (
  state = { query: "This is a search query", results: [] },
  action
) => {
  switch (action.type) {
    case "UPDATE_SEARCH_QUERY":
      return {
        ...state,
        query: action.query,
        results: fuse.search(action.query)
      };
    default:
      return state;
  }
};

function Firata(props) {
  useFirebaseConnect([
    { path: "pp", type: "once", storeAs: "pp" } // { path: '/todos' } // object notation
  ]);

  const pp = useSelector(state => state.firebase.data.pp);

  if (!isLoaded(pp)) {
    return <div>Loading...</div>;
  }

  if (isEmpty(pp)) {
    return <div>Todos List Is Empty</div>;
  }

  const handleQueryChange = e => {
    const { updateSearchQuery } = props;
    updateSearchQuery(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="This is a filter"
        value={props.search.query}
        onChange={handleQueryChange}
      />
      {JSON.stringify(props.search.results)}
      {Object.keys(pp.texts).map(key => (
        <div key={key}>
          <h3>{key}</h3>
          <pre>{pp.texts[key].keywords}</pre>
        </div>
      ))}
    </div>
  );
}

const FirataContainer = connect(
  // State fields to pass as props
  state => ({
    search: state.search
  }),
  // Actions to pass as props
  {
    updateSearchQuery
  }
)(Firata);

export default FirataContainer;
