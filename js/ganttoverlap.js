function overlapbuild(id) {

    var data = json;

    var margin = {
            top: 50,
            right: 20,
            bottom: 40,
            left: 50
        },
        numticks = 9,
        padding = 50;
    if ($gantt.width() < mobile_threshold) {
        overlap_aspect_width = 1;
        overlap_aspect_height = 1.8;
        numticks = 4;
        margin.top = 70;
        margin.left = 10;
        padding = 10;
    }
    var width = $overlap.width() - margin.left - margin.right;
    var height = Math.ceil((width * overlap_aspect_height) / overlap_aspect_width) - margin.top - margin.bottom;

    $overlap.empty();

    var formatMinutes = d3.format('.1f');
    var formatAxis = d3.format('.0f');

    var svg = d3.select(id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1);

    var x = d3.scale.linear()
        .domain([0, 40])
        .range([padding, width - padding]);

    var legendlabs = ["Sarah", "Alison", "Cosima", "Helena", "Rachel", "Beth", "Katja", "Tony"];
    var legendmob = ["1", "2", "3", "4"]

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(height)
        .tickFormat(formatXAxis)
        .orient("bottom")
        .ticks(numticks);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .innerTickSize(0);

    y.domain(data.map(function (d) {
        return d.episode;
    }));

    var gx = svg.append("g")
        .attr("class", "x axis")
        //.attr("transform", "translate(0," - height + ")")
        .call(xAxis);

    gx.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    //doing things differently for small vs big screens
    if ($barcharts.width() < mobile_threshold) {
        var gy = svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);
        svg.append("g")
            .append("text")
            .attr("class", "seasonTitle")
            .attr("x", -5)
            .attr("y", -10)
            .text(function (d) {
                return "Episode";
            });
        svg.append("g")
            .append("text")
            .attr("class", "seasonTitle")
            .attr("x", function (d) {
                return x(0);
            })
            .attr("y", height + 30)
            .text(function (d) {
                return "Timeline of episode";
            });

        svg.append("g")
            .append("text")
            .attr("class", "seasonTitle")
            .attr("x", width / 3)
            .attr("y", -60)
            .text(function (d) {
                return "Number of clones";
            });

        var legend = svg.selectAll("g.legend")
            .data(legendmob)
            .enter().append("g");

        var l_w = 40,
            l_h = 20;

        legend.append("rect")
            .attr("id", function (d) {
                return d;
            })
            .attr("x", function (d, i) {
                return (i * l_w) + width / 4;
            })
            .attr("y", -50)
            .attr("width", 30)
            .attr("height", l_h)
            .attr("class", "moblegendbar")
            .attr("opacity", function (d, i) {
                return (i * 0.16) + 0.4;
            });

        legend.append("text")
            .attr("id", function (d) {
                return d;
            })
            .attr("x", function (d, i) {
                return (i * l_w) + width / 4 + 12;
            })
            .attr("y", -36)
            .attr("class", "legendmob")
            .text(function (d, i) {
                return legendmob[i];
            });
        svg.append("g")
            .append("line")
            .attr("class", "labelline")
            .attr("y1", function (d) {
                return y(11) - 1;
            })
            .attr("y2", function (d) {
                return y(11) - 1;
            })
            .attr("x1", -45)
            .attr("x2", function (d) {
                return x(43);
            });
        svg.append("g")
            .append("line")
            .attr("class", "labelline")
            .attr("y1", function (d) {
                return y(21) - 1;
            })
            .attr("y2", function (d) {
                return y(21) - 1;
            })
            .attr("x1", -45)
            .attr("x2", function (d) {
                return x(43);
            });

    } else {
        var gy = svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis);
        svg.append("g")
            .append("text")
            .attr("class", "seasonTitle2")
            .attr("x", -40)
            .attr("y", function (d) {
                return y(6) + 6;
            })
            .text(function (d) {
                return "Season 1";
            });
        svg.append("g")
            .append("text")
            .attr("class", "seasonTitle2")
            .attr("x", -40)
            .attr("y", function (d) {
                return y(16) + 6;
            })
            .text(function (d) {
                return "Season 2";
            });
        svg.append("g")
            .append("text")
            .attr("class", "seasonTitle2")
            .attr("x", -40)
            .attr("y", function (d) {
                return y(24) + 6;
            })
            .text(function (d) {
                return "Season 3";
            });
        svg.append("g")
            .append("text")
            .attr("class", "seasonTitle")
            .attr("x", function (d) {
                return x(0);
            })
            .attr("y", height + 30)
            .text(function (d) {
                return "Timeline of episode";
            });
        svg.append("g")
            .append("text")
            .attr("class", "seasonTitle")
            .attr("x", function (d) {
                return x(0) - 25;
            })
            .attr("y", -5)
            .text(function (d) {
                return "Episode";
            });

        var legend = svg.selectAll("g.legend")
            .data(legendlabs)
            .enter().append("g");

        var l_w = 65,
            l_h = 30;

        legend.append("rect")
            .attr("id", function (d) {
                return d;
            })
            .attr("x", function (d, i) {
                return (i * l_w) + width / 4;
            })
            .attr("y", -50)
            .attr("width", 58)
            .attr("height", l_h)
            .attr("class", "legendbar overlapbar");

        legend.append("text")
            .attr("id", function (d) {
                return d;
            })
            .attr("x", function (d, i) {
                return (i * l_w) + width / 4 + 10;
            })
            .attr("y", -30)
            .attr("class", "legend")
            .text(function (d, i) {
                return legendlabs[i];
            });
        svg.append("g")
            .append("line")
            .attr("class", "labelline")
            .attr("y1", function (d) {
                return y(11) - 1;
            })
            .attr("y2", function (d) {
                return y(11) - 1;
            })
            .attr("x1", -45)
            .attr("x2", function (d) {
                return x(43);
            });
        svg.append("g")
            .append("line")
            .attr("class", "labelline")
            .attr("y1", function (d) {
                return y(21) - 1;
            })
            .attr("y2", function (d) {
                return y(21) - 1;
            })
            .attr("x1", -45)
            .attr("x2", function (d) {
                return x(43);
            });
    }

    var segment = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("g");

    segment.append("rect")
        .attr("id", function (d) {
            return d.character;
        })
        .attr("fill", "#1B3536")
        .attr("opacity", 0.4)
        .attr("class", "overlapbar")
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

    function formatXAxis(d) {
        var s = formatAxis(d);
        return d === x.domain()[1] ? s + " minutes" : s;
    }
}

function overlapdraw() {

    if ($barcharts.width() < mobile_threshold) {
        overlapbuild("#overlap");
    } else {
        overlapbuild("#overlap");
        var allbars = d3.selectAll("rect");

        allbars.on("mouseover", function () {
            var moused_id = this.id;
            allbars.classed("selected", function () {
                return this.id === moused_id;
            });
        })

        allbars.on("mouseout", function () {
            allbars.classed("selected", false);
        })
    }
}