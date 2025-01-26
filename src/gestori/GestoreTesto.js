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
        this.testoCorrente = {
            regione: "",
            carcere: "",
            sovraffollamento: ""
        };
        this.velocitaCancellazione = 20;
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
        this.stato.regione.inCancellazione = true;
        this.stato.regione.ultimaCancellazione = millis();
        this.stato.carcere.inCancellazione = true;
        this.stato.carcere.ultimaCancellazione = millis();
        this.stato.sovraffollamento.inCancellazione = true;
        this.stato.sovraffollamento.ultimaCancellazione = millis();
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

    // Funzione per gestire la cancellazione del testo
    cancellaTesto(stato, testoCorrente, velocitaCancellazione) {
        if (stato.testo && !stato.inCancellazione) {
            stato.inCancellazione = true;
            stato.ultimaCancellazione = millis();
        }
        
        if (stato.inCancellazione) {
            let tempoCorrente = millis();
            if (tempoCorrente - stato.ultimaCancellazione > velocitaCancellazione) {
                testoCorrente = testoCorrente.slice(0, -1);
                if (testoCorrente.length === 0) {
                    stato.testo = "";
                    stato.precedente = null;
                    stato.inCancellazione = false;
                }
                stato.ultimaCancellazione = tempoCorrente;
            }
        }
        return testoCorrente;
    }

    // Funzione per aggiornare il testo di una sezione
    aggiornaTestoSezione(stato, testoCorrente, testoNuovo, gestoreAnimazioni) {
        if (!stato.inCancellazione) {
            testoCorrente = gestoreAnimazioni.animaTesto(testoCorrente, testoNuovo);
        } else {
            testoCorrente = this.cancellaTesto(stato, testoCorrente, this.velocitaCancellazione);
        }
        return testoCorrente;
    }

    // Modifica delle funzioni esistenti per utilizzare le nuove funzioni
    aggiornaTestoRegione(regioneSelezionata) {
        if (!regioneSelezionata) {
            this.testoCorrente.regione = this.cancellaTesto(this.stato.regione, this.testoCorrente.regione, this.velocitaCancellazione);
            return;
        }

        if (regioneSelezionata !== this.stato.regione.precedente) {
            this.stato.regione.testo = regioneSelezionata;
            this.stato.regione.precedente = regioneSelezionata;
            this.testoCorrente.regione = "";
        }

        this.testoCorrente.regione = this.aggiornaTestoSezione(this.stato.regione, this.testoCorrente.regione, this.stato.regione.testo, this.gestoreAnimazioni);
    }

    aggiornaTestoCarcere(regioneSelezionata, esagonoSelezionato) {
        if (esagonoSelezionato?.scaleMultiplier > 1.5) {
            return;
        }

        if (!this.datiCarceri || !this.esagoni || !esagonoSelezionato) {
            this.testoCorrente.carcere = this.cancellaTesto(this.stato.carcere, this.testoCorrente.carcere, this.velocitaCancellazione);
            return;
        }

        const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagonoSelezionato.id}`;
        const datiCarcere = this.datiCarceri.get(hexId);

        if (esagonoSelezionato !== this.stato.carcere.precedente && datiCarcere) {
            this.stato.carcere.testo = datiCarcere.carcere;
            this.stato.carcere.precedente = esagonoSelezionato;
            this.testoCorrente.carcere = "";
        }

        this.testoCorrente.carcere = this.aggiornaTestoSezione(this.stato.carcere, this.testoCorrente.carcere, this.stato.carcere.testo, this.gestoreAnimazioni);
    }

    aggiornaTestoSovraffollamento(regioneSelezionata, esagonoSelezionato) {
        if (!this.datiCarceri || !this.esagoni || !esagonoSelezionato) {
            this.testoCorrente.sovraffollamento = this.cancellaTesto(this.stato.sovraffollamento, this.testoCorrente.sovraffollamento, this.velocitaCancellazione);
            return;
        }

        const esagonoIngrandito = esagonoSelezionato.scaleMultiplier > 1.5;

        if (!esagonoIngrandito) {
            this.testoCorrente.sovraffollamento = this.cancellaTesto(this.stato.sovraffollamento, this.testoCorrente.sovraffollamento, this.velocitaCancellazione);
            return;
        }

        const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagonoSelezionato.id}`;
        const datiCarcere = this.datiCarceri.get(hexId);

        if (datiCarcere && esagonoSelezionato !== this.stato.sovraffollamento.precedente) {
            const percentuale = parseFloat(datiCarcere.sovraffollamento);
            this.stato.sovraffollamento.testo = `Tasso di sovraffollamento:\n${percentuale}%`;
            this.stato.sovraffollamento.precedente = esagonoSelezionato;
            this.stato.sovraffollamento.percentuale = percentuale;
            this.testoCorrente.sovraffollamento = "";
        }

        this.testoCorrente.sovraffollamento = this.aggiornaTestoSezione(this.stato.sovraffollamento, this.testoCorrente.sovraffollamento, this.stato.sovraffollamento.testo, this.gestoreAnimazioni);
    }

    aggiornaTesto(regioneSelezionata, esagonoSelezionato) {
        this.aggiornaTestoRegione(regioneSelezionata);
        this.aggiornaTestoCarcere(regioneSelezionata, esagonoSelezionato);
        this.aggiornaTestoSovraffollamento(regioneSelezionata, esagonoSelezionato);
    }

    disegna() {
        if (!this.font) return;

        push();
        textFont(this.font);
        textAlign(LEFT, CENTER);
        
        const xPos = width * 0.75;
        const yPos = height * 0.5;
        
        textSize(32);
        fill(255);
        text(this.testoCorrente.regione || this.stato.regione.testo, xPos, yPos);
        
        if (this.stato.carcere.testo) {
            textSize(24);
            fill(200);
            text(this.testoCorrente.carcere, xPos, yPos + 40);
        }
        
        if (this.stato.sovraffollamento.testo) {
            const lines = this.testoCorrente.sovraffollamento.split('\n');
            
            // Prima riga (testo)
            textSize(20);
            fill(150);
            text(lines[0], xPos, yPos + 80);
            
            // Seconda riga (percentuale)
            if (lines[1]) {
                textSize(72);
                const percentuale = parseFloat(lines[1]);
                
                // Calcolo del colore con gradiente
                let colore;
                if (percentuale <= 100) {
                    // Da bianco a giallo (0-100%)
                    colore = lerpColor(
                        color(CONFIGURAZIONE.colori.esagonoBase),
                        color(CONFIGURAZIONE.colori.esagonoMedio),
                        map(percentuale, 0, 100, 0, 1)
                    );
                } else if (percentuale <= 150) {
                    // Da giallo a rosso (100-150%)
                    colore = lerpColor(
                        color(CONFIGURAZIONE.colori.esagonoMedio),
                        color(CONFIGURAZIONE.colori.esagonoAlto),
                        map(percentuale, 100, 150, 0, 1)
                    );
                } else {
                    // Oltre 150% resta rosso
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