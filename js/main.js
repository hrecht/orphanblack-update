var MOBILE_THRESHOLD = 600;
var isMobile = false;
var data;
var main_data_url = "data/obtimes.csv";
var char_data_url = "data/charactertable.csv";
var $overlap = $('#overlap');
var $gantt = $('#gantt');
var formatNum = d3.format('.0f');
var SEASONS = [1, 2, 3];
var CHARACTERS = ["Sarah", "Alison", "Cosima", "Helena", "Rachel", "Krystal", "Beth", "Katja", "Tony"];

function formatXAxis(d) {
    var s = formatNum(d);
    return d === 40 ? s + " minutes" : s;
}

//body text straight from data;
function datatext() {

    for (var i = 0; i < CHARACTERS.length; i++) {
        data = data_char.filter(function (d) {
            return d.character == CHARACTERS[i]
        })
        d3.select("#minSarah")
            .text(data)
    }

}

function ganttcharacters() {

    data = data_main;

    data.forEach(function (d) {
        d.startmin = +d.startmin;
        d.stopmin = +d.stopmin;
        d.episode = +d.episode;
    });

    var characters = d3.nest()
        .key(function (d) {
            return d.character;
        })
        .sortKeys(function (a, b) {
            return CHARACTERS.indexOf(a) - CHARACTERS.indexOf(b);
        })
        .entries(data);

    var chart_aspect_height = 0.75;
    var margin = {
        top: 25,
        right: 40,
        bottom: 40,
        left: 60
    };
    var numticks = 4;

    var width = 400 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .05)
        .domain(data.map(function (d) {
            return d.episode;
        }));

    var x = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.stopmin;
        })])
        .range([0, width]);

    $gantt.empty();

    //put each SVG in a separate div so they can be moved arround
    var holder = d3.selectAll("div.gantt")
        .data(function (d) {
            return characters;
        })
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        /*.enter()
        .append("div")
        .attr("id", function (d) {
            return "gantt-" + d.key;
        })
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "gantt");*/

    var svg = holder.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /*var svg = d3.select("#gantt").selectAll("svg")
        .data(characters)
        .enter()
        .append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "gantt")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");*/

    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1)
        .domain(data.map(function (d) {
            return d.episode;
        }));

    var x = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.stopmin;
        })])
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(height)
        .tickFormat(formatXAxis)
        .orient("bottom")
        .ticks(numticks);

    var gx = svg.append("g")
        .attr("class", "x axis")
        //.attr("transform", "translate(0," - height + ")")
        .call(xAxis);

    gx.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    var seasonline = svg.selectAll(".seasonline")
        .data([11, 21])
        .enter()
        .append("g")
        .attr("class", "seasonline");

    seasonline.append("line")
        .attr("y1", function (d) {
            return y(d);
        })
        .attr("y2", function (d) {
            return y(d);
        })
        .attr("x1", -margin.left)
        .attr("x2", function (d) {
            return x(43);
        });

    var seasonlab = svg.selectAll(".seasonlabel")
        .data(SEASONS)
        .enter()
        .append("g")
        .attr("class", "label-small");

    seasonlab.append("text")
        .attr("x", -margin.left)
        .attr("y", function (d, i) {
            return y(10 * i + 5) + y.rangeBand();
        })
        .text(function (d) {
            return "Season " + d;
        })

    svg.append("g")
        .append("text")
        .attr("class", "axistitle")
        .attr("x", function (d) {
            return x(0);
        })
        .attr("y", height + 30)
        .text(function (d) {
            return "Timeline of episode";
        });

    var bars = svg.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("g")
        .attr("class", "overlapbar");

    bars.append("rect")
        .attr("opacity", 0.4)
        .attr("y", function (d) {
            return y(d.episode);
        })
        .attr("height", y.rangeBand())
        .attr("x", function (d) {
            return x(d.startmin);
        })
        .attr("width", function (d) {
            return x(d.stopmin) - x(d.startmin);
        });

    //Title for each chart
    /*svg.append("g")
        .append("text")
        .attr("class", "charttitle")
        .attr("x", 0)
        .attr("y", -10)
        .text(function (d) {
            return d.key;
        });*/
}

