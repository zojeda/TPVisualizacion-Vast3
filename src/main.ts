import "./main.css";
import { MapaCalor } from "./mapaCalor";
import { Mapa } from "./mapa";
import { SelectorTiempo } from "./timeSelector";
import * as d3 from 'd3';
import { preprocesar, totalizarPorBarrio, convertirAMatriz} from './datos';

const rutaTados = require("../pruebas/datos/data/tweet-servicio-valoracion2.csv");


d3.csv(rutaTados, preprocesar)
	.then( (datos)  => {
		Mapa({
		  padreSelector: ".mapa"
		});
		

		let datosFiltrados =  datos;
		let datosPorBarrio = totalizarPorBarrio(datosFiltrados);
		let datosPorBarrioMatriz = convertirAMatriz(datosPorBarrio);
		
		let actualizarDatosMapaCalor = MapaCalor({
		  padreSelector: ".mapaCalor",
		  labelscol: datosPorBarrioMatriz.servicios,
		  labelsrow: datosPorBarrioMatriz.barrios,
		  start_color: "#98df8a",
		  end_color: 'red'
		});


		SelectorTiempo({
		  padreSelector: ".selectorTiempo",
		}, datos, (t1, t2) => {
			let datosFiltrados = t1 && t2 ? datos.filter(d => d.timestamp>t1 && d.timestamp<t2) : datos;
			let datosPorBarrio = totalizarPorBarrio(datosFiltrados.length>1 ? datosFiltrados : datos);
			let datosPorBarrioMatriz = convertirAMatriz(datosPorBarrio);
			if(datosPorBarrioMatriz.datos.length > 0) {
				actualizarDatosMapaCalor(datosPorBarrioMatriz.datos);
			}
		});
} );

