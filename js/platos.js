// Sabores de Colombia
// Consume /api/v1/TypicalDish y muestra nombre, descripción, departamento e imagen
// Las imágenes se resuelven con js/imagenes.js

const API_URL = "https://api-colombia.com/api/v1";

const contenedor = document.getElementById("lista-platos");
const cargando = document.getElementById("cargando");
const cajaError = document.getElementById("error");

const MAX_INGREDIENTES = 8; // para que las pastillas quepan en el reverso

// Crea un elemento con clase y texto
function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

// "arroz, carne, sal." → ["arroz", "carne", "sal"]
function separarIngredientes(texto) {
  if (!texto) return [];
  return texto
    .replace(/\.\s*$/, "")
    .split(",")
    .map((i) => i.trim())
    .filter((i) => i !== "");
}

// Tarjeta que gira: frente (foto, nombre, departamento) y reverso (ingredientes, resumen, enlace)
function crearTarjeta(plato) {
  const nombre = plato.name.trim();
  const departamento = plato.department ? plato.department.name : "Departamento no disponible";

  const tarjeta = crear("article", "flip");
  tarjeta.tabIndex = 0; // para poder girarla con el teclado
  const interior = crear("div", "flip__inner");

  // ----- Frente -----
  const frente = crear("div", "flip__face flip__front");
  const img = crearImagen(imagenPlato(plato), nombre, "flip__img");
  img.loading = "lazy";
  const infoFrente = crear("div", "flip__info");
  infoFrente.append(crear("h2", "flip__title", nombre), crear("p", "flip__meta", `📍 ${departamento}`));
  frente.append(img, infoFrente);

  // ----- Reverso -----
  const reverso = crear("div", "flip__face flip__back");
  const pastillas = crear("ul", "flip__pills");
  separarIngredientes(plato.ingredients)
    .slice(0, MAX_INGREDIENTES)
    .forEach((ing) => pastillas.appendChild(crear("li", "flip__pill", ing)));

  const verMas = crear("a", "flip__link", "Ver más →");
  verMas.href = `detalle.html?tipo=plato&id=${plato.id}`;

  reverso.append(
    crear("h2", "flip__title", nombre),
    pastillas,
    crear("p", "flip__text", plato.description || "Sin descripción."),
    verMas
  );

  interior.append(frente, reverso);
  tarjeta.appendChild(interior);

  // En pantallas sin hover (celulares) la tarjeta gira al tocarla.
  // Tocar el enlace "Ver más" no la gira: abre el detalle.
  tarjeta.addEventListener("click", (e) => {
    if (window.matchMedia("(hover: hover)").matches) return;
    if (e.target.closest("a")) return;
    tarjeta.classList.toggle("flip--girada");
  });

  return tarjeta;
}

async function cargarPlatos() {
  try {
    const respuesta = await fetch(`${API_URL}/TypicalDish`);
    if (!respuesta.ok) {
      throw new Error(`La API respondió con estado ${respuesta.status}`);
    }

    const platos = await respuesta.json();

    const fragmento = document.createDocumentFragment();
    platos.forEach((plato) => fragmento.appendChild(crearTarjeta(plato)));
    contenedor.appendChild(fragmento);


  } catch (error) {
    console.error(error);
    cajaError.textContent = `No se pudieron cargar los platos típicos. ${error.message}`;
    cajaError.hidden = false;
  } finally {
    cargando.hidden = true;
  }
}

cargarPlatos();
