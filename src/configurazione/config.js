const CONFIGURAZIONE = {
    colori: {
      sfondo: "black",
      esagonoBase: "white",
      esagonoMedio: "yellow",
      esagonoAlto: "red"
    },
    margini: {
      verticale: 0.8,
      orizzontale: 0.1
    },
    animazioni: {
        velocita: {
            base: 0.05,      
            testo: 50,
            scala: 0.05,
            fluidita: 0.05,
            cancellazione: 20
        },
        durata: {
            transizione: 500,
            ingrandimento: 500,
            uscita: 1000
        },
        easing: 0.1
    },
    layout: {
        offset: {
            italia: {
                x: 0.25,
                y: 0.35
            },
            regione: {
                x: 0.25
            }
        },
        scala: {
            piccola: 0.3,
            piuPiccola: 0.6,
            normale: 1.2,
            grande: 20.0,
            punto: 0.01
        }
    },
    dimensioni: {
        esagono: {
            raggioBase: 45,
            hitbox: 1.5
        },
        bottone: {
            larghezza: 140,
            altezza: 45
        }
    },
    svg: {
        proporzioni: {
            larghezza: 2.85,
            rapporto: 595.28 / 841.89
        }
    },
    testi: {
        intro: {
            riga1: "In Italia ci sono 189 carceri",
            riga2: "187 sono sovraffollati"
        }
    }
}; 