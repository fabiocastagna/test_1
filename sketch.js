let tabella;
let esagoni = [];
let coloriRegioni = {};
let scaleFactor; // Fattore di scala globale
let offsetX, offsetY; // Offset per centrare gli esagoni

function preload() {
  // Carica il CSV dalla URL fornita
  tabella = loadTable('coordinate.csv', 'csv', 'header', () => {
    console.log('Caricamento completato');
  }, (error) => {
    console.error('Errore nel caricamento:', error);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);  // Canvas responsivo
  
  // Calcola il fattore di scala in base alla dimensione minima tra larghezza e altezza del canvas
  scaleFactor = min(width, height) / 800; // Adatta in base alla dimensione minima
  
  // Calcola la distanza desiderata tra i centri degli esagoni
  let distanza = 50 * scaleFactor; // Distanza scalata
  let raggio = distanza / sqrt(3); // Calcola il raggio
  


  // Genera colori unici per ogni regione
  let regioni = new Set(tabella.getColumn('regione'));
  for (let regione of regioni) {
    coloriRegioni[regione] = color(random(255), random(255), random(255));
  }
  
  // Calcola il centro di raggruppamento
  let centerX = 0;
  let centerY = 0;
  
  for (let riga of tabella.rows) {
    let x = parseFloat(riga.get('x').replace(',', '.')) * scaleFactor;  // Scala x
    let y = parseFloat(riga.get('y').replace(',', '.')) * scaleFactor; // Scala y
    
    centerX += x;
    centerY += y;
  }
  
  let numEsagoni = tabella.rows.length;
  centerX /= numEsagoni; // Centro x
  centerY /= numEsagoni; // Centro y
  
  // Converti i dati e posiziona gli esagoni rispetto al centro di raggruppamento
  for (let riga of tabella.rows) {
    let x = parseFloat(riga.get('x').replace(',', '.')) * scaleFactor;  // Scala x
    let y = parseFloat(riga.get('y').replace(',', '.')) * scaleFactor; // Scala y
    
    // Posiziona gli esagoni rispetto al centro di raggruppamento
    esagoni.push({ 
      x: x - centerX + width / 2,  // Centra gli esagoni nella viewport
      y: y - centerY + height / 2, // Centra gli esagoni nella viewport
      rotazione: HALF_PI,  // Rotazione di 90 gradi (PI/2)
      regione: riga.get('regione'),
      raggio: raggio // Aggiunto il raggio per ogni esagono
    });
  }
}

// Aggiungi questa funzione per gestire il ridimensionamento della finestra
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup(); // Ricalcola le posizioni degli esagoni
}
function draw() {
  background(220);
  
  // Disegna gli esagoni
  for (let esagono of esagoni) {
    // Sposta e ruota ogni esagono
    disegnaEsagono(
      esagono.x,   // Usa direttamente la coordinata x
      esagono.y,   // Usa direttamente la coordinata y
      esagono.raggio,        // Raggio
      esagono.rotazione,     // Angolo di rotazione
      coloriRegioni[esagono.regione]  // Colore basato sulla regione
    );
  }
  
  // Disegna la legenda
  disegnaLegenda();
}

function disegnaEsagono(x, y, raggio, rotazione = 0, colore) {
  push();
  
  // Sposta al punto centrale dell'esagono
  translate(x, y);
  
  // Applica la rotazione
  rotate(rotazione);
  
  // Stili di disegno
  fill(colore);
  stroke(50);
  strokeWeight(2);
  
  // Disegna l'esagono
  beginShape();
  for (let angolo = 0; angolo < 6; angolo++) {
    let verticeX = raggio * cos(angolo * PI / 3);
    let verticeY = raggio * sin(angolo * PI / 3);
    vertex(verticeX, verticeY);
  }
  endShape(CLOSE);
  
  // Punto centrale rosso
  fill(255, 0, 0);
  circle(0, 0, 5);
  
  pop();
}

function disegnaLegenda() {
  let x = 20;
  let y = 20;
  let size = 20;
  let spacing = 30;
  
  for (let regione in coloriRegioni) {
    fill(coloriRegioni[regione]);
    rect(x, y, size, size);
    fill(0);
    textAlign(LEFT, CENTER);
    text(regione, x + size + 5, y + size / 2);
    y += spacing;
  }
}

// Aggiungi questa funzione per gestire il ridimensionamento della finestra
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup(); // Ricalcola le posizioni degli esagoni
}

