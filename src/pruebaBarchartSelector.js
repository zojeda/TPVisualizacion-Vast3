import * as d3 from 'd3';
import crossfilter from 'crossfilter2';

d3.rebind = function(target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };
  
  // Method is assumed to be a standard D3 getter-setter:
  // If passed with no arguments, gets the value.
  // If passed with arguments, sets the value and returns the target.
  function d3_rebind(target, source, method) {
    return function() {
      var value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }

export function crearSelector(padre) {
    d3.csv("https://raw.githubusercontent.com/square/crossfilter/gh-pages/flights-3m.json").then((flights) => {
        // Various formatters.
        var formatNumber = d3.format(",d"),
            formatChange = d3.format("+,d"),
            formatDate = d3.timeFormat("%B %d, %Y"),
            formatTime = d3.timeFormat("%I:%M %p");
        // A nest operator, for grouping the flight list.
        var nestByDate = d3.nest()
            .key(function(d) { return d3.timeDay(d.date); });
        // A little coercion, since the CSV is untyped.
        flights.forEach(function(d, i) {
          d.index = i;
          d.date = parseDate(d.date);
          d.delay = +d.delay;
          d.distance = +d.distance;
        });
        // Create the crossfilter for the relevant dimensions and groups.
        var flight = crossfilter(flights),
            all = flight.groupAll(),
            date = flight.dimension(function(d) { return d.date; }),
            dates = date.group(d3.timeDay),
            hour = flight.dimension(function(d) { return d.date.getHours() + d.date.getMinutes() / 60; }),
            hours = hour.group(Math.floor),
            delay = flight.dimension(function(d) { return Math.max(-60, Math.min(149, d.delay)); }),
            delays = delay.group(function(d) { return Math.floor(d / 10) * 10; }),
            distance = flight.dimension(function(d) { return Math.min(1999, d.distance); }),
            distances = distance.group(function(d) { return Math.floor(d / 50) * 50; });
        var charts = [
          barChart()
              .dimension(date)
              .group(dates)
              .round(d3.timeDay.round)
            .x(d3.scaleTime()
              .domain([new Date(2001, 0, 1), new Date(2001, 3, 1)])
              .rangeRound([0, 10 * 90]))
              .filter([new Date(2001, 1, 1), new Date(2001, 2, 1)])
        ];
        // Given our array of charts, which we assume are in the same order as the
        // .chart elements in the DOM, bind the charts to the DOM and render them.
        // We also listen to the chart's brush events to update the display.
        var chart = d3.selectAll(padre)
            .data(charts)
        // Render the initial lists.
        var list = d3.selectAll(".list")
            .data([flightList]);
        // Render the total.
        d3.selectAll("#total")
            .text(formatNumber(flight.size()));
        renderAll();
        // Renders the specified chart or list.
        function render(method) {
          d3.select(this).call(method);
        }
        // Whenever the brush moves, re-rendering everything.
        function renderAll() {
          chart.each(render);
          list.each(render);
          d3.select("#active").text(formatNumber(all.value()));
        }
        // Like d3.time.format, but faster.
        function parseDate(d) {
          return new Date(2001,
              d.substring(0, 2) - 1,
              d.substring(2, 4),
              d.substring(4, 6),
              d.substring(6, 8));
        }
        // window.filter = function(filters) {
        //   filters.forEach(function(d, i) { charts[i].filter(d); });
        //   renderAll();
        // };
        // window.reset = function(i) {
        //   charts[i].filter(null);
        //   renderAll();
        // };
        function flightList(div) {
          var flightsByDate = nestByDate.entries(date.top(40));
          div.each(function() {
            var date = d3.select(this).selectAll(".date")
                .data(flightsByDate, function(d) { return d.key; });
            date.enter().append("div")
                .attr("class", "date")
              .append("div")
                .attr("class", "day")
                .text(function(d) { return formatDate(d.values[0].date); });
            date.exit().remove();
            var flight = date.order().selectAll(".flight")
                .data(function(d) { return d.values; }, function(d) { return d.index; });
            var flightEnter = flight.enter().append("div")
                .attr("class", "flight");
            flightEnter.append("div")
                .attr("class", "time")
                .text(function(d) { return formatTime(d.date); });
            flightEnter.append("div")
                .attr("class", "origin")
                .text(function(d) { return d.origin; });
            flightEnter.append("div")
                .attr("class", "destination")
                .text(function(d) { return d.destination; });
            flightEnter.append("div")
                .attr("class", "distance")
                .text(function(d) { return formatNumber(d.distance) + " mi."; });
            flightEnter.append("div")
                .attr("class", "delay")
                .classed("early", function(d) { return d.delay < 0; })
                .text(function(d) { return formatChange(d.delay) + " min."; });
            flight.exit().remove();
            flight.order();
          });
        }
        function barChart() {
          if (!barChart.id) barChart.id = 0;
          var margin = {top: 10, right: 10, bottom: 20, left: 10},
              x,
              y = d3.scaleLinear().range([100, 0]),
              id = barChart.id++,
              axis = d3.axisBottom(),
              brush = d3.brush(),
              brushDirty,
              dimension,
              group,
              round;
          function chart(div) {
            var width = x.range()[1],
                height = y.range()[0];
            y.domain([0, group.top(1)[0].value]);
            div.each(function() {
              var div = d3.select(this),
                  g = div.select("g");
              // Create the skeletal chart.
              if (g.empty()) {
                div.select(".title").append("a")
                    .attr("href", "javascript:reset(" + id + ")")
                    .attr("class", "reset")
                    .text("reset")
                    .style("display", "none");
                g = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                g.append("clipPath")
                    .attr("id", "clip-" + id)
                  .append("rect")
                    .attr("width", width)
                    .attr("height", height);
                g.selectAll(".bar")
                    .data(["background", "foreground"])
                  .enter().append("path")
                    .attr("class", function(d) { return d + " bar"; })
                    .datum(group.all());
                g.selectAll(".foreground.bar")
                    .attr("clip-path", "url(#clip-" + id + ")");
                g.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(axis);
                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
              }
              
              g.selectAll(".bar").attr("d", barPath);
            });
            function barPath(groups) {
              var path = [],
                  i = -1,
                  n = groups.length,
                  d;
              while (++i < n) {
                d = groups[i];
                path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
              }
              return path.join("");
            }
            function resizePath(d) {
              var e = +(d == "e"),
                  x = e ? 1 : -1,
                  y = height / 3;
              return "M" + (.5 * x) + "," + y
                  + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                  + "V" + (2 * y - 6)
                  + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                  + "Z"
                  + "M" + (2.5 * x) + "," + (y + 8)
                  + "V" + (2 * y - 8)
                  + "M" + (4.5 * x) + "," + (y + 8)
                  + "V" + (2 * y - 8);
            }
          }
          
          chart.margin = function(_) {
            if (!arguments.length) return margin;
            margin = _;
            return chart;
          };
          chart.x = function(_) {
            if (!arguments.length) return x;
            x = _;
            axis.scale(x);
            // brushX(x);
            return chart;
          };
          chart.y = function(_) {
            if (!arguments.length) return y;
            y = _;
            return chart;
          };
          chart.dimension = function(_) {
            if (!arguments.length) return dimension;
            dimension = _;
            return chart;
          };
          chart.filter = function(_) {
            if (_) {
              brush.extent(_);
              dimension.filterRange(_);
            } else {
              brush.clear();
              dimension.filterAll();
            }
            brushDirty = true;
            return chart;
          };
          chart.group = function(_) {
            if (!arguments.length) return group;
            group = _;
            return chart;
          };
          chart.round = function(_) {
            if (!arguments.length) return round;
            round = _;
            return chart;
          };
          return d3.rebind(chart, brush, "on");
        }
      });
}