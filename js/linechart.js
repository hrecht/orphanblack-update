function linedraw() {
    var margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 40
    };
    var width = $linechart.width() - margin.left - margin.right,
        height = Math.ceil((width * linechart_aspect_height) / linechart_aspect_width) - margin.top - margin.bottom,
        padding = 20;

    $linechart.empty();

    var formatPct = d3.format("%");

    var x = d3.scale.linear()
        .range([padding, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var dotcolor = d3.scale.threshold()
        .domain([10.5, 20.5])
        .range(["#712164", "#4f8a83", "#000"]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(-width)
        .orient("left")
        .ticks(7, "%");

    var line = d3.svg.line()
        .x(function (d) {
            return x(d.episode);
        })
        .y(function (d) {
            return y(d.tmaspct);
        });

    var svg = d3.select("#linechart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function (d) {
        d.episode = d.episode;
        d.tmaspct = +d.tmaspct;
    });

    x.domain([1, 24]);
    y.domain([0, 1.3]);

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    svg.append("path")
        .attr("class", "chartline")
        .attr("d", line(data));

    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 4)
        .attr("fill", function (d) {
            return dotcolor(d.episode);
        })
        .attr("cx", function (d) {
            return x(d.episode);
        })
        .attr("cy", function (d) {
            return y(d.tmaspct);
        });

    //Season labels for x axis
    svg.append("g")
        .append("text")
        .attr("class", "seasonTitle")
        .attr("x", function (d) {
            return x(4);
        })
        .attr("y", height + padding)
        .text(function (d) {
            return "Season 1";
        })
    svg.append("g")
        .append("text")
        .attr("class", "seasonTitle")
        .attr("x", function (d) {
            return x(14);
        })
        .attr("y", height + padding)
        .text(function (d) {
            return "Season 2";
        })
    svg.append("g")
        .append("text")
        .attr("class", "seasonTitle")
        .attr("x", function (d) {
            return x(22);
        })
        .attr("y", height + padding)
        .text(function (d) {
            return "Season 3";
        })
}