let tabella;
let esagoni = [];
let regioneHover = null;
let regioneSelezionata = null;
let testoRegione = "";
let indiceTestoCorrente = 0;
let ultimoCarattereAggiunto = 0;
let velocitaScrittura = 50; // millisecondi tra ogni carattere
let italiaRimpicciolita = false;

// Oggetto per memorizzare le informazioni geometriche di ogni regione
let infoRegioni = {};

// Oggetto per memorizzare i testi delle regioni
const testiRegioni = {
  "Lombardia": "La Lombardia è una delle regioni più popolose d'Italia, con una ricca storia industriale e culturale. Il suo capoluogo, Milano, è considerato il centro economico e finanziario del paese. La regione vanta una varietà di paesaggi che spaziano dalle Alpi ai laghi, fino alla pianura padana.",
  // Aggiungi altri testi per le altre regioni...
};

let bounds, scaledWidth;

function preload() {
  tabella = loadTable('/database/coordinate.csv', 'csv', 'header', () => {
    console.log('Caricamento completato');
  }, (error) => {
    console.error('Errore nel caricamento:', error);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Sposta i calcoli delle coordinate in una funzione separata
  calcolaParametriMappa();
  
  // Ottimizza la creazione degli esagoni
  creaEsagoni();
}

function calcolaParametriMappa() {
  bounds = trovaCoordinateEstreme();
  
  let mappaWidth = bounds.maxX - bounds.minX;
  let mappaHeight = bounds.maxY - bounds.minY;
  let aspectRatio = mappaWidth / mappaHeight;
  
  marginHeight = height * 0.8;
  scaleFactor = marginHeight / mappaHeight;
  scaledWidth = marginHeight * aspectRatio;
  
  offsetX = (width - scaledWidth) / 2;
  offsetY = height * 0.1;
  
  raggio = marginHeight / 45;
}

function trovaCoordinateEstreme() {
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
  
  return {
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY
  };
}

function creaEsagoni() {
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
    let x = parseFloat(riga.get('x').replace(',', '.'));
    let y = parseFloat(riga.get('y').replace(',', '.'));
    let sovraffollamento = parseFloat(riga.get('sovraffollamento'));
    let regione = riga.get('regione');
    
    let mappedX = map(x, bounds.minX, bounds.maxX, offsetX, offsetX + scaledWidth);
    let mappedY = map(y, bounds.minY, bounds.maxY, offsetY, offsetY + marginHeight);
    
    let colore = lerpColor(color("green"), color("yellow"), 
      (sovraffollamento - minSovraffollamento) / (maxSovraffollamento - minSovraffollamento));
    colore = lerpColor(colore, color("red"), 
      (sovraffollamento - minSovraffollamento) / (maxSovraffollamento - minSovraffollamento));
    
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
  let hexagoniFuoriHover = [];
  let esagoniInHover = [];
  
  if (regioneSelezionata) {
    // Se una regione è selezionata, controlla l'hover sull'Italia rimpicciolita come un tutt'uno
    let italiaHover = false;
    for (let esagono of esagoni) {
      if (esagono.regione !== regioneSelezionata) {
        let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
        if (distanza < esagono.raggio * 1.5) {
          italiaHover = true;
          break;
        }
      }
    }
    
    // Se il mouse è sopra l'Italia rimpicciolita, evidenzia tutta l'Italia
    if (italiaHover) {
      nuovaRegioneHover = "italia_rimpicciolita";
    } else {
      // Controlla hover sui singoli esagoni della regione selezionata
      for (let esagono of esagoni) {
        if (esagono.regione === regioneSelezionata) {
          let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
          if (distanza < esagono.raggio * 1.5) {
            nuovaRegioneHover = esagono;
            break;
          }
        }
      }
    }
  } else {
    // Comportamento normale quando nessuna regione è selezionata
    for (let esagono of esagoni) {
      let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
      if (distanza < esagono.raggio * 1.5) {
        nuovaRegioneHover = esagono.regione;
        break;
      }
    }
  }
  
  if (nuovaRegioneHover !== regioneHover) {
    regioneHover = nuovaRegioneHover;
  }
  
  // Aggiorna lo stato degli esagoni
  for (let esagono of esagoni) {
    esagono.x = lerp(esagono.x, esagono.targetX, 0.1);
    esagono.y = lerp(esagono.y, esagono.targetY, 0.1);
    
    let targetHoverState = 0;
    if (regioneSelezionata) {
      if (regioneHover === "italia_rimpicciolita") {
        // Evidenzia tutta l'Italia rimpicciolita
        targetHoverState = (esagono.regione !== regioneSelezionata) ? 1 : 0;
      } else {
        // Evidenzia solo l'esagono specifico della regione selezionata
        targetHoverState = (regioneHover === esagono) ? 1 : 0;
      }
    } else {
      // Comportamento normale
      targetHoverState = esagono.regione === regioneHover ? 1 : 0;
    }
    
    esagono.hoverState = lerp(esagono.hoverState, targetHoverState, 0.2);
    
    // Gestisci l'opacità
    let targetOpacita = 255;
    if (regioneSelezionata) {
      targetOpacita = esagono.regione === regioneSelezionata ? 255 : 30;
      if (regioneHover === "italia_rimpicciolita" && esagono.regione !== regioneSelezionata) {
        targetOpacita = 255;
      }
    }
    
    esagono.opacita = lerp(esagono.opacita, targetOpacita, 0.1);
    
    // Organizza gli esagoni per il rendering
    if ((regioneSelezionata && ((regioneHover === "italia_rimpicciolita" && esagono.regione !== regioneSelezionata) || 
        (regioneHover === esagono))) || 
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
  if (regioneSelezionata) {
    // Controlla se l'Italia rimpicciolita è stata cliccata
    let italiaCliccata = false;
    for (let esagono of esagoni) {
      if (esagono.regione !== regioneSelezionata) {
        let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
        if (distanza < esagono.raggio * 1.5) {
          italiaCliccata = true;
          break;
        }
      }
    }
    
    if (italiaCliccata) {
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
    
    // Gestisci il clic sui singoli esagoni della regione selezionata
    for (let esagono of esagoni) {
      if (esagono.regione === regioneSelezionata) {
        let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
        if (distanza < esagono.raggio * 1.5) {
          console.log(`Esagono cliccato nella regione: ${esagono.regione}`);
          return;
        }
      }
    }
  }
  
  // Comportamento normale quando nessuna regione è selezionata
  for (let esagono of esagoni) {
    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
    if (distanza < esagono.raggio * 1.5) {
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
        
        // Posiziona la regione selezionata al centro dello schermo
        hex.targetX = width * 0.5 + offsetX * 1.2;  // Scala meno per avvicinare gli esagoni
        hex.targetY = height/2 + offsetY * 1.2;     // Scala meno per avvicinare gli esagoni
        hex.scaleMultiplier = 1.2;                  // Scala meno per avvicinare gli esagoni
      });
      
      // Sposta l'Italia rimpicciolita a sinistra
      esagoni.filter(e => e.regione !== regioneSelezionata).forEach(hex => {
        hex.targetX = hex.originalX * 0.3 + width * 0.1;  // Posiziona a 1/3 dello schermo verso sinistra
        hex.targetY = hex.originalY * 0.3 + height * 0.35;
        hex.scaleMultiplier = 0.3;                        // Rimpicciolisci ulteriormente
      });
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