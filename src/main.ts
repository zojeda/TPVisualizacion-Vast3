import "./main.css";
import { MapaCalor } from "./mapaCalor";
import { Mapa } from "./mapa";
import { SelectorTiempo } from "./timeSelector";

Mapa({
  padreSelector: ".mapa"
});

MapaCalor({
  padreSelector: ".mapaCalor"
});

SelectorTiempo({
  padreSelector: ".selectorTiempo"
});
