let animazione;
let tabella;
let esagono;
let menuCarceri;
let valSovraffollamentoCorrente = null;

function preload() {
  tabella = loadTable('DATABASE/coordinate.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  esagono = new Esagono();
  animazione = new Animazione();
  
  menuCarceri = createSelect();
  menuCarceri.position(10, 10);
  menuCarceri.option('Seleziona un carcere');
  
  for (let i = 0; i < tabella.getRowCount(); i++) {
    let hexId = tabella.getString(i, 'hexagon_id');
    menuCarceri.option(hexId);
  }
  
  menuCarceri.changed(careereScelto);
}

function careereScelto() {
  let hexagonScelto = menuCarceri.value();
  if (hexagonScelto === 'Seleziona un carcere') {
    valSovraffollamentoCorrente = null;
    return;
  }
  
  for (let i = 0; i < tabella.getRowCount(); i++) {
    if (tabella.getString(i, 'hexagon_id') === hexagonScelto) {
      let valSovraffollamento = tabella.getNum(i, 'sovraffollamento');
      valSovraffollamentoCorrente = valSovraffollamento;
      animazione.spostamento(valSovraffollamento);
      break;
    }
  }
}

function draw() {
  background(220);
  
  // Draw hexagon animation
  esagono.aggiornaPosizione();
  esagono.disegna();
  
  // Draw animation
  animazione.disegna();
  
  // Disegniamo il testo del sovraffollamento se esiste un valore
  if (valSovraffollamentoCorrente !== null) {
    push();
    textSize(16);
    textAlign(LEFT);
    fill(0);
    text(`Sovraffollamento: ${valSovraffollamentoCorrente}%`, 10, 50);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
