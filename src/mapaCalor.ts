import * as d3 from "d3";
import { Mapa } from "./mapa";

const heatmap_data = require("../data/heatmap_data.csv");

export interface MapaCalorOpciones {
  padreSelector: string; //elemento contenedor del mapa
  labelscol: string[];
  labelsrow: string[];
  start_color: string;
  end_color: string;
  minValue: number;
  maxValue: number;
  callback_Mapa: (servicio: string, datos: number[], label: string[], color: string[], inice: number) => void;
  callback_Barrio: (barrio: string) => void;
}

// Defino los colores para cada uno de los servicios
const colorPorSerivicio: string[] = [];
colorPorSerivicio[0] = "rgb(51, 54, 255,";
colorPorSerivicio[1] = "rgb(252, 255, 51,";
colorPorSerivicio[2] = "rgb(255, 51, 246,";
colorPorSerivicio[3] = "rgb(51, 209, 255,";
colorPorSerivicio[4] = "rgb(18, 224, 28,";

export function indexOfMax (arr: number[]) {
  if (arr.length === 0) {
      return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }

  return maxIndex;
}

export function MapaCalor(options: MapaCalorOpciones) {
  var margin = { top: 5, right: 5, bottom: 100, left: 120 },
    width = 240,
    height = 350,
    container = options.padreSelector,
    labelscolData = options.labelscol,
    labelsrowData = options.labelsrow,
    startColor = options.start_color,
    endColor = options.end_color,
    minValue = options.minValue,
    maxValue = options.maxValue;

  var widthLegend = 130;


  var svg = d3
    .select(container)
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
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
    .domain(d3.range(labelscolData.length))
    .range([0, width]);

  var y = d3.scaleBand<number>()
    .domain(d3.range(labelsrowData.length))
    .range([0, height]);
  
  var labels = svg.append("g").attr("class", "labels");

  var columnLabels = labels
    .selectAll(".column-label")
    .data(labelscolData)
    .enter()
    .append("g")
    .attr("class", "column-label")
    .attr("transform", function(d, i) {
      return "translate(" + x(i) + "," + height + ")";
    })
    .style("stroke", function (d,i) {return colorPorSerivicio[i]+"255)"; });

  columnLabels
    .append("line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .attr("x1", x.bandwidth() / 2)
    .attr("x2", x.bandwidth() / 2)
    .attr("y1", 0)
    .attr("y2", 5);

  let textoColumnas = columnLabels
    .append("text")
    .attr("x", 0)
    .attr("y", y.bandwidth() / 2)
    .attr("dy", ".82em")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-60)")
    .attr("id", function(d, i) { return labelscolData[i].replace(/\s/g,'-'); })
    .text(function(d, i) {
      return d;
    })
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

  let rowTexts = rowLabels
      .append("text")
      .attr("x", -8)
      .attr("y", y.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .attr("id", function(d, i) { return labelsrowData[i].replace(/\s/g,'-'); })
      .text(function(d, i) {
        return d;
      })
      .attr("font-size", "12px")
      .attr("fill", "black")
      .style("stroke", "black")

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

  let servicioSeleccionado = null;
  let indiceColumnaSeleccionada = null;

  let actualidarDatos = function(data: number[][]) {
    textoColumnas
      .on("mouseover", handleMouseOverCLabel)
      .on("mouseout", handleMouseOutCLabel);

    rowTexts
      .on("mouseover", handleMouseOverRLabel)
      .on("mouseout", handleMouseOutRLabel);

    if (servicioSeleccionado) {
      options.callback_Mapa(servicioSeleccionado,data.map(x => x[indiceColumnaSeleccionada]),
                labelsrowData,colorPorSerivicio,indiceColumnaSeleccionada);
    }

    if (servicioSeleccionado == null) {
      const maxValueFila: number[] = [];
      const maxColorFila: string[] = [];

      for(let i = 0; i < data.length; i++)
      {
          //maxValueFila[i] = [];
          maxValueFila[i] = d3.max(data[i]);
          if (maxValueFila[i]>0) {
            maxColorFila[i] = colorPorSerivicio[indexOfMax(data[i])];
          } else {
            maxColorFila[i] = "rgb(255, 255, 255,";
          }
          
      }
      options.callback_Mapa(servicioSeleccionado,maxValueFila,labelsrowData,maxColorFila,0);
    }


    function handleMouseOverRLabel(d, i){
      //alert(d);
    }
  
    function handleMouseOutRLabel(d, i){
      //alert('Out'+d);
    }

    function handleMouseOverCLabel(d, i){
      //alert(d);
      
      columnLabels.selectAll("text")
      .data(labelscolData).transition().duration(200)
      .attr("font-size", "16px")
      .attr("fill", "black");
      
      var selectText = '#'; 
      var selectText = selectText.concat(labelscolData[i]).replace(/\s/g,'-'); 
      columnLabels.select(selectText).transition().duration(200)
      .attr("font-size", "21px")
      .attr("fill", "rgb(0, 78, 255)");
      servicioSeleccionado = d;
      indiceColumnaSeleccionada = i;
      options.callback_Mapa(d,data.map(x => x[i]),labelsrowData,colorPorSerivicio,indiceColumnaSeleccionada);
    }
  
    function handleMouseOutCLabel(d, i){
      //alert('Out'+d);
    }


    if (!Array.isArray(data) || !data.length || !Array.isArray(data[0])) {
      throw new Error("It should be a 2-D array");
    }
  
    /* 
    //Este era el calculo original de los maximos y minimos del color. 
    // Se paso para afuera para que no cambie el maximo con el filtro.
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
   */
  //const maxValue = 134;
  //const minValue =   0;

  var colorMap = d3.scaleLinear<string>()
    .domain([minValue, maxValue])
    .range([startColor, endColor]);

  
  var row = svg
    .selectAll(".row")
    .data(data)

  row.enter()
    .append("g")
    .attr("class", "row")
    .attr("transform", function(d, i) {
      return "translate(0," + y(i) + ")";
    })
    .on("mouseover", handleMouseOverRow)
    .on("mouseout", handleMouseOutRow);

  var cell = row
    .selectAll(".cell")
    .data(function(d) {
      return d;
    })

   cell.enter()
    .append("g")
    .attr("class", "cell")
    .attr("transform", function(d, i) {
      return "translate(" + x(i) + ", 0)";
    })
    .on("mouseover", handleMouseOverCol)
    .on("mouseout", handleMouseOutCol);

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



  var yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([minValue, maxValue]);

  var yAxis = d3.axisRight(yScale)

  key
    .append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(41," + margin.top + ")")
    .call(yAxis);

  // Eventos por Mouse por Fila
  function handleMouseOverRow(d, i) {  
    /*
    //console.log("Mouse Over", d[i], labelsrowData[i], i);
    // Armo un string con el id de cada componente de texto
    var selectText = '#'; 
    var selectText = selectText.concat(labelsrowData[i]).replace(/\s/g,'-'); 
    //console.log(selectText);
    rowLabels.select(selectText).transition().duration(200)
    .attr("font-size", "21px")
    .attr("fill", "red");
    options.callback_Barrio(labelsrowData[i].replace(/\s/g,'-'));
    //console.log("Mouse Over Fin");
    */
    }

  function handleMouseOutRow(d, i) {  
    /*
    //console.log("Mouse Out", d[i]);
    rowLabels.selectAll("text")
    .data(labelsrowData).transition().duration(200)
    .attr("font-size", "16px")
    .attr("fill", "black");
    options.callback_Barrio("");
    */
  }

  // Eventos por Mouse por Columna
  function handleMouseOverCol(d, i) {  
    /*var selectText = '#'; 
    var selectText = selectText.concat(labelscolData[i]).replace(/\s/g,'-'); 
    columnLabels.select(selectText).transition().duration(200)
    .attr("font-size", "21px")
    .attr("fill", "red");
    //options.callback_Mapa(labelscolData[i]);
    */
    }
  
  function handleMouseOutCol(d, i) {  
    /*columnLabels.selectAll("text")
    .data(labelscolData).transition().duration(200)
    .attr("font-size", "16px")
    .attr("fill", "black");
    */
  }

  }

  

  return actualidarDatos;
}
