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

const { DOMParser } = require("xmldom");
const xpath = require("xpath");

const importXmi = async (req, res) => {
  console.log("✅ Entró a importXmi");

  if (!req.file) {
    return res.status(400).send("❌ No se subió ningún archivo.");
  }

  try {
    const fileBuffer = req.file.buffer;
    const content = fileBuffer.toString("latin1");

    const doc = new DOMParser().parseFromString(content, "text/xml");
    const select = xpath.useNamespaces({ UML: "omg.org/UML1.3" });

    const classes = [];
    const associations = [];

    // Extraer clases
    const classNodes = select("//UML:Class", doc);
    classNodes.forEach((node) => {
      const name = node.getAttribute("name");
      if (name === "EARootClass") return;
      const attrNodes = select("UML:Classifier.feature/UML:Attribute", node);
      const attributes = [];

      attrNodes.forEach((attr) => {
        const attrName = attr.getAttribute("name");
        const tagged = select(
          "UML:ModelElement.taggedValue/UML:TaggedValue",
          attr
        );
        const typeTag = tagged.find((t) => t.getAttribute("tag") === "type");
        const type = typeTag?.getAttribute("value") || "desconocido";
        attributes.push({ name: attrName, type });
      });

      classes.push({ name, attributes });
    });

    // Extraer relaciones
    const relationNodes = select(
      "//UML:Association | //UML:Generalization",
      doc
    );
    relationNodes.forEach((rel) => {
      const type = rel.nodeName.replace("UML:", "");
      const tagged = select(
        "UML:ModelElement.taggedValue/UML:TaggedValue",
        rel
      );

      const from = tagged
        .find((t) => t.getAttribute("tag") === "ea_sourceName")
        ?.getAttribute("value");
      const to = tagged
        .find((t) => t.getAttribute("tag") === "ea_targetName")
        ?.getAttribute("value");
      if (from && to) {
        associations.push({
          name: `${from}_to_${to}`,
          type,
          from,
          to,
        });
      }
    });

    //console.log("📦 Clases:", JSON.stringify(classes, null, 2));
   // console.log("🔗 Relaciones:", JSON.stringify(associations, null, 2));
   const { id } = req.params;
   const diagrama = await Sala.getDiagrama(id);
    const nuevoDiagrama = generarPaginasDesdeClases(diagrama,classes);
    await Sala.saveDiagrama(id,nuevoDiagrama)
    console.log("🔗 FORMULARIOS :", JSON.stringify(nuevoDiagrama, null, 2));
    // Puedes usar esto en tu vista EJS si lo deseas
    // res.render('resultado', { classes, associations });
    //res.json({ classes, associations });
  } catch (e) {
    console.error("❌ Error inesperado:", e);
    res.status(500).send("Error inesperado en importación.");
  }
};

function generarPaginasDesdeClases(diagrama, clases) {
  const nuevasPaginas = clases.map((clase, i) => {
    const formId = `form_${clase.name}_${i}`;
    const formFields = clase.attributes.map((attr, j) => {
      const inputId = `input_${clase.name}_${attr.name}_${j}`;

      return {
        tagName: "div",
        attributes: {
          class: "form-group",
          style: `
            display: flex;
            flex-direction: column;
            margin-bottom: 20px;
          `,
        },
        components: [
          {
            tagName: "label",
            attributes: {
              for: inputId,
              style: `
                font-weight: bold;
                margin-bottom: 6px;
                color: #444;
              `,
            },
            components: [{ type: "textnode", content: attr.name }],
          },
          {
            tagName: "input",
            void: true,
            attributes: {
              id: inputId,
              type: "text",
              placeholder: `Ingrese ${attr.name}`,
              name: attr.name,
              style: `
                padding: 12px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 15px;
                transition: border-color 0.2s ease-in-out;
              `,
            },
          },
        ],
      };
    });

    const form = {
      tagName: "form",
      attributes: {
        id: formId,
        style: `
          max-width: 700px;
          margin: 40px auto;
          padding: 35px 40px;
          border-radius: 10px;
          background: white;
          box-shadow: 0 4px 25px rgba(0, 0, 0, 0.1);
          font-family: 'Segoe UI', sans-serif;
        `,
      },
      components: [
        {
          type: "text",
          tagName: "h2",
          attributes: {
            style: `
              margin-bottom: 25px;
              font-size: 28px;
              color: #2c3e50;
              text-align: center;
            `,
          },
          components: [
            {
              type: "textnode",
              content: `Formulario ${clase.name}`,
            },
          ],
        },
        ...formFields,
        {
          tagName: "div",
          attributes: {
            style: "text-align: center; margin-top: 30px;",
          },
          components: [
            {
              tagName: "button",
              type: "text",
              attributes: {
                type: "submit",
                id: `submit_${clase.name}`,
                style: `
                  background: #007bff;
                  color: white;
                  padding: 12px 25px;
                  border: none;
                  border-radius: 5px;
                  font-size: 16px;
                  cursor: pointer;
                  transition: background 0.3s;
                `,
                onmouseover: "this.style.background='#0056b3'",
                onmouseout: "this.style.background='#007bff'",
              },
              components: [
                {
                  type: "textnode",
                  content: `Guardar ${clase.name}`,
                },
              ],
            },
          ],
        },
      ],
    };

    return {
      name: clase.name.toLowerCase(),
      id: `page-${clase.name.toLowerCase()}`,
      frames: [
        {
          id: `frame-${clase.name.toLowerCase()}`,
          component: {
            type: "wrapper",
            components: [form],
          },
        },
      ],
    };
  });

  diagrama.pages.push(...nuevasPaginas);
  return diagrama;
}

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
  importXmi,
};
