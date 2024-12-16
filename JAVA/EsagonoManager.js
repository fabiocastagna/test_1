class EsagonoManager {
    constructor(mappaManager) {
        this.mappaManager = mappaManager;
        this.esagonoIngrandito = null;
        this.ITALIA_OFFSET_X = -width * 0.5;
        this.REGIONE_OFFSET_X = width * 0.25;
        this.ANIMATION_DURATION = 800;
        this.SCALE = {
            SMALL: 0.3,
            SMALLER: 0.6,
            NORMAL: 1.2,
            LARGE: 15.0,
            DOT: 0.01
        };
    }

    calcolaCentroRegione(esagoni) {
        return {
            x: esagoni.reduce((sum, h) => sum + h.originalX, 0) / esagoni.length,
            y: esagoni.reduce((sum, h) => sum + h.originalY, 0) / esagoni.length
        };
    }

    spostaEsagoniItalia(scala = this.SCALE.SMALL, offsetX = width * 0.1) {
        const esagoniItalia = this.mappaManager.esagoni.filter(e => 
            e.regione !== this.mappaManager.regioneSelezionata
        );

        esagoniItalia.forEach(hex => {
            hex.targetX = hex.originalX * scala + offsetX;
            hex.targetY = hex.originalY * scala + height * 0.35;
            hex.scaleMultiplier = scala;
        });
    }

    spostaEsagoniRegione(regioneEsagoni, centro, scala, offsetX = 0) {
        regioneEsagoni.forEach(hex => {
            const offsetXFromCenter = hex.originalX - centro.x;
            const offsetYFromCenter = hex.originalY - centro.y;
            hex.targetX = offsetX + offsetXFromCenter * scala;
            hex.targetY = height * 0.5 + offsetYFromCenter * scala;
            hex.scaleMultiplier = scala;
            
            if (hex.dot) {
                if (scala !== this.SCALE.NORMAL) {
                    hex.dot.scaleMultiplier = 0;
                } else {
                    hex.dot.scaleMultiplier = 1;
                }
            }
        });
    }

    gestisciClickEsagonoRegione(esagonoCliccato) {
        const regioneEsagoni = this.mappaManager.esagoni.filter(e => 
            e.regione === this.mappaManager.regioneSelezionata
        );
        const centro = this.calcolaCentroRegione(regioneEsagoni);

        if (this.esagonoIngrandito && esagonoCliccato.scaleMultiplier === this.SCALE.SMALLER) {
            // Ripristina vista regione al centro
            this.spostaEsagoniRegione(regioneEsagoni, centro, this.SCALE.NORMAL, width * 0.5);
            this.spostaEsagoniItalia();
            this.esagonoIngrandito = null;
        } else {
            regioneEsagoni.forEach(hex => {
                if (hex === esagonoCliccato) {
                    hex.targetX = width * 0.5;
                    hex.targetY = height * 0.5;
                    hex.scaleMultiplier = this.SCALE.LARGE;
                    this.esagonoIngrandito = hex;
                }
            });

            // Sposta altri esagoni della regione
            const esagoniNonSelezionati = regioneEsagoni.filter(hex => hex !== esagonoCliccato);
            this.spostaEsagoniRegione(
                esagoniNonSelezionati, 
                centro, 
                this.SCALE.SMALLER,
                this.REGIONE_OFFSET_X
            );
            
            // Sposta l'Italia più lontano e più lentamente
            this.spostaEsagoniItalia(this.SCALE.SMALL, this.ITALIA_OFFSET_X);
        }
    }

    handleEsagonoClick(esagono) {
        // ... codice esistente ...

        // Animazione della regione
        d3.selectAll(".regione")
            .transition()
            .duration(800)
            .ease(d3.easeCubicInOut)
            .attr("transform", (d) => {
                if (d.properties.reg_name === esagono.regione) {
                    // Sposta e scala leggermente la regione cliccata
                    const currentTransform = d3.select(this).attr("transform") || "";
                    const translateX = -window.innerWidth * 0.2; // 20% verso sinistra
                    return `${currentTransform} translate(${translateX},0) scale(0.85)`;
                }
                return d.properties ? d.properties.transform || "" : "";
            });

        // ... resto del codice per gestire la visualizzazione dei dettagli ...
    }

    resetView() {
        d3.selectAll(".regione")
            .transition()
            .duration(800)
            .ease(d3.easeCubicInOut)
            .attr("transform", d => d.properties ? d.properties.transform || "" : "");
    }
}