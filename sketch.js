let mappaManager;
let svgManager;
let animationManager;
let tabella;

function preload() {
  tabella = loadTable('database/coordinate.csv', 'csv', 'header');
}

function setup() {
  console.log('Setup iniziato');
  createCanvas(windowWidth, windowHeight);
  
  animationManager = new AnimationManager();
  mappaManager = new MappaManager(animationManager);
  mappaManager.caricaDati(tabella);
  svgManager = new SvgManager();
  console.log('Setup completato');
}

function draw() {
  background(CONFIG.colori.sfondo);
  
  if (!mappaManager || !svgManager) {
    console.error('Manager non inizializzati');
    return;
  }
  
  mappaManager.aggiorna();
  mappaManager.esagoni.forEach(esagono => esagono.disegna());
  
  // Disegna l'SVG se c'è un esagono ingrandito
  if (mappaManager.esagonoManager.esagonoIngrandito) {
    svgManager.display(mappaManager.esagonoManager.esagonoIngrandito);
  }
}

function mousePressed() {
  if (mappaManager) {
    mappaManager.gestisciClick(mouseX, mouseY);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup();
}