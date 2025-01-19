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
            const response = await fetch('Database/Data_Comp.csv');
            const csvText = await response.text();
            const righe = csvText.split('\n').slice(1);
            
            righe.forEach(riga => {
                if (!riga.trim()) return;
                const [carcere, regione, , , , , , , , , , sovraffollamento, , , , , , , , , , , , , , , , hexId] = riga.split(',');
                
                if (!this.datiCarceri.has(hexId)) {
                    this.datiCarceri.set(hexId, { carcere, regione, sovraffollamento });
                }
            });
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

    aggiornaTestoRegione(regioneSelezionata) {
        if (!regioneSelezionata) {
            if (this.stato.regione.testo && !this.stato.regione.inCancellazione) {
                this.stato.regione.inCancellazione = true;
                this.stato.regione.ultimaCancellazione = millis();
            }
            
            if (this.stato.regione.inCancellazione) {
                let tempoCorrente = millis();
                if (tempoCorrente - this.stato.regione.ultimaCancellazione > this.velocitaCancellazione) {
                    this.testoCorrente.regione = this.testoCorrente.regione.slice(0, -1);
                    if (this.testoCorrente.regione.length === 0) {
                        this.stato.regione.testo = "";
                        this.stato.regione.precedente = null;
                        this.stato.regione.inCancellazione = false;
                    }
                    this.stato.regione.ultimaCancellazione = tempoCorrente;
                }
                return;
            }
            
            this.resetStato();
            return;
        }

        if (regioneSelezionata !== this.stato.regione.precedente) {
            if (this.stato.regione.testo && !this.stato.regione.inCancellazione) {
                this.stato.regione.inCancellazione = true;
                this.stato.regione.ultimaCancellazione = millis();
                return;
            }
            
            if (!this.stato.regione.inCancellazione) {
                this.stato.regione.testo = regioneSelezionata;
                this.stato.regione.precedente = regioneSelezionata;
                this.testoCorrente.regione = "";
            }
        }

        if (!this.stato.regione.inCancellazione) {
            this.testoCorrente.regione = this.gestoreAnimazioni.animaTesto(
                this.testoCorrente.regione,
                this.stato.regione.testo
            );
        } else {
            let tempoCorrente = millis();
            if (tempoCorrente - this.stato.regione.ultimaCancellazione > this.velocitaCancellazione) {
                this.testoCorrente.regione = this.testoCorrente.regione.slice(0, -1);
                if (this.testoCorrente.regione.length === 0) {
                    this.stato.regione.inCancellazione = false;
                    this.stato.regione.testo = regioneSelezionata;
                    this.stato.regione.precedente = regioneSelezionata;
                }
                this.stato.regione.ultimaCancellazione = tempoCorrente;
            }
        }
    }

    aggiornaTestoCarcere(regioneSelezionata, esagonoSelezionato) {
        // Se l'esagono è ingrandito al centro, non aggiornare il testo in hover
        if (esagonoSelezionato?.scaleMultiplier > 15) {
            return;
        }

        if (!this.datiCarceri || !this.esagoni || !esagonoSelezionato) {
            if (this.stato.carcere.testo && !this.stato.carcere.inCancellazione) {
                this.stato.carcere.inCancellazione = true;
                this.stato.carcere.ultimaCancellazione = millis();
            }
            
            if (this.stato.carcere.inCancellazione) {
                let tempoCorrente = millis();
                if (tempoCorrente - this.stato.carcere.ultimaCancellazione > this.velocitaCancellazione) {
                    this.testoCorrente.carcere = this.testoCorrente.carcere.slice(0, -1);
                    if (this.testoCorrente.carcere.length === 0) {
                        this.stato.carcere.testo = "";
                        this.stato.carcere.precedente = null;
                        this.stato.carcere.inCancellazione = false;
                    }
                    this.stato.carcere.ultimaCancellazione = tempoCorrente;
                }
                return;
            }
            
            this.stato.carcere.testo = "";
            this.stato.carcere.precedente = null;
            this.testoCorrente.carcere = "";
            return;
        }

        const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagonoSelezionato.id}`;
        const datiCarcere = this.datiCarceri.get(hexId);

        if (esagonoSelezionato !== this.stato.carcere.precedente && 
            !this.stato.carcere.cliccato && 
            !this.stato.carcere.ingrandito && 
            datiCarcere) {
            
            if (this.stato.carcere.testo && !this.stato.carcere.inCancellazione) {
                this.stato.carcere.inCancellazione = true;
                this.stato.carcere.ultimaCancellazione = millis();
                return;
            }
            
            if (!this.stato.carcere.inCancellazione) {
                this.stato.carcere.testo = datiCarcere.carcere;
                this.stato.carcere.precedente = esagonoSelezionato;
                this.testoCorrente.carcere = "";
            }
        }

        if (!this.stato.carcere.inCancellazione) {
            this.testoCorrente.carcere = this.gestoreAnimazioni.animaTesto(
                this.testoCorrente.carcere,
                this.stato.carcere.testo
            );
        } else {
            let tempoCorrente = millis();
            if (tempoCorrente - this.stato.carcere.ultimaCancellazione > this.velocitaCancellazione) {
                this.testoCorrente.carcere = this.testoCorrente.carcere.slice(0, -1);
                if (this.testoCorrente.carcere.length === 0) {
                    this.stato.carcere.inCancellazione = false;
                    if (datiCarcere) {
                        this.stato.carcere.testo = datiCarcere.carcere;
                        this.stato.carcere.precedente = esagonoSelezionato;
                    }
                }
                this.stato.carcere.ultimaCancellazione = tempoCorrente;
            }
        }
    }

    aggiornaTestoSovraffollamento(regioneSelezionata, esagonoSelezionato) {
        if (!this.datiCarceri || !this.esagoni || !esagonoSelezionato) {
            if (this.stato.sovraffollamento.testo && !this.stato.sovraffollamento.inCancellazione) {
                this.stato.sovraffollamento.inCancellazione = true;
                this.stato.sovraffollamento.ultimaCancellazione = millis();
            }
            
            if (this.stato.sovraffollamento.inCancellazione) {
                let tempoCorrente = millis();
                if (tempoCorrente - this.stato.sovraffollamento.ultimaCancellazione > this.velocitaCancellazione) {
                    this.testoCorrente.sovraffollamento = this.testoCorrente.sovraffollamento.slice(0, -1);
                    if (this.testoCorrente.sovraffollamento.length === 0) {
                        this.stato.sovraffollamento.testo = "";
                        this.stato.sovraffollamento.precedente = null;
                        this.stato.sovraffollamento.inCancellazione = false;
                    }
                    this.stato.sovraffollamento.ultimaCancellazione = tempoCorrente;
                }
                return;
            }
            
            this.stato.sovraffollamento.testo = "";
            this.stato.sovraffollamento.precedente = null;
            this.testoCorrente.sovraffollamento = "";
            return;
        }

        const esagonoIngrandito = esagonoSelezionato.scaleMultiplier > 1.5;

        if (!esagonoIngrandito) {
            if (this.stato.sovraffollamento.testo && !this.stato.sovraffollamento.inCancellazione) {
                this.stato.sovraffollamento.inCancellazione = true;
                this.stato.sovraffollamento.ultimaCancellazione = millis();
            }
            return;
        }

        const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagonoSelezionato.id}`;
        const datiCarcere = this.datiCarceri.get(hexId);

        if (datiCarcere && esagonoSelezionato !== this.stato.sovraffollamento.precedente) {
            if (this.stato.sovraffollamento.testo && !this.stato.sovraffollamento.inCancellazione) {
                this.stato.sovraffollamento.inCancellazione = true;
                this.stato.sovraffollamento.ultimaCancellazione = millis();
                return;
            }
            
            if (!this.stato.sovraffollamento.inCancellazione) {
                const percentuale = parseFloat(datiCarcere.sovraffollamento);
                this.stato.sovraffollamento.testo = `Tasso di sovraffollamento:\n${percentuale}%`;
                this.stato.sovraffollamento.precedente = esagonoSelezionato;
                this.stato.sovraffollamento.percentuale = percentuale;
                this.testoCorrente.sovraffollamento = "";
            }
        }

        if (!this.stato.sovraffollamento.inCancellazione) {
            this.testoCorrente.sovraffollamento = this.gestoreAnimazioni.animaTesto(
                this.testoCorrente.sovraffollamento,
                this.stato.sovraffollamento.testo
            );
        } else {
            let tempoCorrente = millis();
            if (tempoCorrente - this.stato.sovraffollamento.ultimaCancellazione > this.velocitaCancellazione) {
                this.testoCorrente.sovraffollamento = this.testoCorrente.sovraffollamento.slice(0, -1);
                if (this.testoCorrente.sovraffollamento.length === 0) {
                    this.stato.sovraffollamento.inCancellazione = false;
                    if (datiCarcere) {
                        const percentuale = parseFloat(datiCarcere.sovraffollamento);
                        this.stato.sovraffollamento.testo = `Tasso di sovraffollamento:\n${percentuale}%`;
                        this.stato.sovraffollamento.precedente = esagonoSelezionato;
                        this.stato.sovraffollamento.percentuale = percentuale;
                    }
                }
                this.stato.sovraffollamento.ultimaCancellazione = tempoCorrente;
            }
        }
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