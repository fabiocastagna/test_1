class GestoreTestoBase {
    constructor(gestoreAnimazioni) {
        this.gestoreAnimazioni = gestoreAnimazioni;
        this.stato = {
            testo: "",
            precedente: null,
            inCancellazione: false,
            ultimaCancellazione: 0
        };
        this.testoCorrente = "";
        this.velocitaCancellazione = 20;
    }

    reset() {
        this.stato.inCancellazione = true;
        this.stato.ultimaCancellazione = millis();
    }

    cancellaTesto() {
        if (this.stato.inCancellazione) {
            let tempoCorrente = millis();
            if (tempoCorrente - this.stato.ultimaCancellazione > this.velocitaCancellazione) {
                this.testoCorrente = this.testoCorrente.slice(0, -1);
                if (this.testoCorrente.length === 0) {
                    this.stato.testo = "";
                    this.stato.precedente = null;
                    this.stato.inCancellazione = false;
                }
                this.stato.ultimaCancellazione = tempoCorrente;
            }
        }
        return this.testoCorrente;
    }

    aggiornaTesto(testoNuovo) {
        if (testoNuovo === "") {
            this.stato.inCancellazione = true;
            return this.cancellaTesto();
        }

        if (this.stato.inCancellazione) {
            return this.cancellaTesto();
        }

        this.testoCorrente = this.gestoreAnimazioni.animaTesto(this.testoCorrente, testoNuovo);
        return this.testoCorrente;
    }
}

class GestoreTestoRegione extends GestoreTestoBase {
    aggiorna(regioneSelezionata) {
        if (!regioneSelezionata) {
            return this.aggiornaTesto("");
        }

        if (regioneSelezionata !== this.stato.precedente) {
            this.stato.precedente = regioneSelezionata;
            this.stato.testo = regioneSelezionata;
            this.testoCorrente = "";
        }

        return this.aggiornaTesto(this.stato.testo);
    }
}

class GestoreTestoCarcere extends GestoreTestoBase {
    constructor(gestoreAnimazioni, datiCarceri) {
        super(gestoreAnimazioni);
        this.datiCarceri = datiCarceri;
        this.esagonoCliccato = null;
    }

    aggiorna(regioneSelezionata, esagonoSelezionato) {
        // Se siamo nella vista esagono ingrandito
        if (esagonoSelezionato?.scaleMultiplier > 1.5) {
            this.esagonoCliccato = esagonoSelezionato;
        }
        
        // Se non c'è una regione selezionata o non c'è nessun esagono da mostrare
        if (!regioneSelezionata || (!esagonoSelezionato && !this.esagonoCliccato)) {
            if (this.stato.testo !== "") {
                this.stato.inCancellazione = true;
            }
            return this.aggiornaTesto("");
        }

        // Se siamo nella vista regione (non ingrandita)
        if (esagonoSelezionato?.scaleMultiplier <= 1.5 && this.esagonoCliccato?.scaleMultiplier <= 1.5) {
            this.esagonoCliccato = null;
            const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagonoSelezionato.id}`;
            const datiCarcere = this.datiCarceri.get(hexId);
            const nuovoTesto = datiCarcere ? datiCarcere.carcere : "";

            if (esagonoSelezionato !== this.stato.precedente) {
                if (this.stato.testo !== "" && nuovoTesto !== this.stato.testo) {
                    this.stato.inCancellazione = true;
                }
                this.stato.precedente = esagonoSelezionato;
                this.stato.testo = nuovoTesto;
            }

            return this.aggiornaTesto(this.stato.testo);
        }

        // Se siamo nella vista esagono ingrandito
        const esagonoDaUsare = this.esagonoCliccato || esagonoSelezionato;
        const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagonoDaUsare.id}`;
        const datiCarcere = this.datiCarceri.get(hexId);
        const nuovoTesto = datiCarcere ? datiCarcere.carcere : "";

        if (esagonoDaUsare !== this.stato.precedente) {
            if (this.stato.testo !== "" && nuovoTesto !== this.stato.testo) {
                this.stato.inCancellazione = true;
            }
            this.stato.precedente = esagonoDaUsare;
            this.stato.testo = nuovoTesto;
        }

        return this.aggiornaTesto(this.stato.testo);
    }

