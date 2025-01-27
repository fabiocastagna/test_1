class Legenda {
    constructor(font) {
        // Definiamo il testo comune che appare in tutte le fasi
        this.testoComune = [
            "",
            "Il colore degli esagoni indica",
            "progressivamente il livello",
            "di sovraffollamento del carcere.",
        ];

        // Definiamo i testi specifici per ogni fase
        this.testiPerFase = {
            italia: [
                "Questa è la situazione delle",
                "carceri nel nostro paese.",
                "Passando il mouse sopra gli esagoni e",
                "cliccando potrai vedere più informazioni."
            ]
        };

        this.faseCorrente = 'italia';
        this.testo = [...this.testiPerFase[this.faseCorrente], ...this.testoComune];
        // Separiamo il testo degli esagoni
        this.testoEsagoni = [
            "Grave sovraffollamento",
            "Nei limiti normativi"
        ];
        this.testoCorrente = [];
        this.rigaCorrente = 0;
        this.indice = 0;
        // Aggiungiamo variabili separate per il testo degli esagoni
        this.testoEsagoniCorrente = ["", ""];
        this.rigaEsagoniCorrente = 0;
        this.indiceEsagoni = 0;
        this.velocitaScrittura = 10;
        this.ultimoAggiornamento = 0;
        this.font = font;
        this.altezzaRiga = 20;
        this.esagoni = [
            new Esagono(width / 12, height - 150, 15, "regione1", color("red"), "1"),
            new Esagono(width / 12, height - 100, 15, "regione2", color("white"), "2")
        ];
        
        // Configuro il secondo esagono per mostrare l'ellisse bianca
        this.esagoni[1].sovraffollamento = 150;
        this.esagoni[1].attivaAnimazione();

        // Imposto il bordo bianco per entrambi gli esagoni
        this.esagoni.forEach(esagono => {
            esagono.hoverState = 1;
        });

        // Variabili per le animazioni
        this.opacitaPrimoEsagono = 0;
        this.opacitaSecondoEsagono = 0;
        this.lunghezzaLinea = 0;
        this.inizioAnimazione = 0;
        this.durataFadeIn = 1000; // 1 secondo per il fade in
        this.durataLinea = 1000; // 1 secondo per la linea
        this.animazionePartita = false;
    }

    disegna() {
        push();
        fill(255);
        noStroke();
        textFont(this.font);
        textSize(16);
        textAlign(LEFT, CENTER);

        // Disegna i primi 4 testi nella posizione originale
        for (let i = 0; i < this.testoCorrente.length; i++) {
            text(this.testoCorrente[i], width / 13, height - 270 + (i - 4) * this.altezzaRiga);
        }

        // Disegna gli esagoni solo quando tutto il testo principale è stato scritto
        if (this.rigaCorrente >= this.testo.length) {
            if (!this.animazionePartita) {
                this.inizioAnimazione = millis();
                this.animazionePartita = true;
            }

            let tempoTrascorso = millis() - this.inizioAnimazione;
            
            // Animazione primo esagono
            this.opacitaPrimoEsagono = min(255, map(tempoTrascorso, 0, this.durataFadeIn, 0, 255));
            
            // Animazione linea
            if (tempoTrascorso > this.durataFadeIn) {
                let tempoLinea = tempoTrascorso - this.durataFadeIn;
                this.lunghezzaLinea = min(50, map(tempoLinea, 0, this.durataLinea, 0, 50));
                
                // Animazione secondo esagono (parte a metà dell'animazione della linea)
                if (tempoLinea > this.durataLinea/2) {
                    this.opacitaSecondoEsagono = min(255, map(tempoLinea - this.durataLinea/2, 0, this.durataFadeIn, 0, 255));
                }
            }

            // Disegna la linea con animazione
            if (this.lunghezzaLinea > 0) {
                stroke(255);
                strokeWeight(3);
                line(width / 12, height - 150, width / 12, height - 150 + this.lunghezzaLinea);
                noStroke(); // Resettiamo lo stroke dopo aver disegnato la linea
            }

            // Disegna gli esagoni con le rispettive opacità
            if (this.opacitaPrimoEsagono > 0) {
                this.esagoni[0].opacita = this.opacitaPrimoEsagono;
                this.esagoni[0].disegna();
                fill(255);
                text(this.testoEsagoniCorrente[0], width / 12 + 35, height - 150);
            }
            
            if (this.opacitaSecondoEsagono > 0) {
                this.esagoni[1].opacita = this.opacitaSecondoEsagono;
                this.esagoni[1].disegna();
                fill(255);
                text(this.testoEsagoniCorrente[1], width / 12 + 35, height - 100);
            }
        }
        
        pop();

        // Aggiorna il testo principale
        if (millis() - this.ultimoAggiornamento > this.velocitaScrittura) {
            if (this.rigaCorrente < this.testo.length) {
                if (this.indice === 0) {
                    this.testoCorrente.push("");
                }
                
                if (this.indice < this.testo[this.rigaCorrente].length) {
                    this.testoCorrente[this.rigaCorrente] += this.testo[this.rigaCorrente].charAt(this.indice);
                    this.indice++;
                } else {
                    this.rigaCorrente++;
                    this.indice = 0;
                }
                this.ultimoAggiornamento = millis();
            }
            // Aggiorna il testo degli esagoni dopo che il testo principale è completo
            else if (this.rigaEsagoniCorrente < this.testoEsagoni.length) {
                // Controlla se è il momento di iniziare a scrivere il secondo testo
                if (this.rigaEsagoniCorrente === 1 && 
                    millis() - this.inizioAnimazione <= this.durataFadeIn + this.durataLinea/2) {
                    return;
                }
                
                if (this.indiceEsagoni < this.testoEsagoni[this.rigaEsagoniCorrente].length) {
                    this.testoEsagoniCorrente[this.rigaEsagoniCorrente] += 
                        this.testoEsagoni[this.rigaEsagoniCorrente].charAt(this.indiceEsagoni);
                    this.indiceEsagoni++;
                } else {
                    this.rigaEsagoniCorrente++;
                    this.indiceEsagoni = 0;
                }
                this.ultimoAggiornamento = millis();
            }
        }
    }

    reset() {
        this.testoCorrente = [];
        this.testoEsagoniCorrente = ["", ""];
        this.rigaCorrente = 0;
        this.rigaEsagoniCorrente = 0;
        this.indice = 0;
        this.indiceEsagoni = 0;
        this.opacitaPrimoEsagono = 0;
        this.opacitaSecondoEsagono = 0;
        this.lunghezzaLinea = 0;
        this.animazionePartita = false;
    }

    cambiaFase(nuovaFase) {
        if (this.faseCorrente !== nuovaFase) {
            this.faseCorrente = nuovaFase;
            this.testo = [...this.testiPerFase[nuovaFase], ...this.testoComune];
            this.reset();
        }
    }
}
