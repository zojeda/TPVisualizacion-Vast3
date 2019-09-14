import * as d3 from "d3";
import * as moment from "moment";
import * as crossfilter from "crossfilter2";
import { crearSelector } from "./pruebaBarchartSelector";
export interface SelectorTiempoOpciones {
  padreSelector: string; //elemento contenedor del mapa
}

interface Dato {
  timestamp: Date;
  cantidadMsgProblemas: number;
}

const inicio = moment("2020-04-06 00:00:00");
const datos: Dato[] = Array.apply(null, { length: 5 * 24 }) // 5 dias X 24 hs
  .map((_v, i) => ({
    timestamp: inicio.add(moment.duration(1, "hour")).toDate(),
    cantidadMsgProblemas: (100 * i) / (5 * 25)
  }));

export function SelectorTiempo(opciones: SelectorTiempoOpciones) {
  const margin = 10;
  const width = 1000 - 2 * margin;
  const height = 140 - 2 * margin;

  const svg = d3
    .select(opciones.padreSelector)
    .append("svg")
    .attr("height", "100%")
    .attr("width", "100%");

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, 100]);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${30 + margin}, ${0})`);

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
    .data(datos)
    .enter()
    .append("rect")
    .attr("x", dato => xScale(dato.timestamp))
    .attr("y", dato => yScale(dato.cantidadMsgProblemas))
    .attr("height", s => height - yScale(s.cantidadMsgProblemas))
    .attr("width", 8)
    .style("fill", "steelblue")
    .style("stroke", "black")
    .style("stoke-width", 2);


  // brush para seleccion de datos
  let arc = d3.arc()
  .innerRadius(0)
  .outerRadius((height - margin) / 2)
  .startAngle(0)
  .endAngle((d, i) => i ? Math.PI : -Math.PI)

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
          .attr("d", arc)
    )
      .attr("display", selection === null ? "none" : null)
      .attr("transform", selection === null ? null : (d, i) => `translate(${selection[i]},${(height + margin - margin) / 2})`)

  function brushed() {
    const selection = d3.event.selection;
    if (selection === null) {
      barras.attr("stroke", null);
    } else {
      const sx = selection.map(xScale.invert);
      barras.attr("stroke", d => (sx[0] <= d && d <= sx[1] ? "red" : null));
    }
    d3.select(this).call(brushHandle, selection);
  }

  const brush = d3
    .brushX()
    .extent([[margin, margin], [width - margin, height - margin]])
    .on("start brush end", brushed);

  svg
    .append("g")
    .call(brush)
    .call(brush.move, [0.3, 0.5].map(xScale));





}
