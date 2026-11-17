// Página de detalle: muestra toda la información de un lugar turístico o de un plato típico.
// Se llega aquí con un hipervínculo, por ejemplo:
//   detalle.html?tipo=lugar&id=36   → /api/v1/TouristicAttraction/36
//   detalle.html?tipo=plato&id=1    → /api/v1/TypicalDish/1

const API_URL = "https://api-colombia.com/api/v1";

const contenedor = document.getElementById("detalle");
const cargando = document.getElementById("cargando");
const cajaError = document.getElementById("error");
const volver = document.getElementById("volver");

// Leer los parámetros de la URL
const parametros = new URLSearchParams(window.location.search);
const tipo = parametros.get("tipo");
const id = parametros.get("id");

const formatoNumero = new Intl.NumberFormat("es-CO");

async function pedir(ruta) {
  const respuesta = await fetch(`${API_URL}${ruta}`);
  if (!respuesta.ok) {
    throw new Error(`La API respondió con estado ${respuesta.status}`);
  }
  return respuesta.json();
}

// Crea un elemento con clase y texto
function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

// Crea una fila "Etiqueta: valor" para la ficha de datos
function dato(etiqueta, valor) {
  const fila = crear("div", "ficha__fila");
  fila.append(crear("dt", "ficha__etiqueta", etiqueta), crear("dd", "ficha__valor", valor));
  return fila;
}

// Bloque con información del departamento
function seccionDepartamento(depto) {
  const seccion = crear("section", "detalle__seccion");
  seccion.appendChild(crear("h2", "detalle__subtitulo", `Sobre ${depto.name}`));

  const ficha = crear("dl", "ficha");
  if (depto.cityCapital) ficha.appendChild(dato("Capital", depto.cityCapital.name));
  if (depto.population) ficha.appendChild(dato("Población", formatoNumero.format(depto.population)));
  if (depto.surface) ficha.appendChild(dato("Superficie", `${formatoNumero.format(depto.surface)} km²`));
  if (depto.municipalities) ficha.appendChild(dato("Municipios", depto.municipalities));
  seccion.appendChild(ficha);

  if (depto.description) {
    seccion.appendChild(crear("p", "detalle__texto", depto.description));
  }
  return seccion;
}

async function mostrarLugar() {
  volver.href = "turismo.html";
  volver.textContent = "← Volver a la guía turística";

  const lugar = await pedir(`/TouristicAttraction/${id}`);
  const ciudad = lugar.city ? lugar.city.name : "No disponible";
  const depto = lugar.city ? await pedir(`/Department/${lugar.city.departmentId}`) : null;

  document.title = `${lugar.name} | Guía turística`;

  const portada = crearImagen(imagenLugar(lugar), lugar.name, "detalle__img");
  const titulo = crear("h1", "detalle__titulo", lugar.name.trim());
  const meta = crear("p", "detalle__meta", `📍 ${ciudad}${depto ? ", " + depto.name : ""}`);

  const ficha = crear("dl", "ficha");
  ficha.appendChild(dato("Ciudad", ciudad));
  if (depto) ficha.appendChild(dato("Departamento", depto.name));
  if (lugar.latitude && lugar.longitude) {
    ficha.appendChild(dato("Coordenadas", `${lugar.latitude}, ${lugar.longitude}`));
  }

  const descripcion = crear("section", "detalle__seccion");
  descripcion.append(
    crear("h2", "detalle__subtitulo", "Descripción"),
    crear("p", "detalle__texto", lugar.description || "Sin descripción.")
  );

  contenedor.append(portada, titulo, meta, ficha);

  if (lugar.latitude && lugar.longitude) {
    const mapa = crear("a", "boton", "🗺️ Ver en Google Maps");
    mapa.href = `https://www.google.com/maps?q=${lugar.latitude},${lugar.longitude}`;
    mapa.target = "_blank";
    mapa.rel = "noopener";
    contenedor.appendChild(mapa);
  }

  contenedor.appendChild(descripcion);
  if (depto) contenedor.appendChild(seccionDepartamento(depto));
}

async function mostrarPlato() {
  volver.href = "platos.html";
  volver.textContent = "← Volver a Sabores de Colombia";

  const plato = await pedir(`/TypicalDish/${id}`);
  // Se pide el departamento completo para tener también su capital
  const depto = plato.departmentId ? await pedir(`/Department/${plato.departmentId}`) : plato.department;

  document.title = `${plato.name} | Sabores de Colombia`;

  const portada = crearImagen(imagenPlato(plato), plato.name, "detalle__img");
  const titulo = crear("h1", "detalle__titulo", plato.name.trim());
  const meta = crear("p", "detalle__meta", `📍 ${depto ? depto.name : "Departamento no disponible"}`);

  const descripcion = crear("section", "detalle__seccion");
  descripcion.append(
    crear("h2", "detalle__subtitulo", "Descripción"),
    crear("p", "detalle__texto", plato.description || "Sin descripción.")
  );

  contenedor.append(portada, titulo, meta, descripcion);

  if (plato.ingredients) {
    const seccion = crear("section", "detalle__seccion");
    seccion.appendChild(crear("h2", "detalle__subtitulo", "Ingredientes"));
    const lista = crear("ul", "ingredientes");
    plato.ingredients
      .replace(/\.$/, "")
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i !== "")
      .forEach((i) => lista.appendChild(crear("li", "ingredientes__item", i)));
    seccion.appendChild(lista);
    contenedor.appendChild(seccion);
  }

  if (depto) contenedor.appendChild(seccionDepartamento(depto));
}

async function cargarDetalle() {
  try {
    if (!id || (tipo !== "lugar" && tipo !== "plato")) {
      throw new Error("El enlace no es válido. Vuelve a la lista y elige un elemento.");
    }

    if (tipo === "lugar") {
      await mostrarLugar();
    } else {
      await mostrarPlato();
    }

    contenedor.hidden = false;
  } catch (error) {
    console.error(error);
    cajaError.textContent = `No se pudo cargar la información. ${error.message}`;
    cajaError.hidden = false;
  } finally {
    cargando.hidden = true;
  }
}

cargarDetalle();
