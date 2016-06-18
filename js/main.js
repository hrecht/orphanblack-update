var MOBILE_THRESHOLD = 700;
var isMobile = false;
var data;
var main_data_url = "data/obtimes.csv";
var char_data_url = "data/charactertable.csv";
var total_data_url = "data/totaltime.csv";
var $overlap = $('#overlap');
var $ganttSarah = $('#ganttSarah');
var $linechart = $('#linechart');
var formatNum = d3.format(',.0f');
var SEASONS = [1, 2, 3, 4];
var CHARACTERS = ["Sarah", "Alison", "Cosima", "Helena", "Rachel", "Beth", "MK", "Krystal", "Katja", "Tony"];
var CHARACTERS_GANTT = ["Sarah", "Alison", "Cosima", "Helena", "Rachel", "Beth", "MK", "Krystal"];
var LINELABELS = ["Episode length", "Tatiana Maslany screen time"];
var COLORS = ["#a78fa3", "#185a52"];

function formatXAxis(d) {
    var s = formatNum(d);
    return d === 40 ? s + " minutes" : s;
}

//body text straight from data;
function datatext() {

    //top-line numbers
    var eps = d3.max(data_total, function (d) {
        return d.episode;
    });

    var totmin = d3.sum(data_total, function (d) {
        return d.epmin;
    });

    var tottmas = d3.sum(data_total, function (d) {
        return d.tmasmin;
    });

    d3.select("#toteps").html(eps + " episodes");
    d3.select("#totmin").html(formatNum(totmin) + " minutes");
    d3.select("#tottmas").html(formatNum(tottmas) + " minutes");

    //individual character tables
    for (var i = 0; i < CHARACTERS.length; i++) {
        data = data_char.filter(function (d) {
            return d.character == CHARACTERS[i]
        })[0];

        var formatSwap = function (d) {
            if (d == "") {
                return "None";
            } else {
                return d;
            }
        }

        var tabledata = [["Episodes in", data.episodesin],
                         ["Minutes", formatNum(data.minutes)],
                        ["Clone swaps", formatSwap(data.cloneswaps)],
                        ["Origin", data.origin],
                        ["Status", data.status]];

        var table = d3.select("#table" + CHARACTERS[i])
            .append("table");

        table.append('tbody')
            .selectAll('tr')
            .data(tabledata)
            .enter()
            .append('tr')
            .selectAll('td')
            .data(function (d) {
                return d;
            })
            .enter()
            .append('td')
            .html(function (d) {
                return d;
            })
    }

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
        if ($overlap.width() >= 450) {
            //not so tall on larger small screens
            var chart_aspect_height = 1.2;
        } else {
            var chart_aspect_height = 2.3;
        }
        var margin = {
                top: 70,
                right: 20,
                bottom: 40,
                left: 60
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
        //.tickFormat(formatXAxis)
        .orient("bottom")
        .ticks(numticks);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(0)
        .tickFormat(function (d) {
            if (isMobile) {
                return "";
            } else {
                return d;
            }
        })
        .orient("left");

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

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("text")
        .attr("dx", -4);

    //axis labels
    svg.append("g")
        .append("text")
        .attr("class", "axistitle")
        .attr("x", function (d) {
            return x(0);
        })
        .attr("y", height + 30)
        .text(function (d) {
            return "Timeline of episode (minutes)";
        });

    var seasonline = svg.selectAll(".seasonline")
        .data([11, 21, 31])
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
            return x(44);
        });

    var seasonlab = svg.selectAll(".seasonlabel")
        .data(SEASONS)
        .enter()
        .append("g");

    seasonlab.append("text")
        .attr("class", function () {
            if (isMobile) {
                return "label-small";
            } else {
                return "seasonlab";
            }
        })
        .attr("x", -margin.left)
        .attr("y", function (d, i) {
            return y(10 * i + 5) + y.rangeBand();
        })
        .text(function (d) {
            return "Season " + d;
        })

    if (!isMobile) {

        svg.append("g")
            .append("text")
            .attr("class", "axistitle")
            .attr("x", -15)
            .attr("y", -10)
            .text(function (d) {
                return "Episode";
            });

        //bars with mouseover
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

        //legend showing each character's name
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
                return (i * l_w) + width / 6 + 29;
            })
            .attr("y", -30)
            .attr("class", "legend")
            .attr("text-anchor", "middle")
            .text(function (d, i) {
                return CHARACTERS[i];
            });
    } else {

        //no mouse events
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
            });

        //legend showing number of clones
        var legend = svg.selectAll("g.legend")
            .data([1, 2, 3, 4])
            .enter()
            .append("g");

        var l_w = 40,
            l_h = 20;

        legend.append("rect")
            .attr("x", function (d, i) {
                return (i * l_w);
            })
            .attr("y", -50)
            .attr("width", 30)
            .attr("height", l_h)
            .attr("class", "moblegendbar")
            .attr("opacity", function (d, i) {
                return (i * 0.16) + 0.4;
            });

        legend.append("text")
            .attr("x", function (d, i) {
                return (i * l_w) + 15;
            })
            .attr("y", -36)
            .attr("text-anchor", "middle")
            .attr("class", "legendmob")
            .text(function (d) {
                return d;
            });


        svg.append("g")
            .append("text")
            .attr("class", "axistitle")
            .attr("x", 0)
            .attr("y", -58)
            .text(function (d) {
                return "Number of clones";
            });
    }
}

