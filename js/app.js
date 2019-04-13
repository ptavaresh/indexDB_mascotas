let DB;

//seleccion de la interfaz
const form = document.querySelector('form'),
      nombreMascota = document.querySelector('#mascota'),
      nombreCliente = document.querySelector('#cliente'),
      telefono = document.querySelector('#telefono'),
      fecha = document.querySelector('#fecha'),
      hora = document.querySelector('#hora'),
      sintomas = document.querySelector('#sintomas'),
      citas = document.querySelector('#citas'),
      headingAdministra = document.querySelector('#administra');


//Esperar por DOM ready
document.addEventListener('DOMContentLoaded', () => {
    //Crear base de datos
    let crearDB = window.indexedDB.open('citas', 1);

    // Si hay un error enviarlo a la consola
    crearDB.oneerror = function () {
        console.log('Hubo un error al crear la DB');
    }

    crearDB.onsuccess = function() {
        console.log('Todo bien');

        //asignar la DB
        DB = crearDB.result;
        mostrarCitas();
    }

    //Este metodo solo corre una vez y es ideal para crear el Scheme.
    crearDB.onupgradeneeded = function(e) {
        // El evento es la misma base de datos
        let db = e.target.result;

        // definir el objectstore, toma 2 parametros el nombre de la base de datos y segundo las opciones
        //keypath es el indice de la base de datos
        let objectstore = db.createObjectStore('citas', { keyPath: 'key', autoIncrement: true });

        //Crear los indices y campos de la base de datos, createIndex : 3 parametros, nombre, keypath y opciones.
        objectstore.createIndex('mascota', 'mascota', { unique: false });
        objectstore.createIndex('cliente', 'cliente', { unique: false });
        objectstore.createIndex('telefono', 'telefono', { unique: false });
        objectstore.createIndex('fecha', 'fecha', { unique: false });
        objectstore.createIndex('hora', 'hora', { unique: false });
        objectstore.createIndex('sintomas', 'sintomas', { unique: false });
    }
    //agregamos un listener para que se active la funcion al presionar el boton
    form.addEventListener('submit', agregarDatos);

    function agregarDatos(e) {
        e.preventDefault();
        // generamos el objeto
        const nuevaCita =  {
            mascota: nombreMascota.value,
            cliente: nombreCliente.value,
            telefono: telefono.value,
            fecha: fecha.value,
            hora: hora.value,
            sintomas: sintomas.value
        }
        // en indexDB se utilizan las transacciones.
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');

        let peticion = objectStore.add(nuevaCita);

        console.log(peticion)
            
        peticion.onsuccess = () => {
            form.reset();
        }

        transaction.oncomplete = () => {
            console.log('Cita agregada');
            mostrarCitas();
        }
        
        transaction.onerror = () => {
            console.log('Error');
        }
    }

    function mostrarCitas() {
        //limpiAR CITAS ANTERIORES
        while(citas.firstChild) {
            citas.removeChild(citas.firstChild);
        }
        //creamos un objectStore
        let objectStore = DB.transaction('citas').objectStore('citas');
        
        //esto retorna una peticion
        objectStore.openCursor().onsuccess = function(e) {
            //Cursor se va a ubicar en el registro indicado para acceder a los datos.
            let cursor = e.target.result;
            console.log(e.target.result)


            if(cursor) {
                let citaHTML = document.createElement('li');
                citaHTML.setAttribute('data-cita-id', cursor.value.key);
                console.log(cursor.value.key)
                citaHTML.classList.add('list-group-item');

                citaHTML.innerHTML = `
                    <p class="font-weight-bold">Mascota: <span class="font-weight-normal">${cursor.value.mascota}</span></p>
                    <p class="font-weight-bold">Cliente: <span class="font-weight-normal">${cursor.value.cliente}</span></p>
                    <p class="font-weight-bold">Telefono: <span class="font-weight-normal">${cursor.value.telefono}</span></p>
                    <p class="font-weight-bold">Fecha: <span class="font-weight-normal">${cursor.value.fecha}</span></p>
                    <p class="font-weight-bold">Hora: <span class="font-weight-normal">${cursor.value.hora}</span></p>
                    <p class="font-weight-bold">Sintomas: <span class="font-weight-normal">${cursor.value.sintomas}</span></p>
                    `;
                //boton borrar
                const botonBorrar = document.createElement('button');
                botonBorrar.classList.add('borrar', 'btn', 'btn-danger');
                botonBorrar.innerHTML = '<span aria-hidden="true">x</span> Borrar';
                //asignar funcion al boton
                botonBorrar.onclick = borrarCita;
                citaHTML.appendChild(botonBorrar);

                citas.appendChild(citaHTML);
                cursor.continue();
            } else {
                //cuando no hay registros
                if(!citas.firstChild) {
                    headingAdministra.textContent = 'Agrega citas para comenzar.';
                    let listado = document.createElement('p');
                    listado.classList.add('text-center');
                    listado.textContent = 'No hay registros';
                    citas.appendChild(listado);
                } else {
                    headingAdministra.textContent = 'Administra tus citas'
                }
            }
        }
    }

    //borrar citas
    function borrarCita(e) {
        console.log(e.target.parentElement);
        let citaID = Number(e.target.parentElement.getAttribute('data-cita-id'));

        // en indexDB se utilizan las transacciones.
        let transaction = DB.transaction(['citas'], 'readwrite');
        let objectStore = transaction.objectStore('citas');

        let peticion = objectStore.delete(citaID);

        transaction.oncomplete = () => {
            e.target.parentElement.parentElement.removeChild(e.target.parentElement);
            console.log(`se elimino la cita con el id: ${citaID}`);
            if(!citas.firstChild) {
                headingAdministra.textContent = 'Agrega citas para comenzar.';
                let listado = document.createElement('p');
                listado.classList.add('text-center');
                listado.textContent = 'No hay registros';
                citas.appendChild(listado);
            } else {
                headingAdministra.textContent = 'Administra tus citas'
            }
        }
    }
})