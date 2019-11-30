import * as d3 from "d3";
import moment from "moment";
import 'daterangepicker';
import 'daterangepicker/daterangepicker.css';

export interface SelectorTiempoOpciones {
  padreSelector: string; //elemento contenedor del mapa
}

interface Dato {
  timestamp: Date;
  total: number;
}

const DATE_TIME_FORMAT = 'DD/MM HH:mm'
const inicioMoment = moment("2020-04-06 00:00:00");
const finMoment = moment("2020-04-11 00:00:00");

export function SelectorTiempo(opciones: SelectorTiempoOpciones, datos: Dato[], onCambioSeleccion?: (t1: Date, t2: Date) => void) {

  var coeff = 1000 * 60 * 30; //acumulado cada 30 minutos
  var datosAcumuladosPorTiempo = d3.nest<Dato, {total: Number}>()
  .key(d => new Date(Math.round(d.timestamp.getTime() / coeff) * coeff).toString())
  .rollup(a => ({
      total: d3.sum(a, d =>d.total )
    }))
  .entries(datos)
  .map(d => Object.assign({}, d, {timestamp: new Date(d.key)}));

  const margin = {top: 10, right: 10, bottom: 10, left: 31};
  const width = 1400 - ( margin.left + margin.right);
  const height = 140 - ( margin.top + margin.bottom);


  let horaTerremoto: Date = moment('2020-04-08T08:36:00-03:00').toDate();

  let seleccionDesde: Date = moment('2020-04-08T08:36:00-03:00').toDate();
  let seleccionHasta: Date = moment('2020-04-08T13:36:00-03:00').toDate();

  d3.select("#ir_terremoto_btb")
    .on('click', () => {
      const ventanaActual = moment(seleccionHasta).diff(moment(seleccionDesde))
      let desde = horaTerremoto;
      let hasta = moment(horaTerremoto).add(ventanaActual).toDate()
      seleccionar(desde, hasta)
      brushG
      .call(brush.move, [desde, hasta].map(xScale));
    })


    d3.select("#mover_ventana_der")
    .on('click', () => {
      const vetanaActual = moment(seleccionHasta).diff(moment(seleccionDesde))
      let desde = seleccionHasta;
      let hasta = moment(seleccionHasta).add(vetanaActual).toDate();
      seleccionar(desde, hasta)
      brushG
      .call(brush.move, [desde, hasta].map(xScale));
    })

    d3.select("#mover_ventana_izq")
    .on('click', () => {
      const vetanaActual = moment(seleccionDesde).diff(moment(seleccionHasta))
      let desde = moment(seleccionDesde).add(vetanaActual).toDate()
      let hasta = seleccionDesde;
      seleccionar(desde, hasta)
      brushG
      .call(brush.move, [desde, hasta].map(xScale));
    })

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
      inicioMoment.toDate(),
      finMoment.toDate()
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

  
  let brushHandle = function(g) {
    let xDesde = xScale(seleccionDesde);
    let xHasta = xScale(seleccionHasta);
    let seleccion = [xDesde, xHasta];
    let brushH = g
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
    .attr("transform", (d, i) => `translate(${seleccion[i]},${-margin.top-margin.bottom})`)
    return brushH;
  }

  function brushed() {
    const selection = d3.event.selection;
    if (selection === null) {
      seleccionar(seleccionDesde, seleccionHasta);
    } else {
      const sx = selection.map(xScale.invert);
      seleccionar(sx[0], sx[1]);
    }

 
    d3.select(this).call(brushHandle);
  }

  const brush = d3
    .brushX()
  
  brush
    .extent([[0, margin.top], [width - (margin.left+margin.right), height]])
    .on("brush", brushed);

  const brushG = chart
    .append("g")
    .call(brush)

 
  function seleccionar(desde: Date, hasta: Date) {
    if (desde == seleccionDesde && hasta == seleccionHasta) {
      return
    }
    const inicioDate = inicioMoment.toDate();
    const finDate = finMoment.toDate();
    seleccionDesde = inicioDate > desde ? inicioDate : desde;
    seleccionHasta = finDate < hasta || hasta < inicioDate ? finDate : hasta;


    $('input[name="datetimes"]').daterangepicker({
      timePicker: true,
      showDropdowns: true,
      drops: "up",
      startDate: moment(seleccionDesde),
      endDate: moment(finMoment),
      timePicker24Hour: true,
      minDate: inicioMoment,
      maxDate: finMoment,
      locale: {
        format: DATE_TIME_FORMAT
      }
    });

    $('input[name="datetimes"]').on('apply.daterangepicker', function(ev, picker) {
      //do something, like clearing an input
        seleccionar(picker.startDate.toDate(), picker.endDate.toDate())
  
        brushG
          .call(brush.move, [picker.startDate.toDate(), picker.endDate.toDate()].map(xScale));
    });
    
    $('input[name="datetimes"]').val(moment(seleccionDesde).format(DATE_TIME_FORMAT) + 'hs - ' + moment(seleccionHasta).format(DATE_TIME_FORMAT)) + 'hs';


    onCambioSeleccion && onCambioSeleccion(desde, hasta);
  }

  seleccionar(seleccionDesde, seleccionHasta);

  // horrible hack para evitar el primer mapa negro
  onCambioSeleccion && onCambioSeleccion(seleccionDesde, seleccionHasta);
  onCambioSeleccion && onCambioSeleccion(seleccionDesde, seleccionHasta);
  brushG
    .call(brush.move, [seleccionDesde, seleccionHasta].map(xScale));

}
