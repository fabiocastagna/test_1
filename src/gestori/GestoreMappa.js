const StatoMappa = {
    ITALIA: 'ITALIA',
    REGIONE: 'REGIONE',
    CELLA: 'CELLA'
};

class GestoreMappa {
    constructor() {
      this.esagoni = [];
      this.regioneHover = null;
      this.cellaHover = null;
      this.regioneSelezionata = null;
      this.italiaRimpicciolita = false;
      this.stato = StatoMappa.ITALIA;
      this.gestoreEsagoni = new GestoreEsagoni(this);
      this.gestoreTesto = new GestoreTesto(new GestoreAnimazioni());
      this.CONFIG = CONFIGURAZIONE;
      this.esagonoCliccato = null;
      this.hoverAttivo = true;
      this.fadeInProgress = 0;
            this._cache = {
          esagoniPerRegione: new Map(),
          centroRegioni: new Map(),
          dimensioniMappa: null
      };
    }
  
    caricaDati(tabella) {
      // Calcola le dimensioni della mappa una sola volta
      this._cache.dimensioniMappa = this._calcolaDimensioniMappa(tabella);
      const { minX, maxX, minY, maxY, scaleFactor, offsetX, offsetY, raggio } = this._cache.dimensioniMappa;

      // Prepara i dati per il sovraffollamento
      const sovraffollamenti = tabella.getColumn('sovraffollamento').map(Number);
      const maxSovraffollamento = Math.max(...sovraffollamenti);
      const minSovraffollamento = Math.min(...sovraffollamenti);
      
      // Mappa per contare gli esagoni per regione
      let contatoreRegioni = new Map();
      
      // Crea gli esagoni
      for (let riga of tabella.rows) {
          const esagono = this._creaEsagono(riga, {
              minX, maxX, minY, maxY, 
              offsetX, offsetY, 
              scaleFactor, raggio,
              minSovraffollamento, maxSovraffollamento,
              contatoreRegioni
          });
          
          this.esagoni.push(esagono);
          
          // Aggiorna la cache degli esagoni per regione
          if (!this._cache.esagoniPerRegione.has(esagono.regione)) {
              this._cache.esagoniPerRegione.set(esagono.regione, []);
          }
          this._cache.esagoniPerRegione.get(esagono.regione).push(esagono);
      }

      // Calcola e cache i centri delle regioni
      this._calcolaCentriRegioni();
      
      // Passa gli esagoni al GestoreTesto
      this.gestoreTesto.setEsagoni(this.esagoni);
    }
  
    _calcolaDimensioniMappa(tabella) {
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
      
      let mappaWidth = maxX - minX;
      let mappaHeight = maxY - minY;
      let aspectRatio = mappaWidth / mappaHeight;
      
      let marginHeight = height * this.CONFIG.margini.verticale * 0.8;
      let scaleFactor = marginHeight / mappaHeight;
      let scaledWidth = marginHeight * aspectRatio;
      
      let offsetX = (width - scaledWidth) / 2;
      let offsetY = (height - marginHeight) / 2;
      
      let raggio = marginHeight / 45;

      return { minX, maxX, minY, maxY, scaleFactor, offsetX, offsetY, raggio };
    }
  
    _creaEsagono(riga, params) {
      const {
          minX, maxX, minY, maxY,
          offsetX, offsetY,
          scaleFactor, raggio,
          minSovraffollamento, maxSovraffollamento,
          contatoreRegioni
      } = params;

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
      
      let mappedX = map(x, minX, maxX, offsetX, offsetX + scaleFactor * (maxX - minX));
      let mappedY = map(y, minY, maxY, offsetY, offsetY + scaleFactor * (maxY - minY));
      
      let colore = this.calcolaColore(sovraffollamento, minSovraffollamento, maxSovraffollamento);
      
      let esagono = new Esagono(mappedX, mappedY, raggio, regione, colore, contatoreRegioni.get(regione));
      esagono.sovraffollamento = sovraffollamento;
      return esagono;
    }
  
    _calcolaCentriRegioni() {
      for (let [regione, esagoni] of this._cache.esagoniPerRegione) {
          let sommaX = 0, sommaY = 0;
          esagoni.forEach(esagono => {
              sommaX += esagono.originalX;
              sommaY += esagono.originalY;
          });
          this._cache.centroRegioni.set(regione, {
              x: sommaX / esagoni.length,
              y: sommaY / esagoni.length
          });
      }
    }
  
    getEsagoniRegione(regione) {
      return this._cache.esagoniPerRegione.get(regione) || [];
    }
  
    getCentroRegione(regione) {
      return this._cache.centroRegioni.get(regione);
    }
  
