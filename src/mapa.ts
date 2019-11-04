import * as d3 from 'd3';
import { json, geoCentroid } from 'd3';

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
    
    // Agrega los nombres de cada barrio al mapa.
    // Lo ubica en el centro desplazado a la izquierda según el largo del string.
    var label = svg.selectAll("text")
            .data(json.features)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("transform", function(d,i) { return "translate(" + [geoGenerator.centroid(json.features[i])[0]-(json.features[0].properties.Nbrhood.length/2*6),geoGenerator.centroid(json.features[i])[1]] + ")"; })
            .text(function(d,i) { return json.features[i].properties.Nbrhood;} );

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

export function MapaEdit(servicio: string, datos: number[], labels: string[]){
    var maxValue = Math.max.apply(null, datos);
    var i = 0;
    labels.forEach(function (barrio) {
        barrio = barrio.replace(/\s/g,'-');
        var selectBarrio = '#'; 
        var selectBarrio = selectBarrio.concat(barrio); 
        d3.select(selectBarrio).transition().duration(200)
        .attr("fill", "rgb(0, 78, 255,"+(datos[i]/maxValue)+")");
        i++;
    })
}

