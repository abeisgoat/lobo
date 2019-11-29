import React from "react";
import { connect, useSelector } from "react-redux";
import { useFirebaseConnect } from "react-redux-firebase";
import AddPlace, {add_place_data, openAddPlace} from "./AddPlace";
import {combineReducers} from "redux";

export const setYelpPlace = place => ({
  type: "SET_YELP_PLACE",
  place
});

export const clearYelpPlace = () => ({
  type: "CLEAR_YELP_PLACE"
});

export const view_place_data = (
  state = {
    place: null
  },
  action
) => {

  switch (action.type) {
    case "SET_YELP_PLACE":
      return { ...state, place: action.place };
    case "CLEAR_YELP_PLACE":
      return { ...state, place: null };
    default:
      return state;
  }
};

export const yelp_data = combineReducers({
  view_place_data,
  add_place_data
});

const getPlaceImage = (name) => `https://jpg.cool/${encodeURI(name + " austin")}`.replace(/'/, "");

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
  return <div
      className={`overlay ${props.place && "visible"}`}
      onClick={() => props.clearYelpPlace()}
  >
    <div className="walls">
      <div className="wall">
        <div className="tray">
          <BarImageH2
              title={props.place.name}
              image={getPlaceImage(props.place.name)}
          />
          <ul>
            <li>📍  {props.place.address}</li>
            <li>🍹  {props.place.categories}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
}

function Yelp(props) {
  useFirebaseConnect([{ path: "places" }]);

  const places = useSelector(state => state.firebase.data.places);

  return (
    <div>
      {props.place && <OverlayViewPlace place={props.place} clearYelpPlace={props.clearYelpPlace}/>}
      <AddPlace />
      <div className="wall">
        <div className="tray">
          <div className="bar" sided="true">
            <h2>Welp</h2>
            <i className="material-icons" onClick={props.openAddPlace}>add</i>
          </div>
          <input type="text" placeholder="Find a place..." />
        <div className="bundle">
          {places && (
            <ul>
              {Object.keys(places).map(key => {
                const place = places[key];
                return < BarItem
                  key = {place.id}
                  title = {place.name}
                  subtitle = {place.categories}
                  image = {getPlaceImage(place.name)}
                  onClick = {() => props.setYelpPlace(place)}
                />
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
    place: state.yelp_data.view_place_data.place
  }),
  // Actions to pass as props
  {
    setYelpPlace,
    clearYelpPlace,
    openAddPlace
  }
)(Yelp);

export default YelpContainer;
