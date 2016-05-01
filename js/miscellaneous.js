var MOBILE_THRESHOLD = 700;
var isMobile = false;
var data;
var main_data_url = "data/chartimebyep.csv";
var $barcharts = $('#barcharts');
var CHARACTERS_GANTT = ["Sarah", "Alison", "Cosima", "Helena", "Rachel", "Beth", "MK", "Krystal"];

function barcharts() {

    data = data_main.filter(function (d) {
        return d.character == "Sarah" | d.character == "Alison" | d.character == "Cosima" | d.character == "Helena" | d.character == "Rachel" | d.character == "Krystal" | d.character == "Beth" | d.character == "MK";
    });

    data.forEach(function (d) {
        d.minutes = +d.minutes;
        d.episode = +d.episode;
    });

    var chart_aspect_height = 1.1;
    var margin = {
        top: 30,
        right: 15,
        bottom: 40,
        left: 25
    };
    var numticks = 4;

    if ($barcharts.width() <= 325) {
        var width = $barcharts.width() - margin.left - margin.right;
    } else if ($barcharts.width() > 325 & $barcharts.width() <= 650) {
        var width = $barcharts.width() * 0.46 - margin.left - margin.right;
    } else {
        var width = $barcharts.width() * 0.24 - margin.left - margin.right;
    }

    var height = Math.ceil(width * chart_aspect_height) - margin.top - margin.bottom;

    $barcharts.empty();

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
        .domain(data.map(function (d) {
            return d.episode;
        }));

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, d3.max(data, function (d) {
            return d.minutes;
        })]);

    var characters = d3.nest()
        .key(function (d) {
            return d.character;
        })
        .sortKeys(function (a, b) {
            return CHARACTERS_GANTT.indexOf(a) - CHARACTERS_GANTT.indexOf(b);
        })
        .entries(data);

    var svg = d3.select("#barcharts").selectAll("svg")
        .data(characters)
        .enter()
        .append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.svg.axis()
        .scale(x)
        .outerTickSize(0)
        .tickValues([1, 11, 21, 31])
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(4)
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    //Title for each chart
    svg.append("g")
        .append("text")
        .attr("class", "charttitle")
        .attr("x", 0)
        .attr("y", -15)
        .text(function (d) {
            return d.key;
        });

    var bars = svg.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("g")
        .attr("class", "episodebar");
    
    var gx = svg.append("g")
        .attr("class", "x axis-show")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    bars.append("rect")
        .attr("class", function (d) {
            return "ep" + d.episode;
        })
        .attr("x", function (d) {
            return x(d.episode);
        })
        .attr("width", x.rangeBand())
        .attr("y", function (d) {
            return y(d.minutes);
        })
        .attr("height", function (d) {
            return height - y(d.minutes);
        })
        .on("mouseover", function (d) {
            d3.selectAll("." + d3.select(this).attr("class"))
                .classed("selected", true);
        })
        .on("mouseout", function (d) {
            d3.selectAll(".selected")
                .classed("selected", false);
        })
        .on("mouseleave", function (d) {
            d3.selectAll(".selected")
                .classed("selected", false);
        });

}

$(window).load(function () {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart
        d3.csv(main_data_url, function (rates) {
            data_main = rates;
            barcharts();
            window.onresize = barcharts;
        });
    }
});