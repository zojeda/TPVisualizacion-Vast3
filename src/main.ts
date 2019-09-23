import "./main.css";
import { MapaCalor } from "./mapaCalor";
import { Mapa } from "./mapa";
import { SelectorTiempo } from "./timeSelector";

Mapa({
  padreSelector: ".mapa"
});

let datosMapaCalor = [
	[0,10, 0, 2, 0],
	[0, 8, 0, 2, 0],
	[0, 1, 0, 2, 0],
	[4, 0, 0, 2, 0],
	[8, 0, 0, 2, 0],
	[1, 0, 0, 2, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 1],
	[0, 0, 1, 0, 1],
	[0, 0, 1, 0, 1],
	[1, 0, 1, 0, 5],
	[2, 0, 1, 0, 5],
	[3, 0, 1, 0, 5],
	[4, 0, 1, 0, 8],
	[0, 0, 7, 0, 2],
	[0, 0, 1, 1, 2],
	[0, 0, 1, 0, 2],
	[0, 0, 1, 1, 0],
	[0, 0, 1, 0, 0],
	[0, 0, 1, 2, 0]
  ];

MapaCalor({
  padreSelector: ".mapaCalor",
  data: datosMapaCalor,
  labelscol: ["WATER","POWER","ROADWAYS","GAS","GARBAGE"],
  labelsrow: ["Weston","Southton","Broadview","West Parton",
					  "Old Town","Terrapin Springs","Downtown","Southwest",
					  "Scenic Vista","East Parton","Cheddarford","Palace Hills",
					  "Safe Town","Easton","Chapparal","Northwest","Oak Willow",
            "Pepper Mill","Wilson Forest","UNKNOWN"],
  start_color: "#98df8a",
  end_color: 'red'

});

SelectorTiempo({
  padreSelector: ".selectorTiempo"
});