function linechart() {

    data_total.forEach(function (d) {
        d.epmin = +d.epmin;
        d.tmasmin = +d.tmasmin;
        d.episode = +d.episode;
    });

    var numticks = 6;

    if ($linechart.width() >= 450) {
        var chart_aspect_height = 0.75;
        var margin = {
                top: 50,
                right: 75,
                bottom: 40,
                left: 25
            },
            isMobile = false;
    } else {
        var chart_aspect_height = 1.4;
        var margin = {
                top: 70,
                right: 25,
                bottom: 40,
                left: 25
            },
            isMobile = true;
    }

    var width = $linechart.width() - margin.left - margin.right,
        height = Math.ceil(width * chart_aspect_height) - margin.top - margin.bottom;

    $linechart.empty();

    var svg = d3.select("#linechart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var color = d3.scale.ordinal()
        .range(COLORS)
        .domain(["tmasmin", "epmin"]);

    var y = d3.scale.linear()
        .domain([0, d3.max(data_total, function (d) {
            return d.tmasmin;
        })])
        .range([height, 0], .1)

    var x = d3.scale.linear()
        .domain([1, d3.max(data_total, function (d) {
            return d.episode;
        })])
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        //.ticks(30);
        //.tickValues([1, 6, 11, 16, 21, 26, 30]);
        .ticks(0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(-width)
        .ticks(numticks);

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    gy.selectAll("text")
        .attr("dx", -4);

    var gx = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //axis labels
    svg.append("g")
        .append("text")
        .attr("class", "axistitle")
        .attr("x", -20)
        .attr("y", 0)
        .text(function (d) {
            return "Minutes";
        });

    /*svg.append("g")
        .append("text")
        .attr("class", "axistitle")
        .attr("x", 0)
        .attr("y", height + 30)
        .text(function (d) {
            return "Episode";
        });*/

    var seasonlab = svg.selectAll(".seasonlabel")
        .data(SEASONS)
        .enter()
        .append("g")
        .attr("class", "seasonlabel");

    seasonlab.append("text")
        .attr("text-anchor", "middle")
        .attr("y", height + 20)
        .attr("x", function (d, i) {
            return x(10 * i + 5);
        })
        .text(function (d) {
            return "Season " + d;
        })

    var seasonline = svg.selectAll(".seasonline")
        .data([10.5, 20.5, 30.5])
        .enter()
        .append("g")
        .attr("class", "seasonlight");

    seasonline.append("line")
        .attr("x1", function (d) {
            return x(d);
        })
        .attr("x2", function (d) {
            return x(d);
        })
        .attr("y1", 0)
        .attr("y2", height + 30);

    var line = d3.svg.line()
        .x(function (d) {
            return x(d.episode);
        })
        .y(function (d) {
            return y(d.minutes);
        });

    color.domain(d3.keys(data_total[0]).filter(function (key) {
        return key == "tmasmin" | key == "epmin";
    }));

    var types = color.domain().map(function (name) {
        return {
            name: name,
            values: data_total.map(function (d) {
                return {
                    episode: d.episode,
                    minutes: +d[name]
                };
            })
        };
    });


    var lines = svg.selectAll(".chartline")
        .data(types)
        .enter().append("g")
        .attr("class", "type");

    lines.append("path")
        .attr("class", "chartline")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return color(d.name);
        });

    //direct line labels
    /*lines.append("text")
        .datum(function (d) {
            return {
                name: d.name,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function (d) {
            return "translate(" + x(d.value.episode) + "," + y(d.value.minutes) + ")";
        })
        .attr("x", 3)
        .attr("dy", ".35em")
        .attr("fill", function (d, i) {
            return COLORS[i];
        })
        .text(function (d, i) {
            return LINELABELS[i];
        })
        .attr("class", "axis");*/

    //dots for tmas line
    var dots = svg.selectAll(".dot")
        .data(data_total)
        .enter()
        .append("g")
        .attr("class", "dot");

    dots.append("circle")
        .attr("r", 3)
        .attr("cx", function (d) {
            return x(d.episode);
        })
        .attr("cy", function (d) {
            return y(d.tmasmin);
        });

    //legend
    var legend = svg.selectAll("g.legend")
        .data(LINELABELS)
        .enter()
        .append("g");

    if (!isMobile) {
        var l_w = 150,
            l_h = 30;

        legend.append("line")
            .attr("stroke", function (d, i) {
                return COLORS[i];
            })
            .attr("class", "legendline")
            .attr("x1", function (d, i) {
                return (i * l_w);
            })
            .attr("x2", function (d, i) {
                return (i * l_w) + 20;
            })
            .attr("y1", -35)
            .attr("y2", -35);

        legend.append("text")
            .attr("class", "tip")
            .attr("x", function (d, i) {
                return (i * l_w) + 25;
            })
            .attr("y", -30)
            .text(function (d, i) {
                return LINELABELS[i];
            });

        //tooltip on tmas line
        var bisectDate = d3.bisector(function (d) {
            return d.episode;
        }).left;

        var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", 4.5);

        focus.append("text")
            .attr("id", "tipep")
            .attr("class", "tip")
            .attr("x", 11)
            .attr("dy", "4px");

        focus.append("text")
            .attr("id", "tipmin")
            .attr("class", "tip")
            .attr("x", 11)
            .attr("dy", "16px");

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function () {
                focus.style("display", null);
            })
            .on("mouseout", function () {
                focus.style("display", "none");
            })
            .on("mousemove", mousemove);

    } else {
        var l_h = 20;

        legend.append("rect")
            .attr("fill", function (d, i) {
                return COLORS[i];
            })
            .attr("x", 10)
            .attr("y", function (d, i) {
                return (-1 * i * l_h) - 25;
            })
            .attr("width", 20)
            .attr("height", 2);

        legend.append("text")
            .attr("class", "tip")
            .attr("x", 35)
            .attr("y", function (d, i) {
                return (-1 * i * l_h) - 20;
            })
            .text(function (d, i) {
                return LINELABELS[i];
            });
    }

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisectDate(data_total, x0, 1);
        var d0 = data_total[i - 1];
        var d1 = data_total[i];
        var d = x0 - d0.episode > d1.episode - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.episode) + "," + y(d.tmasmin) + ")");

        focus.select("text#tipep")
            .text("Episode " + d.episode);

        focus.select("text#tipmin")
            .text(formatNum(d.tmasmin) + " minutes");
    }

}

