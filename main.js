"use strict";

//Declared here so they are accessable.
var dataLayer;
var map;
var data;

var port_markers
var pointstwo

var port_markerstwo

var length = 14;

var timestamp = "here"
var hours = 11
var minutes = 0
var time_interval = 5

var crash_markers

function add_time(){
minutes += time_interval
if(minutes > 59)
{
	hours += 1
	minutes = 0
}
if(minutes > 9)
{
timestamp = hours.toString() + ":" + minutes.toString()
}
else
{
timestamp = hours.toString() + ":0" + minutes.toString()
}

}

var fireIcon = L.icon({

    iconUrl: './carfire.png',
    iconSize:     [length, length],
    iconAnchor:   [length*0.5, length*0.5],
    popupAnchor:  [length, length] 
});

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

function turnOn(){
removeMarkers(port_markers)
	setInterval(updateData, 5000);
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

function getSeverityColor(number) {
    var calc = 60 - number * 10;

    return Color({
        h: calc,
        s: 100,
        l: 50
    }).toCSS();
}

function removeMarkers(layer){
map.removeLayer(layer)
}

//just a way to simplify creation of points
function createMarkers(json){
    port_markers = L.geoJSON([json], {

        pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: fireIcon});
        }
    }).bindPopup(function(layer){return "<dl><dt>Crash-type: "+ layer.feature["properties"]["crash-type"]  + " </dt>"
    + "<dt>Crash Severity: " +layer.feature["properties"]["crash-severity"] + "</dt>"}
).addTo(map);
}

function createLiveMarkers(json){
    port_markers = L.geoJSON([json], {

        pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: fireIcon});
        }
    }).bindPopup(function(layer){return "<dl><dt>Incident-type: "+ layer.feature["properties"]["Incident_1"]  + " </dt>"
    + "<dt>Incident_ID: " +layer.feature["properties"]["inci_id"] + "</dt>"
	+ "<dt>Incident_Number: " +layer.feature["properties"]["incident_n"] + "</dt>"}
).addTo(map);
}


function createZones(){
    var zones = L.geoJSON(JSON.parse("/DataFile/JSONFile/Franklin_County_Zoning.geojson"), {
        style: {}
    }).addTo(map);
};

//Pulls down the points from the API
//changes the date and time display. Currently faked, need timestamp from api.
function updateData() {
	//removeMarkers(port_Markers
	add_time()
	//removeMarkers(port_markers)
	//map.removeLayer(port_markers)
	points = JSON.parse(httpGetThis("https://lptakwrsp9.execute-api.us-east-1.amazonaws.com/dev/incident-data"))
	createLiveMarkers(points)

    document.querySelector('.content').innerHTML = "Time: " + timestamp;
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
    

};
