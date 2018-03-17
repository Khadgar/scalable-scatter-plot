define([
    'jquery',
    'd3',
    './fisheye'
], function($, d3, Fisheye) {
    return {
        // chart dimensions
        margin: {
            top: 20,
            right: 15,
            bottom: 60,
            left: 60
        },

        init: function() {
            this.width = 960 - this.margin.left - this.margin.right;
            this.height = 500 - this.margin.top - this.margin.bottom;
        },

        transFormCirclesData: function(data) {
            // data transform for from-to dots
            var circlesData = [];
            data.forEach((e, i) => {
                circlesData.push([i, e["salary-from"], e["className"] + " from", e["role"], "from"]);
                circlesData.push([i, e["salary-to"], e["className"] + " to", e["role"], "to"]);
            });
            return circlesData;
        },

        transFormLinksData: function(data) {
            var lineCoordinates = [];
            data.forEach((e, i) => {
                lineCoordinates.push({
                    x1: this.scaleX(i),
                    y1: this.scaleY(e["salary-from"]),
                    x2: this.scaleX(i),
                    y2: this.scaleY(e["salary-to"])
                });
            });
            return lineCoordinates;
        },

        createChart: function(data) {
            this.init();
            // core scaling
            this.scaleX = d3.scale.linear()
                .domain([-1, data.length])
                .range([0, this.width]);

            this.scaleY = d3.scale.linear()
                .domain([0, d3.max(data, function(d) {
                    return d["salary-to"];
                })])
                .range([this.height, 0]);

            // data transform for from-to dots
            var circlesData = this.transFormCirclesData(data);

            // data transform for links
            var lineCoordinates = this.transFormLinksData(data);

            // root element
            var svg = d3.select('#chartContainer')
                .append('svg:svg')
                .attr('width', this.width + this.margin.right + this.margin.left)
                .attr('height', this.height + this.margin.top + this.margin.bottom)
                .attr('class', 'chart');


            // holds tha chart with x and y axis
            var main = svg.append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
                .attr('width', this.width)
                .attr('height', this.height)
                .attr('class', 'main')

            // define x-axis scaling
            var xAxis = d3.svg.axis()
                .scale(this.scaleX)
                .tickFormat(function(d) {
                    return data[d] ? data[d].role : "";
                })
                .ticks(data.length)
                .orient("bottom");

            // x-axis values
            var x_axis = main.append('g')
                .attr('transform', 'translate(0,' + this.height + ')')
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
                .scale(this.scaleY)
                .orient("left");

            var y_axis = main.append('g')
                .attr('transform', 'translate(0,0)')
                .attr('class', 'main axis date')
                .call(yAxis);

            // Add the text label for the Y axis
            main.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - this.margin.left)
                .attr("x", 0 - (this.height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Salary");

            // hover area
            main.append("rect")
                .attr("x", 0)
                .attr("y", this.margin.top)
                .attr("width", this.width)
                .attr("height", this.height)
                .attr("opacity", 0)
                .attr("class", "hoverrect");

            // chart Container
            var chartArea = main.append("g")
                .attr("class", "chartContainer");

            d3.select(".hoverrect").on('click', function() {
                d3.event.stopPropagation();
            });

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
                }.bind(this))
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
                        x: this.scaleX(d[0]),
                        y: this.scaleY(d[1]),
                        className: d[2],
                        role: d[3],
                        salary: d[1],
                        type: d[4],
                        id: "circle_" + d[0]
                    }
                }.bind(this))
                .attr("class", function(d) {
                    return d.className + " " + d.id;
                })
                .attr("cx", function(d) {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                })
                .attr("r", 8)
                .on('mouseover', function(d, i) {
                    d3.select(this).style("cursor", "pointer");
                    d3.select(".jobTitle").text(d.role)
                    var circles = d3.selectAll("." + d.id);
                    circles.each(function(circle) {
                        if (circle.type === "to") {
                            d3.select(".salaryMax").text(circle.salary)
                        } else {
                            d3.select(".salaryMin").text(circle.salary)
                        }
                    });
                    console.log('circle move', d, i)
                })
                .on('mouseout', function(d, i) {
                    d3.select(this).style("cursor", "default");
                });

            // fisheye setup
            var fisheye = Fisheye.scale(d3.scale.linear)
                .domain([-1, data.length])
                .range([0, this.width])
                .distortion(4);

            // fisheye on mousemove
            svg.selectAll('.hoverrect').on("mousemove", function() {
                fisheye.focus(d3.mouse(this)[0]);
                redraw();
            });

            // reset scale on mouseleave
            svg.on("mouseleave", () => {
                svg.selectAll('.from')
                    .attr("cx", (d, i) => {
                        return this.scaleX(i);
                    });

                svg.selectAll('.to')
                    .attr("cx", (d, i) => {
                        return this.scaleX(i);
                    });

                links.attr("x1", (e, t) => {
                        return this.scaleX(t)
                    })
                    .attr("x2", (e, t) => {
                        return this.scaleX(t)
                    });
            });

            // fisheye effect
            function redraw() {
                svg.selectAll('.from')
                    .attr("cx", function(d, i) {
                        return fisheye(i);
                    })
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
        }
    };
});