import * as d3 from "d3";

const heatmap_data = require('../data//heatmap_data.csv');

export interface MapaCalorOpciones {
  padreSelector: string; //elemento contenedor del mapa
}

export function MapaCalor(opciones: MapaCalorOpciones) {
  var margin = { top: 30, right: 30, bottom: 30, left: 130 },
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3
    .select(opciones.padreSelector)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Labels of row and columns
  var myGroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  var myVars = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];

  // Build X scales and axis:
  var x = d3
    .scaleBand()
    .range([0, width])
    .domain(myGroups)
    .padding(0.01);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Build X scales and axis:
  var y = d3
    .scaleBand()
    .range([height, 0])
    .domain(myVars)
    .padding(0.01);
  svg.append("g").call(d3.axisLeft(y));

  // Build color scale
  var myColor = d3
    .scaleLinear<string>()
    .range(["white", "red"])
    .domain([1, 100]);

  //Read the data
  d3.csv(heatmap_data).then(data => {
    svg
      .selectAll()
      .data(data, function(d) {
        return d.group + ":" + d.variable;
      })
      .enter()
      .append("rect")
      .attr("x", function(d) {
        return x(d.group);
      })
      .attr("y", function(d) {
        return y(d.variable);
      })
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", function(d: any) {
        return myColor(d.value);
      });
  });
}
