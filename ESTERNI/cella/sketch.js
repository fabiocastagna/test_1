function loadSVG(path, callback) {
  loadImage(path, callback);
}

let svgManager;
let animationManager;
let tabella;
let esagono;
let animazione;
let menuCarceri;

function preload() {
  tabella = loadTable('DATABASE/coordinate.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  esagono = new Esagono();
  animazione = new Animazione();
  svgManager = new SVGManager();
  
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
  background("black");
  esagono.aggiornaPosizione();
  esagono.disegna();
  svgManager.disegna();
  animazione.disegna();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}