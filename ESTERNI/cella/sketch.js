let animazione;
let tabella;
let esagono;
let menuCarceri;

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
  for (let i = 0; i < tabella.getRowCount(); i++) {
    if (tabella.getString(i, 'hexagon_id') === hexagonScelto) {
      let valSovraffollamento = tabella.getNum(i, 'sovraffollamento');
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
