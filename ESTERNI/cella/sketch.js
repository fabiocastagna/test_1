function loadSVG(path, callback) {
  loadImage(path, callback);
}

let svgManager;
let animazione;
let tabella;
let esagono;
let menuCarceri;

function preload() {
  tabella = loadTable('DATABASE/coordinate.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  esagono = new Esagono(); // Assuming Esagono is defined elsewhere
  animazione = new Animazione();
  svgManager = new SvgManager();
  
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
  
  // Draw hexagon animation
  esagono.aggiornaPosizione(); // Assuming this updates Esagono's position
  esagono.disegna(); // Assuming this draws the hexagon
  
  // Draw animation and overlay SVG
  animazione.disegna();
  svgManager.disegna(animazione.esagonoInterno);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
