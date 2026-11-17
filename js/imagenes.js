// Imágenes compartidas por todas las páginas.
// Algunas imágenes de la API no cargan; se reemplazan por imágenes válidas de Wikimedia Commons.

const IMAGEN_POR_DEFECTO = "img/sin-imagen.svg";

// Clave: id del atractivo turístico
const REEMPLAZOS_LUGARES = {
  36: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Parque_Tem%C3%A1tico_Hacienda_N%C3%A1poles_-_Puerto_Triunfo_Antioquia.jpg/960px-Parque_Tem%C3%A1tico_Hacienda_N%C3%A1poles_-_Puerto_Triunfo_Antioquia.jpg",
  17: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Ventanalmundo.jpg/960px-Ventanalmundo.jpg",
  19: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Volc%C3%A1n_del_totumo002.jpg/960px-Volc%C3%A1n_del_totumo002.jpg",
  26: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Ritacuba_.jpg/960px-Ritacuba_.jpg",
  28: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Nevado_del_Ruiz_nos_saludo_4.jpg/960px-Nevado_del_Ruiz_nos_saludo_4.jpg",
  41: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b7/Zona_Purace.jpg/960px-Zona_Purace.jpg",
  40: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Centro_Hist%C3%B3rico_de_Popay%C3%A1n_Ermita.jpg/960px-Centro_Hist%C3%B3rico_de_Popay%C3%A1n_Ermita.jpg",
  3: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/20250219_VILLA_DE_LEYVA_CUMBRE_GOBERNADORES-JC00962.jpg/960px-20250219_VILLA_DE_LEYVA_CUMBRE_GOBERNADORES-JC00962.jpg",
  38: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/70/Jaime_Duque_Park.jpg/960px-Jaime_Duque_Park.jpg",
  6: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Serrania_La_Lindosa%2C_estribaciones_dentro_de_la_serrania.jpg/960px-Serrania_La_Lindosa%2C_estribaciones_dentro_de_la_serrania.jpg",
  39: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Jeric%C3%B3%2C_Antioquia%2C_Colombia.JPG/960px-Jeric%C3%B3%2C_Antioquia%2C_Colombia.JPG",
  5: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/CA%C3%91O_CRISTALES%2C_EL_R%C3%8DO_DE_COLORES.jpg/960px-CA%C3%91O_CRISTALES%2C_EL_R%C3%8DO_DE_COLORES.jpg",
};

// Clave: id del plato típico
const REEMPLAZOS_PLATOS = {
  10: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Tamal_tolimense_abierto.jpg/960px-Tamal_tolimense_abierto.jpg",
  16: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/Arroz_de_liza.jpg/960px-Arroz_de_liza.jpg",
  43: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Bocadillo.jpg/960px-Bocadillo.jpg",
};

function imagenLugar(lugar) {
  if (REEMPLAZOS_LUGARES[lugar.id]) return REEMPLAZOS_LUGARES[lugar.id];
  if (Array.isArray(lugar.images) && lugar.images.length > 0) return lugar.images[0];
  return IMAGEN_POR_DEFECTO;
}

function imagenPlato(plato) {
  if (REEMPLAZOS_PLATOS[plato.id]) return REEMPLAZOS_PLATOS[plato.id];
  // Algunas URLs tienen espacios: encodeURI las deja válidas
  if (plato.imageUrl) return encodeURI(plato.imageUrl);
  return IMAGEN_POR_DEFECTO;
}

// Crea un <img> que muestra la imagen por defecto si la original falla
function crearImagen(src, alt, clase) {
  const img = document.createElement("img");
  img.className = clase;
  img.src = src;
  img.alt = alt;
  img.addEventListener("error", () => {
    img.src = IMAGEN_POR_DEFECTO;
  }, { once: true });
  return img;
}
