class SvgManager {
    constructor() {
        this.svg = null;
        this.isLoaded = false;
        this.loadSVG();
    }

    loadSVG() {
        loadImage('svg/Tavola disegno 1.svg', 
            // Success callback
            (img) => {
                console.log('SVG caricato con successo');
                this.svg = img;
                this.isLoaded = true;
            },
            // Error callback
            (err) => {
                console.error('Errore nel caricamento dell\'SVG:', err);
            }
        );
    }

    display(esagonoIngrandito) {
        if (!this.isLoaded || !esagonoIngrandito) {
            console.log('SVG non ancora caricato o nessun esagono ingrandito');
            return;
        }

        try {
            let svgWidth = esagonoIngrandito.raggio * esagonoIngrandito.scaleMultiplier * 2;
            let svgHeight = (svgWidth * 595.28) / 841.89;
            let svgX = esagonoIngrandito.x - svgWidth / 2;
            let svgY = esagonoIngrandito.y - svgHeight / 2;
            
            image(this.svg, svgX, svgY, svgWidth, svgHeight);
        } catch (error) {
            console.error('Errore nel disegno dell\'SVG:', error);
        }
    }
}
