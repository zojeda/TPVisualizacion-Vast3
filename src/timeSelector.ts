import * as d3 from "d3";
import * as moment from "moment";
import * as crossfilter from "crossfilter2";
import { crearSelector } from "./pruebaBarchartSelector";
export interface SelectorTiempoOpciones {
  padreSelector: string; //elemento contenedor del mapa
}

interface Dato {
  timestamp: Date;
  total: number;
}



export function SelectorTiempo(opciones: SelectorTiempoOpciones, datos: Dato[], onCambioSeleccion?: (t1: Date, t2: Date) => void) {

  var coeff = 1000 * 60 * 30; //acumulado cada 30 minutos
  var datosAcumuladosPorTiempo = d3.nest<Dato, {total: Number}>()
  .key(d => new Date(Math.round(d.timestamp.getTime() / coeff) * coeff).toString())
  .rollup(a => ({
      total: d3.sum(a, d =>d.total )
    }))
  .entries(datos)
  .map(d => Object.assign({}, d, {timestamp: new Date(d.key)}));

  const margin = {top: 10, right: 10, bottom: 10, left: 60};
  const width = 1400 - ( margin.left + margin.right);
  const height = 140 - ( margin.top + margin.bottom);

  const svg = d3
    .select(opciones.padreSelector)
    .append("svg")
    .attr("height", "100%")
    .attr("width", "100%");

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, 50]);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${0})`);

  const xScale = d3
    .scaleTime()
    .domain([
      moment("2020-04-06 00:00:00").toDate(),
      moment("2020-04-11 00:00:00").toDate()
    ])
    .rangeRound([0, width]);

  chart
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  let barras = chart
    .selectAll()
    .data(datosAcumuladosPorTiempo)
    .enter()
    .append("rect")
    .attr("x", dato => xScale(dato.timestamp))
    .attr("y", dato => yScale(dato.value.total))
    .attr("height", s => height - yScale(s.value.total))
    .attr("width", 5)
    .style("fill", "steelblue")
    .style("stroke", "black")
    .style("stoke-width", 1);


  // brush para seleccion de datos
  let brushResizePath = function(d) {
    let e = +(d.type == "e"),
        x = e ? 1 : -1,
        y = height / 2;
    return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
}

  let brushHandle = (g, selection) => g
    .selectAll(".handle--custom")
    .data([{type: "w"}, {type: "e"}])
    .join(
      enter => enter.append("path")
          .attr("class", "handle--custom")
          .attr("fill", "#666")
          .attr("fill-opacity", 0.8)
          .attr("stroke", "#000")
          .attr("stroke-width", 1.5)
          .attr("cursor", "ew-resize")
          .attr("d", brushResizePath)
          )
    .attr("display", selection === null ? "none" : null)
    .attr("transform", selection === null ? null : (d, i) => `translate(${selection[i]},${-margin.top-margin.bottom})`)

  function brushed() {
    const selection = d3.event.selection;
    if (selection === null) {
      barras.style("stroke", 'black');
      onCambioSeleccion && onCambioSeleccion(null, null);
    } else {
      const sx = selection.map(xScale.invert);
      // barras.style("stroke", d => sx[0] <= d.timestamp && d.timestamp <= sx[1] ? 'red' : 'black');
      onCambioSeleccion && onCambioSeleccion(sx[0], sx[1]);
    }
    d3.select(this).call(brushHandle, selection);
  }

  const brush = d3
    .brushX()
    .extent([[margin.left, margin.right], [width - (margin.left+margin.right), height]])
    .on("start brush end", brushed);

  chart
    .append("g")
    .call(brush)
    .call(brush.move, [0.3, 0.5].map(xScale));





}
