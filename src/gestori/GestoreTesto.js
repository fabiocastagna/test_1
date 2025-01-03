class GestoreTesto {
    constructor(gestoreAnimazioni) {
        this.gestoreAnimazioni = gestoreAnimazioni;
        this.testoCorrente = "";
        this.testoTarget = "";
        this.nomeCarcereCorrente = "";
        this.nomeCarcereTarget = "";
        this.ultimoAggiornamento = 0;
        this.datiCarceri = null;
        this.esagoni = null;
        this.caricaDatiCarceri();
        this.font = null;
        this.caricaFont();
        this.ultimaRegione = null;
        this.ultimoEsagono = null;
        this.inTransizione = false;
        this.inTransizioneCarcere = false;
        this.tempoTransizione = 0;
        this.tempoTransizioneCarcere = 0;
        this.DURATA_TRANSIZIONE = 150;
        this.TOLLERANZA_TRANSIZIONE = 0.99;
        this.regioneCliccata = false;
        this.carcereCliccato = false;
        this.cancellazioneCarcere = false;
        this.VELOCITA_TESTO = 2;
        this.testoInUscita = "";
        this.inRimozione = false;
        this.carcereInUscita = "";
        this.inRimozioneCarcere = false;
        this.ultimaTransizioneCompletata = 0;
        this.INTERVALLO_MINIMO_TRANSIZIONI = 50;
    }

    caricaFont() {
        loadFont('FONT/AeionMono-SemiBold.ttf', font => {
            this.font = font;
            console.log('Font caricato con successo');
        });
    }

    setEsagoni(esagoni) {
        this.esagoni = esagoni;
    }

    async caricaDatiCarceri() {
        try {
            const response = await fetch('Database/Data_Comp.csv');
            const csvText = await response.text();
            const righe = csvText.split('\n').slice(1);
            this.datiCarceri = new Map();
            
            righe.forEach(riga => {
                if (!riga.trim()) return;
                const colonne = riga.split(',');
                const carcere = colonne[0];
                const regione = colonne[1];
                const hexId = colonne[27];
                
                if (!this.datiCarceri.has(hexId)) {
                    this.datiCarceri.set(hexId, {
                        carcere: carcere,
                        regione: regione
                    });
                }
            });
            console.log("Dati carceri caricati:", this.datiCarceri);
        } catch (error) {
            console.error('Errore nel caricamento dei dati delle carceri:', error);
        }
    }

    aggiornaTesto(regioneSelezionata, esagonoSelezionato) {
        if (!this.datiCarceri || !this.esagoni) return;

        const tempoCorrente = millis();
        if (tempoCorrente - this.ultimaTransizioneCompletata < this.INTERVALLO_MINIMO_TRANSIZIONI) {
            return;
        }

        let nuovoTesto = "";
        let nuovoNomeCarcere = "";
        let cambioTesto = false;
        
        if (regioneSelezionata) {
            nuovoTesto = regioneSelezionata;
            cambioTesto = regioneSelezionata !== this.ultimaRegione || this.testoCorrente === "";

            if (esagonoSelezionato) {
                if (!this.regioneCliccata) {
                    this.regioneCliccata = true;
                }
                
                if (esagonoSelezionato !== this.ultimoEsagono) {
                    const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagonoSelezionato.id}`;
                    const datiCarcere = this.datiCarceri.get(hexId);
                    if (datiCarcere) {
                        nuovoNomeCarcere = datiCarcere.carcere;
                        this.carcereCliccato = true;
                    }
                    this.ultimoEsagono = esagonoSelezionato;
                } else if (this.carcereCliccato) {
                    nuovoNomeCarcere = this.nomeCarcereTarget;
                }
            } 
            else if (this.regioneCliccata && !this.carcereCliccato) {
                let esagonoHover = null;
                let distanzaMinima = Infinity;

                this.esagoni.forEach(esagono => {
                    if (esagono.regione === regioneSelezionata) {
                        const distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                        if (distanza < esagono.raggio * 1.5 && distanza < distanzaMinima) {
                            distanzaMinima = distanza;
                            esagonoHover = esagono;
                        }
                    }
                });

                if (esagonoHover) {
                    const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagonoHover.id}`;
                    const datiCarcere = this.datiCarceri.get(hexId);
                    if (datiCarcere) {
                        nuovoNomeCarcere = datiCarcere.carcere;
                        this.carcereCliccato = true;
                    }
                }
            }

            this.ultimaRegione = regioneSelezionata;
        } else {
            cambioTesto = this.testoCorrente !== "";
            nuovoTesto = "";
            nuovoNomeCarcere = "";
            this.ultimaRegione = null;
            this.ultimoEsagono = null;
            this.regioneCliccata = false;
            this.carcereCliccato = false;
        }

        if (cambioTesto) {
            if (this.testoCorrente !== nuovoTesto) {
                if (this.testoCorrente && !this.inRimozione) {
                    this.testoInUscita = this.testoCorrente;
                    this.inRimozione = true;
                    this.inTransizione = false;
                    this.tempoTransizione = 0;
                } else if (!this.inTransizione && (!this.inRimozione || this.testoCorrente === "")) {
                    this.testoTarget = nuovoTesto;
                    this.inTransizione = true;
                    this.inRimozione = false;
                    this.tempoTransizione = 0;
                }
            }
        }

        if (this.inRimozione) {
            this.tempoTransizione += deltaTime;
            const progresso = Math.min(this.tempoTransizione / this.DURATA_TRANSIZIONE, 1);
            
            if (progresso >= this.TOLLERANZA_TRANSIZIONE) {
                this.inRimozione = false;
                this.testoCorrente = "";
                this.testoInUscita = "";
                this.tempoTransizione = 0;
                
                if (nuovoTesto) {
                    this.testoTarget = nuovoTesto;
                    this.inTransizione = true;
                }
                
                this.ultimaTransizioneCompletata = tempoCorrente;
            } else {
                const lunghezzaOriginale = this.testoInUscita.length;
                const lunghezzaCorrente = Math.floor(lunghezzaOriginale * progresso);
                this.testoCorrente = this.testoInUscita.substring(0, lunghezzaOriginale - lunghezzaCorrente);
            }
        } else if (this.inTransizione) {
            this.tempoTransizione += deltaTime;
            const progresso = Math.min(this.tempoTransizione / this.DURATA_TRANSIZIONE, 1);
            
            if (progresso >= this.TOLLERANZA_TRANSIZIONE) {
                this.inTransizione = false;
                this.testoCorrente = this.testoTarget;
                this.tempoTransizione = 0;
                this.ultimaTransizioneCompletata = tempoCorrente;
            } else {
                const lunghezzaTarget = this.testoTarget.length;
                const lunghezzaCorrente = Math.floor(lunghezzaTarget * progresso);
                this.testoCorrente = this.testoTarget.substring(0, lunghezzaCorrente);
            }
        }

        if (nuovoNomeCarcere !== this.nomeCarcereTarget) {
            if (this.nomeCarcereCorrente && this.nomeCarcereCorrente !== "" && !this.inRimozioneCarcere) {
                this.carcereInUscita = this.nomeCarcereCorrente;
                this.inRimozioneCarcere = true;
                this.tempoTransizioneCarcere = 0;
            } else if (!this.nomeCarcereCorrente || this.nomeCarcereCorrente === "") {
                this.nomeCarcereTarget = nuovoNomeCarcere;
                this.inTransizioneCarcere = true;
                this.tempoTransizioneCarcere = 0;
            }
        }

        if (this.inRimozioneCarcere) {
            this.tempoTransizioneCarcere += deltaTime;
            const progresso = Math.min(this.tempoTransizioneCarcere / this.DURATA_TRANSIZIONE, 1);
            const lunghezzaOriginale = this.carcereInUscita.length;
            const lunghezzaCorrente = Math.floor(lunghezzaOriginale * (1 - progresso));
            this.nomeCarcereCorrente = this.carcereInUscita.substring(0, lunghezzaCorrente);

            if (progresso >= this.TOLLERANZA_TRANSIZIONE) {
                this.inRimozioneCarcere = false;
                this.nomeCarcereCorrente = "";
                this.carcereInUscita = "";
                this.tempoTransizioneCarcere = 0;
                if (this.nomeCarcereTarget) {
                    this.inTransizioneCarcere = true;
                }
            }
        } else if (this.inTransizioneCarcere) {
            this.tempoTransizioneCarcere += deltaTime;
            const progresso = Math.min(this.tempoTransizioneCarcere / this.DURATA_TRANSIZIONE, 1);
            const lunghezzaTarget = this.nomeCarcereTarget.length;
            const lunghezzaCorrente = Math.floor(lunghezzaTarget * progresso);
            this.nomeCarcereCorrente = this.nomeCarcereTarget.substring(0, lunghezzaCorrente);

            if (progresso >= this.TOLLERANZA_TRANSIZIONE) {
                this.inTransizioneCarcere = false;
                this.nomeCarcereCorrente = this.nomeCarcereTarget;
                this.tempoTransizioneCarcere = 0;
            }
        }
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
        text(this.testoCorrente, xPos, yPos);
        
        if (this.nomeCarcereCorrente) {
            textSize(24);
            fill(200);
            text(this.nomeCarcereCorrente, xPos, yPos + 40);
        }
        
        pop();
    }
} 