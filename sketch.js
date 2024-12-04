let tabella;
let esagoni = [];
let regioneHover = null;
let regioneSelezionata = null;

// Oggetto per memorizzare le informazioni geometriche di ogni regione
let infoRegioni = {};

function preload() {
  tabella = loadTable('/database/coordinate.csv', 'csv', 'header', () => {
    console.log('Caricamento completato');
  }, (error) => {
    console.error('Errore nel caricamento:', error);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  let margineFactor = 1;
  let scaleFactor = min(width, height) / 1700 * margineFactor;
  
  let distanza = min(width, height) / 20;
  let raggio = distanza / sqrt(10);
  
  let regioni = new Set(tabella.getColumn('regione'));
  for (let regione of regioni) {
    
    infoRegioni[regione] = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
      centerX: 0,
      centerY: 0,
      count: 0
    };
  }
  
  let sovraffollamenti = tabella.getColumn('sovraffollamento').map(Number);
  let maxSovraffollamento = Math.max(...sovraffollamenti);
  let minSovraffollamento = Math.min(...sovraffollamenti);
  
  
  for (let riga of tabella.rows) {
    let x = parseFloat(riga.get('x').replace(',', '.')) * scaleFactor;
    let y = parseFloat(riga.get('y').replace(',', '.')) * scaleFactor;
    let sovraffollamento = parseFloat(riga.get('sovraffollamento'));
    let regione = riga.get('regione');
    
    let colore = lerpColor(color("green"), color("yellow"), (sovraffollamento - minSovraffollamento) / (maxSovraffollamento - minSovraffollamento));
    colore = lerpColor(colore, color("red"), (sovraffollamento - minSovraffollamento) / (maxSovraffollamento - minSovraffollamento));
    
    let mappedX = map(x, 0, width, width * 0.1, width * 0.9);
    let mappedY = map(y, 0, height, height * 0.1, height * 0.9);
    
    let regionInfo = infoRegioni[regione];
    regionInfo.minX = min(regionInfo.minX, mappedX);
    regionInfo.maxX = max(regionInfo.maxX, mappedX);
    regionInfo.minY = min(regionInfo.minY, mappedY);
    regionInfo.maxY = max(regionInfo.maxY, mappedY);
    regionInfo.centerX += mappedX;
    regionInfo.centerY += mappedY;
    regionInfo.count++;
    
    esagoni.push({ 
      x: mappedX,
      y: mappedY,
      originalX: mappedX,
      originalY: mappedY,
      rotazione: HALF_PI,
      regione: regione,
      raggio: raggio,
      colore: colore,
      opacita: 255,
      hoverState: 0,
      targetX: mappedX,
      targetY: mappedY,
      scaleMultiplier: 1
    });
  }
  
  // Calcola il centro di massa per ogni regione
  for (let regione in infoRegioni) {
    let regionInfo = infoRegioni[regione];
    regionInfo.centerX /= regionInfo.count;
    regionInfo.centerY /= regionInfo.count;
    regionInfo.width = regionInfo.maxX - regionInfo.minX;
    regionInfo.height = regionInfo.maxY - regionInfo.minY;
  }
}

function draw() {
  background("black");
  
  let nuovaRegioneHover = null;
  
  for (let esagono of esagoni) {
    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
    if (distanza < esagono.raggio * 1.5) {
      nuovaRegioneHover = esagono.regione;
      break;
    }
  }
  
  if (nuovaRegioneHover !== regioneHover) {
    regioneHover = nuovaRegioneHover;
  }
  
  for (let esagono of esagoni) {
    // Interpolazione fluida della posizione
    esagono.x = lerp(esagono.x, esagono.targetX, 0.1);
    esagono.y = lerp(esagono.y, esagono.targetY, 0.1);
    
    // Aggiorna hover e stato
    let targetHoverState = esagono.regione === regioneHover ? 1 : 0;
    esagono.hoverState = lerp(esagono.hoverState, targetHoverState, 0.1);
    
    // Gestisci l'opacità
    let targetOpacita = 255;
    if (regioneSelezionata) {
      // Se una regione è selezionata, riduci l'opacità degli esagoni non selezionati
      targetOpacita = esagono.regione === regioneSelezionata ? 255 : 30;
    } else if (regioneHover) {
      // Se c'è un hover, riduci l'opacità degli esagoni non in hover
      targetOpacita = esagono.regione === regioneHover ? 255 : 100;
    }
    
    esagono.opacita = lerp(esagono.opacita, targetOpacita, 0.1);
    
    disegnaEsagono(
      esagono.x,
      esagono.y,
      esagono.raggio * esagono.scaleMultiplier,
      esagono.rotazione,
      esagono.colore,
      esagono.hoverState,
      esagono.opacita
    );
  }
}

function mousePressed() {
  for (let esagono of esagoni) {
    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
    
    if (distanza < esagono.raggio * 1.5) {
      if (regioneSelezionata === esagono.regione) {
        // Deseleziona
        regioneSelezionata = null;
        
        // Ripristina tutti gli esagoni alle loro posizioni originali
        for (let hex of esagoni) {
          hex.targetX = hex.originalX;
          hex.targetY = hex.originalY;
          hex.scaleMultiplier = 1;
        }
      } else {
        // Seleziona nuova regione
        regioneSelezionata = esagono.regione;
        
        // Calcola il centro della regione
        let regioneEsagoni = esagoni.filter(e => e.regione === regioneSelezionata);
        let centerX = regioneEsagoni.reduce((sum, hex) => sum + hex.originalX, 0) / regioneEsagoni.length;
        let centerY = regioneEsagoni.reduce((sum, hex) => sum + hex.originalY, 0) / regioneEsagoni.length;
        
        // Calcola gli offset relativi per mantenere la forma della regione
        regioneEsagoni.forEach(hex => {
          let offsetX = hex.originalX - centerX;
          let offsetY = hex.originalY - centerY;
          
          // Ingrandisci e sposta al centro
          hex.targetX = width/2 + offsetX * 1.5;
          hex.targetY = height/2 + offsetY * 1.5;
          hex.scaleMultiplier = 1.5;
        });
        
        // Sposta gli altri esagoni fuori schermo
        esagoni.filter(e => e.regione !== regioneSelezionata).forEach(hex => {
          hex.targetX = hex.originalX - 100;
          hex.targetY = hex.originalY;
          hex.scaleMultiplier = 1;
        });
      }
      break;
    }
  }
}

function disegnaEsagono(x, y, raggio, rotazione = 0, colore, hoverState, opacita) {
  push(); // Salva lo stato corrente
  translate(x, y); // Trasla il sistema di coordinate
  rotate(rotazione); // Ruota il sistema di coordinate
  
  // Interpola il colore e lo spessore del bordo
  let strokeColor = lerpColor(color("grey"), color("white"), hoverState);
  let strokeW = lerp(0.5, 2, hoverState);
  stroke(strokeColor);
  strokeWeight(strokeW);
  
  // Interpola l'effetto di blur
  drawingContext.shadowBlur = lerp(0, 50, hoverState);
  drawingContext.shadowColor = color(red(colore), green(colore), blue(colore), lerp(0, 150, hoverState));
  
  fill(0); // Imposta il colore di riempimento a nero
  beginShape(); // Inizia a disegnare la forma
  for (let angolo = 0; angolo < 6; angolo++) {
    // Disegna i vertici dell'esagono
    let verticeX = raggio * cos(angolo * PI / 3); // Calcola la coordinata x del vertice
    let verticeY = raggio * sin(angolo * PI / 3); // Calcola la coordinata y del vertice
    vertex(verticeX, verticeY); // Aggiunge il vertice alla forma
  }
  endShape(CLOSE); // Chiude la forma
  
  // Rimuovi l'effetto blur e aggiungi un alone
  strokeWeight(0); // Imposta lo spessore del bordo a 0
  fill(color(red(colore), green(colore), blue(colore), opacita)); // Imposta il colore di riempimento con opacità
  ellipse(0, 0, raggio * 0.5, raggio * 0.5); // Disegna un'ellisse al centro dell'esagono
  
  // Aggiungi un alone attorno al pallino
  fill(color(red(colore), green(colore), blue(colore), opacita * 0.5)); // Colore dell'alone con opacità ridotta
  ellipse(0, 0, raggio * 0.8, raggio * 0.8); // Disegna l'alone attorno al pallino
  
  pop(); // Ripristina lo stato precedente
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Ridimensiona il canvas in base alla finestra
  setup(); // Richiama la funzione setup per ricalcolare le posizioni
}