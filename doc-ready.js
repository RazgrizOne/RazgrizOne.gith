/// <reference Path="./jquery-3.1.1.js" />

$(document).ready(function(){
    $("#outer").addClass("otherContainer");
    $(".otherContainer").css("height", $(window).height());
    $("#header").css("width", $(window).width());
});

$(window).resize(function(){
    $(".otherContainer").css("height", $(window).height());
    $("#header").css("width", $(window).width());
});