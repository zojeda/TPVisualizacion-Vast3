import * as d3 from 'd3';

export interface MapaCalorOpciones {
    padreSelector: string //elemento contenedor del mapa
}

export function MapaCalor(opciones: MapaCalorOpciones) {
    d3.selectAll(opciones.padreSelector)
    .style("background-color", "lightcyan")
    .append("span")
    .text("mapa de calor")
}