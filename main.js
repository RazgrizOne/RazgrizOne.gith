"use strict";

//Declared here so they are accessable.
var dataLayer;
var map;
var data;

var port_markers
var pointstwo

var port_markerstwo

function httpGetThis(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;


}

function sendQuery(query) {

	points = JSON.parse(httpGetThis("https://bgukgr16i3.execute-api.us-east-1.amazonaws.com/dev/crash-data"))
	createMarkers(points)

}

function getCountryPopup(feature) {
    if(getRelevant(feature)){
    return "<dl><dt>Country: "+ feature.properties.name+" </dt>"
    + "<dt>Tourists: " + String(feature.properties["T_2016_" + currentdate]) + "</dt>"
    }
    else {return feature.properties.name }
}

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


function actionMethodList(feature, layer) {
    layer.on(
        {
            //mouseover: popup,
            //mouseout: removepopup,
            //click: zoomToFeature
        }
    );
}


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

function createMarkers(json){
    port_markers = L.geoJSON([json], {

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 2,
                fillColor: "#ff0000",
                color: "#fff",
                weight: .1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    }).bindPopup(function(layer){return "<dl><dt>Crash-type: "+ layer.feature["properties"]["crash-type"]  + " </dt>"
    + "<dt>Crash Severity: " +layer.feature["properties"]["crash-severity"] + "</dt>"}
).addTo(map);
}


window.onload = function () {

	points =  JSON.parse(httpGetThis("https://bgukgr16i3.execute-api.us-east-1.amazonaws.com/dev/crash-data"))

    map = L.map('mapDiv', {
        center: [39.9612, -82.9988],
        zoom: 12,
        //minZoom: 2,
        zoomControl: false
        //how to change the coordinate system
        //Won't change it for mapbox though.
        //crs: L.CRS.EPSG4326,

    });

    L.tileLayer('https://api.mapbox.com/styles/v1/amasw87/cjhe2am5i25rj2rqleqao8j0d/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1hc3c4NyIsImEiOiJjajZ6aG50bnUwMGpqMnBvOGJjNTk0cHFvIn0.IXHyLgImAw0H_dlCs7ZEgA', {
        maxZoom: 18,
        attribution: "&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> &copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>; <a href='https://www.columbus.gov/smartcolumbus/home/'>Smart Columbus</a>"
    }).addTo(map);

	createMarkers(points)
}
;
