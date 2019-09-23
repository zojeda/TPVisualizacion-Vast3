const rutaCSV = "http://localhost:8000/data/tweet-servicio-valoracion2.csv";

var dataset = [];   // Objeto que contiene los datos originales, cargados desde el dataset de entrada (csv).
var datosPorBarrio = [];    // Objeto que contiene el resultado de aplicar determinado filtro sobre dataset, agrupado por barrio.
var datosPorBarrioMatriz = [];  // Versión de datosPorBarrio en formato matriz.


// Conversión de tipos de datos a numérico, cuando corresponde.
function preprocesar(t)
{
    t.dia = +t.dia;
    t.hora = +t.hora;
    t.minuto = +t.minuto;

    t.total = +t.total;
    t.gas = +t.gas;
    t.water = +t.water;
    t.healthcare = +t.healthcare;
    t.power = +t.power;
    t.roadways = +t.roadways;

    return t;
}


// Método que realiza la suma de los datos numéricos, agrupados por barrios.
function totalizarPorBarrio(datos)
{
    sumasPorGrupos = d3.nest()
                       .key(function(d){ return d.location; })
                       .rollup(function(t)
                            { return {
                                        total: d3.sum(t, function(d){return d.total}),
                                        water: d3.sum(t, function(d){return d.water}),
                                        roadways: d3.sum(t, function(d){return d.roadways}),
                                        gas: d3.sum(t, function(d){return d.gas}),
                                        power: d3.sum(t, function(d){return d.power}),
                                        healthcare: d3.sum(t, function(d){return d.healthcare})
                                    }
                            })
                       .entries(datos);
    return sumasPorGrupos;
}


// Método para convertir una estructura de objetos JSON en matriz.
// Debe haber una forma más elegante de hacerlo.
function convertirAMatriz(datos)
{
    datosPorBarrioMatriz = [];
    for(i = 0; i < datos.length; i++)
    {
        datosPorBarrioMatriz[i] = [];
        datosPorBarrioMatriz[i][0] = datos[i].key;
        datosPorBarrioMatriz[i][1] = datos[i].value.total;
        datosPorBarrioMatriz[i][2] = datos[i].value.water;
        datosPorBarrioMatriz[i][3] = datos[i].value.roadways;
        datosPorBarrioMatriz[i][4] = datos[i].value.gas;
        datosPorBarrioMatriz[i][5] = datos[i].value.power;
        datosPorBarrioMatriz[i][6] = datos[i].value.healthcare;
    }
    return datosPorBarrioMatriz;
}


// Carga inicial de datos desde un archivo CSV.
function loadData()
{
    d3.csv(rutaCSV, function(tweets) {

        dataset.push(preprocesar(tweets));

    } ).then( function() {
        console.log(dataset);

        datosPorBarrio = totalizarPorBarrio(dataset);
        datosPorBarrioMatriz = convertirAMatriz(datosPorBarrio);
        console.log(datosPorBarrio);
    } );
}


// Filtrado sobre los datos originales, en base a un tiempo de inicio y fin.
function filtrarDatos(inicio, fin)
{
    filtro = dataset.filter(function(tweet)
    {
        return (tweet.id >= inicio && tweet.id <= fin);
    })
    datosPorBarrio = totalizarPorBarrio(filtro);
    datosPorBarrioMatriz = convertirAMatriz(datosPorBarrio);

    console.log(datosPorBarrio);
    console.log(datosPorBarrioMatriz);
}


$(document).ready(loadData);