import * as d3 from 'd3';
// Conversión de tipos de datos a numérico, cuando corresponde.

export interface ValoracionServicio {
    total: number;
    water: number;
    roadways: number;
    gas: number;
    power: number;
    healthcare: number;
}

export interface Dato extends ValoracionServicio { 
    timestamp: Date;
    location: string;
}


export function preprocesar(t): Dato {
    t.dia = +t.dia;
    t.hora = +t.hora;
    t.minuto = +t.minuto;
    t.timestamp = new Date(2020, 3, t.dia, t.hora, t.minuto)

    t.total = +t.total;
    t.gas = +t.gas;
    t.water = +t.water;
    t.healthcare = +t.healthcare;
    t.power = +t.power;
    t.roadways = +t.roadways;

    return t;
}


// Método que realiza la suma de los datos numéricos, agrupados por barrios.
export function totalizarPorBarrio(datos: Dato[])
{
    const sumasPorGrupos = d3.nest<Dato, ValoracionServicio>()
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
export function convertirAMatriz(datos): {barrios: string[], servicios: string[], datos: number[][]}
{
    const datosPorBarrioMatriz: number[][] = [];
    const barrios: string[] = [];
    const servicios: string[] = ['water', 'roadways', 'gas', 'power', 'healthcare']
    for(let i = 0; i < datos.length; i++)
    {
        barrios.push(datos[i].key);
        datosPorBarrioMatriz[i] = [];
        datosPorBarrioMatriz[i][0] = datos[i].value.water;
        datosPorBarrioMatriz[i][1] = datos[i].value.roadways;
        datosPorBarrioMatriz[i][2] = datos[i].value.gas;
        datosPorBarrioMatriz[i][3] = datos[i].value.power;
        datosPorBarrioMatriz[i][4] = datos[i].value.healthcare;
    }
    return {
        barrios,
        servicios,
        datos: datosPorBarrioMatriz
    };
}



