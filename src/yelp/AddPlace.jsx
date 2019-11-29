import React from "react";
import {connect} from "react-redux";
import {store} from "../index"
import {BarImageH2} from "./Yelp";
import * as mbxStatic from "@mapbox/mapbox-sdk/services/static";
import {useFirebase} from "react-redux-firebase";

const mbxStaticClient = mbxStatic({accessToken: "pk.eyJ1IjoiYWJlaXNncmVhdCIsImEiOiJrOEhRekZVIn0.9KVGXDIo5bd6pghddAd44Q"});

const forwardGeocodingURL = (query) => `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=pk.eyJ1IjoiYWJlaXNncmVhdCIsImEiOiJrOEhRekZVIn0.9KVGXDIo5bd6pghddAd44Q&types=poi&bbox=-98.02276650312514%2C30.057825160616275%2C-97.42401025743476%2C30.527207193138608`

const mapURL = (latlng) => mbxStaticClient.getStaticImage({
        ownerId: 'mapbox',
        styleId: 'streets-v11',
        width: 600,
        height: 600,
        position: {
            coordinates: latlng,
            zoom: 14.25
        },
        highRes: true,
        overlays: [ {
            marker: {
                coordinates: latlng,
                label: 'bar',
                size: 'large',
                color: '#2e81ff'
            }
        }]
    }).url();

export const setAddPlaceQueryResults = query_results => ({
    type: "SET_ADD_PLACE_QUERY_RESULTS",
    query_results
});

export const setAddPlaceQueryID = query_id => ({
    type: "SET_ADD_PLACE_QUERY_ID",
    query_id
});

export const setAddPlacePlace = place => ({
    type: "SET_ADD_PLACE_PLACE",
    place
});

export const clearAddPlacePlace = place => ({
    type: "CLEAR_ADD_PLACE_PLACE",
    place
});

export const closeAddPlace = () => ({
    type: "CLOSE_ADD_PLACE"
});

export const openAddPlace = () => ({
    type: "OPEN_ADD_PLACE"
});

const defaultState = {
    active: false,
    query_results: [],
    query_id: "",
    place: {
        id: "",
        name: "",
        categories: "",
        point: [],
        address: "",
        comments: ""
    }
};
export const add_place_data = (
    state = defaultState,
    action
) => {
    switch (action.type) {
        case "SET_ADD_PLACE_QUERY":
            return {...state, query: action.query};
        case "SET_ADD_PLACE_QUERY_RESULTS":
            return {...state, query_results: action.query_results.map((feature) => ({
                    name: feature.text,
                    id: feature.id,
                    categories: feature.properties.category,
                    point: feature.center,
                    address: feature.properties.address
                }))};
        case "SET_ADD_PLACE_QUERY_ID":
            return {...state, query_id: action.query_id};
        case "SET_ADD_PLACE_PLACE":
            return {...state, place: action.place};
        case "CLEAR_ADD_PLACE_PLACE":
            return {...state, place: defaultState.place};
        case "CLOSE_ADD_PLACE":
            return {...state, active: false};
        case "OPEN_ADD_PLACE":
            return {...state, active: true};
        default:
            return state;
    }
};

function fetchQueryResults(query) {
    return (dispatch, getState) => {
        const query_id = Math.random().toString();
        dispatch(setAddPlaceQueryID(query_id));
        if (!query) return dispatch(setAddPlaceQueryResults([]));
        return fetch(forwardGeocodingURL(query))
            .then(response => response.json())
            .then(json => {
                const recent_query_id = getState().yelp_data.add_place_data.query_id;
                if (query_id === recent_query_id) {
                    dispatch(setAddPlaceQueryResults(json.features))
                }
                }
            )
    }
}


function AddPlace(props) {
    const firebase = useFirebase();

    function add(place) {
        return firebase.update(`places/${place.id.replace(".", "_")}`, place);
    }

    return <div
        className={`overlay ${props.active && "visible"}`}>
        <div className="walls">
            <div className="wall">
                {!props.place.id && <div className="tray">
                    <div className="bar" sided="true">
                        <h2>Add a Place</h2>
                        <i className="material-icons" onClick={() => props.closeAddPlace()}>close</i>
                    </div>
                    <input type="text" placeholder="Name" onKeyUp={(e) => store.dispatch(fetchQueryResults(e.target.value))}/>
                    {props.results.length > 0 && <ul>
                        {props.results.map((result) => <li hoverable="true" key={result.id} onClick={() => props.setAddPlacePlace(result)}>
                            {result.name}
                            <br />
                            <i className="light">{result.address}</i>
                        </li>)}
                    </ul>}
                </div>}
                {props.place.id && <div className="tray">
                    <BarImageH2 image={mapURL(props.place.point)} title={props.place.name}/>
                    <input type="text" defaultValue={props.place.categories} />
                    <textarea defaultValue={props.place.comments} placeholder="Comments / Notes"></textarea>
                    <input type="file" multiple={true}/>
                    <div className="bar" half_padded="true">
                        <button onClick={props.clearAddPlacePlace}>Cancel</button>
                        <button onClick={() => add(props.place) && props.closeAddPlace()}>Save</button>
                    </div>
                </div>}
            </div>
        </div>
    </div>;
}

export const AddPlaceContainer = connect(
    // State fields to pass as props
    state => ({
        results: state.yelp_data.add_place_data.query_results,
        place: state.yelp_data.add_place_data.place,
        active: state.yelp_data.add_place_data.active
    }),
    // Actions to pass as props
    {
        setAddPlacePlace,
        clearAddPlacePlace,
        closeAddPlace
    }
)(AddPlace);

export default AddPlaceContainer;
