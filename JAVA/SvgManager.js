class SvgManager {
    constructor() {
        this.svg = null;
        this.isLoaded = false;
        this.loadSVG();
        window.addEventListener('resize', () => this.loadSVG());
    }

    loadSVG() {
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

    display(esagonoIngrandito) {
        if (!this.isLoaded || !esagonoIngrandito) {
            return;
        }

        try {
            let svgWidth = esagonoIngrandito.raggio * esagonoIngrandito.scaleMultiplier * 2.85;
            let svgHeight = (svgWidth * 595.28) / 841.89;
            let svgX = esagonoIngrandito.x - svgWidth / 2;
            let svgY = esagonoIngrandito.y - svgHeight / 2;
            
            image(this.svg, svgX, svgY, svgWidth, svgHeight);
        } catch (error) {
            console.error('Errore nel disegno dell\'SVG:', error);
        }
    }
}