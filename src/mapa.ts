import * as d3 from 'd3';

const StHimark = require('../data/StHimark.geojson');

export interface MapaOpciones {
    padreSelector: string //elemento contenedor del mapa
}

function crearMapa(json: any, svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>) {
    console.log(json)

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
            .on("mouseover", function() {
                d3.select(this)
                    .attr("fill", "red");
            })
            .on("mouseout", function(d, i) {
                d3.select(this)
                    .attr("fill", 'white');
            });
    
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