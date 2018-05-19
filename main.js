"use strict";

//Declared here so they are accessable.
var dataLayer;
var map;
var data;

//Max value of data: used in styling. Maybe the method should find this instead of saving it here.
var maxvalue = 510000;

//Target Data: MONTH
var currentdate = 1;

//Target Data: DATA names, mostly just for reference.
//If you append data to the JSON file it should have these names + the month.
//Talk to Andrew you are confused how the data should be formatted.
var TOP20 = "T_2016_";
var TOPPORTS = "PORTS_2016_";
var MEXCAN = "MEX_CAN_2016_";

//Target Data: DATA
var basedata = "T_2016_";

//Target Data: DATA + MONTH
var datastring = "T_2016_1";

var port_markers

//Input:  JSON feature  EX: json_data.features[i] or json_data.features["Country_name_here"]
//Output: target feature name
//Method: simply a way to save time.
//Dependancy: None
function getName(feature) {
    return feature.properties["name"];
}

function getRelevant(feature) {
    return feature.properties["name_1"] != null
}

function getCountryPopup(feature) {
    if(getRelevant(feature)){
    return "<dl><dt>Country: "+ feature.properties.name+" </dt>"
    + "<dt>Tourists: " + String(feature.properties["T_2016_" + currentdate]) + "</dt>"
    }
    else {return feature.properties.name }
}

//Input:  JSON feature  EX: json_data.features[i] or json_data.features["Country_name_here"]
//Output: target data value
//Method: simply a way to save time.
//Dependancy: Uses the global data target variable 'datastring'
function getData(feature) {
    return feature.properties[datastring];
    //return feature.properties["T_2016_1"]
}

function getRank(feature) {
    return feature.properties["R_" + currentdate];
    //return feature.properties["T_2016_1"]
}

function crossHighlight(event) {
    console.log(event)
}

//Input:  JSON feature  EX: json_data.features[i] or json_data.features["Country_name_here"]
//Output: Style list
//Method: sets the style of the drawn country based on the current target data.
//Dependancy: getData(), getCountryColor()
function calcStyle(feature) {
    var featureweight = 0;
    var featurecolor = "black";
    var opacity = 0;
    if (getData(feature) > 0) {
        featurecolor = "black";
        featureweight = 3;
        opacity = 0
    }

    return {
        fillColor: getCountryColor(getRank(feature)),
        zIndex: 1,
        weight: featureweight,
        opacity: opacity,
        color: featurecolor,
        fillOpacity: opacity
    }
}


//Input:  JSON feature, Leaflet Layer
//Output: VOID
//Method: assigns methods to different actions from actions.js
//Dependancy: highlightFeature(), resetHighlight(), zoomToFeature(), setStyle(), calcStyle()
function actionMethodList(feature, layer) {
    layer.on(
        {
            //mouseover: popup,
            //mouseout: removepopup,
            //click: zoomToFeature
        }
    );
}

//Input:  value
//Output: CSS color
//Method: returns a color given a value.
//Dependancy: Colorjs
function getCountryColor(number) {
    var tempnumber = number;
    if (number == 0) {
        return Color({
            b: 61,
            g: 60,
            r: 60
        }).toCSS();
    }

    if (number > maxvalue) {
        return Color({
            h: 240,
            s: 80,
            l: 50
        }).toCSS();
    }

    return Color({
        h: 216,
        s: number * 5,
        l: 90 - (4 * number)
    }).toCSS();
}


window.onload = function () {

    map = L.map('mapDiv', {
        center: [39.9612, -82.9988],
        zoom: 12,
        //minZoom: 2,
        zoomControl: false
        //how to change the coordinate system
        //Won't change it for mapbox though.
        //crs: L.CRS.EPSG4326,
    });

    //load data from JSON file
    //change this to the new file and then alter calcstyle and such
    data = L.geoJSON(
        json_data,
        {
            style: calcStyle,
            onEachFeature: actionMethodList
        }
    ).bindPopup(function (layer) { return getCountryPopup(layer.feature) }
        ).addTo(map);


    L.tileLayer('https://api.mapbox.com/styles/v1/amasw87/cjhdjch8s1plv2srrogts4phm/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1hc3c4NyIsImEiOiJjajZ6aG50bnUwMGpqMnBvOGJjNTk0cHFvIn0.IXHyLgImAw0H_dlCs7ZEgA', {
        maxZoom: 18,
        attribution: "&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>; <a href='https://www.columbus.gov/smartcolumbus/home/'>Smart Columbus</a>"
    }).addTo(map);


    port_markers = L.geoJSON([points], {

        

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 12,
                fillColor: "#ff7800",
                color: "#000",
                weight: feature["properties"]["crash-type"],
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    }).bindPopup(function(layer){return "<dl><dt>Crash-type: "+ layer.feature["properties"]["crash-type"]  + " </dt>"
    + "<dt>Crash Severity: " +layer.feature["properties"]["crash-severity"] + "</dt>"}
).addTo(map);

	/*
    port_markers = L.geoJSON([ports], {

        

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: feature["properties"]["PORTS_" + currentdate] / 20000,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    }).bindPopup(function(layer){return "<dl><dt>City: "+ layer.feature.properties.City+" </dt>"
    + "<dt>Tourists: " + String(layer.feature.properties["PORTS_" + currentdate]) + "</dt>"}
).addTo(map);
*/

    map.createPane('labels');
    map.getPane('labels').style.zIndex = 650;
    map.getPane('labels').style.pointerEvents = 'none';

    var labels = L.tileLayer('https://api.mapbox.com/styles/v1/pieisgood4u/cjaoilmgselqy2rkayslecuv4/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGllaXNnb29kNHUiLCJhIjoiY2o2emd1bWg4MDA4MDMzbXluNjBtem5lMiJ9.jIGkrUiDkQXfUl4EVruO1g', {
        maxZoom: 18,
        pane: 'labels'
    }).addTo(map);

    //Load data for the graph and Create the graph.
    graphLoader()
    buildGraph()
}
;
