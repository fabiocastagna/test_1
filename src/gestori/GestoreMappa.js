class GestoreMappa {
    constructor() {
      this.esagoni = [];
      this.regioneHover = null;
      this.cellaHover = null;
      this.regioneSelezionata = null;
      this.italiaRimpicciolita = false;
      this.gestoreEsagoni = new GestoreEsagoni(this);
      this.gestoreTesto = new GestoreTesto(new GestoreAnimazioni());
      this.CONFIG = CONFIGURAZIONE;
      this.esagonoCliccato = null;
      this.hoverAttivo = true;
    }
  
    caricaDati(tabella) {
      // Troviamo le coordinate estreme della mappa
      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      
      for (let riga of tabella.rows) {
        let x = parseFloat(riga.get('x').replace(',', '.'));
        let y = parseFloat(riga.get('y').replace(',', '.'));
        minX = min(minX, x);
        maxX = max(maxX, x);
        minY = min(minY, y);
        maxY = max(maxY, y);
      }
      
      // Calcoliamo l'aspect ratio e il fattore di scala
      let mappaWidth = maxX - minX;
      let mappaHeight = maxY - minY;
      let aspectRatio = mappaWidth / mappaHeight;
      
      let marginHeight = height * this.CONFIG.margini.verticale * 0.8;
      let scaleFactor = marginHeight / mappaHeight;
      let scaledWidth = marginHeight * aspectRatio;
      
      let offsetX = (width - scaledWidth) / 2;
      let offsetY = (height - marginHeight) / 2;
      
      let raggio = marginHeight / 45;
      
      let sovraffollamenti = tabella.getColumn('sovraffollamento').map(Number);
      let maxSovraffollamento = Math.max(...sovraffollamenti);
      let minSovraffollamento = Math.min(...sovraffollamenti);
      
      // Mappa per contare gli esagoni per regione
      let contatoreRegioni = new Map();
      
      for (let riga of tabella.rows) {
        let x = parseFloat(riga.get('x').replace(',', '.'));
        let y = parseFloat(riga.get('y').replace(',', '.'));
        let sovraffollamento = parseFloat(riga.get('sovraffollamento'));
        let regione = riga.get('regione');
        
        // Incrementa il contatore per questa regione
        if (!contatoreRegioni.has(regione)) {
            contatoreRegioni.set(regione, 1);
        } else {
            contatoreRegioni.set(regione, contatoreRegioni.get(regione) + 1);
        }
        
        let mappedX = map(x, minX, maxX, offsetX, offsetX + scaledWidth);
        let mappedY = map(y, minY, maxY, offsetY, offsetY + marginHeight);
        
        let colore = this.calcolaColore(sovraffollamento, minSovraffollamento, maxSovraffollamento);
        
        // Usa il contatore come ID dell'esagono
        this.esagoni.push(new Esagono(mappedX, mappedY, raggio, regione, colore, contatoreRegioni.get(regione)));
      }
      
      // Passa gli esagoni al GestoreTesto
      this.gestoreTesto.setEsagoni(this.esagoni);
    }
  
    calcolaColore(sovraffollamento, min, max) {
      let colore = lerpColor(
        color(this.CONFIG.colori.esagonoBase), 
        color(this.CONFIG.colori.esagonoMedio), 
        (sovraffollamento - min) / (max - min)
      );
      return lerpColor(
        colore, 
        color(this.CONFIG.colori.esagonoAlto), 
        (sovraffollamento - min) / (max - min)
      );
    }
  
    aggiorna() {
        let nuovaRegioneHover = null;
        let nuovaCellaHover = null;

        if (this.gestoreEsagoni.esagonoIngrandito) {
            nuovaCellaHover = this.trovaCellaHover();
        } else {
            nuovaRegioneHover = this.trovaRegioneHover();
        }

        if (nuovaRegioneHover !== this.regioneHover) {
            this.regioneHover = nuovaRegioneHover;
        }

        if (nuovaCellaHover !== this.cellaHover) {
            this.cellaHover = nuovaCellaHover;
        }

        for (let esagono of this.esagoni) {
            esagono.aggiorna();
            this.aggiornaStatoEsagono(esagono);
            // Aggiorna la scala con una transizione fluida
            if (esagono.scaleMultiplier !== esagono.targetScale) {
                esagono.scaleMultiplier = lerp(esagono.scaleMultiplier, esagono.targetScale, 0.1);
            }
        }

        this.gestoreTesto.aggiornaTesto(
            this.regioneSelezionata || this.regioneHover,
            this.esagonoCliccato || this.cellaHover || this.regioneHover
        );
    }
  
    trovaRegioneHover() {
      for (let esagono of this.esagoni) {
        let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
        if (distanza < esagono.raggio * 1.5) {
          return this.regioneSelezionata ? 
            (esagono.regione === this.regioneSelezionata ? esagono : null) : 
            esagono.regione;
        }
      }
      return null;
    }
  
    aggiornaStatoEsagono(esagono) {
        if (!this.hoverAttivo) {
            esagono.hoverState = 0;
            if (this.gestoreEsagoni.esagonoIngrandito === esagono) {
                esagono.opacita = 255;
            } else {
                esagono.opacita = this.regioneSelezionata === esagono.regione ? 255 : 30;
            }
            return;
        }
  
        let targetHoverState = 0;
        if (this.regioneSelezionata) {
            targetHoverState = this.regioneHover === esagono ? 1 : 0;
        } else {
            targetHoverState = esagono.regione === this.regioneHover ? 1 : 0;
        }
        esagono.hoverState = lerp(esagono.hoverState, targetHoverState, 0.2);
  
        let targetOpacita = 255;
        if (this.regioneSelezionata) {
            targetOpacita = esagono.regione === this.regioneSelezionata ? 255 : 30;
        } else if (this.regioneHover) {
            targetOpacita = esagono.regione === this.regioneHover ? 255 : 100;
        }
        esagono.opacita = lerp(esagono.opacita, targetOpacita, 0.1);
    }
  
    gestisciClick(mouseX, mouseY) {
        // Caso 1: Italia al centro (stato iniziale)
        if (!this.italiaRimpicciolita) {
            for (let esagono of this.esagoni) {
                let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                if (distanza < esagono.raggio * 1.5) {
                    // Reset di tutti i testi prima della nuova selezione
                    this.esagonoCliccato = null;
                    this.cellaHover = null;
                    this.regioneHover = null;
                    this.gestoreTesto.resetStato();
                    
                    // Seleziona nuova regione e spostala al centro
                    this.regioneSelezionata = esagono.regione;
                    this.italiaRimpicciolita = true;
                    
                    let regioneEsagoni = this.esagoni.filter(e => e.regione === this.regioneSelezionata);
                    let centerX = regioneEsagoni.reduce((sum, h) => sum + h.originalX, 0) / regioneEsagoni.length;
                    let centerY = regioneEsagoni.reduce((sum, h) => sum + h.originalY, 0) / regioneEsagoni.length;
                    
                    regioneEsagoni.forEach(hex => {
                        let offsetX = hex.originalX - centerX;
                        let offsetY = hex.originalY - centerY;
                        hex.targetX = width * 0.5 + offsetX * 1.5;
                        hex.targetY = height * 0.5 + offsetY * 1.5;
                        hex.targetScale = 1.5;
                    });
                    
                    // Sposta l'Italia a sinistra
                    this.esagoni.filter(e => e.regione !== this.regioneSelezionata).forEach(hex => {
                        hex.targetX = hex.originalX * 0.3 + width * 0.1;
                        hex.targetY = hex.originalY * 0.3 + height * 0.35;
                        hex.targetScale = 0.3;
                    });
                    return;
                }
            }
        }
        // Caso 2: Regione al centro e Italia a sinistra
        else {
            if (this.gestoreEsagoni.esagonoIngrandito) {
                let esagono = this.gestoreEsagoni.esagonoIngrandito;
                let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                let raggioEffettivo = esagono.raggio * esagono.scaleMultiplier;
                
                if (distanza < raggioEffettivo * 1.5) {
                    this.gestoreEsagoni.gestisciClickEsagonoRegione(esagono);
                    this.esagonoCliccato = null;
                    this.cellaHover = null;
                    this.gestoreTesto.resetStatoCompleto();
                    return;
                }
            }

            let italiaCliccata = false;
            for (let esagono of this.esagoni) {
                if (esagono.regione !== this.regioneSelezionata) {
                    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                    if (distanza < esagono.raggio * esagono.scaleMultiplier * 1.5) {
                        italiaCliccata = true;
                        break;
                    }
                }
            }

            if (italiaCliccata) {
                this.esagoni.forEach(hex => {
                    hex.targetX = hex.originalX;
                    hex.targetY = hex.originalY;
                    hex.targetScale = 1;
                });
                this.regioneSelezionata = null;
                this.italiaRimpicciolita = false;
                this.esagonoCliccato = null;
                this.cellaHover = null;
                this.regioneHover = null;
                
                // Modifica qui: prima resetta solo il testo della regione
                this.gestoreTesto.resetStatoRegione();
                return;
            }

            for (let esagono of this.esagoni) {
                if (esagono.regione === this.regioneSelezionata) {
                    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                    let raggioEffettivo = esagono.raggio * esagono.scaleMultiplier;
                    
                    if (distanza < raggioEffettivo * 1.5) {
                        this.gestoreEsagoni.gestisciClickEsagonoRegione(esagono);
                        this.esagonoCliccato = null;
                        this.cellaHover = null;
                        this.gestoreTesto.resetStatoCompleto();
                        return;
                    }
                }
            }
        }
    }

    disegna() {
        // Disegna gli esagoni
        for (let esagono of this.esagoni) {
            esagono.disegna();
        }

        // Disegna il testo
        this.gestoreTesto.disegna();
    }

    trovaCellaHover() {
        if (!this.regioneSelezionata || !this.gestoreEsagoni.esagonoIngrandito) {
            return null;
        }

        const regioneEsagoni = this.esagoni.filter(e => e.regione === this.regioneSelezionata);
        
        for (let esagono of regioneEsagoni) {
            let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
            let raggioEffettivo = esagono.raggio * esagono.scaleMultiplier * 1.5;
            
            if (distanza < raggioEffettivo) {
                return esagono;
            }
        }
        return null;
    }
} 