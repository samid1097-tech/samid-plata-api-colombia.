// Guía turística de Colombia
// Consume /api/v1/TouristicAttraction y /api/v1/Department (para el nombre del departamento)
// Muestra las atracciones en un mapa de Colombia (Leaflet) y en una lista de tarjetas.
// Las imágenes se resuelven con js/imagenes.js

const API_URL = "https://api-colombia.com/api/v1";
const LIMITE = 20; // Extra: mostrar solo los primeros 20

const contenedor = document.getElementById("lista-lugares");
const cargando = document.getElementById("cargando");
const cajaError = document.getElementById("error");

const seccionMapa = document.getElementById("seccion-mapa");
const tituloLista = document.getElementById("titulo-lista");
const burbuja = document.getElementById("burbuja");

// ---------- Tarjetas de la lista ----------

function crearTarjeta(lugar) {
  // Cada tarjeta es un hipervínculo a la página de detalle
  const tarjeta = document.createElement("a");
  tarjeta.classList.add("card");
  tarjeta.href = `detalle.html?tipo=lugar&id=${lugar.id}`;

  const img = crearImagen(imagenLugar(lugar), lugar.name, "card__img");
  img.loading = "lazy";

  tarjeta.append(img, crearCuerpo(lugar, "card"));
  return tarjeta;
}

// Título, ubicación, descripción y "Ver más" (se usa en la tarjeta y en la burbuja del mapa)
function crearCuerpo(lugar, prefijo) {
  const cuerpo = document.createElement("div");
  cuerpo.classList.add(`${prefijo}__body`);

  const titulo = document.createElement("h2");
  titulo.classList.add(`${prefijo}__title`);
  titulo.textContent = lugar.name.trim();

  const ubicacion = document.createElement("p");
  ubicacion.classList.add(`${prefijo}__meta`);
  ubicacion.textContent = `📍 ${lugar.ciudad}, ${lugar.departamento}`;

  const descripcion = document.createElement("p");
  descripcion.classList.add(`${prefijo}__text`);
  descripcion.textContent = lugar.description || "Sin descripción.";

  const verMas = document.createElement(prefijo === "card" ? "span" : "a");
  verMas.classList.add(`${prefijo}__link`);
  verMas.textContent = "Ver más →";
  if (prefijo !== "card") verMas.href = `detalle.html?tipo=lugar&id=${lugar.id}`;

  cuerpo.append(titulo, ubicacion, descripcion, verMas);
  return cuerpo;
}

// ---------- Mapa ----------

let temporizadorCierre = null;

