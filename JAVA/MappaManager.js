class MappaManager {
    constructor() {
      this.esagoni = [];
      this.regioneHover = null;
      this.regioneSelezionata = null;
      this.italiaRimpicciolita = false;
      this.esagonoManager = new EsagonoManager(this);
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
      
      let marginHeight = height * CONFIG.margini.verticale;
      let scaleFactor = marginHeight / mappaHeight;
      let scaledWidth = marginHeight * aspectRatio;
      
      let offsetX = (width - scaledWidth) / 2;
      let offsetY = height * CONFIG.margini.orizzontale;
      
      let raggio = marginHeight / 45;
      
      let sovraffollamenti = tabella.getColumn('sovraffollamento').map(Number);
      let maxSovraffollamento = Math.max(...sovraffollamenti);
      let minSovraffollamento = Math.min(...sovraffollamenti);
      
      for (let riga of tabella.rows) {
        let x = parseFloat(riga.get('x').replace(',', '.'));
        let y = parseFloat(riga.get('y').replace(',', '.'));
        let sovraffollamento = parseFloat(riga.get('sovraffollamento'));
        let regione = riga.get('regione');
        
        let mappedX = map(x, minX, maxX, offsetX, offsetX + scaledWidth);
        let mappedY = map(y, minY, maxY, offsetY, offsetY + marginHeight);
        
        let colore = this.calcolaColore(sovraffollamento, minSovraffollamento, maxSovraffollamento);
        
        this.esagoni.push(new Esagono(mappedX, mappedY, raggio, regione, colore));
      }
    }
  
    calcolaColore(sovraffollamento, min, max) {
      let colore = lerpColor(
        color(CONFIG.colori.esagonoBase), 
        color(CONFIG.colori.esagonoMedio), 
        (sovraffollamento - min) / (max - min)
      );
      return lerpColor(
        colore, 
        color(CONFIG.colori.esagonoAlto), 
        (sovraffollamento - min) / (max - min)
      );
    }
  
    aggiorna() {
        // Disabilita l'hover se c'è un esagono ingrandito
        if (!this.esagonoManager.esagonoIngrandito) {
            let nuovaRegioneHover = this.trovaRegioneHover();
            if (nuovaRegioneHover !== this.regioneHover) {
                this.regioneHover = nuovaRegioneHover;
            }
        } else {
            this.regioneHover = null;
        }
  
        for (let esagono of this.esagoni) {
            esagono.aggiorna();
            this.aggiornaStatoEsagono(esagono);
        }
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
        // Se c'è un esagono ingrandito, disabilita tutti gli effetti hover
        if (this.esagonoManager.esagonoIngrandito) {
            esagono.hoverState = 0;
            esagono.opacita = 255;
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
                    // Seleziona nuova regione e spostala al centro
                    this.regioneSelezionata = esagono.regione;
                    this.italiaRimpicciolita = true;
                    
                    // Sposta la regione selezionata al centro
                    let regioneEsagoni = this.esagoni.filter(e => e.regione === this.regioneSelezionata);
                    let centerX = regioneEsagoni.reduce((sum, h) => sum + h.originalX, 0) / regioneEsagoni.length;
                    let centerY = regioneEsagoni.reduce((sum, h) => sum + h.originalY, 0) / regioneEsagoni.length;
                    
                    regioneEsagoni.forEach(hex => {
                        let offsetX = hex.originalX - centerX;
                        let offsetY = hex.originalY - centerY;
                        hex.targetX = width * 0.5 + offsetX * 1.2;
                        hex.targetY = height * 0.5 + offsetY * 1.2;
                        hex.scaleMultiplier = 1.2;
                    });
                    
                    // Sposta l'Italia a sinistra
                    this.esagoni.filter(e => e.regione !== this.regioneSelezionata).forEach(hex => {
                        hex.targetX = hex.originalX * 0.3 + width * 0.1;
                        hex.targetY = hex.originalY * 0.3 + height * 0.35;
                        hex.scaleMultiplier = 0.3;
                    });
                    return;
                }
            }
        }
        // Caso 2: Regione al centro e Italia a sinistra
        else {
            // Controlla se è stata cliccata l'Italia rimpicciolita
            let italiaCliccata = false;
            for (let esagono of this.esagoni) {
                if (esagono.regione !== this.regioneSelezionata) {
                    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                    if (distanza < esagono.raggio * 1.5 && esagono.scaleMultiplier === 0.3) {
                        italiaCliccata = true;
                        break;
                    }
                }
            }

            if (italiaCliccata) {
                // Ripristina la posizione originale di tutti gli esagoni
                this.esagoni.forEach(hex => {
                    hex.targetX = hex.originalX;
                    hex.targetY = hex.originalY;
                    hex.scaleMultiplier = 1;
                });
                this.regioneSelezionata = null;
                this.italiaRimpicciolita = false;
                return;
            }

            // NUOVO CODICE: Gestione click su esagono della regione selezionata
            for (let esagono of this.esagoni) {
                if (esagono.regione === this.regioneSelezionata) {
                    let distanza = dist(mouseX, mouseY, esagono.x, esagono.y);
                    if (distanza < esagono.raggio * 1.5) {
                        this.esagonoManager.gestisciClickEsagonoRegione(esagono);
                        return;
                    }
                }
            }
        }
    }
  }