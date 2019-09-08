import * as d3 from 'd3';

export interface MapaOpciones {
    padreSelector: string //elemento contenedor del mapa
}

export function Mapa(opciones: MapaOpciones) {
    d3.selectAll(opciones.padreSelector)
    .style("background-color", "lightgrey")
    .append("span")
    .text("mapa")
}