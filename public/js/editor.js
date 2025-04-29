import { loadComponentsUi } from "./componentsui.js";
const salaId = document.getElementById("salaId").value; // Si lo estás pasando de alguna forma

document.addEventListener("DOMContentLoaded", function () {
  const socket = io();
  const editor = grapesjs.init({
    container: "#gjs",
    height: "100vh",
    width: "auto",
    fromElement: false,
    storageManager: false,
    plugins: [
      "grapesjs-navbar",
      "grapesjs-plugin-export",
      "grapesjs-custom-code",
    ],
    pageManager: {
      pages: [],
    },
  });

  // --- 1. Primero recibir el proyecto inicial ---
  socket.on("init", (proyectoInicial) => {
    if (proyectoInicial && proyectoInicial.pages) {
      console.log("Recibiendo proyecto inicial", proyectoInicial);
      actualizandoDesdeSocket = true;
      editor.loadProjectData(proyectoInicial);

      // Espera un pequeño tiempo para asegurarte de que GrapesJS termine de cargar
      setTimeout(() => {
        actualizarSelector(); // 🔥 Aquí actualizas el selector después de cargar el proyecto

        // Opcional: seleccionar la primera página automáticamente
        const pages = pageManager.getAll();
        if (pages.length) {
          pageManager.select(pages[0].id);
        }

        actualizandoDesdeSocket = false;
      }, 500);
    }
  });

  loadComponentsUi(editor);

  socket.emit("joinRoom", { salaId });

  editor.Panels.getButton("views", "open-blocks").set("active", true);

  const pageManager = editor.Pages;
  const addPageBtn = document.getElementById("addPageBtn");
  const pageSelector = document.getElementById("pageSelector");

  function actualizarSelector() {
    pageSelector.innerHTML = "";
    pageManager.getAll().forEach((page) => {
      const option = document.createElement("option");
      option.value = page.id;
      option.text = page.get("name") || page.id;
      pageSelector.appendChild(option);
    });
  }

  addPageBtn.addEventListener("click", () => {
    const pageName = prompt("Ingrese el nombre de la nueva página:");
    if (pageName) {
      const newPage = pageManager.add({
        name: pageName,
        component: `<h1>${pageName}</h1><p>Contenido inicial de ${pageName}.</p>`,
      });
      pageManager.select(newPage.id);
      actualizarSelector();
    }
  });

  pageSelector.addEventListener("change", (e) => {
    const selectedPageId = e.target.value;
    pageManager.select(selectedPageId);
  });

  actualizarSelector();

  editor.on("page:add", enviarProyecto);
  editor.on("page:remove", enviarProyecto);

  let actualizandoDesdeSocket = false; // Bandera de control

  function enviarProyecto() {
    if (actualizandoDesdeSocket) return; // Si es actualización externa, no enviar

    const proyecto = editor.getProjectData();
    socket.emit("guardarProyecto", proyecto);
    console.log("Proyecto enviado al servidor:", proyecto);
  }

  socket.on("actualizarProyecto", (proyecto) => {
    actualizandoDesdeSocket = true;

    const currentProject = editor.getProjectData();
    if (JSON.stringify(currentProject) !== JSON.stringify(proyecto)) {
      console.log("Actualizando proyecto completo desde otro usuario");
      editor.loadProjectData(proyecto);

      setTimeout(() => {
        actualizarSelector(); // 🔥 Volver a llenar el menú de páginas

        // 🔥 Opcional: Mantener la página activa anterior
        const currentPages = pageManager.getAll();
        if (currentPages.length) {
          pageManager.select(currentPages[0].id); // Selecciona la primera página
        }

        actualizandoDesdeSocket = false;
      }, 500);
    } else {
      console.log("Proyecto idéntico, no actualizo");
    }
  });

  // Conecta los eventos de edición normalmente
  editor.on("component:add", enviarProyecto);
  editor.on("component:remove", enviarProyecto);





  const deletePageBtn = document.getElementById("deletePageBtn");

deletePageBtn.addEventListener("click", () => {
  const selectedPageId = pageSelector.value; // ID de la página seleccionada

  if (!selectedPageId) {
    alert("Primero selecciona una página para eliminar.");
    return;
  }

  const confirmDelete = confirm(`¿Seguro que quieres eliminar la página "${selectedPageId}"?`);
  if (!confirmDelete) return;

  const pageToDelete = pageManager.get(selectedPageId);

  if (pageToDelete) {
    pageManager.remove(pageToDelete); // Eliminar del editor
    actualizarSelector(); // Actualizar selector de páginas

    // Selecciona automáticamente otra página si existe
    const remainingPages = pageManager.getAll();
    if (remainingPages.length > 0) {
      pageManager.select(remainingPages[0].id);
    } else {
      console.log("No hay más páginas disponibles.");
    }

    // 🔥 Enviar cambios al servidor si quieres colaboración en tiempo real
    enviarProyecto();
  } else {
    alert("No se encontró la página seleccionada.");
  }
});

});
