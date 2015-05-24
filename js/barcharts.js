function bardraw() {
    var margin = {
        top: 45,
        right: 40,
        bottom: 40,
        left: 40
    };
    if ($barcharts.width() < mobile_threshold) {
        margin.right = 15;
        margin.left = 20;
        var width = $barcharts.width() - margin.left - margin.right;
    } else if (mobile_threshold <= $barcharts.width() && $barcharts.width() < 1000) {
        var width = ($barcharts.width() - margin.left - margin.right) / 2.3;
    } else {
        var width = ($barcharts.width() - margin.left - margin.right) / 3.6;
    }

    var height = Math.ceil((width * barcharts_aspect_height) / barcharts_aspect_width) - margin.top - margin.bottom,
        padding = -15;

    $barcharts.empty();

    var formatMinutes = d3.format('.1f');
    var formatAxis = d3.format('.0f');
    
    var seasons = [0, 1, 2];

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .domain([0, 50])
        .range([height, 0]);

    var barcolor = d3.scale.threshold()
        .domain([10.5, 20.5])
        .range(["#712164", "#4f8a83", "#000"]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat('')
        .orient("bottom")
        .innerTickSize(0);

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(width - padding)
        .tickFormat(formatYAxis)
        .orient("right")
        .ticks(4);

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return d.character + "</br>Episode " + d.episode + "<br/>" + formatMinutes(d.minutes) + " minutes";
        })

    //just want the main five
    data = data.filter(function (d) {
        return d.character == "All Tatiana Maslany Clones" | d.character == "Sarah" | d.character == "Alison" | d.character == "Cosima" | d.character == "Helena" | d.character == "Rachel";
    });


    var characters = d3.nest()
        .key(function (d) {
            return d.character;
        })
        .entries(data);
    x.domain(data.map(function (d) {
        return d.episode;
    }));

    // Add an SVG for each character
    var svg = d3.select("#barcharts").selectAll("svg")
        .data(characters)
        .enter()
        .append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var gy = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    gy.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    gy.selectAll("text")
        .attr("x", 0)
        .attr("dy", -4);

    //Season labels for x axis
    var seasonlab = svg.selectAll("g.seasonl")
        .data(seasons)
        .enter().append("g");
    
    seasonlab.append("g")
        .append("text")
        .attr("class", "seasonTitle")
        .attr("y", height + 20)
        .attr("x", function (d, i) {
            return x(10 * i + 3);
        })
        .text(function (d, i) {
            return "Season " + (1 + seasons[i]);
        })

    //Title for each chart
    svg.append("g")
        .append("text")
        .attr("class", "chartTitle")
        .attr("x", 0)
        .attr("y", -25)
        .text(function (d) {
            return d.key
        });

    svg.selectAll(".bar")
        .data(function (d) {
            return d.values;
        })
        .enter()
        .append("rect")
        .attr("class", "barchart")
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
        .attr("fill", function (d) {
            return barcolor(d.episode);
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)

    svg.call(tip);


    function type(d) {
        d.minutes = +d.minutes;
        return d;
    }

    function formatYAxis(d) {
        var s = formatAxis(d);
        return d === y.domain()[1] ? s + " minutes" : s;
    }
}