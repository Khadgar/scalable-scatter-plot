// chart dimensions
var margin = {
        top: 20,
        right: 15,
        bottom: 60,
        left: 60
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// core scaling
var x = d3.scale.linear()
    .domain([-1, data.length])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) {
        return d["salary-to"];
    })])
    .range([height, 0]);


// data transform for from-to dots
var circlesData = [];
data.forEach((e, i) => {
    circlesData.push([i, e["salary-from"], e["className"] + " from"]);
    circlesData.push([i, e["salary-to"], e["className"] + " to"]);
})

console.log(JSON.stringify(data))

// data transform for links
var lineCoordinates = [];
data.forEach((e, i) => {
    lineCoordinates.push({
        x1: x(i),
        y1: y(e["salary-from"]),
        x2: x(i),
        y2: y(e["salary-to"])
    });
});

// root element
var svg = d3.select('body')
    .append('svg:svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .attr('class', 'chart');


// holds tha chart with x and y axis
var main = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main')

// define x-axis scaling
var xAxis = d3.svg.axis()
    .scale(x)
    .tickFormat(function(d) {
        return data[d] ? data[d].role : "";
    })
    .ticks(data.length)
    .orient("bottom");

// x-axis values
var x_axis = main.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .attr('class', 'main axis date')
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

// Add the text label for the x axis
// main.append("text")
//     .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
//     .style("text-anchor", "middle")
//     .text("Role");

// draw the y axis
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var y_axis = main.append('g')
    .attr('transform', 'translate(0,0)')
    .attr('class', 'main axis date')
    .call(yAxis);

// Add the text label for the Y axis
main.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Salary");

// chart Container
var chartArea = main.append("g")
    .attr("class", "chartContainer");

// hover area
main.append("rect")
    .attr("x", 0)
    .attr("y", margin.top)
    .attr("width", width)
    .attr("height", height)
    .attr("opacity", 0)
    .attr("class", "hoverrect");

//links between dots
var links = chartArea.selectAll("line")
    .data(lineCoordinates)
    .enter()
    .append("line")
    .style("z-index", '1')
    .datum(function(d, i) {
        return {
            source: {
                x: d.x1,
                y: d.y1
            },
            target: {
                x: d.x2,
                y: d.y2
            }
        }
    })
    .style('stroke', 'black')
    .attr('x1', function(d, i) {
        return d.source.x
    })
    .attr('y1', function(d, i) {
        return d.source.y
    })
    .attr('x2', function(d, i) {
        return d.target.x
    })
    .attr('y2', function(d, i) {
        return d.target.y
    });

// from-to dots
var circles = chartArea.selectAll("circLe")
    .data(circlesData)
    .enter()
    .append("circle")
    .style("z-index", '2')
    .datum(function(d, i) {
        return {
            x: x(d[0]),
            y: y(d[1]),
            className: d[2]
        }
    })
    .attr("class", function(d) {
        return d["className"];
    })
    .attr("cx", function(d) {
        return d.x;
    })
    .attr("cy", function(d) {
        return d.y;
    })
    .attr("r", 8);

// fisheye setup
var fisheye = d3.fisheye.scale(d3.scale.linear)
    .domain([-1, data.length])
    .range([0, width])
    .distortion(4);

// fisheye on mousemove
svg.selectAll('.hoverrect').on("mousemove", function() {
    fisheye.focus(d3.mouse(this)[0]);
    redraw();
});

// reset scale on mouseleave
svg.on("mouseleave", function() {
    reset();
});

// reset scaling
function reset() {
    svg.selectAll('.from')
        .attr("cx", function(d, i) {
            return x(i);
        });
    svg.selectAll('.to')
        .attr("cx", function(d, i) {
            return x(i);
        });
    links.attr("x1", function(e, t) {
        return x(t)
    }).attr("x2", function(e, t) {
        return x(t)
    });
}

// fisheye effect
function redraw() {
    svg.selectAll('.from')
        .attr("cx", function(d, i) {
            return fisheye(i);
        });
    svg.selectAll('.to')
        .attr("cx", function(d, i) {
            return fisheye(i);
        });
    links.attr("x1", function(e, t) {
        return fisheye(t)
    }).attr("x2", function(e, t) {
        return fisheye(t)
    });
}