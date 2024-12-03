const fs = require('fs');
const { DOMParser } = require('xmldom');

// Leggi il file HTML che contiene l'SVG
const svgContent = fs.readFileSync('Ita_Esa.html', 'utf8');
const parser = new DOMParser();
const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');

// Lista delle regioni italiane
const regioniItaliane = [
    'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
    'Friuli-Venezia-Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
    'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
    'Trentino-Alto_Adige', 'Umbria', 'Valle-d-Aosta', 'Veneto'
];

// Array per memorizzare tutti i centri degli esagoni
const hexagons = [];

// Funzione per calcolare il centro di un esagono
function calculateCenter(pointsStr) {
    // Dividi la stringa in coppie di numeri
    const numbers = pointsStr.trim().split(/\s+/).map(Number);
    const points = [];
    
    // Crea coppie di coordinate x,y
    for (let i = 0; i < numbers.length; i += 2) {
        points.push({
            x: numbers[i],
            y: numbers[i + 1]
        });
    }

    // Calcola la media delle coordinate x e y
    const sumX = points.reduce((sum, point) => sum + point.x, 0);
    const sumY = points.reduce((sum, point) => sum + point.y, 0);
    const count = points.length;

    return {
        x: (sumX / count).toFixed(2),
        y: (sumY / count).toFixed(2)
    };
}

// Elabora ogni regione
regioniItaliane.forEach(regione => {
    const regioneGroup = svgDoc.getElementById(regione);
    if (regioneGroup) {
        const polygons = regioneGroup.getElementsByTagName('polygon');
        
        for (let i = 0; i < polygons.length; i++) {
            const polygon = polygons[i];
            const points = polygon.getAttribute('points');
            
            if (points) {
                const center = calculateCenter(points);
                hexagons.push({
                    regione: regione,
                    id: `${regione}_hex_${i + 1}`,
                    x: center.x,
                    y: center.y
                });
            }
        }
    }
});

// Ordina gli esagoni per regione
hexagons.sort((a, b) => a.regione.localeCompare(b.regione));

// Crea il contenuto CSV con colonne separate per x e y
let csvContent = 'regione,hexagon_id,x,y\n';

hexagons.forEach(hexagon => {
    csvContent += `${hexagon.regione},${hexagon.id},${hexagon.x},${hexagon.y}\n`;
});

// Salva il file CSV
fs.writeFileSync('hexagon_centers.csv', csvContent);

console.log('Elaborazione completata. File hexagon_centers.csv creato.');
console.log(`Totale esagoni elaborati: ${hexagons.length}`);
console.log('Regioni trovate:', [...new Set(hexagons.map(h => h.regione))].join(', '));
