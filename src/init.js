let gestoreMappa;
let gestoreAnimazioni;
let gestoreTesto;
let gestoreSvg;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    gestoreAnimazioni = new GestoreAnimazioni();
    gestoreMappa = new GestoreMappa();
    gestoreTesto = new GestoreTesto(gestoreAnimazioni);
    gestoreSvg = new GestoreSvg();
    
    // Carica i dati
    loadTable('Database/Data_Comp.csv', 'csv', 'header', (tabella) => {
        gestoreMappa.caricaDati(tabella);
    });
}

function draw() {
    background(0);
    gestoreMappa.aggiorna();
    // Disegna gli esagoni
    gestoreMappa.esagoni.forEach(esagono => esagono.disegna());
}

function mousePressed() {
    gestoreMappa.gestisciClick(mouseX, mouseY);
} 