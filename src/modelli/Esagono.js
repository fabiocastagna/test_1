class Esagono {
    constructor(x, y, raggio, regione, colore, id) {
      this.x = x;
      this.y = y;
      this.originalX = x;
      this.originalY = y;
      this.raggio = raggio;
      this.regione = regione;
      this.colore = colore;
      this.opacita = 255;
      this.hoverState = 0;
      this.targetX = x;
      this.targetY = y;
      this.scaleMultiplier = 1;
      this.rotazione = HALF_PI;
      this.currentScale = 1;
      this.targetScale = 1;
      this.esagonoInterno = null;
      this.id = id;
    }
  
    aggiorna() {
      this.x = lerp(this.x, this.targetX, 0.1);
      this.y = lerp(this.y, this.targetY, 0.1);
    }
  
    disegna() {
      push();
      translate(this.x, this.y);
      rotate(this.rotazione);
      
      // Disegna l'esagono rosso sotto
      fill('red');
      beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * cos(angolo * PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * sin(angolo * PI / 3);
        vertex(verticeX, verticeY);
      }
      endShape(CLOSE);
      
      // Disegna l'esagono nero sopra quello rosso
      fill('black');
      beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * cos(angolo * PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * sin(angolo * PI / 3);
        vertex(verticeX, verticeY);
      }
      endShape(CLOSE);
      
      // Disegna l'esagono sopra
      let strokeColor = lerpColor(color("grey"), color("white"), this.hoverState);
      let strokeW = lerp(2, 3, this.hoverState);
      stroke(strokeColor);
      strokeWeight(strokeW);
      
      drawingContext.shadowBlur = lerp(0, 50, this.hoverState);
      drawingContext.shadowColor = color(
        red(this.colore), 
        green(this.colore), 
        blue(this.colore), 
        lerp(0, 250, this.hoverState)
      );
      
      noFill(); // Rimuove il riempimento nero
      beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * cos(angolo * PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * sin(angolo * PI / 3);
        vertex(verticeX, verticeY);
      }
      endShape(CLOSE);
      
      // Disegna i cerchi colorati sempre, ma adatta le dimensioni in base alla scala
      strokeWeight(0);
      
      let targetOffset = -5 * this.scaleMultiplier;
      let currentOffset = 0;
      
      if (this.scaleMultiplier > 1.5) {
        let progress = map(this.scaleMultiplier, 1.5, 20.0, 0, 1);
        currentOffset = lerp(0, targetOffset, progress);
        let blurAmount = map(this.scaleMultiplier, 1.5, 20.0, 0, 80);
        drawingContext.filter = `blur(${blurAmount}px)`;
      }
      
      fill(color(red(this.colore), green(this.colore), blue(this.colore), this.opacita));
      ellipse(currentOffset, currentOffset, this.raggio * this.scaleMultiplier * 0.5);
      
      fill(color(red(this.colore), green(this.colore), blue(this.colore), this.opacita * 0.5));
      ellipse(currentOffset, currentOffset, this.raggio * this.scaleMultiplier * 0.8);
      
      if (this.scaleMultiplier > 1.5) {
        drawingContext.filter = 'none';
      }
      
      if (this.scaleMultiplier >= this.SCALA_GRANDE) {
        fill(0);
        noStroke();
        beginShape();
        for (let angolo = 0; angolo < TWO_PI; angolo += TWO_PI / 6) {
          let x = cos(angolo) * this.raggio * this.scaleMultiplier * 0.9;
          let y = sin(angolo) * this.raggio * this.scaleMultiplier * 0.9;
          vertex(x + this.esagonoInterno?.x || 0, y + this.esagonoInterno?.y || 0);
        }
        endShape(CLOSE);
      }
      
      pop();
    }
} 