export function loadComponentsUi(editor) {
  // Añadir categoría personalizada
  editor.BlockManager.add("category-components", {
    id: "Componentes UI",
    open: false,
  });

  // 1. Tarjeta (Card)
  editor.BlockManager.add("card", {
    label: "Tarjeta",
    category: "Componentes UI",
    content: `
      <div style="width:300px; border:1px solid #ddd; border-radius:8px; overflow:hidden; margin:10px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
        <img src="https://via.placeholder.com/300x150" style="width:100%; height:150px; object-fit:cover;" alt="Imagen de Tarjeta">
        <div style="padding:15px;">
          <h3 style="margin-top:0; margin-bottom:10px;">Título de Tarjeta</h3>
          <p style="color:#666; margin-bottom:15px;">Descripción de la tarjeta con información relevante.</p>
          <button style="background-color:#007bff; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Leer más</button>
        </div>
      </div>
    `,
    media: '<i class="fa fa-id-card"></i>',
  });

  // 2. Navbar Moderno
  editor.BlockManager.add("navbar-modern", {
    label: "Navbar Moderno",
    category: "Componentes UI",
    content: `
      <nav style="background:#fff; box-shadow:0 2px 10px rgba(0,0,0,0.1); padding:15px 30px; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-weight:bold; font-size:24px;">Logo</div>
        <ul style="list-style:none; display:flex; gap:30px; margin:0; padding:0;">
          <li><a href="#" style="text-decoration:none; color:#333;">Inicio</a></li>
          <li><a href="#" style="text-decoration:none; color:#333;">Productos</a></li>
          <li><a href="#" style="text-decoration:none; color:#333;">Servicios</a></li>
          <li><a href="#" style="text-decoration:none; color:#333;">Contacto</a></li>
        </ul>
        <button style="background:#007bff; color:white; padding:10px 20px; border:none; border-radius:4px; cursor:pointer;">Acceder</button>
      </nav>
    `,
    media: '<i class="fa fa-bars"></i>',
  });

  // 3. Header con imagen de fondo
  editor.BlockManager.add("header-bg", {
    label: "Header con Fondo",
    category: "Componentes UI",
    content: `
      <header style="background:linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://via.placeholder.com/1920x500') center/cover no-repeat; color:white; text-align:center; padding:80px 20px;">
        <h1 style="font-size:48px; margin-bottom:20px;">Título Principal</h1>
        <p style="font-size:20px; margin-bottom:30px;">Subtítulo o descripción para captar la atención de los visitantes.</p>
        <div>
          <button style="background-color:#007bff; color:white; padding:12px 25px; border:none; border-radius:4px; font-size:16px; cursor:pointer; margin-right:10px;">Comenzar</button>
          <button style="background:transparent; border:2px solid white; color:white; padding:12px 25px; border-radius:4px; font-size:16px; cursor:pointer;">Más información</button>
        </div>
      </header>
    `,
    media: '<i class="fa fa-heading"></i>',
  });

  // 4. Lista con iconos
  editor.BlockManager.add("list-icons", {
    label: "Lista con Iconos",
    category: "Componentes UI",
    content: `
      <ul style="list-style:none; padding:0; margin:20px 0;">
        <li style="display:flex; align-items:center; margin-bottom:15px;">
          <span style="background:#007bff; color:white; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin-right:15px;">1</span>
          <div>
            <h4 style="margin:0 0 5px;">Primer elemento</h4>
            <p style="margin:0; color:#666;">Descripción del primer elemento.</p>
          </div>
        </li>
        <li style="display:flex; align-items:center; margin-bottom:15px;">
          <span style="background:#007bff; color:white; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin-right:15px;">2</span>
          <div>
            <h4 style="margin:0 0 5px;">Segundo elemento</h4>
            <p style="margin:0; color:#666;">Descripción del segundo elemento.</p>
          </div>
        </li>
        <li style="display:flex; align-items:center;">
          <span style="background:#007bff; color:white; width:40px; height:40px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin-right:15px;">3</span>
          <div>
            <h4 style="margin:0 0 5px;">Tercer elemento</h4>
            <p style="margin:0; color:#666;">Descripción del tercer elemento.</p>
          </div>
        </li>
      </ul>
    `,
    media: '<i class="fa fa-list"></i>',
  });

  // 5. Botones variados
  editor.BlockManager.add("buttons-set", {
    label: "Set de Botones",
    category: "Componentes UI",
    content: `
      <div style="display:flex; flex-wrap:wrap; gap:10px; padding:20px;">
        <button style="background:#007bff; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer;">Primario</button>
        <button style="background:#6c757d; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer;">Secundario</button>
        <button style="background:#28a745; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer;">Éxito</button>
        <button style="background:#dc3545; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer;">Peligro</button>
        <button style="background:#ffc107; color:#212529; border:none; padding:10px 20px; border-radius:4px; cursor:pointer;">Advertencia</button>
        <button style="background:#17a2b8; color:white; border:none; padding:10px 20px; border-radius:4px; cursor:pointer;">Info</button>
      </div>
    `,
    media: '<i class="fa fa-square"></i>',
  });

  // 6. Sección de características
  editor.BlockManager.add("features-section", {
    label: "Sección Características",
    category: "Componentes UI",
    content: `
    <section style="padding:60px 20px; background:#f8f9fa;">
      <h2 style="text-align:center; margin-bottom:40px;">Nuestras Características</h2>
      <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:30px; max-width:1200px; margin:0 auto;">
        <div style="flex:1; min-width:300px; text-align:center; padding:20px;">
          <div style="font-size:40px; color:#007bff; margin-bottom:20px;">⚡</div>
          <h3 style="margin:0 0 10px;">Rápido</h3>
          <p style="color:#666;">Descripción de la característica rápida de tu producto o servicio.</p>
        </div>
        <div style="flex:1; min-width:300px; text-align:center; padding:20px;">
          <div style="font-size:40px; color:#007bff; margin-bottom:20px;">🔒</div>
          <h3 style="margin:0 0 10px;">Seguro</h3>
          <p style="color:#666;">Descripción de la característica segura de tu producto o servicio.</p>
        </div>
        <div style="flex:1; min-width:300px; text-align:center; padding:20px;">
          <div style="font-size:40px; color:#007bff; margin-bottom:20px;">🌐</div>
          <h3 style="margin:0 0 10px;">Global</h3>
          <p style="color:#666;">Descripción de la característica global de tu producto o servicio.</p>
        </div>
      </div>
    </section>
  `,
    media: '<i class="fa fa-th-large"></i>',
  });

  // 7. Formulario de contacto
  editor.BlockManager.add("contact-form", {
    label: "Formulario de Contacto",
    category: "Componentes UI",
    content: `
    <form style="max-width:600px; margin:30px auto; padding:30px; box-shadow:0 0 10px rgba(0,0,0,0.1); border-radius:8px;">
      <h2 style="margin-top:0; margin-bottom:20px;">Contáctanos</h2>
      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; font-weight:500;">Nombre</label>
        <input type="text" placeholder="Tu nombre" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; font-weight:500;">Email</label>
        <input type="email" placeholder="Tu correo electrónico" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;">
      </div>
      <div style="margin-bottom:20px;">
        <label style="display:block; margin-bottom:8px; font-weight:500;">Mensaje</label>
        <textarea rows="5" placeholder="Tu mensaje" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:4px; box-sizing:border-box;"></textarea>
      </div>
      <button type="submit" style="background:#007bff; color:white; padding:12px 20px; border:none; border-radius:4px; font-size:16px; cursor:pointer;">Enviar mensaje</button>
    </form>
  `,
    media: '<i class="fa fa-envelope"></i>',
  });

  // 8. Imagen con texto superpuesto
  editor.BlockManager.add("image-overlay", {
    label: "Imagen con Texto",
    category: "Componentes UI",
    content: `
    <div style="position:relative; max-width:100%; overflow:hidden; margin:20px 0;">
      <img src="https://via.placeholder.com/800x400" alt="Imagen" style="width:100%; display:block;">
      <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.7); color:white; padding:20px;">
        <h3 style="margin:0 0 10px;">Título sobre la imagen</h3>
        <p style="margin:0;">Descripción o texto sobre la imagen.</p>
      </div>
    </div>
  `,
    media: '<i class="fa fa-image"></i>',
  });

  // 9. Footer moderno
  editor.BlockManager.add("footer-modern", {
    label: "Footer Moderno",
    category: "Componentes UI",
    content: `
    <footer style="background:#222; color:white; padding:60px 20px 20px;">
      <div style="display:flex; flex-wrap:wrap; justify-content:space-between; max-width:1200px; margin:0 auto; gap:30px;">
        <div style="flex:1; min-width:200px;">
          <h3 style="margin-top:0; margin-bottom:20px;">Sobre Nosotros</h3>
          <p style="color:#aaa; line-height:1.6;">Una breve descripción sobre la empresa o proyecto.</p>
        </div>
        <div style="flex:1; min-width:200px;">
          <h3 style="margin-top:0; margin-bottom:20px;">Enlaces</h3>
          <ul style="list-style:none; padding:0; margin:0;">
            <li style="margin-bottom:10px;"><a href="#" style="color:#aaa; text-decoration:none;">Inicio</a></li>
            <li style="margin-bottom:10px;"><a href="#" style="color:#aaa; text-decoration:none;">Servicios</a></li>
            <li style="margin-bottom:10px;"><a href="#" style="color:#aaa; text-decoration:none;">Productos</a></li>
            <li style="margin-bottom:10px;"><a href="#" style="color:#aaa; text-decoration:none;">Contacto</a></li>
          </ul>
        </div>
        <div style="flex:1; min-width:200px;">
          <h3 style="margin-top:0; margin-bottom:20px;">Contacto</h3>
          <p style="color:#aaa; margin-bottom:10px;">Dirección: Calle Ejemplo 123</p>
          <p style="color:#aaa; margin-bottom:10px;">Teléfono: (123) 456-7890</p>
          <p style="color:#aaa; margin-bottom:10px;">Email: info@ejemplo.com</p>
        </div>
      </div>
      <div style="text-align:center; padding-top:40px; margin-top:40px; border-top:1px solid #444;">
        <p style="color:#aaa;">&copy; 2025 Nombre de la Empresa. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
    media: '<i class="fa fa-window-minimize"></i>',
  });

  // 10. Testimonios
  editor.BlockManager.add("testimonials", {
    label: "Testimonios",
    category: "Componentes UI",
    content: `
    <section style="padding:60px 20px; background:#f9f9f9;">
      <h2 style="text-align:center; margin-bottom:40px;">Lo que dicen nuestros clientes</h2>
      <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:30px; max-width:1200px; margin:0 auto;">
        <div style="flex:1; min-width:300px; background:white; padding:30px; border-radius:8px; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
          <blockquote style="font-style:italic; color:#555; margin:0 0 20px;">"Excelente servicio, totalmente recomendado."</blockquote>
          <div style="display:flex; align-items:center;">
            <div style="width:50px; height:50px; border-radius:50%; background:#ddd; margin-right:15px;"></div>
            <div>
              <h4 style="margin:0;">Ana Rodríguez</h4>
              <p style="margin:0; color:#777;">Directora de Marketing</p>
            </div>
          </div>
        </div>
        <div style="flex:1; min-width:300px; background:white; padding:30px; border-radius:8px; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
          <blockquote style="font-style:italic; color:#555; margin:0 0 20px;">"El resultado final fue exactamente lo que necesitábamos."</blockquote>
          <div style="display:flex; align-items:center;">
            <div style="width:50px; height:50px; border-radius:50%; background:#ddd; margin-right:15px;"></div>
            <div>
              <h4 style="margin:0;">Carlos Gómez</h4>
              <p style="margin:0; color:#777;">CEO</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
    media: '<i class="fa fa-comment"></i>',
  });
}
