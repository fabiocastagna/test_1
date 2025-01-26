const CONFIGURAZIONE = {
    colori: {
      sfondo: "black",
      esagonoBase: "white",
      esagonoMedio: "yellow",
      esagonoAlto: "red"
    },
    margini: {
      verticale: 0.8,  // 80% dell'altezza
      orizzontale: 0.1 // 10% dai lati
    },
    animazioni: {
        velocita: {
            base: 0.05,      // Velocità base delle animazioni
            testo: 50,       // Velocità animazione testo (millisecondi)
            scala: 0.05,     // Velocità animazione scala
            fluidita: 0.05,  // Fluidità delle animazioni
            cancellazione: 20 // Velocità cancellazione testo
        },
        durata: {
            transizione: 500,    // Durata transizioni generiche
            ingrandimento: 500,  // Durata animazione ingrandimento
            uscita: 1000        // Durata animazione uscita
        },
        easing: 0.1  // Valore di easing per le interpolazioni
    },
    layout: {
        offset: {
            italia: {
                x: 0.25,    // 10% della larghezza (spostamento a sinistra)
                y: 0.35    // 35% dell'altezza
            },
            regione: {
                x: 0.25    // 25% della larghezza
            }
        },
        scala: {
            piccola: 0.3,      // Scala per elementi piccoli
            piuPiccola: 0.6,   // Scala intermedia
            normale: 1.2,      // Scala normale
            grande: 20.0,      // Scala massima
            punto: 0.01        // Scala minima
        }
    },
    dimensioni: {
        esagono: {
            raggioBase: 45,    // Il raggio base verrà diviso per questo valore
            hitbox: 1.5        // Moltiplicatore per l'area cliccabile
        },
        bottone: {
            larghezza: 140,
            altezza: 45
        }
    },
    svg: {
        proporzioni: {
            larghezza: 2.85,   // Moltiplicatore larghezza SVG
            rapporto: 595.28 / 841.89  // Rapporto altezza/larghezza SVG
        }
    },
    testi: {
        intro: {
            riga1: "In Italia ci sono 189 carceri",
            riga2: "x di questi sono sovraffollati"
        }
    }
}; 