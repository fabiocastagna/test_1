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
        this.tempoTransizione = 0;
        this.DURATA_TRANSIZIONE = 500;
        this.regioneCliccata = false;
        this.cancellazioneCarcere = false;
        this.VELOCITA_TESTO = 2;
    }

    caricaFont() {
        loadFont('FONT/AeionMono-Regular.ttf', font => {
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
                const citta = colonne[0];
                const regione = colonne[1];
                const hexId = colonne[27];
                
                if (!this.datiCarceri.has(hexId)) {
                    this.datiCarceri.set(hexId, {
                        citta: citta,
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

        let nuovoTesto = "";
        let nuovoNomeCarcere = "";
        let cambioTesto = false;
        
        // Controllo se c'è un esagono ingrandito
        let esagonoIngrandito = false;
        this.esagoni.forEach(esagono => {
            if (esagono.scaleMultiplier > 1) {
                esagonoIngrandito = true;
            }
        });

        if (regioneSelezionata) {
            if (esagonoSelezionato || this.regioneCliccata) {
                if (esagonoSelezionato && !this.regioneCliccata) {
                    this.regioneCliccata = true;
                }
                
                nuovoTesto = regioneSelezionata;
                this.testoCorrente = regioneSelezionata;

                let esagonoHover = null;
                let distanzaMinima = Infinity;

                this.esagoni.forEach(esagono => {
                    if (esagono.regione === regioneSelezionata) {
                        if (esagono.scaleMultiplier > 1) {
                            const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagono.id}`;
                            const datiCarcere = this.datiCarceri.get(hexId);
                            if (datiCarcere) {
                                nuovoNomeCarcere = datiCarcere.citta;
                            }
                            return;
                        }
                        
                        // Se c'è già un esagono ingrandito, non mostrare i nomi al passaggio del mouse
                        if (!esagonoIngrandito) {
                            const distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                            if (distanza < esagono.raggio * 2 && distanza < distanzaMinima) {
                                distanzaMinima = distanza;
                                esagonoHover = esagono;
                            }
                        }
                    }
                });

                if (esagonoHover && !esagonoIngrandito) {
                    const hexId = `${regioneSelezionata.replace(' ', '_')}_hex_${esagonoHover.id}`;
                    const datiCarcere = this.datiCarceri.get(hexId);
                    if (datiCarcere) {
                        nuovoNomeCarcere = datiCarcere.citta;
                    }
                }
            } else {
                nuovoTesto = regioneSelezionata;
                cambioTesto = regioneSelezionata !== this.ultimaRegione;
            }

            this.ultimaRegione = regioneSelezionata;
        } else {
            nuovoTesto = "";
            nuovoNomeCarcere = "";
            cambioTesto = this.testoCorrente !== "";
            this.ultimaRegione = null;
            this.ultimoEsagono = null;
            this.regioneCliccata = false;
            this.nomeCarcereCorrente = "";
            this.nomeCarcereTarget = "";
        }

        if (!this.regioneCliccata && cambioTesto) {
            this.testoTarget = nuovoTesto;
            this.inTransizione = true;
            this.tempoTransizione = 0;
        }

        if (this.inTransizione) {
            this.tempoTransizione += deltaTime;
            const progresso = this.tempoTransizione / this.DURATA_TRANSIZIONE;
            const lunghezzaTarget = this.testoTarget.length;
            const lunghezzaCorrente = Math.floor(lunghezzaTarget * progresso);
            this.testoCorrente = this.testoTarget.substring(0, lunghezzaCorrente);

            if (progresso >= 1) {
                this.inTransizione = false;
            }
        }

        if (this.nomeCarcereTarget !== nuovoNomeCarcere) {
            if (this.nomeCarcereCorrente && nuovoNomeCarcere) {
                this.cancellazioneCarcere = true;
            } else {
                this.nomeCarcereTarget = nuovoNomeCarcere;
                if (!this.nomeCarcereCorrente) {
                    this.nomeCarcereCorrente = "";
                }
            }
        }

        if (this.cancellazioneCarcere) {
            if (this.nomeCarcereCorrente.length > 0) {
                this.nomeCarcereCorrente = this.nomeCarcereCorrente.slice(0, -this.VELOCITA_TESTO);
            } else {
                this.cancellazioneCarcere = false;
                this.nomeCarcereTarget = nuovoNomeCarcere;
            }
        } else if (this.nomeCarcereCorrente !== this.nomeCarcereTarget) {
            if (this.nomeCarcereCorrente.length < this.nomeCarcereTarget.length) {
                const nuovaLunghezza = Math.min(
                    this.nomeCarcereCorrente.length + this.VELOCITA_TESTO,
                    this.nomeCarcereTarget.length
                );
                this.nomeCarcereCorrente = this.nomeCarcereTarget.substring(0, nuovaLunghezza);
            } else if (this.nomeCarcereCorrente.length > this.nomeCarcereTarget.length) {
                this.nomeCarcereCorrente = this.nomeCarcereCorrente.slice(0, -this.VELOCITA_TESTO);
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
        
        if (this.regioneCliccata && this.nomeCarcereCorrente) {
            textSize(24);
            fill(200);
            text(this.nomeCarcereCorrente, xPos, yPos + 40);
        }
        
        pop();
    }
} 