export function loadComponentsUi(editor) {
  // Categoría personalizada
  editor.BlockManager.add("category-components", {
    id: "Widgets",
    open: false,
  });

editor.BlockManager.add("appbar", {
  label: "AppBar",
  category: "Componentes UI",
  content: `
    <div style="width:100%; background:#6200ee; color:white; padding:16px; text-align:center; font-size:20px; font-weight:bold;">
      AppBar
    </div>
  `,
  media: '<i class="fa fa-bars"></i>',
});


editor.BlockManager.add("column", {
  label: "Columna (Column)",
  category: "Componentes UI",
  content: `
    <div style="display:flex; flex-direction:column; gap:15px; padding:20px; border:1px dashed #ccc;">
      <div style="background:#f1f1f1; padding:10px; text-align:center;">Elemento 1</div>
      <div style="background:#f1f1f1; padding:10px; text-align:center;">Elemento 2</div>
      <div style="background:#f1f1f1; padding:10px; text-align:center;">Elemento 3</div>
    </div>
  `,
  media: '<i class="fa fa-ellipsis-v"></i>',
});

editor.BlockManager.add("row", {
  label: "Fila (Row)",
  category: "Componentes UI",
  content: `
    <div style="display:flex; justify-content:space-around; padding:20px; border:1px dashed #ccc;">
      <div style="background:#f1f1f1; padding:10px;">Elemento A</div>
      <div style="background:#f1f1f1; padding:10px;">Elemento B</div>
      <div style="background:#f1f1f1; padding:10px;">Elemento C</div>
    </div>
  `,
  media: '<i class="fa fa-ellipsis-h"></i>',
});

editor.BlockManager.add("container", {
  label: "Contenedor",
  category: "Componentes UI",
  content: `
    <div style="padding:20px; border:1px solid #ddd; border-radius:8px; background:#fff;">
      Contenido dentro del contenedor
    </div>
  `,
  media: '<i class="fa fa-square-o"></i>',
});


editor.BlockManager.add("flutter-button", {
  label: "Botón (Flutter)",
  category: "Componentes UI",
  content: `
    <button style="padding:12px 24px; background:#03dac6; color:#000; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">
      Botón
    </button>
  `,
  media: '<i class="fa fa-hand-pointer"></i>',
});

editor.BlockManager.add("bottom-nav", {
  label: "Bottom Navigation",
  category: "Componentes UI",
  content: `
    <div style="position:fixed; bottom:0; left:0; width:100%; background:#ffffff; border-top:1px solid #ccc; display:flex; justify-content:space-around; align-items:center; height:60px; box-shadow:0 -1px 5px rgba(0,0,0,0.1); z-index:999;">
      <button style="background:none; border:none; color:#6200ee; font-size:20px;">🏠</button>
      <button style="background:none; border:none; color:#6200ee; font-size:20px;">🔍</button>
      <button style="background:none; border:none; color:#6200ee; font-size:20px;">👤</button>
    </div>
  `,
  media: '<i class="fa fa-ellipsis-h"></i>',
});


}
