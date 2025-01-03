class GestoreSvg {
    constructor() {
        this.svg = null;
        this.isLoaded = false;
        this.opacita = 0;
        this.targetOpacita = 0;
        this.caricaSVG();
    }

    caricaSVG() {
        loadImage('svg/cella.svg', 
            (img) => {
                console.log('SVG caricato con successo');
                this.svg = img;
                this.isLoaded = true;
            },
            (err) => {
                console.error('Errore nel caricamento dell\'SVG:', err);
            }
        );
    }

    impostaOpacita(valore) {
        this.targetOpacita = valore;
    }

    aggiornaOpacita() {
        this.opacita = lerp(this.opacita, this.targetOpacita, 0.1);
    }

    visualizza(esagonoIngrandito) {
        if (!this.isLoaded || !esagonoIngrandito) {
            return;
        }

        try {
            this.aggiornaOpacita();
            
            push();
            tint(255, this.opacita * 255); // Applica l'opacità all'immagine
            
            let svgWidth = esagonoIngrandito.raggio * esagonoIngrandito.scaleMultiplier * 2.85;
            let svgHeight = (svgWidth * 595.28) / 841.89;
            let svgX = esagonoIngrandito.x - svgWidth / 2;
            let svgY = esagonoIngrandito.y - svgHeight / 2;
            
            image(this.svg, svgX, svgY, svgWidth, svgHeight);
            pop();
        } catch (error) {
            console.error('Errore nel disegno dell\'SVG:', error);
        }
    }
} 