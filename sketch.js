let gestoreMappa;
let gestoreSvg;
let gestoreAnimazioni;
let gestoreIntro;
let tabella;
let caricamentoDatiCompletato = false;

function preload() {
  try {
    tabella = loadTable('database/coordinate.csv', 'csv', 'header');
  } catch (error) {
    console.error('Errore nel caricamento dei dati:', error);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  inizializzaGestori();
}

function inizializzaGestori() {
  try {
    gestoreAnimazioni = new GestoreAnimazioni();
    gestoreIntro = new GestoreIntro(gestoreAnimazioni);
    gestoreMappa = new GestoreMappa(gestoreAnimazioni);
    if (tabella) {
      gestoreMappa.caricaDati(tabella);
      caricamentoDatiCompletato = true;
    }
    gestoreSvg = new GestoreSvg();
  } catch (error) {
    console.error('Errore nell\'inizializzazione dei gestori:', error);
    caricamentoDatiCompletato = false;
  }
}

function draw() {
  if (!caricamentoDatiCompletato) return;
  
  background(CONFIGURAZIONE.colori.sfondo);
  
  if (gestoreIntro.attivo) {
    gestoreIntro.aggiorna();
    gestoreIntro.disegna();
  } else {
    gestoreMappa?.aggiorna();
    gestoreMappa?.disegna();
    
    const esagonoIngrandito = gestoreMappa?.gestoreEsagoni?.esagonoIngrandito;
    if (esagonoIngrandito) {
      gestoreSvg?.visualizza(esagonoIngrandito);
      gestoreMappa?.gestoreEsagoni?.aggiornaIngrandimento();
    }
  }
}

function mousePressed() {
  if (gestoreIntro.attivo) {
    if (gestoreIntro.gestisciClick()) {
      // Il click sul bottone è stato gestito
      return;
    }
  }
  gestoreMappa?.gestisciClick(mouseX, mouseY);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (gestoreMappa) {
    gestoreMappa.ridimensiona(windowWidth, windowHeight);
  }
  if (gestoreSvg) {
    gestoreSvg.ridimensiona(windowWidth, windowHeight);
  }
}

function disegnaEsagonoNero(esagono) {
  push();
  fill(0);
  esagono.disegna();
  pop();
}