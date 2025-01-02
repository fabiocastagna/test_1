class SVGManager {
  constructor() {
    this.svgImage = null;
  }

  preloadSVG(path) {
    loadImage(path, img => {
      this.svgImage = img;
    });
  }

  disegna() {
    if (this.svgImage) {
      push();
      imageMode(CENTER);
      image(this.svgImage, width/2, height/2);
      pop();
    }
  }
}
