const Sala = require("../models/salaModel");
const path = require("path");
const fs = require("fs-extra");
const archiver = require("archiver");
require("dotenv").config(); // Asegúrate de cargar las variables de entorno

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

const exportFlutter = async (req, res) => {
  console.log("ENTRO");
  if (!req.file) {
    return res.status(400).json({ error: "No se envió ninguna imagen." });
  }
  const prompt = `
La imagen enviada representa una interfaz UI de Flutter.

Analízala y genera el código Dart equivalente en la version 3 en adelante. Devuelve SOLO un objeto JSON en formato plano, sin usar markdown ni bloque de código (\`\`\`).

Formato:
{
  "widget": "<código dart aquí>"
}
`;

  const mimeType = req.file.mimetype;
  const imageBase64 = req.file.buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });

  let result = completion.choices[0].message.content || "";

  const json = JSON.parse(result);
  console.log("🎯 Código Dart generado:\n", json.widget);
  const dartCode = `
                import 'package:flutter/material.dart';

                class Example extends StatelessWidget {
                  const Example({super.key});

                  @override
                  Widget build(BuildContext context) {
                    return ${json.widget};
                  }
                }
                `;
  const outputPath = path.join(__dirname, "../../exports/flutter_widget.dart");
  fs.writeFile(outputPath, dartCode, (err) => {
    if (err) {
      console.error("❌ Error exacto al guardar el archivo:", err);
      return res.status(500).send("Error al guardar archivo");
    }

    console.log("✅ Archivo Dart generado");

    // Enviar archivo al cliente
    res.download(outputPath, "example.dart", (err) => {
      if (err) {
        console.error("❌ Error al enviar archivo:", err);
      } else {
        console.log("📦 Archivo enviado correctamente");

        // Eliminar archivo después de enviarlo
        fs.unlink(outputPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("🧨 Error al eliminar el archivo:", unlinkErr);
          } else {
            console.log("🗑️ Archivo eliminado del servidor");
          }
        });
      }
    });
  });
};

const importImg = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen." });
    }

    const prompt = `
      Analiza esta imagen y genera el código HTML y CSS correspondiente. Devuélvelo como un JSON con el siguiente formato:
      {
        "html": "<aquí el html>",
        "css": "<aquí el css>"
      }
    `;

    const mimeType = req.file.mimetype;
    const imageBase64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    let result = completion.choices[0].message.content || "";

    // Limpia si empieza con markdown ```json
    if (result.startsWith("```json")) {
      result = result
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim();
    }

    // 💥 Nueva validación: asegurar que empieza con "{" para intentar parsear
    if (!result.trim().startsWith("{")) {
      console.error("La respuesta de OpenAI no es JSON válido:", result);
      return res
        .status(500)
        .json({ error: "OpenAI no devolvió un JSON válido." });
    }

    // Ahora sí parseamos
    const aiDesign = JSON.parse(result);

    res.render("editor", {
      title: "Generador Frontend",
      salaId: req.params.id,
      aiDesign: JSON.stringify(aiDesign),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar la imagen con OpenAI." });
  }
};

const importPromt = async (req, res) => {
  try {
    const { mensaje } = req.body;

    const prompt = `
Quiero que actúes como un desarrollador web experto.

Te voy a describir cómo quiero que se vea mi página web.

Devuélveme únicamente un objeto JSON plano con dos claves: "html" y "css", cada una conteniendo su respectivo contenido como string.

No uses markdown, ni etiquetas especiales, ni bloques de código.

Solo quiero el JSON plano.

Usa buenas prácticas, estilo responsivo, y comenta dentro del código si lo crees necesario.

Esta es la descripción de la página que quiero:
${mensaje}
    `;


    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    let result = completion.choices[0].message.content || "";
    const aiDesign = JSON.parse(result);

    res.render("editor", {
      title: "Generador Frontend",
      salaId: req.params.id,
      aiDesign: JSON.stringify(aiDesign),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al procesar la imagen con OpenAI." });
  }
};
module.exports = {
  storeSala,
  editSala,
  updateSala,
  indexSala,
  createSala,
  deleteSala,
  importImg,
  exportFlutter,
  importPromt,
};
