document.getElementById('year').textContent = new Date().getFullYear();

/* ---------------- Header scroll state ---------------- */
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------------- Mobile nav ---------------- */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const overlay = document.getElementById('navOverlay');

function closeNav(){
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
  overlay.classList.remove('is-visible');
  document.body.style.overflow = '';
}
function toggleNav(){
  const isOpen = nav.classList.toggle('is-open');
  burger.classList.toggle('is-open', isOpen);
  burger.setAttribute('aria-expanded', String(isOpen));
  overlay.classList.toggle('is-visible', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}
burger.addEventListener('click', toggleNav);
overlay.addEventListener('click', closeNav);
nav.querySelectorAll('.nav__link').forEach(link => link.addEventListener('click', closeNav));

/* ---------------- Reveal on scroll ---------------- */
const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealItems.forEach(item => revealObserver.observe(item));

/* ---------------- WhatsApp chat simulator ---------------- */
const CHATS = {
  editor: {
    howto: 'Envía por WhatsApp una foto del producto con la información escrita en la imagen (nombre, precio, características). En unos 30 segundos el bot devuelve la foto editada, lista para publicar.',
    messages: [
      { from: 'out', photo: true, text: 'Smartwatch deportivo, resistente al agua, $210.000' },
      { from: 'in', text: 'Recibido. Estoy generando el diseño con tu plantilla de marca, esto toma unos 30 segundos.' },
      { from: 'in', card: { title: 'Smartwatch FitPro X3', price: '$210.000', meta: 'Resistente al agua · Batería 10 días · 3 colores' } },
      { from: 'in', text: 'Aquí tienes tu imagen lista para publicar. Puedes descargarla y subirla directo a tus redes.' }
    ]
  },
  stock: {
    howto: 'De dos formas: es automático al enviar una foto (el bot pide confirmar los datos antes de guardarlos), o escribiendo la palabra "ingreso", que pregunta uno por uno los datos del nuevo producto, sin necesidad de foto. Si algún dato quedó mal, el comando "corrección" permite editarlo sin tener que volver a cargar todo el producto.',
    messages: [
      { from: 'in', text: 'Antes de guardar en el inventario, confirma que estos datos estén correctos:\nProducto: Smartwatch FitPro X3\nResistente al agua: sí\nPrecio: $210.000\nCantidad: 1' },
      { from: 'out', text: 'Sí' },
      { from: 'in', text: 'Guardado. El producto ya está disponible en tu inventario de Google Sheets.' },
      { from: 'out', text: 'Ingreso' },
      { from: 'in', text: 'Cuéntame los datos del nuevo producto:\n1. Producto\n2. Cantidad\n3. Precio\n4. Proveedor\n5. Categoría' },
      { from: 'out', text: 'Parlante Bluetooth SoundGo\n12 unidades\n$95.000\nTecno Import\nAudio' },
      { from: 'in', text: 'Agregado al inventario: 12 unidades de Parlante Bluetooth SoundGo a $95.000.' }
    ]
  },
  venta: {
    howto: 'Escribe "vendí" seguido del producto. Si hay varios parecidos, el bot muestra una lista numerada para elegir. Luego pregunta los datos que faltan. Si te equivocas en algún dato de la venta, el comando "corrección" te permite editarlo.',
    messages: [
      { from: 'out', text: 'Vendí unos audífonos inalámbricos' },
      { from: 'in', text: 'Encontré estas coincidencias en tu inventario:\n1. Audífonos ProSound Negro — $180.000\n2. Audífonos ProSound Blanco — $180.000\n\nResponde con el número del que vendiste.' },
      { from: 'out', text: '2' },
      { from: 'in', text: 'Perfecto. Cuéntame:\n1. Precio de venta\n2. A quién se vendió\n3. Vendedor\n4. Comisión del vendedor' },
      { from: 'out', text: '175.000\nCamila Ruiz\nJulián\n15.000' },
      { from: 'in', text: 'Venta registrada.\nProducto: Audífonos ProSound Blanco\nVendido a: Camila Ruiz\nVendedor: Julián\nPrecio de venta: $175.000\nComisión: $15.000\nEl producto salió automáticamente del inventario.' }
    ]
  },
  asesor: {
    howto: 'Escribe la palabra "asesor" para activar el modo consulta. Responde preguntas sobre tu inventario y tus ventas, disponible 24/7.',
    messages: [
      { from: 'out', text: 'Asesor' },
      { from: 'in', text: 'Asesor listo. ¿Qué quieres saber de tu negocio?' },
      { from: 'out', text: '¿Tenemos parlantes Bluetooth disponibles?' },
      { from: 'in', text: 'Sí, quedan 11 parlantes Bluetooth SoundGo en inventario.' },
      { from: 'out', text: '¿Cuál fue la ganancia del negocio el último mes?' },
      { from: 'in', text: 'En el último mes vendiste 42 productos con una ganancia total de $6.850.000, un margen promedio del 18%.' }
    ]
  }
};

const chatBody = document.getElementById('chatBody');
const manualHowto = document.getElementById('manualHowto');
const manualTabs = document.querySelectorAll('.manual__tab');
const serviceCards = document.querySelectorAll('[data-tab].card--service');
const manualSection = document.getElementById('manual');

let chatRunId = 0;

function buildBubbleContent(msg){
  if (msg.card){
    const wrap = document.createElement('div');
    wrap.className = 'bubble-card';
    wrap.innerHTML = `
      <div class="bubble-card__img"></div>
      <div class="bubble-card__body">
        <strong>${msg.card.title}</strong>
        <em>${msg.card.price}</em>
        <small>${msg.card.meta}</small>
      </div>`;
    return wrap;
  }
  const bubble = document.createElement('div');
  bubble.className = `bubble bubble--${msg.from}`;
  if (msg.photo){
    const photo = document.createElement('div');
    photo.className = 'bubble-photo';
    photo.textContent = 'Foto enviada';
    const holder = document.createElement('div');
    holder.className = 'bubble-photo-wrap';
    holder.appendChild(photo);
    const textEl = document.createElement('div');
    textEl.className = `bubble bubble--${msg.from}`;
    textEl.textContent = msg.text;
    holder.appendChild(textEl);
    return holder;
  }
  bubble.textContent = msg.text;
  return bubble;
}

function playChat(tabKey){
  const runId = ++chatRunId;
  const chat = CHATS[tabKey];
  chatBody.innerHTML = '';
  manualHowto.innerHTML = `<strong>Cómo se activa:</strong> ${chat.howto}`;

  chat.messages.forEach((msg, i) => {
    const delay = i * 900;
    setTimeout(() => {
      if (runId !== chatRunId) return;

      if (msg.from === 'in'){
        const typingRow = document.createElement('div');
        typingRow.className = 'bubble-row bubble-row--in';
        typingRow.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
        chatBody.appendChild(typingRow);
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(() => {
          if (runId !== chatRunId) return;
          typingRow.remove();
          const row = document.createElement('div');
          row.className = `bubble-row bubble-row--${msg.from}`;
          row.appendChild(buildBubbleContent(msg));
          chatBody.appendChild(row);
          chatBody.scrollTop = chatBody.scrollHeight;
        }, 550);
      } else {
        const row = document.createElement('div');
        row.className = `bubble-row bubble-row--${msg.from}`;
        row.appendChild(buildBubbleContent(msg));
        chatBody.appendChild(row);
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }, delay);
  });
}

function setActiveTab(tabKey){
  manualTabs.forEach(tab => {
    const active = tab.dataset.tab === tabKey;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  serviceCards.forEach(card => card.classList.toggle('is-active', card.dataset.tab === tabKey));
  playChat(tabKey);
}

manualTabs.forEach(tab => {
  tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
});

serviceCards.forEach(card => {
  card.addEventListener('click', () => {
    setActiveTab(card.dataset.tab);
    manualSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* Autoplay first chat once the manual is visible */
let manualStarted = false;
const manualObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !manualStarted){
      manualStarted = true;
      setActiveTab('editor');
      manualObserver.disconnect();
    }
  });
}, { threshold: 0.3 });
manualObserver.observe(manualSection);
