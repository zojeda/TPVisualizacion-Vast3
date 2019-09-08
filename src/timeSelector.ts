import * as d3 from 'd3';

export interface SelectorTiempoOpciones {
    padreSelector: string //elemento contenedor del mapa
}

export function SelectorTiempo(opciones: SelectorTiempoOpciones) {
    d3.selectAll(opciones.padreSelector)
    .style("background-color", "lightskyblue")
    .append("span")
    .text("selector tiempo")
}