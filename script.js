const $ = id => document.getElementById(id);

let cur = 'usd';   // moneda destino: 'usd' o 'eur'
let notes = [];    // notas del pizarrón

const fmt = (n, d = 2) => n.toLocaleString('es-AR', { maximumFractionDigits: d });

// Cargar notas guardadas
try {
  notes = JSON.parse(localStorage.getItem('notitas') || '[]') || [];
} catch (e) {
  notes = [];
}

function save() {
  try { localStorage.setItem('notitas', JSON.stringify(notes)); } catch (e) {}
}

// ---------- Conversor ----------
function convert() {
  const m = parseFloat($('monto').value);
  const r = parseFloat($(cur === 'usd' ? 'rUsd' : 'rEur').value);
  if (!(m >= 0) || !(r > 0)) return null;
  return { m, val: m / r, sym: cur === 'usd' ? 'U$S' : '€' };
}

function updateRes() {
  const c = convert();
  $('res').textContent = c ? fmt(c.val) + ' ' + c.sym : '—';
}

function setCur(c) {
  cur = c;
  $('usd').setAttribute('aria-pressed', c === 'usd');
  $('eur').setAttribute('aria-pressed', c === 'eur');
  updateRes();
}

$('usd').onclick = () => setCur('usd');
$('eur').onclick = () => setCur('eur');
['monto', 'rUsd', 'rEur'].forEach(i => $(i).addEventListener('input', updateRes));

// ---------- Pizarrón ----------
function push(title, body) {
  notes.push({ id: Date.now() + Math.random(), title, body });
  save();
  render();
}

// Agregar conversión como tarjeta
$('addConv').onclick = () => {
  const c = convert();
  if (!c) { $('monto').focus(); return; }
  const name = $('nombre').value.trim() || 'Sin nombre';
  push(name, '$' + fmt(c.m, 0) + ' = ' + fmt(c.val) + ' ' + c.sym);
  $('nombre').value = '';
};

// Agregar nota personalizada
function addText() {
  const t = $('texto').value.trim();
  if (!t) { $('texto').focus(); return; }
  push(t, '');
  $('texto').value = '';
}
$('addTxt').onclick = addText;
$('texto').addEventListener('keydown', e => { if (e.key === 'Enter') addText(); });

function render() {
  const b = $('board');
  b.innerHTML = '';

  if (!notes.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'El pizarrón está vacío. Convertí un monto o escribí una nota para agregarla.';
    b.appendChild(p);
    return;
  }

  notes.forEach((n, i) => {
    const d = document.createElement('div');
    d.className = 'card';
    d.style.background = 'var(--c' + (i % 6) + ')';

    const t = document.createElement('b');
    t.textContent = n.title;
    d.appendChild(t);

    if (n.body) {
      const s = document.createElement('span');
      s.textContent = n.body;
      d.appendChild(s);
    }

    const x = document.createElement('button');
    x.textContent = '×';
    x.setAttribute('aria-label', 'Borrar nota');
    x.onclick = () => {
      notes = notes.filter(k => k.id !== n.id);
      save();
      render();
    };
    d.appendChild(x);

    b.appendChild(d);
  });
}

updateRes();
render();
