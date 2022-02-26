const url1 = 'https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json'
  
const promise1 = new Promise((resolve, reject)=>{
    let req = new XMLHttpRequest();
    req.open('GET', url1);
    req.onload = function(){
        if(req.status == 200){
            resolve(req.response);
        }
        else {
            reject(req.statusText);
        }
    };
    req.send();
});

promise1.then((result)=>{
    let linea = JSON.parse(result);

    let tbody = document.getElementById("table-body");
    let i = 1;
    let correlation = [];

    // Crear y llenar la primera tabla en el HTML
    for (let x of linea){
        let row = document.createElement('tr');

        let contador = document.createElement('th');
        contador.innerHTML = i;
        i += 1;
        row.appendChild(contador);

        let events = document.createElement('td');
        events.innerHTML = x.events;
        row.appendChild(events);

        let squirrel = document.createElement('td');
        squirrel.innerHTML = x.squirrel;
        if(x.squirrel == true){row.style.backgroundColor = 'pink'}
        row.appendChild(squirrel);

        tbody.appendChild(row);

        // Crear un array con todos los eventos
        for(let event of x.events){
            let nuevo = true;
            for(let j = 0; j < correlation.length; j++){
                let sig = correlation[j];
                if (sig.key == event){
                    nuevo = false;
                    break;
                }
            }
            if (nuevo == true){
                correlation.push({
                    key: event,
                    TP: 0,
                    TN: 0,
                    FP: 0,
                    FN: 0,
                    CORRELATION: 0
                });
            }
        }
    }

    // Recorrer todas las lineas y calcular los TP y FN, guardando en un arreglo los que ya han sido evaluados
    for (let x of linea){
        let yaEvaludadosLinea = [...correlation];
        for(let event of x.events){
            for(let j = 0; j < correlation.length; j++){
                let sig = correlation[j];

                if (sig.key == event && x.squirrel == true){
                    sig.TP += 1;
                    delete yaEvaludadosLinea[j];
                }
                else if (sig.key == event && x.squirrel == false){
                    sig.FN += 1;
                    delete yaEvaludadosLinea[j];
                }
            }
        }

        // Calcular los FP y los TN, verificando que no hayan sido ya evaluados
        for(let data of yaEvaludadosLinea){
            if (data !== undefined)
            {
                if(x.squirrel == true){
                    data.FP += 1;
                }
                else{
                    data.TN += 1;
                }
            }
        }
    }

    // Calcular las correlaciones
    for(let i = 0; i < correlation.length; i++)
    {
        let top = (correlation[i].TP * correlation[i].TN) - (correlation[i].FP * correlation[i].FN);
        let bot = (correlation[i].TP + correlation[i].FP) * (correlation[i].TP + correlation[i].FN) * (correlation[i].TN + correlation[i].FP) * (correlation[i].TN + correlation[i].FN);
        let sqrt = Math.sqrt(bot);
        correlation[i].CORRELATION = (top / sqrt);
    }

    // Ordenar el arrglo de mayor a menor
    correlation.sort(function (a,b){
        if(a.CORRELATION > b.CORRELATION){
            return -1;
        }
        else if(a.CORRELATION < b.CORRELATION){
            return 1;
        }
        return 0;
    });

    // Crear y llenar la primera tabla en el HTML
    let tableBody = document.getElementById("table-body-correlation");
    let n = 1;
    for (let x of correlation){
        let row = document.createElement('tr');

        let contador = document.createElement('th');
        contador.innerHTML = n;
        n += 1;
        row.appendChild(contador);

        let events = document.createElement('td');
        events.innerHTML = x.key;
        row.appendChild(events);

        let correlation = document.createElement('td');
        correlation.innerHTML = x.CORRELATION;
        row.appendChild(correlation);

        tableBody.appendChild(row);
    }
    
});