import * as d3 from "d3";
import { image } from "d3";

//https://blockbuilder.org/micahstubbs/d393bcfde0228430c00b  -> Fuente principal.
//https://www.d3-graph-gallery.com/graph/line_select.html    -> Solución de un error.

const hablaAntes = require('../data/hablaAntes.png');
const hablaDespues = require('../data/hablaDespues.png');
const sienteAntes = require('../data/sienteAntes.png');
const sienteDespues = require('../data/sienteDespues.png');
const dropdownOpciones = ["¿De qué se habla? (Antes)", "¿De qué se habla? (Después)", 
                          "¿Qué se siente? (Antes)", "¿Qué se siente? (Después)"];
                
const imagenes = [hablaAntes,hablaDespues,sienteAntes,sienteDespues];

export function nubes(contenedor: string) {
    //console.log("Nubes Inicio");

    var selector = d3.select(contenedor)
        .append("select")
        .attr("id", "dropdown")
        .selectAll("option")
        .data(dropdownOpciones)
        .enter().append("option")
        .text(function(d) { return d; })
        .attr("value", function (d, i) {
            return i;
        });

    var index = 0;
    d3.select("#dropdown").property("selectedIndex", index);
    
    d3.select("#dropdown")
	    .on("change", function(d,i) {
            index = d3.select(this).property("value");
		    updateFoto(d,i);
        })
        
    function updateFoto(d,i){
        //console.log("index ->", index);
        //Borro imagen anterior
        svg.selectAll("image").remove();

        //Cargo imagen según indice del selector
        var myimage = svg.append('image')
            .attr('xlink:href', imagenes[index])
            .attr('width', 275)
            .attr('height', 275)

    }

    //console.log("Pegando FOTO");

    var svg = d3.select(contenedor)
    .append("svg")
    .attr('width', 275)
    .attr('height', 275)
    .attr('stroke', 'black')
    .attr("fill", "red");

    var myimage = svg.append('image')
            .attr('xlink:href', imagenes[index])
            .attr('width', 275)
            .attr('height', 275)

    //console.log("Nubes Fin");
}
