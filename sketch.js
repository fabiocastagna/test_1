let tabella;
let esagoni = [];
let coloriRegioni = {};

function preload() {
  tabella = loadTable('/database/coordinate.csv', 'csv', 'header', () => {
    console.log('Caricamento completato');
  }, (error) => {
    console.error('Errore nel caricamento:', error);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Calcola il fattore di scala basato sulle dimensioni più piccole
  let scaleFactor = min(width, height) / 800;
  
  // Calcola la distanza e il raggio in modo dinamico
  let distanza = min(width, height) / 16; // Una proporzione più flessibile
  let raggio = distanza / sqrt(3);

  // Genera colori unici per ogni regione
  let regioni = new Set(tabella.getColumn('regione'));
  for (let regione of regioni) {
    coloriRegioni[regione] = color(random(255), random(255), random(255));
  }
  
  // Calcolo del centro di raggruppamento
  let centerX = 0, centerY = 0;
  let numEsagoni = tabella.rows.length;
  
  for (let riga of tabella.rows) {
    let x = parseFloat(riga.get('x').replace(',', '.')) * scaleFactor;
    let y = parseFloat(riga.get('y').replace(',', '.')) * scaleFactor;
    
    centerX += x;
    centerY += y;
  }
  
  centerX /= numEsagoni;
  centerY /= numEsagoni;
  
  // Svuota l'array degli esagoni prima di riempirlo
  esagoni = [];
  
  // Converti i dati con un approccio più dinamico
  for (let riga of tabella.rows) {
    let x = parseFloat(riga.get('x').replace(',', '.')) * scaleFactor;
    let y = parseFloat(riga.get('y').replace(',', '.')) * scaleFactor;
    
    esagoni.push({ 
      x: map(x - centerX, -width/2, width/2, 0, width),
      y: map(y - centerY, -height/2, height/2, 0, height),
      rotazione: HALF_PI,
      regione: riga.get('regione'),
      raggio: raggio 
    });
  }
}

function draw() {
  background(220);
  
  for (let esagono of esagoni) {
    disegnaEsagono(
      esagono.x,
      esagono.y,
      esagono.raggio,
      esagono.rotazione,
      coloriRegioni[esagono.regione]
    );
  }
  
  disegnaLegenda();
}

function disegnaEsagono(x, y, raggio, rotazione = 0, colore) {
  push();
  translate(x, y);
  rotate(rotazione);
  
  fill(colore);
  stroke(50);
  strokeWeight(2);
  
  beginShape();
  for (let angolo = 0; angolo < 6; angolo++) {
    let verticeX = raggio * cos(angolo * PI / 3);
    let verticeY = raggio * sin(angolo * PI / 3);
    vertex(verticeX, verticeY);
  }
  endShape(CLOSE);
  
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup(); // Ricalcola le posizioni degli esagoni
}