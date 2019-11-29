import React from "react";
import { connect, useSelector } from "react-redux";
import { useFirebase, useFirebaseConnect } from "react-redux-firebase";

export const setExampleData = example_data => ({
  type: "SET_EXAMPLE_DATA",
  example_data
});

export const clearExampleData = () => ({
  type: "CLEAR_EXAMPLE_DATA"
});

export const example_data = (
  state = { title: "This is fresh state" },
  action
) => {
  switch (action.type) {
    case "SET_EXAMPLE_DATA":
      return action.example_data;
    case "CLEAR_EXAMPLE_DATA":
      return {};
    default:
      return state;
  }
};

function Example(props) {
  const firebase = useFirebase();
  useFirebaseConnect([{ path: "people" }]);

  const people = useSelector(state => state.firebase.data.people);

  function updateName() {
    return firebase.update(`people/one`, {
      name: Math.random()
        .toString()
        .replace(".", "")
    });
  }

  return (
    <div className="wall">
      <div className="tray">
        <div className="bar"> {props.example_data.title}</div>
        {people && (
          <ul>
            {Object.keys(people).map(key => (
              <li key={key}>{people[key].name}</li>
            ))}
          </ul>
        )}
        <div class="bar" half_padded="true">
          <button onClick={updateName}>Update</button>
          {props.example_data.title ? (
            <button onClick={props.clearExampleData}>Clear</button>
          ) : (
            <button
              onClick={() => props.setExampleData({ title: "Goodbye World!" })}
            >
              Set
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const ExampleContainer = connect(
  // State fields to pass as props
  state => ({
    example_data: state.example_data
  }),
  // Actions to pass as props
  {
    setExampleData,
    clearExampleData
  }
)(Example);

export default ExampleContainer;
