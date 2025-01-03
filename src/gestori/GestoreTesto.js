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
        this.DURATA_TRANSIZIONE = 500;
        this.regioneCliccata = false;
        this.carcereCliccato = false;
        this.cancellazioneCarcere = false;
        this.VELOCITA_TESTO = 2;
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

        let nuovoTesto = "";
        let nuovoNomeCarcere = "";
        let cambioTesto = false;
        
        if (regioneSelezionata) {
            nuovoTesto = regioneSelezionata;
            cambioTesto = regioneSelezionata !== this.ultimaRegione;

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
            nuovoTesto = "";
            nuovoNomeCarcere = "";
            cambioTesto = this.testoCorrente !== "";
            this.ultimaRegione = null;
            this.ultimoEsagono = null;
            this.regioneCliccata = false;
            this.carcereCliccato = false;
        }

        if (!this.regioneCliccata && cambioTesto) {
            this.testoTarget = nuovoTesto;
            this.inTransizione = true;
            this.tempoTransizione = 0;
        }

        if (nuovoNomeCarcere !== this.nomeCarcereTarget) {
            this.nomeCarcereTarget = nuovoNomeCarcere;
            this.inTransizioneCarcere = true;
            this.tempoTransizioneCarcere = 0;
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

        if (this.inTransizioneCarcere) {
            this.tempoTransizioneCarcere += deltaTime;
            const progresso = this.tempoTransizioneCarcere / this.DURATA_TRANSIZIONE;
            
            if (this.nomeCarcereTarget === "") {
                const lunghezzaCorrente = Math.floor(this.nomeCarcereCorrente.length * (1 - progresso));
                this.nomeCarcereCorrente = this.nomeCarcereCorrente.substring(0, lunghezzaCorrente);
            } else {
                const lunghezzaTarget = this.nomeCarcereTarget.length;
                const lunghezzaCorrente = Math.floor(lunghezzaTarget * progresso);
                this.nomeCarcereCorrente = this.nomeCarcereTarget.substring(0, lunghezzaCorrente);
            }

            if (progresso >= 1) {
                this.inTransizioneCarcere = false;
                if (this.nomeCarcereTarget === "") {
                    this.nomeCarcereCorrente = "";
                }
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