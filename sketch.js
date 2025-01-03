let gestoreMappa;
let gestoreSvg;
let gestoreAnimazioni;
let tabella;

function preload() {
  tabella = loadTable('database/coordinate.csv', 'csv', 'header');
}

function setup() {
  console.log('Setup iniziato');
  createCanvas(windowWidth, windowHeight);
  
  gestoreAnimazioni = new GestoreAnimazioni();
  gestoreMappa = new GestoreMappa(gestoreAnimazioni);
  gestoreMappa.caricaDati(tabella);
  gestoreSvg = new GestoreSvg();
  console.log('Setup completato');
}

function draw() {
  background(CONFIGURAZIONE.colori.sfondo);
  
  if (!gestoreMappa || !gestoreSvg) {
    console.error('Gestori non inizializzati');
    return;
  }
  
  gestoreMappa.aggiorna();
  gestoreMappa.disegna();
  
  if (gestoreMappa.gestoreEsagoni.esagonoIngrandito) {
    gestoreSvg.visualizza(gestoreMappa.gestoreEsagoni.esagonoIngrandito);
    gestoreMappa.gestoreEsagoni.aggiornaIngrandimento();
  }
}

function mousePressed() {
  if (gestoreMappa) {
    gestoreMappa.gestisciClick(mouseX, mouseY);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Reinizializza i gestori con le nuove dimensioni
  gestoreAnimazioni = new GestoreAnimazioni();
  gestoreMappa = new GestoreMappa(gestoreAnimazioni);
  gestoreMappa.caricaDati(tabella);
  gestoreSvg = new GestoreSvg();
}