function ganttcharacters() {

    data = data_main.filter(function (d) {
        return d.character == "Sarah" | d.character == "Alison" | d.character == "Cosima" | d.character == "Helena" | d.character == "Rachel" | d.character == "Krystal" | d.character == "Beth" | d.character == "MK";
    });

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
            return CHARACTERS_GANTT.indexOf(a) - CHARACTERS_GANTT.indexOf(b);
        })
        .entries(data);

    var chart_aspect_height = 0.75;
    var margin = {
        top: 5,
        right: 25,
        bottom: 40,
        left: 60
    };
    var numticks = 4;

    var width = Math.min((400 - margin.left - margin.right), ($ganttSarah.width() - margin.left - margin.right)),
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

    //empty on resize
    d3.selectAll("div.gantt").selectAll("*").remove();

    //put each SVG in a separate div so they can be moved arround
    var holder = d3.selectAll("div.gantt")
        .data(function (d) {
            return characters;
        })
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);
    var svg = holder.append("svg")
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

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(0)
        .tickFormat("");

    var gy = svg.append("g")
        .attr("class", "y axis-show")
        .call(yAxis);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(formatNum)
        .ticks(numticks);

    var gx = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var seasonline = svg.selectAll(".seasonline")
        .data([11, 21, 31])
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
            return x(44);
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
        .attr("y", height + 32)
        .text(function (d) {
            return "Timeline of episode (minutes)";
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

}

function drawGraphs() {
    overlap();
    linechart();
    ganttcharacters();
}

$(window).load(function () {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart
        d3.csv(main_data_url, function (rates) {
            d3.csv(char_data_url, function (chars) {
                d3.csv(total_data_url, function (tot) {
                    data_main = rates;
                    data_char = chars;
                    data_total = tot;
                    drawGraphs();
                    datatext();
                    window.onresize = drawGraphs;
                });
            });
        });
    }
});