function crearMapa(lugares) {
  const mapa = L.map("mapa", {
    scrollWheelZoom: false, // para que la página se pueda desplazar sin hacer zoom
    minZoom: 5,
    maxBounds: [[-6, -84], [15, -64]], // alrededor de Colombia
  });

  // Mapa base de Esri (gratuito, no necesita clave)
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, USGS, NGA, EPA, USDA, NPS",
    maxZoom: 18,
  }).addTo(mapa);

  const puntos = [];

  lugares.forEach((lugar) => {
    const lat = parseFloat(lugar.latitude);
    const lng = parseFloat(lugar.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return; // sin coordenadas, no va al mapa

    const icono = L.divIcon({
      className: "marcador",
      html: '<span class="marcador__punto"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    const marcador = L.marker([lat, lng], { icon: icono, title: lugar.name.trim() }).addTo(mapa);
    marcador.on("mouseover", () => mostrarBurbuja(mapa, marcador, lugar));
    marcador.on("click", () => mostrarBurbuja(mapa, marcador, lugar)); // para celulares
    marcador.on("mouseout", programarCierre);

    puntos.push([lat, lng]);
  });

  if (puntos.length > 0) {
    mapa.fitBounds(puntos, { padding: [30, 30] });
  } else {
    mapa.setView([4.6, -74.1], 5);
  }

  // Si el mapa se mueve, la burbuja se oculta
  mapa.on("movestart zoomstart click", ocultarBurbuja);

  // Mientras el mouse esté sobre la burbuja, no se cierra
  burbuja.addEventListener("mouseenter", () => clearTimeout(temporizadorCierre));
  burbuja.addEventListener("mouseleave", programarCierre);
}

// Llena la burbuja con el resumen del lugar y la ubica junto al punto
function mostrarBurbuja(mapa, marcador, lugar) {
  clearTimeout(temporizadorCierre);

  burbuja.innerHTML = "";
  const img = crearImagen(imagenLugar(lugar), lugar.name, "burbuja__img");
  burbuja.append(img, crearCuerpo(lugar, "burbuja"));

  // Primero se muestra invisible para poder medir su tamaño
  burbuja.style.visibility = "hidden";
  burbuja.hidden = false;

  const punto = mapa.latLngToContainerPoint(marcador.getLatLng());
  const anchoMapa = mapa.getSize().x;
  const ancho = burbuja.offsetWidth;
  const alto = burbuja.offsetHeight;
  const separacion = 16;

  // Horizontal: centrada en el punto, sin salirse del mapa
  let izquierda = punto.x - ancho / 2;
  izquierda = Math.max(8, Math.min(izquierda, anchoMapa - ancho - 8));

  // Vertical: arriba del punto; si no cabe, abajo
  let arriba = punto.y - alto - separacion;
  let abajo = false;
  if (arriba < 8) {
    arriba = punto.y + separacion;
    abajo = true;
  }

  burbuja.style.left = `${izquierda}px`;
  burbuja.style.top = `${arriba}px`;
  burbuja.classList.toggle("burbuja--abajo", abajo);
  // Posición de la flechita apuntando al punto
  burbuja.style.setProperty("--flecha-x", `${punto.x - izquierda}px`);
  burbuja.style.visibility = "visible";
}

function programarCierre() {
  clearTimeout(temporizadorCierre);
  temporizadorCierre = setTimeout(ocultarBurbuja, 300);
}

function ocultarBurbuja() {
  clearTimeout(temporizadorCierre);
  burbuja.hidden = true;
}

// ---------- Carga de datos ----------

async function cargarLugares() {
  try {
    const [respLugares, respDeptos] = await Promise.all([
      fetch(`${API_URL}/TouristicAttraction`),
      fetch(`${API_URL}/Department`),
    ]);

    if (!respLugares.ok || !respDeptos.ok) {
      throw new Error(`La API respondió con estado ${respLugares.status} / ${respDeptos.status}`);
    }

    const todos = await respLugares.json();
    const listaDeptos = await respDeptos.json();

    // Diccionario { idDepartamento: nombre }
    const departamentos = {};
    listaDeptos.forEach((d) => {
      departamentos[d.id] = d.name;
    });

    // Primeros 20, agregando ciudad y departamento a cada lugar
    const lugares = todos.slice(0, LIMITE).map((lugar) => ({
      ...lugar,
      ciudad: lugar.city ? lugar.city.name : "Ciudad no disponible",
      departamento: (lugar.city && departamentos[lugar.city.departmentId]) || "Departamento no disponible",
    }));

    // Lista de tarjetas
    const fragmento = document.createDocumentFragment();
    lugares.forEach((lugar) => fragmento.appendChild(crearTarjeta(lugar)));
    contenedor.appendChild(fragmento);
    tituloLista.hidden = false;


    // Mapa (si Leaflet no cargó, la lista se sigue viendo)
    if (typeof L !== "undefined") {
      seccionMapa.hidden = false;
      crearMapa(lugares);
    } else {
      console.warn("No se pudo cargar Leaflet; se muestra solo la lista.");
    }
  } catch (error) {
    console.error(error);
    cajaError.textContent = `No se pudieron cargar los lugares turísticos. ${error.message}`;
    cajaError.hidden = false;
  } finally {
    cargando.hidden = true;
  }
}

cargarLugares();
