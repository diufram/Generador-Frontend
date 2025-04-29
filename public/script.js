const salaId = document.getElementById("salaId").value; // Si lo estás pasando de alguna forma

$(document).ready(function () {
  const socket = io(); // Conectar con el servidor

  // Crear el gráfico y el papel de JointJS
  const graph = new joint.dia.Graph();
  const paper = new joint.dia.Paper({
    el: $("#diagram"),
    model: graph,
    width: $("#diagram").width(), // Establecer el ancho dinámicamente
    height: $("#diagram").height(), // Establecer la altura dinámicamente
    gridSize: 10,
    interactive: true,
  });

  let selectedSource = null; // Clase de origen
  let selectedTarget = null; // Clase de destino
  let currentRelationType = null; // Tipo de relación que se quiere agregar
  let isMoving = false; // Bandera para detectar si se está moviendo una clase
  // Función para exportar el diagrama como PNG
  function exportDiagramAsPng() {
    // Obtener el contenido SVG del diagrama usando paper.svg
    const svgElement = paper.svg; // Obtener el SVG del diagrama

    // Serializar el elemento SVG a string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    // Crear un objeto Blob para el SVG
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    // Crear un canvas donde vamos a dibujar el diagrama
    const canvas = document.createElement("canvas");
    canvas.width = paper.options.width; // Utiliza el ancho actual del diagrama
    canvas.height = paper.options.height; // Utiliza la altura actual del diagrama

    const context = canvas.getContext("2d");

    // Establecer el fondo blanco y rellenar el canvas completamente
    context.fillStyle = "#FFFFFF"; // Fondo blanco
    context.fillRect(0, 0, canvas.width, canvas.height); // Rellenar todo el canvas con blanco

    // Cargar el SVG como una imagen
    const img = new Image();
    img.onload = function () {
      // Dibujar la imagen (el SVG convertido) en el canvas
      context.drawImage(img, 0, 0);

      // Crear el enlace para descargar la imagen
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png"); // Genera el archivo PNG
      link.download = "diagrama.png"; // Nombre del archivo de descarga

      // Simular el clic en el enlace para descargar la imagen
      link.click();

      // Revocar el objeto URL
      URL.revokeObjectURL(url);
    };

    // Asignar la URL generada al objeto `img`
    img.src = url;
  }

  document
    .getElementById("export-btn")
    .addEventListener("click", exportDiagramAsPng);

  // Variables para manejar la escala
  let scaleFactor = 1;
  const scaleStep = 0.1; // Cantidad de zoom por cada paso del scroll
  const minScale = 0.2; // Zoom mínimo permitido
  const maxScale = 3; // Zoom máximo permitido

  let isPanning = false; // Variable para determinar si estamos en modo de arrastre
  let lastMousePosition = { x: 0, y: 0 }; // Última posición del mouse

  let isAnimating = false; // Variable para manejar el requestAnimationFrame
  let deltaX = 0,
    deltaY = 0; // Variables para el desplazamiento acumulado

  // Función para manejar el movimiento suave utilizando requestAnimationFrame
  function pan() {
    if (isAnimating) {
      // Mover la vista del diagrama teniendo en cuenta el desplazamiento
      const translate = paper.translate();
      paper.translate(translate.tx + deltaX, translate.ty + deltaY);

      // Resetear el desplazamiento acumulado después de mover
      deltaX = 0;
      deltaY = 0;

      // Continuar el ciclo de animación mientras estemos en modo de arrastre
      requestAnimationFrame(pan);
    }
  }

  // Evento `mousedown` - Iniciar el arrastre si se hace clic en una parte vacía del diagrama
  paper.on("blank:pointerdown", function (event, x, y) {
    isPanning = true;
    lastMousePosition = { x, y }; // Guardamos la posición inicial del mouse
    $("body").css("cursor", "move"); // Cambiar el cursor mientras se arrastra
    isAnimating = true; // Activar la animación
    requestAnimationFrame(pan); // Iniciar el ciclo de animación
  });

  // Evento `mousemove` - Mientras se arrastra, mover la vista del diagrama
  paper.on("cell:pointermove blank:pointermove", function (event, x, y) {
    if (isPanning) {
      // Calcular el desplazamiento acumulado
      deltaX += (x - lastMousePosition.x) * scaleFactor; // Ajustar según la escala actual
      deltaY += (y - lastMousePosition.y) * scaleFactor; // Ajustar según la escala actual

      // Actualizar la última posición del mouse
      lastMousePosition = { x, y };
    }
  });

  // Evento `mouseup` - Finalizar el arrastre
  paper.on("cell:pointerup blank:pointerup", function () {
    isPanning = false;
    $("body").css("cursor", "default"); // Restaurar el cursor al finalizar el arrastre
    isAnimating = false; // Detener la animación
  });

  // Evento para capturar el scroll del mouse
  $("#diagram").on("wheel", function (event) {
    event.preventDefault(); // Prevenir el comportamiento por defecto del scroll

    // Calcular el nuevo factor de escala basado en el scroll del mouse
    if (event.originalEvent.deltaY < 0) {
      // Si el scroll es hacia arriba, hacemos zoom in
      scaleFactor = Math.min(scaleFactor + scaleStep, maxScale);
    } else {
      // Si el scroll es hacia abajo, hacemos zoom out
      scaleFactor = Math.max(scaleFactor - scaleStep, minScale);
    }

    // Aplicar la nueva escala al paper
    paper.scale(scaleFactor, scaleFactor);

    console.log(`Zoom: ${scaleFactor}`); // Puedes quitar esta línea si no quieres ver el log
  });

  // Función para resetear el color de los bordes de las clases
  function resetClassBorders() {
    if (selectedSource) {
      selectedSource.attr(".uml-class-name-rect/stroke", "#000000"); // Volver a color negro
    }
    if (selectedTarget) {
      selectedTarget.attr(".uml-class-name-rect/stroke", "#000000"); // Volver a color negro
    }
  }

  // Función para generar un ID único
  function generateId(prefix) {
    return prefix + "_" + Math.random().toString(36).substr(2, 9);
  }

  // Función para agregar una nueva clase UML
  function addUMLClass(name, attributes, methods, position) {
    const id = generateId(name); // Generar un ID único
    const umlClass = new joint.shapes.uml.Class({
      position: position,
      size: { width: 180, height: 190 },
      name: name,
      attributes: attributes,
      methods: methods,
      id: id,
      attrs: {
        ".uml-class-name-rect": {
          fill: "#6699cc", // Color de fondo azul para el nombre de la clase
          stroke: "#000000", // Borde negro
          "stroke-width": 1.5, // Grosor del borde
          rx: 0, // Sin bordes redondeados
          ry: 0,
        },
        ".uml-class-attrs-rect": {
          fill: "#d9e1f2", // Fondo gris claro para los atributos
          stroke: "#000000", // Borde negro
          "stroke-width": 1, // Borde fino
          rx: 0, // Sin bordes redondeados
          ry: 0,
        },
        ".uml-class-methods-rect": {
          fill: "#d9e1f2", // Fondo gris claro para los métodos
          stroke: "#000000", // Borde negro
          "stroke-width": 1, // Borde fino
          rx: 0, // Sin bordes redondeados
          ry: 0,
        },
        ".uml-class-name-text": {
          "font-family": "Arial", // Mantiene Arial para la tipografía
          "font-size": 14, // Tamaño de fuente para el nombre de la clase
          "font-weight": "bold", // Texto en negrita para el nombre de la clase
          fill: "#ffffff", // Texto blanco para contraste
        },
        ".uml-class-attrs-text": {
          "font-family": "Arial", // Fuente Arial para los atributos
          "font-size": 12, // Tamaño de fuente para los atributos
          fill: "#000000", // Color del texto negro
        },
        ".uml-class-methods-text": {
          "font-family": "Arial", // Fuente Arial para los métodos
          "font-size": 12, // Tamaño de fuente para los métodos
          fill: "#000000", // Color del texto negro
        },
        ".uml-class-attrs-header": {
          "font-family": "Arial", // Fuente Arial para el encabezado de atributos
          "font-size": 12, // Tamaño de fuente
          "font-style": "italic", // Texto en cursiva para el encabezado de los atributos
          fill: "#000000", // Color negro
        },
        ".uml-class-methods-header": {
          "font-family": "Arial", // Fuente Arial para el encabezado de métodos
          "font-size": 12, // Tamaño de fuente
          "font-style": "italic", // Texto en cursiva para el encabezado de los métodos
          fill: "#000000", // Color negro
        },
        ".uml-class-name-label": {
          text: "<<block>>", // Añadir el estereotipo <<block>> si es necesario
          "font-family": "Arial", // Fuente Arial para el estereotipo
          "font-size": 12, // Tamaño de fuente
          fill: "#ffffff", // Color del estereotipo en blanco (para contraste con el fondo azul)
          "font-style": "italic", // Estilo cursiva
        },
      },
    });
    graph.addCell(umlClass);

    // Emitir al servidor que se ha agregado una nueva clase
    socket.emit("elementAdded", {
      id: id,
      type: "uml.Class",
      name,
      attributes,
      methods,
      position,
    });
  }

  let clickedElement = null; // Guardar el elemento en el que se hizo clic

  // Mostrar el menú contextual al hacer clic derecho en una clase
  paper.on("element:contextmenu", function (elementView, evt, x, y) {
    evt.preventDefault(); // Prevenir el menú contextual predeterminado del navegador
    clickedElement = elementView.model; // Guardar el elemento seleccionado

    // Mostrar el menú contextual en la posición del clic
    $("#contextMenu")
      .css({
        top: evt.pageY + "px",
        left: evt.pageX + "px",
      })
      .show();
  });

  // Ocultar el menú contextual cuando se haga clic en cualquier lugar fuera de él
  $(document).on("click", function () {
    $("#contextMenu").hide();
  });

  // Función para editar el nombre de la clase
  $("#editName").on("click", function () {
    // Obtener el nombre actual de la clase
    const currentName = clickedElement.get("name");

    // Mostrar el nombre actual en el input del modal
    $("#classNameInput").val(currentName);

    // Mostrar el modal de edición
    $("#editClassModal").modal("show");
  });

  // Manejar la acción cuando el usuario guarda los cambios
  $("#saveClassName").on("click", function () {
    const newName = $("#classNameInput").val(); // Obtener el nuevo nombre ingresado

    if (newName) {
      // Actualizar el nombre de la clase en el diagrama
      clickedElement.attr(".uml-class-name-text/text", newName);
      clickedElement.set("name", newName);

      // Ocultar el modal
      $("#editClassModal").modal("hide");

      // Emitir evento de edición de nombre de clase al servidor
      socket.emit("classEdited", {
        id: clickedElement.id,
        name: newName,
      });
    } else {
      alert("El nombre de la clase no puede estar vacío.");
    }
  });

  // Función para editar los atributos de la clase
  $("#editAttributes").on("click", function () {
    // Obtener los atributos actuales de la clase
    const currentAttrs = clickedElement.get("attributes").join(", ");

    // Reemplazar comas con saltos de línea para visualizarlos mejor en el textarea
    const currentAttrsFormatted = currentAttrs.replace(/,/g, "\n");

    // Mostrar los atributos actuales con saltos de línea en el área de texto del modal
    $("#classAttributesInput").val(currentAttrsFormatted);

    // Mostrar el modal para editar los atributos
    $("#editAttributesModal").modal("show");
  });

  // Manejar la acción cuando el usuario guarda los cambios
  $("#saveClassAttributes").on("click", function () {
    const newAttrs = $("#classAttributesInput").val(); // Obtener los atributos ingresados

    if (newAttrs) {
      // Separar los atributos por saltos de línea y luego unirlos con comas
      const newAttrsArray = newAttrs.split("\n").map((attr) => attr.trim()); // Separar por líneas

      // Actualizar los atributos en el diagrama
      clickedElement.attr(
        ".uml-class-attrs-text/text",
        newAttrsArray.join("\n")
      );
      clickedElement.set("attributes", newAttrsArray);

      // Ocultar el modal
      $("#editAttributesModal").modal("hide");

      // Emitir evento de edición de atributos al servidor
      socket.emit("classAttributesEdited", {
        id: clickedElement.id,
        attributes: newAttrsArray,
      });
    } else {
      alert("Los atributos no pueden estar vacíos.");
    }
  });

  // Función para editar los métodos de la clase
  $("#editMethods").on("click", function () {
    // Obtener los métodos actuales de la clase
    const currentMethods = clickedElement.get("methods").join(", ");

    // Reemplazar comas con saltos de línea para visualizarlos mejor en el textarea
    const currentMethodsFormatted = currentMethods.replace(/,/g, "\n");

    // Mostrar los métodos actuales con saltos de línea en el área de texto del modal
    $("#classMethodsInput").val(currentMethodsFormatted);

    // Mostrar el modal para editar los métodos
    $("#editMethodsModal").modal("show");
  });

  // Manejar la acción cuando el usuario guarda los cambios
  $("#saveClassMethods").on("click", function () {
    const newMethods = $("#classMethodsInput").val(); // Obtener los métodos ingresados

    if (newMethods) {
      // Separar los métodos por saltos de línea y luego unirlos con comas
      const newMethodsArray = newMethods
        .split("\n")
        .map((method) => method.trim()); // Separar por líneas

      // Actualizar los métodos en el diagrama
      clickedElement.attr(
        ".uml-class-methods-text/text",
        newMethodsArray.join("\n")
      );
      clickedElement.set("methods", newMethodsArray);

      // Ocultar el modal
      $("#editMethodsModal").modal("hide");

      // Emitir evento de edición de métodos al servidor
      socket.emit("classMethodsEdited", {
        id: clickedElement.id,
        methods: newMethodsArray,
      });
    } else {
      alert("Los métodos no pueden estar vacíos.");
    }
  });

  // Abrir el modal cuando se hace clic en la opción de eliminar
  $("#deleteClass").on("click", function () {
    // Mostrar el modal de confirmación
    $("#deleteClassModal").modal("show");
  });

  // Confirmar la eliminación cuando se hace clic en el botón "Eliminar"
  $("#confirmDeleteClass").on("click", function () {
    // Guardar el ID de la clase antes de eliminarla
    const elementId = clickedElement.id;

    // Obtener todas las relaciones conectadas a esta clase
    const connectedLinks = graph.getConnectedLinks(clickedElement);

    // Eliminar la clase del gráfico
    clickedElement.remove();

    // Eliminar todas las relaciones conectadas a la clase eliminada
    connectedLinks.forEach(function (link) {
      link.remove(); // Eliminar el enlace del gráfico
    });

    // Ocultar el modal
    $("#deleteClassModal").modal("hide");

    // Ocultar el menú contextual si está visible
    $("#contextMenu").hide();

    // Emitir evento de eliminación de clase y sus relaciones al servidor
    socket.emit("classDeleted", {
      id: elementId,
      connectedLinks: connectedLinks.map((link) => link.id), // Enviar los IDs de las relaciones eliminadas
    });
  });

  // Manejar clics para agregar clases
  $("#addUserClass").on("click", function () {
    addUMLClass("Clase", [""], [""], { x: 100, y: 100 });
  });

  // Función para agregar una relación
  function addRelationship(type) {
    currentRelationType = type; // Establecer el tipo de relación actual
    $("#selectionInfo").text(
      "Selecciona el origen y destino para la relación."
    );
    selectedSource = null; // Reiniciar las selecciones de clases
    selectedTarget = null;
    resetClassBorders(); // Reiniciar los bordes de las clases
  }

  // Seleccionar el origen y el destino para la relación después de hacer clic en el botón de relación
  paper.on("element:pointerdown", (cellView) => {
    if (isMoving) return; // No hacer nada si se está moviendo la clase

    if (currentRelationType) {
      // Solo permitir selección si se ha seleccionado un tipo de relación
      if (!selectedSource) {
        selectedSource = cellView.model;
        selectedSource.attr(".uml-class-name-rect/stroke", "#FF0000"); // Cambiar borde a rojo para indicar origen
      } else if (!selectedTarget) {
        selectedTarget = cellView.model;
        selectedTarget.attr(".uml-class-name-rect/stroke", "#0000FF"); // Cambiar borde a azul para indicar destino

        // Cuando se hayan seleccionado ambas clases, crear la relación
        if (selectedSource && selectedTarget) {
          let link;

          switch (currentRelationType) {
            case "association":
              link = new joint.shapes.standard.Link({
                source: { id: selectedSource.id },
                target: { id: selectedTarget.id },
                attrs: {
                  line: {
                    strokeWidth: 1, // Ancho de la línea
                    targetMarker: {
                      type: "none", // No mostrar ninguna flecha en el destino
                    },
                  },
                },
              });
              break;
            case "dependency":
              link = new joint.shapes.standard.Link({
                source: { id: selectedSource.id },
                target: { id: selectedTarget.id },
                attrs: {
                  line: {
                    strokeDasharray: "5 5", // Línea discontinua para la dependencia
                    strokeWidth: 1, // Grosor de la línea
                  },
                  targetMarker: {
                    type: "path", // Usamos una flecha como marcador en el destino
                    d: "M 30 -10 L 0 0 L 30 10 Z", // Aumentamos considerablemente el tamaño de la flecha
                    fill: "black", // Relleno de la flecha
                    stroke: "black", // Borde de la flecha
                  },
                },
              });

              // Añadir el enlace al gráfico
              graph.addCell(link);

              // Forzar la actualización del targetMarker en caso de que esté siendo sobrescrito
              link.attr("line/targetMarker", {
                type: "path",
                d: "M 30 -10 L 0 0 L 30 10 Z", // Ajustamos la flecha a un tamaño más grande
                fill: "black",
                stroke: "black",
              });
              break;
            case "aggregation":
              link = new joint.shapes.standard.Link({
                source: { id: selectedSource.id },
                target: { id: selectedTarget.id },
                attrs: {
                  line: {
                    strokeWidth: 1,
                    sourceMarker: {
                      type: "path",
                      d: "M 30 0 L 15 -10 L 0 0 L 15 10 Z",
                      fill: "white",
                    },
                    targetMarker: {
                      type: "none", // Eliminamos la flecha del target
                    },
                  },
                },
              });
              break;
            case "composition":
              link = new joint.shapes.standard.Link({
                source: { id: selectedSource.id },
                target: { id: selectedTarget.id },
                attrs: {
                  line: {
                    strokeWidth: 1,
                    sourceMarker: {
                      type: "path",
                      d: "M 30 0 L 15 -10 L 0 0 L 15 10 Z",
                      fill: "black",
                    },
                    targetMarker: {
                      type: "none", // Eliminamos la flecha del target
                    },
                  },
                },
              });
              break;
            case "inheritance":
              link = new joint.shapes.standard.Link({
                source: { id: selectedSource.id },
                target: { id: selectedTarget.id },
                attrs: {
                  line: {
                    strokeWidth: 1,
                    targetMarker: {
                      type: "path",
                      d: "M 30 -10 L 0 0 L 30 10 Z",
                      fill: "white",
                    },
                  },
                },
              });
              break;
          }

          graph.addCell(link);

          // Emitir la nueva relación al servidor
          socket.emit("relationshipAdded", {
            id: link.id,
            source: { id: selectedSource.id },
            target: { id: selectedTarget.id },
            type: currentRelationType,
            labels: link.labels(),
            attrs: link.attributes.attrs,
          });

          // Resetear las selecciones y bordes
          resetClassBorders();
          selectedSource = null;
          selectedTarget = null;
          currentRelationType = null; // Reiniciar el tipo de relación actual
          updateSelectionInfo(); // Actualizar la interfaz para mostrar las selecciones vacías
        }
      }
      updateSelectionInfo(); // Actualizar la interfaz después de cada selección
    }
  });

  // Manejar clics en los botones de relaciones
  $("#addAssociation").on("click", function () {
    addRelationship("association");
  });

  $("#addDependency").on("click", function () {
    addRelationship("dependency");
  });

  $("#addAggregation").on("click", function () {
    addRelationship("aggregation");
  });

  $("#addComposition").on("click", function () {
    addRelationship("composition");
  });

  $("#addInheritance").on("click", function () {
    addRelationship("inheritance");
  });

  // Mostrar la selección en la interfaz
  $("#selectionInfo").text(
    "Selecciona el tipo de relación y luego el origen y destino."
  );

  // Evento al hacer clic en el enlace
  paper.on("link:pointerclick", (linkView) => {
    selectedLink = linkView.model; // Guardar el enlace seleccionado
    // Mostrar el modal para editar la cardinalidad
    $("#editCardinalityModal").modal("show");
  });

  // Manejar el clic en "Guardar cambios" en el modal
  $("#saveCardinality").on("click", function () {
    // Obtener las cardinalidades ingresadas
    const sourceCardinality = $("#sourceCardinality").val();
    const targetCardinality = $("#targetCardinality").val();

    // Agregar las etiquetas de cardinalidad al enlace
    selectedLink.label(0, {
      position: 0.1, // Posición cerca del origen
      attrs: {
        text: {
          text: sourceCardinality,
          "font-size": 12,
          "font-family": "Arial",
        },
      },
    });

    selectedLink.label(1, {
      position: 0.9, // Posición cerca del destino
      attrs: {
        text: {
          text: targetCardinality,
          "font-size": 12,
          "font-family": "Arial",
        },
      },
    });

    // Emitir el cambio de cardinalidad al servidor
    socket.emit("cardinalityUpdated", {
      linkId: selectedLink.id,
      sourceCardinality: sourceCardinality,
      targetCardinality: targetCardinality,
    });

    // Ocultar el modal
    $("#editCardinalityModal").modal("hide");

    // Limpiar los campos del modal
    $("#sourceCardinality").val("");
    $("#targetCardinality").val("");
  });

  // **Recibir cambios de cardinalidad desde el servidor**
  socket.on("cardinalityUpdated", (data) => {
    const link = graph.getCell(data.linkId);
    if (link) {
      // Actualizar las etiquetas de cardinalidad en el cliente
      link.label(0, {
        position: 0.1,
        attrs: {
          text: {
            text: data.sourceCardinality,
            "font-size": 12,
            "font-family": "Arial",
          },
        },
      });

      link.label(1, {
        position: 0.9,
        attrs: {
          text: {
            text: data.targetCardinality,
            "font-size": 12,
            "font-family": "Arial",
          },
        },
      });
    }
  });

  // Emitir cambios de posición de los elementos al servidor
  function emitElementPositionChange(element) {
    const position = element.position();
    socket.emit("elementMoved", { id: element.id, position });
  }

  // Detectar cuando se está moviendo una clase y emitir su posición en tiempo real
  paper.on("element:pointermove", (elementView) => {
    isMoving = true;
    emitElementPositionChange(elementView.model); // Emitir la nueva posición en tiempo real
  });

  // Detectar cuando se deja de mover la clase
  paper.on("element:pointerup", (elementView) => {
    if (isMoving) {
      emitElementPositionChange(elementView.model); // Emitir la posición final
      isMoving = false;
    }
  });

  socket.emit("joinRoom", { salaId });

  // Recibir el estado inicial del diagrama desde el backend
  socket.on("init", (diagramState) => {
    // Recorrer los elementos recibidos y agregarlos si no existen
    diagramState.elements.forEach((element) => {
      if (!graph.getCell(element.id)) {
        const umlClass = new joint.shapes.uml.Class({
          position: element.position || { x: 100, y: 100 }, // Asegúrate de que la posición esté establecida
          size: element.size || { width: 180, height: 190 },
          name: element.name,
          attributes: element.attributes,
          methods: element.methods,
          id: element.id,
          attrs: {
            ".uml-class-name-rect": {
              fill: "#6699cc", // Color de fondo azul para el nombre de la clase
              stroke: "#000000", // Borde negro
              "stroke-width": 1.5, // Grosor del borde
              rx: 0, // Sin bordes redondeados
              ry: 0,
            },
            ".uml-class-attrs-rect": {
              fill: "#d9e1f2", // Fondo gris claro para los atributos
              stroke: "#000000", // Borde negro
              "stroke-width": 1, // Borde fino
              rx: 0, // Sin bordes redondeados
              ry: 0,
            },
            ".uml-class-methods-rect": {
              fill: "#d9e1f2", // Fondo gris claro para los métodos
              stroke: "#000000", // Borde negro
              "stroke-width": 1, // Borde fino
              rx: 0, // Sin bordes redondeados
              ry: 0,
            },
            ".uml-class-name-text": {
              "font-family": "Arial", // Mantiene Arial para la tipografía
              "font-size": 14, // Tamaño de fuente para el nombre de la clase
              "font-weight": "bold", // Texto en negrita para el nombre de la clase
              fill: "#ffffff", // Texto blanco para contraste
            },
            ".uml-class-attrs-text": {
              "font-family": "Arial", // Fuente Arial para los atributos
              "font-size": 12, // Tamaño de fuente para los atributos
              fill: "#000000", // Color del texto negro
            },
            ".uml-class-methods-text": {
              "font-family": "Arial", // Fuente Arial para los métodos
              "font-size": 12, // Tamaño de fuente para los métodos
              fill: "#000000", // Color del texto negro
            },
            ".uml-class-attrs-header": {
              "font-family": "Arial", // Fuente Arial para el encabezado de atributos
              "font-size": 12, // Tamaño de fuente
              "font-style": "italic", // Texto en cursiva para el encabezado de los atributos
              fill: "#000000", // Color negro
            },
            ".uml-class-methods-header": {
              "font-family": "Arial", // Fuente Arial para el encabezado de métodos
              "font-size": 12, // Tamaño de fuente
              "font-style": "italic", // Texto en cursiva para el encabezado de los métodos
              fill: "#000000", // Color negro
            },
            ".uml-class-name-label": {
              text: "<<block>>", // Añadir el estereotipo <<block>> si es necesario
              "font-family": "Arial", // Fuente Arial para el estereotipo
              "font-size": 12, // Tamaño de fuente
              fill: "#ffffff", // Color del estereotipo en blanco (para contraste con el fondo azul)
              "font-style": "italic", // Estilo cursiva
            },
          },
        });
        graph.addCell(umlClass);
      }
    });

    // Recorrer los enlaces (relaciones) recibidos y agregarlos si no existen
    diagramState.links.forEach((linkData) => {
      if (!graph.getCell(linkData.id)) {
        const link = new joint.shapes.standard.Link({
          source: { id: linkData.source.id },
          target: { id: linkData.target.id },
          labels: linkData.labels,
          id: linkData.id,
          attrs: linkData.attrs,
        });
        graph.addCell(link);
      }
    });
  });

  // Recibir actualizaciones del diagrama de otros clientes (movimiento de elementos)
  socket.on("elementMoved", (data) => {
    const element = graph.getCell(data.id);
    if (element) {
      element.position(data.position.x, data.position.y); // Actualizar la posición del elemento
    }
  });

  // Recibir nuevos elementos añadidos desde otros clientes
  socket.on("elementAdded", (data) => {
    console.log(data);
    if (!graph.getCell(data.id)) {
      const umlClass = new joint.shapes.uml.Class({
        position: data.position,
        size: {  width: 180, height: 190 },
        name: data.name,
        attributes: data.attributes,
        methods: data.methods,
        id: data.id,
        attrs: {
          ".uml-class-name-rect": {
            fill: "#6699cc", // Color de fondo azul para el nombre de la clase
            stroke: "#000000", // Borde negro
            "stroke-width": 1.5, // Grosor del borde
            rx: 0, // Sin bordes redondeados
            ry: 0,
          },
          ".uml-class-attrs-rect": {
            fill: "#d9e1f2", // Fondo gris claro para los atributos
            stroke: "#000000", // Borde negro
            "stroke-width": 1, // Borde fino
            rx: 0, // Sin bordes redondeados
            ry: 0,
          },
          ".uml-class-methods-rect": {
            fill: "#d9e1f2", // Fondo gris claro para los métodos
            stroke: "#000000", // Borde negro
            "stroke-width": 1, // Borde fino
            rx: 0, // Sin bordes redondeados
            ry: 0,
          },
          ".uml-class-name-text": {
            "font-family": "Arial", // Mantiene Arial para la tipografía
            "font-size": 14, // Tamaño de fuente para el nombre de la clase
            "font-weight": "bold", // Texto en negrita para el nombre de la clase
            fill: "#ffffff", // Texto blanco para contraste
          },
          ".uml-class-attrs-text": {
            "font-family": "Arial", // Fuente Arial para los atributos
            "font-size": 12, // Tamaño de fuente para los atributos
            fill: "#000000", // Color del texto negro
          },
          ".uml-class-methods-text": {
            "font-family": "Arial", // Fuente Arial para los métodos
            "font-size": 12, // Tamaño de fuente para los métodos
            fill: "#000000", // Color del texto negro
          },
          ".uml-class-attrs-header": {
            "font-family": "Arial", // Fuente Arial para el encabezado de atributos
            "font-size": 12, // Tamaño de fuente
            "font-style": "italic", // Texto en cursiva para el encabezado de los atributos
            fill: "#000000", // Color negro
          },
          ".uml-class-methods-header": {
            "font-family": "Arial", // Fuente Arial para el encabezado de métodos
            "font-size": 12, // Tamaño de fuente
            "font-style": "italic", // Texto en cursiva para el encabezado de los métodos
            fill: "#000000", // Color negro
          },
          ".uml-class-name-label": {
            text: "<<block>>", // Añadir el estereotipo <<block>> si es necesario
            "font-family": "Arial", // Fuente Arial para el estereotipo
            "font-size": 12, // Tamaño de fuente
            fill: "#ffffff", // Color del estereotipo en blanco (para contraste con el fondo azul)
            "font-style": "italic", // Estilo cursiva
          },
        },
      });
      graph.addCell(umlClass);
    }
  });

  // Recibir nuevas relaciones añadidas desde otros clientes
  socket.on("relationshipAdded", (data) => {
    if (!graph.getCell(data.id)) {
      const link = new joint.shapes.standard.Link({
        source: { id: data.source.id },
        target: { id: data.target.id },
        labels: data.labels,
        attrs: data.attrs,
      });
      graph.addCell(link);
    }
  });

  // Escuchar eventos desde el servidor para actualizaciones en otros clientes
  socket.on("classEdited", function (data) {
    const element = graph.getCell(data.id);
    if (element) {
      element.attr(".uml-class-name-text/text", data.name);
      element.set("name", data.name);
    }
  });

  socket.on("classAttributesEdited", function (data) {
    const element = graph.getCell(data.id);
    if (element) {
      element.attr(".uml-class-attrs-text/text", data.attributes.join("\n"));
      element.set("attributes", data.attributes);
    }
  });

  socket.on("classMethodsEdited", function (data) {
    const element = graph.getCell(data.id);
    if (element) {
      element.attr(".uml-class-methods-text/text", data.methods.join("\n"));
      element.set("methods", data.methods);
    }
  });

  socket.on("classDeleted", function (data) {
    const element = graph.getCell(data.id);
    console.log("Elemento encontrado:", element);
    if (element) {
      element.remove();
    }
  });

  function showToast(message, tipo) {
    const toastContainer = document.getElementById("toast-container");

    // Crear un nuevo elemento de toast
    const newToast = document.createElement("div");
    newToast.classList.add("toast");
    newToast.innerText = message;

    // Cambiar el color del toast según el tipo
    if (tipo == 1) {
      newToast.style.backgroundColor = "#28a745"; // Verde para éxito
      newToast.style.color = "#fff"; // Texto blanco
    } else if (tipo == 2) {
      newToast.style.backgroundColor = "#dc3545"; // Rojo para error
      newToast.style.color = "#fff"; // Texto blanco
    }

    // Añadir el toast al contenedor
    toastContainer.appendChild(newToast);

    // Eliminar el toast después de 3 segundos
    setTimeout(() => {
      newToast.remove();
    }, 3000);
  }
  socket.on("message", function (data) {
    console.log(data);

    showToast("LEGOO", 2);
    console.log("SI");
  });
  // Detectar el clic derecho sobre un enlace
  paper.on("link:contextmenu", function (linkView, evt, x, y) {
    evt.preventDefault(); // Prevenir el menú contextual predeterminado del navegador

    // Guardar la relación seleccionada
    selectedLink = linkView.model;

    // Mostrar el menú contextual en la posición del clic
    $("#linkContextMenu")
      .css({
        top: evt.pageY + "px",
        left: evt.pageX + "px",
      })
      .show();
  });

  // Ocultar el menú contextual cuando se haga clic en cualquier lugar fuera de él
  $(document).on("click", function () {
    $("#linkContextMenu").hide();
  });

  // Función para eliminar la relación seleccionada
  $("#deleteLink").on("click", function () {
    if (selectedLink) {
      const linkId = selectedLink.id;

      // Eliminar la relación del gráfico
      selectedLink.remove();

      // Emitir al servidor que se ha eliminado una relación
      socket.emit("relationshipDeleted", { id: linkId });

      // Ocultar el menú contextual
      $("#linkContextMenu").hide();
    }
  });
  // Recibir notificación desde el servidor para eliminar una relación
  socket.on("relationshipDeleted", function (data) {
    const link = graph.getCell(data.id);
    if (link) {
      link.remove(); // Eliminar la relación en el cliente
    }
  });
  
});
