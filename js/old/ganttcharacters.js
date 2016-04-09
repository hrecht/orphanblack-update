function ganttdraw() {

    var margin = {
            top: 45,
            right: 35,
            bottom: 20,
            left: 35
        },
        padding = 50;

    if ($gantt.width() < mobile_threshold) {
        margin.left = 10;
        margin.right = 30;
        var width = $gantt.width() - margin.left - margin.right;
    } else if (mobile_threshold <= $gantt.width() && $gantt.width() < 1000) {
        var width = ($gantt.width() - margin.left - margin.right) / 2.3;
    } else {
        var width = ($gantt.width() - margin.left - margin.right) / 3.5;
    }

    var height = Math.ceil((width * gantt_aspect_height) / gantt_aspect_width) - margin.top - margin.bottom;


    $gantt.empty();

    var formatMinutes = d3.format('.1f');
    var formatAxis = d3.format('.0f');

    var seasons = [0, 1, 2];

    var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], .1);

    var x = d3.scale.linear()
        .domain([0, 40])
        .range([padding, width]);

    var barcolor = d3.scale.threshold()
        .domain([0.5])
        .range(["#1B3536", "#FF99CC"]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(height)
        .tickFormat(formatXAxis)
        .orient("bottom")
        .ticks(5);

    //var tip = d3.tip()
    //    .attr('class', 'd3-tip')
    //    .offset([-10, 0])
    //    .html(function (d) {
    //        return "Episode " + d.episode + "</br>" + d.character + " as " + d.charas;
    //    })

    //just the 5 main clones
    data = dj.filter(function (d) {
        return d.character == "Sarah" | d.character == "Alison" | d.character == "Cosima" | d.character == "Helena" | d.character == "Rachel";
    });

    var characters = d3.nest()
        .key(function (d) {
            return d.character;
        })
        .entries(data);
    y.domain(data.map(function (d) {
        return d.episode;
    }));

    // Add an SVG element for each character, with the desired dimensions and margin.
    var svg = d3.select("#gantt").selectAll("svg")
        .data(characters)
        .enter()
        .append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gx = svg.append("g")
        .attr("class", "x axis")
        //.attr("transform", "translate(0," - height + ")")
        .call(xAxis);

    gx.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    //Season labels for y axis
    var seasonlab = svg.selectAll("g.seasonl")
        .data(seasons)
        .enter().append("g");
    
    seasonlab.append("g")
        .append("text")
        .attr("class", "seasonTitle")
        .attr("x", -5)
        .attr("y", function (d, i) {
            return y(10 * i + 5) + 8;
        })
        .text(function (d, i) {
            return "Season " + (1 + seasons[i]);
        })

    svg.append("g")
        .append("line")
        .attr("class", "labelline")
        .attr("y1", function (d) {
            return y(11);
        })
        .attr("y2", function (d) {
            return y(11);
        })
        .attr("x1", -7)
        .attr("x2", function (d) {
            return x(43);
        });
    svg.append("g")
        .append("line")
        .attr("class", "labelline")
        .attr("y1", function (d) {
            return y(21);
        })
        .attr("y2", function (d) {
            return y(21);
        })
        .attr("x1", -7)
        .attr("x2", function (d) {
            return x(43);
        });

    //Title for each chart
    svg.append("g")
        .append("text")
        .attr("class", "chartTitle")
        .attr("x", padding + 20)
        .attr("y", -10)
        .text(function (d) {
            return d.key;
        });

    svg.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        //.attr("class", "bar")
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
        .attr("fill", "#1B3536")
        .attr("opacity", 0.5)
        //.on('mouseover', tip.show)
        //.on('mouseout', tip.hide);

    //svg.call(tip);

    function formatXAxis(d) {
        var s = formatAxis(d);
        return d === x.domain()[1] ? s + " minutes" : s;
    }
}