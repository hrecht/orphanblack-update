var mobile_threshold = 600;
var data;
var json_data_url = "data/objson.json";

var $gantt = $('#gantt');
var gantt_aspect_width = 1;
var gantt_aspect_height = 1.05;

var $overlap = $('#overlap');
var overlap_aspect_width = 2;
var overlap_aspect_height = 1.1;

var $linechart = $('#linechart');
var linechart_data_url = "data/totaltime.csv";
var linechart_aspect_width = 5;
var linechart_aspect_height = 2;

var $barcharts = $('#barcharts');
var barcharts_data_url = "data/chartimebyep.csv";
var barcharts_aspect_width = 5;
var barcharts_aspect_height = 4;


$(window).load(function () {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart

        d3.json(json_data_url, function (error, json) {
            if (error) return console.warn(error);
            data = json;
            ganttdraw();
            window.onresize = ganttdraw;

        });

        d3.json(json_data_url, function (error, json) {
            if (error) return console.warn(error);
            data = json;
            overlapdraw();
            window.onresize = overlapdraw();
        });

        d3.csv(barcharts_data_url, function (error, minutes) {
            data = minutes;
            bardraw();
            window.onresize = bardraw;
        });

        d3.csv(linechart_data_url, function (error, times) {
            data = times;
            linedraw();
            window.onresize = linedraw;
        });

    }
});