class SvgManager {
  constructor() {
    this.svg = null;
    this.isLoaded = false;
    this.loadSVG();
  }

  loadSVG() {
    loadImage('svg/Tavola disegno 1.svg', 
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

  disegna(esagonoInterno) {
    if (!this.isLoaded) {
      console.log("SVG non ancora caricato.");
      return;
    }

    try {
      let svgWidth = esagonoInterno.size * 1.5;
      let svgHeight = svgWidth; // Assuming square scaling
      let svgX = width / 2 - svgWidth / 2;
      let svgY = height / 2 - svgHeight / 2;

      image(this.svg, svgX, svgY, svgWidth, svgHeight);
    } catch (error) {
      console.error('Errore nel disegno dell\'SVG:', error);
    }
  }
}
