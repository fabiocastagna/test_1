let tabella; // Variabile per memorizzare la tabella dei dati
let esagoni = []; // Array per memorizzare gli esagoni
let coloriRegioni = {}; // Oggetto per memorizzare i colori delle regioni
let regioneHover = null; // Variabile per tenere traccia della regione sotto il cursore

function preload() {
  // Carica la tabella da un file CSV
  tabella = loadTable('/database/coordinate.csv', 'csv', 'header', () => {
    console.log('Caricamento completato'); // Messaggio di conferma al caricamento
  }, (error) => {
    console.error('Errore nel caricamento:', error); // Messaggio di errore se il caricamento fallisce
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Crea un canvas delle dimensioni della finestra
  
  let margineFactor = 0.6; // Fattore per il margine
  let scaleFactor = min(width, height) / 1000 * margineFactor; // Calcola il fattore di scala in base alle dimensioni del canvas
  
  let distanza = min(width, height) / 20; // Calcola la distanza tra gli esagoni
  let raggio = distanza / sqrt(10); // Calcola il raggio degli esagoni
  
  let regioni = new Set(tabella.getColumn('regione')); // Crea un insieme delle regioni uniche dalla tabella
  for (let regione of regioni) {
    // Assegna un colore casuale a ciascuna regione
    coloriRegioni[regione] = color(random(255), random(255), random(255));
  }
  
  let centerX = 0, centerY = 0; // Inizializza le coordinate centrali
  let numEsagoni = tabella.rows.length; // Ottiene il numero di esagoni dalla tabella
  
  let sovraffollamenti = tabella.getColumn('sovraffollamento').map(Number); // Estrae e converte i dati di sovraffollamento in numeri
  let maxSovraffollamento = Math.max(...sovraffollamenti); // Trova il massimo sovraffollamento
  let minSovraffollamento = Math.min(...sovraffollamenti); // Trova il minimo sovraffollamento
  
  for (let riga of tabella.rows) {
    // Calcola le coordinate medie degli esagoni
    let x = parseFloat(riga.get('x').replace(',', '.')) * scaleFactor; // Estrae e scala la coordinata x
    let y = parseFloat(riga.get('y').replace(',', '.')) * scaleFactor; // Estrae e scala la coordinata y
    
    centerX += x; // Somma le coordinate x
    centerY += y; // Somma le coordinate y
  }
  
  centerX /= numEsagoni; // Calcola la media delle coordinate x
  centerY /= numEsagoni; // Calcola la media delle coordinate y
  
  esagoni = []; // Resetta l'array degli esagoni
  
  for (let riga of tabella.rows) {
    // Crea gli esagoni in base ai dati della tabella
    let x = parseFloat(riga.get('x').replace(',', '.')) * scaleFactor; // Estrae e scala la coordinata x
    let y = parseFloat(riga.get('y').replace(',', '.')) * scaleFactor; // Estrae e scala la coordinata y
    let sovraffollamento = parseFloat(riga.get('sovraffollamento')); // Estrae il sovraffollamento
    
    // Calcola il colore in base al sovraffollamento
    let colore = lerpColor(color("green"), color("yellow"), (sovraffollamento - minSovraffollamento) / (maxSovraffollamento - minSovraffollamento)); // Modificato per la sfumatura
    colore = lerpColor(colore, color("red"), (sovraffollamento - minSovraffollamento) / (maxSovraffollamento - minSovraffollamento)); // Aggiunta la transizione verso il verde
    
    // Aggiunge l'esagono all'array con le sue proprietà
    esagoni.push({ 
      x: map(x - centerX, -width/2, width/2, width * 0.1, width * 0.9), // Mappa la coordinata x
      y: map(y - centerY, -height/2, height/2, height * 0.1, height * 0.9), // Mappa la coordinata y
      rotazione: HALF_PI, // Imposta la rotazione iniziale
      regione: riga.get('regione'), // Assegna la regione
      raggio: raggio, // Assegna il raggio
      colore: colore, // Assegna il colore
      opacita: 255, // Set initial opacity to full
      hoverState: 0 // Aggiunge lo stato di hover
    });
  }
}

function draw() {
  background("black"); // Imposta lo sfondo a nero
  
  let nuovaRegioneHover = null; // Variabile temporanea per la nuova regione hover
  
  for (let esagono of esagoni) {
    // Controlla se il cursore è sopra un esagono
    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y); // Calcola la distanza tra il cursore e l'esagono
    if (distanza < esagono.raggio * 1.5) { // Se il cursore è vicino all'esagono
      nuovaRegioneHover = esagono.regione; // Imposta la nuova regione hover
      break; // Esci dal ciclo
    }
  }
  
  // Aggiorna la regione hover
  if (nuovaRegioneHover !== regioneHover) {
    regioneHover = nuovaRegioneHover;
  }
  
  for (let esagono of esagoni) {
    // Update hover state
    let targetHoverState = esagono.regione === regioneHover ? 1 : 0;
    esagono.hoverState = lerp(esagono.hoverState, targetHoverState, 0.1);
    
    // Update opacity
    let targetOpacita = esagono.regione === regioneHover ? 255 : (regioneHover ? 100 : 255);
    esagono.opacita = lerp(esagono.opacita, targetOpacita, 0.1);
    
    // Draw hexagon
    disegnaEsagono(
      esagono.x,
      esagono.y,
      esagono.raggio,
      esagono.rotazione,
      esagono.colore,
      esagono.hoverState,
      esagono.opacita
    );
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

