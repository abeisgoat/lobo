import React from "react";
import { connect, useSelector } from "react-redux";
import { isLoaded, useFirebaseConnect } from "react-redux-firebase";
import AddPlace, { add_place_data, openAddPlace } from "./AddPlace";
import { combineReducers } from "redux";
import firebase from "firebase/app";
import { store } from "../index";
import Fuse from "fuse.js";

export const setYelpPlace = place => ({
  type: "SET_YELP_PLACE",
  place
});

export const clearYelpPlace = () => ({
  type: "CLEAR_YELP_PLACE"
});

export const setYelpSearchQuery = query => ({
  type: "SET_YELP_SEARCH_QUERY",
  query
});

export const view_place_data = (
  state = {
    place: null,
    results: null
  },
  action
) => {
  switch (action.type) {
    case "SET_YELP_PLACE":
      return { ...state, place: action.place };
    case "CLEAR_YELP_PLACE":
      return { ...state, place: null };
    case "SET_YELP_SEARCH_QUERY":
      const results = fuse.search(action.query);
      return { ...state, results: action.query.length ? results : null };
    default:
      return state;
  }
};

// function setYelpPlaceWithFiles(place) {
//   return (dispatch) => {
//     const id = place.id.replace(".", "_");
//     const storageRef = firebase.storage().ref(`places/${id}`);
//     dispatch(setYelpPlace(place));
//
//     return storageRef.list().then(async (ls) => {
//       const files = await Promise.all(ls.items.map((item) => item.getDownloadURL()));
//       dispatch(setYelpPlaceFiles(files));
//     });
//
//   }
// }

export const yelp_data = combineReducers({
  view_place_data,
  add_place_data
});

const getPlaceImage = name =>
  `https://jpg.cool/${encodeURI(name + " austin")}`.replace(/'/, "");

function BarItem(props) {
  return (
    <div className="bar" item="true" onClick={props.onClick}>
      <div
        className="image"
        style={{ backgroundImage: `url('${props.image}')` }}
      ></div>
      <div className="text">
        <h3 className="title">{props.title}</h3>
        <div className="subtitle">{props.subtitle}</div>
      </div>
    </div>
  );
}

export function BarImageH2(props) {
  return (
    <div
      className="bar"
      image="true"
      style={{ backgroundImage: `url('${props.image}')` }}
    >
      <h2>{props.title}</h2>
    </div>
  );
}

function OverlayViewPlace(props) {
  const id = props.place.id;
  const storageRef = firebase.storage().ref(`places/${id}`);

  const onFilesChanged = event => {
    [...event.target.files].forEach((file, index) => {
      const image_id = (
        Object.keys(props.place.images || {}).length + index
      ).toString();
      firebase
        .database()
        .ref(`places/${id}/images/${image_id}`)
        .set({ placeholder: true });
      storageRef
        .child(image_id)
        .put(file)
        .then(() => {
          console.log(`upload done on ${index}`);
        });
    });
  };

  return (
    <div className={`overlay ${props.place && "visible"}`}>
      <div className="walls">
        <div className="wall">
          <div className="tray">
            <div
              className="bar"
              image="true"
              style={{
                backgroundImage: `url('${getPlaceImage(props.place.name)}')`
              }}
            >
              <div className="icons" top_right="true">
                <i className="material-icons" onClick={props.clearYelpPlace}>
                  close
                </i>
              </div>
              <h2 bottom_left="true">{props.place.name}</h2>
            </div>
            <ul>
              <li>
                <a
                  href={`https://www.google.com/maps/search/${props.place.address}`}
                  className="no-underline"
                >
                  <span role="img" aria-label="location">
                    📍
                  </span>{" "}
                  {props.place.address}
                </a>
              </li>
              <li>
                <span role="img" aria-label="categories">
                  🍹
                </span>{" "}
                {props.place.categories}
              </li>
            </ul>
            <div className="grid">
              {Object.keys(props.place.images || {}).map(image_id => {
                const isPlaceholder = !!props.place.images[image_id]
                  .placeholder;
                const url = isPlaceholder
                  ? `https://jpg.cool/loading.gif`
                  : `https://storage.googleapis.com/abe-today.appspot.com/places/${props.place.id.replace(
                      ".",
                      "_"
                    )}/${image_id}`;
                return (
                  <a
                    className="image"
                    href={url}
                    style={{ backgroundImage: `url(${url})` }}
                    key={url}
                  >
                    this is a user uploaded image
                  </a>
                );
              })}
            </div>
            <hr />
            <input type="file" multiple={true} onChange={onFilesChanged} />
          </div>
        </div>
      </div>
    </div>
  );
}

let fuse;
function Yelp(props) {
  useFirebaseConnect([{ path: "places" }]);

  const places = useSelector(state => state.firebase.data.places);

  if (isLoaded(places)) {
    fuse = new Fuse(
      Object.keys(places).map(key => places[key]),
      { keys: ["address", "categories", "images", "name"] }
    );
  }
  return (
    <div>
      {props.place && (
        <OverlayViewPlace
          place={places[props.place]}
          clearYelpPlace={props.clearYelpPlace}
        />
      )}
      <AddPlace />
      <div className="wall">
        <div className="tray">
          <div className="bar" sided="true">
            <h2>Welp</h2>
            <i className="material-icons" onClick={props.openAddPlace}>
              add
            </i>
          </div>
          <input
            type="text"
            placeholder="Find a place..."
            onKeyUp={e => props.setYelpSearchQuery(e.target.value)}
          />
          <div className="bar tabs">
            <div className="tab selected">List</div>
            <div className="tab">Map</div>
          </div>
          <div className="bundle">
            {places && (
              <ul>
                {(
                  props.results || Object.keys(places).map(key => places[key])
                ).map(place => {
                  return (
                    <BarItem
                      key={place.id}
                      title={place.name}
                      subtitle={place.address}
                      image={getPlaceImage(place.name)}
                      onClick={() => store.dispatch(setYelpPlace(place.id))}
                    />
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const YelpContainer = connect(
  // State fields to pass as props
  state => ({
    place: state.yelp_data.view_place_data.place,
    results: state.yelp_data.view_place_data.results
  }),
  // Actions to pass as props
  {
    setYelpPlace,
    clearYelpPlace,
    openAddPlace,
    setYelpSearchQuery
  }
)(Yelp);

export default YelpContainer;