function overlap() {

    data = data_main;

    data.forEach(function (d) {
        d.startmin = +d.startmin;
        d.stopmin = +d.stopmin;
        d.episode = +d.episode;
    });

    if ($overlap.width() >= MOBILE_THRESHOLD) {
        var chart_aspect_height = 0.6;
        var margin = {
                top: 50,
                right: 20,
                bottom: 40,
                left: 90
            },
            numticks = 9,
            isMobile = false;
    } else {
        var chart_aspect_height = 1.8;
        var margin = {
                top: 70,
                right: 20,
                bottom: 40,
                left: 40
            },
            numticks = 4,
            isMobile = true;
    }

    var width = $overlap.width() - margin.left - margin.right,
        height = Math.ceil(width * chart_aspect_height) - margin.top - margin.bottom;

    $overlap.empty();

    var svg = d3.select("#overlap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1)
        .domain(data.map(function (d) {
            return d.episode;
        }));

    var x = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.stopmin;
        })])
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(height)
        .tickFormat(formatXAxis)
        .orient("bottom")
        .ticks(numticks);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        //.innerTickSize(0);

    var gx = svg.append("g")
        .attr("class", "x axis")
        //.attr("transform", "translate(0," - height + ")")
        .call(xAxis);

    gx.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "overlapbar");

    bars.append("rect")
        .attr("opacity", 0.4)
        .attr("class", function (d) {
            return d.character;
        })
        .attr("y", function (d) {
            return y(d.episode);
        })
        .attr("height", y.rangeBand())
        .attr("x", function (d) {
            return x(d.startmin);
        })
        .attr("width", function (d) {
            return x(d.stopmin) - x(d.startmin);
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

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .orient("left");

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("text")
        .attr("dx", -4);

    //axis labels
    svg.append("g")
        .append("text")
        .attr("class", "axistitle")
        .attr("x", -15)
        .attr("y", -10)
        .text(function (d) {
            return "Episode";
        });
    svg.append("g")
        .append("text")
        .attr("class", "axistitle")
        .attr("x", function (d) {
            return x(0);
        })
        .attr("y", height + 30)
        .text(function (d) {
            return "Timeline of episode";
        });

    var seasonline = svg.selectAll(".seasonline")
        .data([11, 21])
        .enter()
        .append("g")
        .attr("class", "seasonline");

    seasonline.append("line")
        .attr("y1", function (d) {
            return y(d);
        })
        .attr("y2", function (d) {
            return y(d);
        })
        .attr("x1", -35)
        .attr("x2", function (d) {
            return x(43);
        });

    var seasonlab = svg.selectAll(".seasonlabel")
        .data(SEASONS)
        .enter()
        .append("g")
        .attr("class", "seasonlabel");

    seasonlab.append("text")
        .attr("x", -margin.left)
        .attr("y", function (d, i) {
            return y(10 * i + 5) + y.rangeBand();
        })
        .text(function (d) {
            return "Season " + d;
        })

    if (!isMobile) {

        var legend = svg.selectAll("g.legend")
            .data(CHARACTERS)
            .enter()
            .append("g")
            .attr("class", "overlapbar");

        var l_w = 65,
            l_h = 30;

        legend.append("rect")
            .attr("opacity", 0.4)
            .attr("class", function (d) {
                return d;
            })
            .attr("x", function (d, i) {
                return (i * l_w) + width / 6;
            })
            .attr("y", -50)
            .attr("width", 58)
            .attr("height", l_h)
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

        legend.append("text")
            .attr("class", function (d) {
                return d;
            })
            .attr("x", function (d, i) {
                return (i * l_w) + width / 6 + 10;
            })
            .attr("y", -30)
            .attr("class", "legend")
            .text(function (d, i) {
                return CHARACTERS[i];
            });
    }

}

function drawGraphs() {
    datatext();
    ganttcharacters();
    overlap();
}

$(window).load(function () {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart
        d3.csv(main_data_url, function (rates) {
            d3.csv(char_data_url, function (chars) {
                data_main = rates;
                data_char = chars;
                drawGraphs();
                window.onresize = drawGraphs;
            });
        });
    }
});