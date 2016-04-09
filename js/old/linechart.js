//minutes instead of percent

function linedraw() {
    var margin = {
            top: 50,
            right: 150,
            bottom: 35,
            left: 10
        },
        numticks = 25;
    if ($linechart.width() < mobile_threshold) {
        linechart_aspect_height = 5;
        margin.top = 70;
        margin.right = 20;
        margin.left = 20;
    }
    var width = $linechart.width() - margin.left - margin.right,
        height = Math.ceil((width * linechart_aspect_height) / linechart_aspect_width) - margin.top - margin.bottom,
        padding = 30;

    $linechart.empty();

    var formatAxis = d3.format('.0f');
    var labels = ["Minutes in Episode", "Minutes of Tatiana Maslany"];
    var seasons = [0, 1, 2];

    var x = d3.scale.linear()
        .range([padding, width])
        .domain([1, 30.5]);

    var y = d3.scale.linear()
        .domain([0, 50])
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#712164", "#4f8a83"])
        .domain(seasons);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(0)
        .orient("bottom")
        .ticks(numticks);

    data = percents;
    
    var line = d3.svg.line()
        .x(function (d) {
            return x(d.episode);
        })
        .y(function (d) {
            return y(d.minutes);
        });

    var svg = d3.select("#linechart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(d3.keys(data[0]).filter(function (key) {
        return key == "tmasmin" | key == "epmin";
    }));

    var types = color.domain().map(function (name) {
        return {
            name: name,
            values: data.map(function (d) {
                return {
                    episode: d.episode,
                    minutes: +d[name]
                };
            })
        };
    });

    var type = svg.selectAll(".type")
        .data(types)
        .enter().append("g")
        .attr("class", "type");

    type.append("path")
        .attr("class", "chartline")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return color(d.name);
        });

    var seasonlab = svg.selectAll("g.legend")
        .data(seasons)
        .enter().append("g");

    //Season labels for x axis
    if ($linechart.width() < mobile_threshold) {

        var yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(width)
            .orient("right")
            .ticks(6);

        var gy = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        gy.selectAll("g").filter(function (d) {
                return d;
            })
            .classed("minor", true);

        gy.selectAll("text")
            .attr("x", 0)
            .attr("dy", -4);

        var legend = svg.selectAll("g.legend")
            .data(labels)
            .enter().append("g");

        var l_h = 4;

        legend.append("rect")
            .attr("id", function (d) {
                return d;
            })
            .attr("x", 10)
            .attr("y", function (d, i) {
                return -40 - (25 * i);
            })
            .attr("width", 20)
            .attr("height", l_h)
            .style("fill", function (d, i) {
                return color(d);
            });

        legend.append("text")
            .attr("id", function (d) {
                return d;
            })
            .attr("x", 40)
            .attr("y", function (d, i) {
                return -33 - (25 * i);
            })
            .attr("class", "axis")
            .text(function (d, i) {
                return labels[i];
            });

        seasonlab.append("g")
            .append("text")
            .attr("class", "seasonTitle")
            .attr("x", function (d, i) {
                return x(10 * i + 2.5);
            })
            .attr("y", height + 20)
            .text(function (d, i) {
                return "Season " + (1 + seasons[i]);
            })

        //season lines     
        svg.append("g")
            .append("line")
            .attr("class", "seasonline")
            .attr("x1", function (d) {
                return x(10.5);
            })
            .attr("x2", function (d) {
                return x(10.5);
            })
            .attr("y1", height + 30)
            .attr("y2", function (d) {
                return y(50);
            });

        svg.append("g")
            .append("line")
            .attr("class", "seasonline")
            .attr("x1", function (d) {
                return x(20.5);
            })
            .attr("x2", function (d) {
                return x(20.5);
            })
            .attr("y1", height + 30)
            .attr("y2", function (d) {
                return y(50);
            });

    } else {

        var yAxis = d3.svg.axis()
            .scale(y)
            .tickSize(width)
            .tickFormat(formatYAxis)
            .orient("right")
            .ticks(6);

        var gy = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        gy.selectAll("g").filter(function (d) {
                return d;
            })
            .classed("minor", true);

        gy.selectAll("text")
            .attr("x", 0)
            .attr("dy", -4);

        //numbered x axis
        var gx = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "x axis")
            .call(xAxis);

        //direct line labels
        type.append("text")
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
            .text(function (d, i) {
                return labels[i];
            })
            .attr("class", "axis");

        seasonlab.append("g")
            .append("text")
            .attr("class", "seasonTitle2")
            .attr("x", function (d, i) {
                return x(10 * i + 4);
            })
            .attr("y", height + 30)
            .text(function (d, i) {
                return "Season " + (1 + seasons[i]);
            })

        //season lines     
        svg.append("g")
            .append("line")
            .attr("class", "seasonline")
            .attr("x1", function (d) {
                return x(10.5);
            })
            .attr("x2", function (d) {
                return x(10.5);
            })
            .attr("y1", height + 30)
            .attr("y2", function (d) {
                return y(50);
            });

        svg.append("g")
            .append("line")
            .attr("class", "seasonline")
            .attr("x1", function (d) {
                return x(20.5);
            })
            .attr("x2", function (d) {
                return x(20.5);
            })
            .attr("y1", height + 30)
            .attr("y2", function (d) {
                return y(50);
            });
    }

    function formatYAxis(d) {
        var s = formatAxis(d);
        return d === y.domain()[1] ? s + " minutes" : s;
    }
}