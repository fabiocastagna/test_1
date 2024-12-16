let tabella;
let esagoni = [];
let regioneHover = null;
let regioneSelezionata = null;
let testoRegione = "";
let indiceTestoCorrente = 0;
let ultimoCarattereAggiunto = 0;
let velocitaScrittura = 50; // millisecondi tra ogni carattere
let italiaRimpicciolita = false;

// Oggetto per memorizzare i testi delle regioni
const testiRegioni = {
  "Lombardia": "La Lombardia è una delle regioni più popolose d'Italia, con una ricca storia industriale e culturale. Il suo capoluogo, Milano, è considerato il centro economico e finanziario del paese. La regione vanta una varietà di paesaggi che spaziano dalle Alpi ai laghi, fino alla pianura padana.",
  // Aggiungi altri testi per le altre regioni...
};

function preload() {
  tabella = loadTable('/database/coordinate.csv', 'csv', 'header', () => {
    console.log('Caricamento completato');
  }, (error) => {
    console.error('Errore nel caricamento:', error);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Troviamo le coordinate estreme della mappa
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  for (let riga of tabella.rows) {
    let x = parseFloat(riga.get('x').replace(',', '.'));
    let y = parseFloat(riga.get('y').replace(',', '.'));
    minX = min(minX, x);
    maxX = max(maxX, x);
    minY = min(minY, y);
    maxY = max(maxY, y);
  }
  
  // Calcoliamo l'aspect ratio e il fattore di scala
  let mappaWidth = maxX - minX;
  let mappaHeight = maxY - minY;
  let aspectRatio = mappaWidth / mappaHeight;
  
  // Scaliamo in base all'altezza del viewport, considerando il margine del 20%
  let marginHeight = height * 0.8; // 80% dell'altezza (20% di margine)
  let scaleFactor = marginHeight / mappaHeight;
  let scaledWidth = marginHeight * aspectRatio;
  
  // Calcoliamo gli offset per centrare con margine del 10% su ogni lato
  let offsetX = (width - scaledWidth) / 2;
  let offsetY = height * 0.1; // 10% dall'alto
  
  // Calcoliamo il raggio in proporzione all'altezza effettiva
  let raggio = marginHeight / 45;
  
  let sovraffollamenti = tabella.getColumn('sovraffollamento').map(Number);
  let maxSovraffollamento = Math.max(...sovraffollamenti);
  let minSovraffollamento = Math.min(...sovraffollamenti);
  
  for (let riga of tabella.rows) {
    let x = parseFloat(riga.get('x').replace(',', '.'));
    let y = parseFloat(riga.get('y').replace(',', '.'));
    let sovraffollamento = parseFloat(riga.get('sovraffollamento'));
    let regione = riga.get('regione');
    
    // Mappiamo le coordinate mantenendo l'aspect ratio e aggiungendo l'offsetY
    let mappedX = map(x, minX, maxX, offsetX, offsetX + scaledWidth);
    let mappedY = map(y, minY, maxY, offsetY, offsetY + marginHeight);
    
    let colore = lerpColor(color("green"), color("yellow"), 
      (sovraffollamento - minSovraffollamento) / (maxSovraffollamento - minSovraffollamento));
    colore = lerpColor(colore, color("red"), 
      (sovraffollamento - minSovraffollamento) / (maxSovraffollamento - minSovraffollamento));
    
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
}

function draw() {
  background("black");
  
  let nuovaRegioneHover = null;
  let hexagoniFuoriHover = [];
  let esagoniInHover = [];
  
  // First, identify the hovered region or hexagon
  for (let esagono of esagoni) {
    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
    if (distanza < esagono.raggio * 1.5) {
      if (regioneSelezionata) {
        // Se una regione è selezionata, evidenzia solo l'esagono specifico
        if (esagono.regione === regioneSelezionata) {
          nuovaRegioneHover = esagono;
        }
      } else {
        // Altrimenti, evidenzia l'intera regione
        nuovaRegioneHover = esagono.regione;
      }
      break;
    }
  }
  
  if (nuovaRegioneHover !== regioneHover) {
    regioneHover = nuovaRegioneHover;
  }
  
  // Separate hexagons into two groups: hovered and non-hovered
  for (let esagono of esagoni) {
    // Interpolazione fluida della posizione
    esagono.x = lerp(esagono.x, esagono.targetX, 0.1);
    esagono.y = lerp(esagono.y, esagono.targetY, 0.1);
    
    // Aggiorna hover e stato
    let targetHoverState = 0;
    if (regioneSelezionata) {
      // Se una regione è selezionata, evidenzia solo l'esagono specifico
      targetHoverState = regioneHover === esagono ? 1 : 0;
    } else {
      // Altrimenti, evidenzia l'intera regione
      targetHoverState = esagono.regione === regioneHover ? 1 : 0;
    }
    esagono.hoverState = lerp(esagono.hoverState, targetHoverState, 0.2);
    
    // Gestisci l'opacità
    let targetOpacita = 255;
    if (regioneSelezionata) {
      targetOpacita = esagono.regione === regioneSelezionata ? 255 : 30;
    } else if (regioneHover) {
      targetOpacita = esagono.regione === regioneHover ? 255 : 100;
    }
    
    esagono.opacita = lerp(esagono.opacita, targetOpacita, 0.1);
    
    // Separate hexagons for drawing
    if ((regioneSelezionata && regioneHover === esagono) || 
        (!regioneSelezionata && esagono.regione === regioneHover)) {
      esagoniInHover.push(esagono);
    } else {
      hexagoniFuoriHover.push(esagono);
    }
  }
  
  // First draw non-hovered hexagons
  for (let esagono of hexagoniFuoriHover) {
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
  
  // Then draw hovered hexagons on top
  for (let esagono of esagoniInHover) {
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
  
  if (regioneSelezionata && testiRegioni[regioneSelezionata]) {
    let testoCompleto = testiRegioni[regioneSelezionata];
    
    // Effetto macchina da scrivere
    if (millis() - ultimoCarattereAggiunto > velocitaScrittura && 
        indiceTestoCorrente < testoCompleto.length) {
      testoRegione += testoCompleto.charAt(indiceTestoCorrente);
      indiceTestoCorrente++;
      ultimoCarattereAggiunto = millis();
    }
    
    // Visualizza il testo
    push();
    fill(255);
    noStroke();
    textSize(16);
    textAlign(LEFT, TOP);
    textWrap(WORD);
    text(testoRegione, width * 0.7, height * 0.3, width * 0.25); // Posizionato a destra
    pop();
  }
}

function mousePressed() {
  if (italiaRimpicciolita) {
    // Controlla se l'Italia rimpicciolita è stata cliccata
    for (let esagono of esagoni) {
      let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
      if (distanza < esagono.raggio * 1.5 && esagono.scaleMultiplier === 0.3) {
        // Ripristina la visualizzazione iniziale
        regioneSelezionata = null;
        testoRegione = "";
        indiceTestoCorrente = 0;
        italiaRimpicciolita = false;
        
        // Ripristina tutti gli esagoni alle posizioni originali
        for (let hex of esagoni) {
          hex.targetX = hex.originalX;
          hex.targetY = hex.originalY;
          hex.scaleMultiplier = 1;
        }
        return;
      }
    }

    // Controlla se un esagono della regione selezionata è stato cliccato
    for (let esagono of esagoni) {
      if (esagono.regione === regioneSelezionata) {
        let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
        if (distanza < esagono.raggio * 1.5) {
          let regioneEsagoni = esagoni.filter(e => e.regione === regioneSelezionata);
          
          // Sposta l'esagono cliccato al centro e gli altri a sinistra
          regioneEsagoni.forEach(hex => {
            if (hex === esagono) {
              hex.targetX = width * 0.5;
              hex.targetY = height * 0.5;
              hex.scaleMultiplier = 1.2;
            } else {
              hex.targetX = hex.originalX * 0.3 + width * 0.1;
              hex.targetY = hex.originalY * 0.3 + height * 0.35;
              hex.scaleMultiplier = 0.3;
            }
          });

          // Sposta l'Italia rimpicciolita fuori dallo schermo
          esagoni.filter(e => e.regione !== regioneSelezionata).forEach(hex => {
            hex.targetX = -width * 0.5;
            hex.targetY = hex.originalY * 0.3 + height * 0.35;
            hex.scaleMultiplier = 0.3;
          });
          return;
        }
      }
    }
  }
  
  // Codice esistente per la selezione iniziale della regione
  for (let esagono of esagoni) {
    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
    
    if (distanza < esagono.raggio * 1.5) {
      if (esagono.regione === regioneSelezionata) {
        // Se l'esagono è al centro, sposta la regione al centro e l'Italia a sinistra
        let regioneEsagoni = esagoni.filter(e => e.regione === regioneSelezionata);
        let esagonoAlCentro = esagono.scaleMultiplier === 1.2;

        if (esagonoAlCentro) {
          // Sposta la regione al centro
          let centerX = regioneEsagoni.reduce((sum, h) => sum + h.originalX, 0) / regioneEsagoni.length;
          let centerY = regioneEsagoni.reduce((sum, h) => sum + h.originalY, 0) / regioneEsagoni.length;
          
          regioneEsagoni.forEach(hex => {
            let offsetX = hex.originalX - centerX;
            let offsetY = hex.originalY - centerY;
            hex.targetX = width * 0.5 + offsetX * 1.2;
            hex.targetY = height * 0.5 + offsetY * 1.2;
            hex.scaleMultiplier = 1.2;
          });

          // Sposta l'Italia a sinistra
          esagoni.filter(e => e.regione !== regioneSelezionata).forEach(hex => {
            hex.targetX = hex.originalX * 0.3 + width * 0.1;
            hex.targetY = hex.originalY * 0.3 + height * 0.35;
            hex.scaleMultiplier = 0.3;
          });
        } else {
          // Sposta l'esagono al centro e la regione a sinistra
          regioneEsagoni.forEach(hex => {
            if (hex === esagono) {
              hex.targetX = width * 0.5;
              hex.targetY = height * 0.5;
              hex.scaleMultiplier = 1.2;
            } else {
              hex.targetX = hex.originalX * 0.3 + width * 0.1;
              hex.targetY = hex.originalY * 0.3 + height * 0.35;
              hex.scaleMultiplier = 0.3;
            }
          });

          // Sposta l'Italia fuori dallo schermo
          esagoni.filter(e => e.regione !== regioneSelezionata).forEach(hex => {
            hex.targetX = -width * 0.5;
            hex.targetY = hex.originalY * 0.3 + height * 0.35;
            hex.scaleMultiplier = 0.3;
          });
        }
      } else {
        // Seleziona nuova regione
        regioneSelezionata = esagono.regione;
        testoRegione = "";
        indiceTestoCorrente = 0;
        italiaRimpicciolita = true;
        
        // Calcola il centro della regione selezionata
        let regioneEsagoni = esagoni.filter(e => e.regione === regioneSelezionata);
        let centerX = regioneEsagoni.reduce((sum, hex) => sum + hex.originalX, 0) / regioneEsagoni.length;
        let centerY = regioneEsagoni.reduce((sum, hex) => sum + hex.originalY, 0) / regioneEsagoni.length;
        
        // Sposta e scala la regione selezionata
        regioneEsagoni.forEach(hex => {
          let offsetX = hex.originalX - centerX;
          let offsetY = hex.originalY - centerY;
          hex.targetX = width * 0.5 + offsetX * 1.2;
          hex.targetY = height/2 + offsetY * 1.2;
          hex.scaleMultiplier = 1.2;
        });
        
        // Sposta l'Italia rimpicciolita a sinistra
        esagoni.filter(e => e.regione !== regioneSelezionata).forEach(hex => {
          hex.targetX = hex.originalX * 0.3 + width * 0.1;
          hex.targetY = hex.originalY * 0.3 + height * 0.35;
          hex.scaleMultiplier = 0.3;
        });
      }
      return;
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