    reset() {
        super.reset();
        this.esagonoCliccato = null;
    }
}

class GestoreTestoSovraffollamento extends GestoreTestoBase {
    constructor(gestoreAnimazioni, datiCarceri) {
        super(gestoreAnimazioni);
        this.datiCarceri = datiCarceri;
        this.percentuale = 0;
        this.esagonoCliccato = null;
    }

    aggiorna(regioneSelezionata, esagonoSelezionato) {
        // Se siamo nella vista esagono ingrandito
        if (esagonoSelezionato?.scaleMultiplier > 1.5) {
            this.esagonoCliccato = esagonoSelezionato;
        }
        
        // Se non c'è una regione selezionata o non c'è nessun esagono ingrandito
        if (!regioneSelezionata || !this.esagonoCliccato) {
            if (this.stato.testo !== "") {
                this.stato.inCancellazione = true;
            }
            return this.aggiornaTesto("");
        }

        // Se siamo nella vista regione (non ingrandita)
        if (this.esagonoCliccato?.scaleMultiplier <= 1.5) {
            this.esagonoCliccato = null;
            return this.aggiornaTesto("");
        }

        // Se siamo nella vista esagono ingrandito
        const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${this.esagonoCliccato.id}`;
        const datiCarcere = this.datiCarceri.get(hexId);

        if (this.esagonoCliccato !== this.stato.precedente && datiCarcere) {
            this.stato.precedente = this.esagonoCliccato;
            this.percentuale = parseFloat(datiCarcere.sovraffollamento);
            this.stato.testo = `Tasso di sovraffollamento:\n${this.percentuale}%`;
            this.testoCorrente = "";
        }

        return this.aggiornaTesto(this.stato.testo);
    }

    reset() {
        super.reset();
        this.esagonoCliccato = null;
    }

    getPercentuale() {
        return this.percentuale;
    }
}

class GestoreTesto {
    constructor(gestoreAnimazioni) {
        this.gestoreAnimazioni = gestoreAnimazioni;
        this.stato = {
            regione: {
                testo: "",
                precedente: null,
                cliccata: false,
                inCancellazione: false,
                ultimaCancellazione: 0
            },
            carcere: {
                testo: "",
                precedente: null,
                cliccato: false,
                ingrandito: false,
                inCancellazione: false,
                ultimaCancellazione: 0
            },
            sovraffollamento: {
                testo: "",
                precedente: null,
                inCancellazione: false,
                ultimaCancellazione: 0
            }
        };
        this.datiCarceri = new Map();
        this.esagoni = null;
        this.font = null;
        this.regioneSelezionata = null;
        this.esagonoSelezionato = null;
        
        this.gestoreRegione = new GestoreTestoRegione(gestoreAnimazioni);
        this.gestoreCarcere = new GestoreTestoCarcere(gestoreAnimazioni, this.datiCarceri);
        this.gestoreSovraffollamento = new GestoreTestoSovraffollamento(gestoreAnimazioni, this.datiCarceri);
        
        this.inizializza();
    }

    async inizializza() {
        await this.caricaFont();
        await this.caricaDatiCarceri();
    }

    async caricaFont() {
        try {
            this.font = await new Promise((resolve, reject) => {
                loadFont('FONT/AeionMono-SemiBold.ttf', 
                    font => resolve(font),
                    err => reject(err)
                );
            });
            console.log('Font caricato con successo');
        } catch (error) {
            console.error('Errore nel caricamento del font:', error);
        }
    }

    setEsagoni(esagoni) {
        this.esagoni = esagoni;
    }

    async caricaDatiCarceri() {
        try {
            const response = await fetch('Database/coordinate_test.csv');
            const csvText = await response.text();
            const righe = csvText.split('\n').slice(1); // Salta l'intestazione
            
            righe.forEach(riga => {
                if (!riga.trim()) return;
                
                const [
                    regione,
                    hexId,
                    x,
                    y,
                    carcere,
                    sovraffollamento
                ] = riga.split(',').map(val => val.trim());
                
                if (!this.datiCarceri.has(hexId)) {
                    this.datiCarceri.set(hexId, {
                        carcere,
                        regione,
                        x: parseFloat(x),
                        y: parseFloat(y),
                        sovraffollamento: parseFloat(sovraffollamento),
                        hexId
                    });
                }
            });
            
            console.log('Dati carceri caricati con successo');
        } catch (error) {
            console.error('Errore nel caricamento dei dati delle carceri:', error);
        }
    }

    resetStato() {
        this.gestoreRegione.reset();
        this.gestoreCarcere.reset();
        this.gestoreSovraffollamento.reset();
    }

    resetStatoRegione() {
        this.stato.regione.inCancellazione = true;
        this.stato.regione.ultimaCancellazione = millis();
    }

    resetStatoCompleto() {
        this.stato.regione.inCancellazione = true;
        this.stato.regione.ultimaCancellazione = millis();
        this.stato.carcere.inCancellazione = true;
        this.stato.carcere.ultimaCancellazione = millis();
        this.stato.sovraffollamento.inCancellazione = true;
        this.stato.sovraffollamento.ultimaCancellazione = millis();
    }

    aggiornaTesto(regioneSelezionata, esagonoSelezionato) {
        this.regioneSelezionata = regioneSelezionata;
        this.esagonoSelezionato = esagonoSelezionato;

        return {
            regione: this.gestoreRegione.aggiorna(regioneSelezionata),
            carcere: this.gestoreCarcere.aggiorna(regioneSelezionata, esagonoSelezionato),
            sovraffollamento: this.gestoreSovraffollamento.aggiorna(regioneSelezionata, esagonoSelezionato),
            percentualeSovraffollamento: this.gestoreSovraffollamento.getPercentuale()
        };
    }

    disegna() {
        if (!this.font) return;

        const testi = this.aggiornaTesto(this.regioneSelezionata, this.esagonoSelezionato);

        push();
        textFont(this.font);
        textAlign(LEFT, CENTER);
        
        const xPos = width * 0.75;
        const yPos = height * 0.5;
        
        // Disegna testo regione
        if (testi.regione) {
            textSize(32);
            fill(255);
            text(testi.regione, xPos, yPos);
        }
        
        // Disegna testo carcere
        if (testi.carcere) {
            textSize(24);
            fill(200);
            text(testi.carcere, xPos, yPos + 40);
        }
        
        // Disegna testo sovraffollamento
        if (testi.sovraffollamento) {
            const lines = testi.sovraffollamento.split('\n');
            
            textSize(20);
            fill(150);
            text(lines[0], xPos, yPos + 80);
            
            if (lines[1]) {
                textSize(72);
                const percentuale = testi.percentualeSovraffollamento;
                
                let colore;
                if (percentuale <= 100) {
                    colore = lerpColor(
                        color(CONFIGURAZIONE.colori.esagonoBase),
                        color(CONFIGURAZIONE.colori.esagonoMedio),
                        map(percentuale, 0, 100, 0, 1)
                    );
                } else if (percentuale <= 150) {
                    colore = lerpColor(
                        color(CONFIGURAZIONE.colori.esagonoMedio),
                        color(CONFIGURAZIONE.colori.esagonoAlto),
                        map(percentuale, 100, 150, 0, 1)
                    );
                } else {
                    colore = color(CONFIGURAZIONE.colori.esagonoAlto);
                }
                
                fill(colore);
                textAlign(CENTER, CENTER);
                text(lines[1], xPos + width * 0.1, yPos + 160);
                textAlign(LEFT, CENTER);
            }
        }
        
        pop();
    }
} 