    calcolaColore(sovraffollamento, min, max) {
        if (sovraffollamento <= 100) {
            // Da bianco a giallo (0-100%)
            return lerpColor(
                color(this.CONFIG.colori.esagonoBase),
                color(this.CONFIG.colori.esagonoMedio),
                map(sovraffollamento, 0, 100, 0, 1)
            );
        } else if (sovraffollamento <= 150) {
            // Da giallo a rosso (100-150%)
            return lerpColor(
                color(this.CONFIG.colori.esagonoMedio),
                color(this.CONFIG.colori.esagonoAlto),
                map(sovraffollamento, 100, 150, 0, 1)
            );
        } else {
            // Oltre 150% resta rosso
            return color(this.CONFIG.colori.esagonoAlto);
        }
    }
  
    aggiorna() {
        // Aggiorna il fade in
        if (this.fadeInProgress < 1) {
            this.fadeInProgress = min(this.fadeInProgress + 0.02, 1);
        }

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
                esagono.opacita = 255 * this.fadeInProgress;
            } else {
                esagono.opacita = (this.regioneSelezionata === esagono.regione ? 255 : 30) * this.fadeInProgress;
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
        esagono.opacita = lerp(esagono.opacita, targetOpacita * this.fadeInProgress, 0.1);
    }
  
    gestisciClick(mouseX, mouseY) {
        switch (this.stato) {
            case StatoMappa.ITALIA:
                this._gestisciClickItalia(mouseX, mouseY);
                break;
            case StatoMappa.REGIONE:
                this._gestisciClickRegione(mouseX, mouseY);
                break;
            case StatoMappa.CELLA:
                this._gestisciClickCella(mouseX, mouseY);
                break;
        }
    }

    _gestisciClickItalia(mouseX, mouseY) {
        for (let esagono of this.esagoni) {
            let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
            if (distanza < esagono.raggio * 1.5) {
                this._selezionaRegione(esagono);
                break;
            }
        }
    }

    _gestisciClickRegione(mouseX, mouseY) {
        // Click sulla mini-Italia
        let italiaCliccata = this.esagoni.some(esagono => {
            if (esagono.regione !== this.regioneSelezionata) {
                let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                return distanza < esagono.raggio * esagono.scaleMultiplier * 1.5;
            }
            return false;
        });

        if (italiaCliccata) {
            this._tornaAllaVistaPrincipale();
            return;
        }

        // Click su un esagono della regione
        for (let esagono of this.esagoni) {
            if (esagono.regione === this.regioneSelezionata) {
                let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                let raggioEffettivo = esagono.raggio * esagono.scaleMultiplier;
                
                if (distanza < raggioEffettivo * 1.5) {
                    this.stato = StatoMappa.CELLA;
                    this.gestoreEsagoni.gestisciClickEsagonoRegione(esagono);
                    this.esagonoCliccato = null;
                    this.cellaHover = null;
                    this.gestoreTesto.resetStatoCompleto();
                    return;
                }
            }
        }
    }

    _gestisciClickCella(mouseX, mouseY) {
        if (this.gestoreEsagoni.esagonoIngrandito) {
            let esagono = this.gestoreEsagoni.esagonoIngrandito;
            let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
            let raggioEffettivo = esagono.raggio * esagono.scaleMultiplier;
            
            if (distanza < raggioEffettivo * 1.5) {
                this.stato = StatoMappa.REGIONE;
                this.gestoreEsagoni.gestisciClickEsagonoRegione(esagono);
                this.esagonoCliccato = null;
                this.cellaHover = null;
                this.gestoreTesto.resetStatoCompleto();
            }
        }
    }

    _selezionaRegione(esagono) {
        this.esagonoCliccato = null;
        this.cellaHover = null;
        this.regioneHover = null;
        this.gestoreTesto.resetStato();
        
        this.regioneSelezionata = esagono.regione;
        this.stato = StatoMappa.REGIONE;
        
        this.gestoreTesto.gestoreRegione.setRegioneCliccata(true, esagono.regione);
        
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
        
        this.esagoni.filter(e => e.regione !== this.regioneSelezionata).forEach(hex => {
            hex.targetX = hex.originalX * 0.3 + width * 0.1;
            hex.targetY = hex.originalY * 0.3 + height * 0.35;
            hex.targetScale = 0.3;
            hex.disattivaAnimazione();
        });
    }

    _tornaAllaVistaPrincipale() {
        this.esagoni.forEach(hex => {
            hex.targetX = hex.originalX;
            hex.targetY = hex.originalY;
            hex.targetScale = 1;
            hex.disattivaAnimazione();
        });
        this.regioneSelezionata = null;
        this.stato = StatoMappa.ITALIA;
        this.esagonoCliccato = null;
        this.cellaHover = null;
        this.regioneHover = null;
        this.gestoreTesto.resetStatoRegione();
    }

    disegna() {
        // Prima disegna gli esagoni non in hover
        for (let esagono of this.esagoni) {
            if ((esagono.regione !== this.regioneHover && esagono !== this.cellaHover) || 
                !this.hoverAttivo) {
                esagono.disegna();
            }
        }

        // Poi disegna gli esagoni in hover
        for (let esagono of this.esagoni) {
            if ((esagono.regione === this.regioneHover || esagono === this.cellaHover) && 
                this.hoverAttivo) {
                esagono.disegna();
            }
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