const Sala = require("../models/salaModel");
const path = require("path");
const fs = require("fs-extra");
const archiver = require("archiver");

const indexSala = async (req, res) => {
  try {
    // Acceder al userId desde la sesión correctamente
    const userId = req.session.userId; // Asegúrate de que sea "userId", como guardaste en el login

    // Llamar al servicio de salas para obtener las salas del usuario
    const salas = await Sala.getAllSalasUser(userId);
    const baseUrl = process.env.BASE_URL; // Obteniendo la URL base desde el archivo .env

    // Renderizar la vista de salas
    res.render("salas", { title: "Mis Salas", salas: salas, baseUrl });
  } catch (error) {
    //console.error("Error retrieving salas:", error);
    res.status(500).json({ message: "Error retrieving salas" });
  }
};

const storeSala = async (req, res) => {
  try {
    res.render("create_sala", { title: "Creacion de Sala" });
  } catch (error) {
    console.error("Error retrieving salas:", error);
    res.status(500).json({ message: "Error retrieving salas" });
  }
};

const editSala = async (req, res) => {
  const { id } = req.params;
  const response = await Sala.getSala(id);

  sala = response[0];
  try {
    res.render("edit_sala", { title: "Editar Sala", sala });
  } catch (error) {
    console.error("Error al obtener la sala:", error);
    res.status(500).send("Error al obtener los datos de la sala");
  }
};
const createSala = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { title, description } = req.body; // Extraer los datos del formulario
    const sala = await Sala.createSala(title, description, userId);

    const salaCreada = sala != null;

    if (salaCreada) {
      res.redirect("/index-sala");
    } else {
      res.render("salas/sala", {
        message: "Error al crear la sala. Inténtalo de nuevo.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};
const updateSala = async (req, res) => {
  try {
    const { id, title, description } = req.body;
    await Sala.editSala(title, description, id);
    res.redirect("/index-sala");
  } catch (error) {
    console.error("Error al obtener la sala:", error);
    res.status(500).send("Error al obtener los datos de la sala");
  }
};

const deleteSala = async (req, res) => {
  const { id } = req.params;
  try {
    await Sala.delSala(id);
    res.redirect("/index-sala");
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};

const exportarSoloPages = async (req, res) => {
  const { id } = req.params;
  const sala = await Sala.getSala(id);
  const proyecto = sala[0].diagram;

  // Configura la respuesta HTTP
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=pages.zip");

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res); // 📦 Pipeamos directo a la respuesta HTTP

  // Generar en memoria todas las carpetas y archivos
  for (const page of proyecto.pages) {
    const pageName = sanitizePageName(page.name || "pagina");

    // HTML
    const htmlContent = generateHtmlFromPage(page);
    archive.append(htmlContent, {
      name: `${pageName}/${pageName}.component.html`,
    });

    // CSS
    const cssContent = generateCssFromStyles(proyecto.styles);
    archive.append(cssContent, {
      name: `${pageName}/${pageName}.component.css`,
    });

    // TS
    const tsContent = generateTsComponent(pageName);
    archive.append(tsContent, { name: `${pageName}/${pageName}.component.ts` });
  }

  await archive.finalize(); // Finalizar archivo zip
};

// --- Las demás funciones no cambian ---
function sanitizePageName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

function generateHtmlFromPage(page) {
  if (page.frames && page.frames.length > 0) {
    const frame = page.frames[0];
    return frame.component
      ? buildHtml(frame.component.components || [])
      : "<div>Sin contenido</div>";
  }
  return "<div>Sin contenido</div>";
}

function buildHtml(components) {
  const voidElements = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "source",
    "track",
    "wbr",
  ];

  let html = "";
  components.forEach((comp) => {
    const tag = comp.tagName || "div";
    const attrs = comp.attributes
      ? Object.entries(comp.attributes)
          .map(([k, v]) => `${k}="${v}"`)
          .join(" ")
      : "";

    const isTextOnly = !comp.components && comp.content;

    if (isTextOnly && (tag === "div" || tag === "")) {
      html += comp.content; // Solo mete el contenido
    } else if (voidElements.includes(tag)) {
      html += `<${tag}${attrs ? " " + attrs : ""}>`; // 👉 No cierre para void elements
    } else {
      const content = comp.components
        ? buildHtml(comp.components)
        : comp.content || "";
      html += `<${tag}${attrs ? " " + attrs : ""}>${content}</${tag}>`;
    }
  });
  return html;
}

function generateCssFromStyles(styles) {
  let css = "";
  styles.forEach((style) => {
    css += `${style.selectors.join(", ")} {\n`;
    for (const prop in style.style) {
      css += `  ${prop}: ${style.style[prop]};\n`;
    }
    css += `}\n\n`;
  });
  return css;
}

function generateTsComponent(name) {
  const className = capitalizeFirst(name) + "Component";
  return `
import { Component } from '@angular/core';

@Component({
  selector: 'app-${name}',
  templateUrl: './${name}.component.html',
  styleUrls: ['./${name}.component.css']
})
export class ${className} {}
`.trim();
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  storeSala,
  editSala,
  updateSala,
  indexSala,
  createSala,
  deleteSala,
  exportarSoloPages,
};
