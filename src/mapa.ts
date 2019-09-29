import * as d3 from 'd3';
import { json } from 'd3';

const StHimark = require('../data/StHimark.geojson');

export interface MapaOpciones {
    padreSelector: string //elemento contenedor del mapa
}

function crearMapa(json: any, svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {

    // la proyeccion se calcula así: https://www.d3indepth.com/geographic/#projection-functions
    var projection = d3.geoMercator()
        .fitSize([600, 450], json);
 
    var geoGenerator = d3.geoPath()
        .projection(projection);

    const features = svg.selectAll('path')
        .data(json.features);
    
    features.enter()
        .append('path')
            .attr('d', geoGenerator)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr("id", function(d, i) { return json.features[i].properties.Nbrhood.replace(/\s/g,'-'); })
            .on("mouseover", function() {
                d3.select(this)
                    .attr("fill", "red");
            })
            .on("mouseout", function(d, i) {
                d3.select(this)
                    .attr("fill", 'white');
            });
    
    //console.log(json.features[0].properties.Nbrhood);
    
}
export function Mapa(opciones: MapaOpciones) {
    const contenedor = d3.select(opciones.padreSelector);

    const svg = contenedor.append("svg")
    .attr("width", '100%')
    .attr("height", '100%');

    d3.json(StHimark).then((json: any) =>  {
        crearMapa(json, svg);
    })
}

export function ColorBarrio(barrio: string){
    //console.log("Test ColorBarrio", barrio);
    //saco todos los colores
    var barriosTodos = d3.selectAll('path').transition().duration(200)
    .attr("fill", "white");

    //pinto el barrio seleccionado
    if(barrio !== ""){
        var selectBarrio = '#'; 
        var selectBarrio = selectBarrio.concat(barrio); 
        var unBarrio = d3.select(selectBarrio).transition().duration(200)
        .attr("fill", "red");
    }
}

export function MapaEdit(servicio: string){
    console.log("Test MapaEdit", servicio);

}

