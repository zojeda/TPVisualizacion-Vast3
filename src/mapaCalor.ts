import * as d3 from "d3";

const heatmap_data = require("../data//heatmap_data.csv");

export interface MapaCalorOpciones {
  padreSelector: string; //elemento contenedor del mapa
  data: number[][];
  labelscol: string[];
  labelsrow: string[];
  start_color: string;
  end_color: string;
}

export function MapaCalor(options: MapaCalorOpciones) {
  var margin = { top: 50, right: 50, bottom: 150, left: 150 },
    width = 400,
    height = 400,
    data = options.data,
    container = options.padreSelector,
    labelscolData = options.labelscol,
    labelsrowData = options.labelsrow,
    startColor = options.start_color,
    endColor = options.end_color;

  var widthLegend = 100;

  if (!data) {
    throw new Error("Please pass data");
  }

  // console.log(data);

  if (!Array.isArray(data) || !data.length || !Array.isArray(data[0])) {
    throw new Error("It should be a 2-D array");
  }

  var maxValue = d3.max(data, function(layer) {
    return d3.max(layer, function(d) {
      return d;
    });
  });
  var minValue = d3.min(data, function(layer) {
    return d3.min(layer, function(d) {
      return d;
    });
  });

  var numrows = data.length;
  var numcols = data[0].length;

  // console.log(maxValue, minValue, numcols, numrows);

  var svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var background = svg
    .append("rect")
    .style("stroke", "black")
    .style("stroke-width", "2px")
    .attr("width", width)
    .attr("height", height);

  // console.log(d3.range(numcols));

  var x = d3.scaleBand<number>()
    .domain(d3.range(numcols))
    .range([0, width]);

  var y = d3.scaleBand<number>()
    .domain(d3.range(numrows))
    .range([0, height]);

  var colorMap = d3.scaleLinear<string>()
    .domain([minValue, maxValue])
    .range([startColor, endColor]);

  var row = svg
    .selectAll(".row")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "row")
    .attr("transform", function(d, i) {
      return "translate(0," + y(i) + ")";
    })
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  var cell = row
    .selectAll(".cell")
    .data(function(d) {
      return d;
    })
    .enter()
    .append("g")
    .attr("class", "cell")
    .attr("transform", function(d, i) {
      return "translate(" + x(i) + ", 0)";
    });

  cell
    .append("rect")
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("stroke-width", 0);

  cell
    .append("text")
    .attr("dy", ".32em")
    .attr("x", x.bandwidth() / 2)
    .attr("y", y.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .style("fill", function(d, i) {
      return d >= maxValue / 2 ? "white" : "black";
    })
    .text(function(d, i) {
      return d;
    });

  row
    .selectAll(".cell")
    .data(function(d, i) {
      return data[i];
    })
    .style("fill", colorMap);

  var labels = svg.append("g").attr("class", "labels");

  var columnLabels = labels
    .selectAll(".column-label")
    .data(labelscolData)
    .enter()
    .append("g")
    .attr("class", "column-label")
    .attr("transform", function(d, i) {
      return "translate(" + x(i) + "," + height + ")";
    });

  columnLabels
    .append("line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .attr("x1", x.bandwidth() / 2)
    .attr("x2", x.bandwidth() / 2)
    .attr("y1", 0)
    .attr("y2", 5);

  columnLabels
    .append("text")
    .attr("x", 0)
    .attr("y", y.bandwidth() / 2)
    .attr("dy", ".82em")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-60)")
    .text(function(d, i) {
      return d;
    });

  var rowLabels = labels
    .selectAll(".row-label")
    .data(labelsrowData)
    .enter()
    .append("g")
    .attr("class", "row-label")
    .attr("transform", function(d, i) {
      return "translate(" + 0 + "," + y(i) + ")";
    });

  rowLabels
    .append("line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .attr("x1", 0)
    .attr("x2", -5)
    .attr("y1", y.bandwidth() / 2)
    .attr("y2", y.bandwidth() / 2);

  rowLabels
    .append("text")
    .attr("x", -8)
    .attr("y", y.bandwidth() / 2)
    .attr("dy", ".32em")
    .attr("text-anchor", "end")
    .attr("id", function(d, i) { return labelsrowData[i].replace(/\s/g,'-'); })
    .text(function(d, i) {
      return d;
    })
    .attr("font-size", "16px")
    .attr("fill", "black");

  var key = d3
    .select("#legend")
    .append("svg")
    .attr("width", widthLegend)
    .attr("height", height + margin.top + margin.bottom);

  var legend = key
    .append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

  legend
    .append("stop")
    .attr("offset", "0%")
    .attr("stop-color", endColor)
    .attr("stop-opacity", 1);

  legend
    .append("stop")
    .attr("offset", "100%")
    .attr("stop-color", startColor)
    .attr("stop-opacity", 1);

  key
    .append("rect")
    .attr("width", widthLegend / 2 - 10)
    .attr("height", height)
    .style("fill", "url(#gradient)")
    .attr("transform", "translate(0," + margin.top + ")");

  var yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([minValue, maxValue]);

  var yAxis = d3.axisRight(yScale)

  key
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(41," + margin.top + ")")
    .call(yAxis);

  // Eventos por Mouse
  function handleMouseOver(d, i) {  
    //console.log("Mouse Over", d[i], labelsrowData[i], i);

    // Armo un string con el id de cada componente de texto
    var selectText = '#'; 
    var selectText = selectText.concat(labelsrowData[i]).replace(/\s/g,'-'); 
    //console.log(selectText);

    rowLabels.select(selectText).transition().duration(200)
    .attr("font-size", "21px")
    .attr("fill", "red");
    //console.log("Mouse Over Fin");
    }

  function handleMouseOut(d, i) {  
    //console.log("Mouse Out", d[i]);
    rowLabels.selectAll("text")
    .data(labelsrowData).transition().duration(200)
    .attr("font-size", "16px")
    .attr("fill", "black");
  }

}
