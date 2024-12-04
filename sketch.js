let tabella;
let esagoni = [];
let coloriRegioni = {};
let regioneHover = null;

function preload() {
  tabella = loadTable('/database/coordinate.csv', 'csv', 'header', () => {
    console.log('Caricamento completato');
  }, (error) => {
    console.error('Errore nel caricamento:', error);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  let margineFactor = 0.8;
  let scaleFactor = min(width, height) / 1000 * margineFactor;
  
  let distanza = min(width, height) / 16;
  let raggio = distanza / sqrt(10);

  let regioni = new Set(tabella.getColumn('regione'));
  for (let regione of regioni) {
    coloriRegioni[regione] = color(random(255), random(255), random(255));
  }
  
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
  
  esagoni = [];
  
  for (let riga of tabella.rows) {
    let x = parseFloat(riga.get('x').replace(',', '.')) * scaleFactor;
    let y = parseFloat(riga.get('y').replace(',', '.')) * scaleFactor;
    
    esagoni.push({ 
      x: map(x - centerX, -width/2, width/2, width * 0.1, width * 0.9),
      y: map(y - centerY, -height/2, height/2, height * 0.1, height * 0.9),
      rotazione: HALF_PI,
      regione: riga.get('regione'),
      raggio: raggio
    });
  }
}

function draw() {
  background("black");
  
  // Resetta regioneHover
  regioneHover = null;
  
  // Controlla hover sulla regione
  for (let esagono of esagoni) {
    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
    if (distanza < esagono.raggio * 1.5) {
      regioneHover = esagono.regione;
      break;
    }
  }
  
  // Disegna gli esagoni
  for (let esagono of esagoni) {
    disegnaEsagono(
      esagono.x,
      esagono.y,
      esagono.raggio,
      esagono.rotazione,
      coloriRegioni[esagono.regione],
      esagono.regione === regioneHover
    );
  }
}

function disegnaEsagono(x, y, raggio, rotazione = 0, colore, hover = false) {
  push();
  translate(x, y);
  rotate(rotazione);
  
  // Modifica l'aspetto se in hover
  if (hover) {
    strokeWeight(0);
    stroke(0);
    // Rendi il colore più chiaro con un'animazione
    let coloreHover = lerpColor(colore, color(red(colore) + 50, green(colore) + 50, blue(colore) + 50), 1.5);
    fill(coloreHover);
  } else {
    strokeWeight(2);
    stroke(0);
    fill(colore);
  }
  
  beginShape();
  for (let angolo = 0; angolo < 6; angolo++) {
    let verticeX = raggio * cos(angolo * PI / 3);
    let verticeY = raggio * sin(angolo * PI / 3);
    vertex(verticeX, verticeY);
  }
  endShape(CLOSE);
    
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setup();
}