class Esagono {
    constructor(x, y, raggio, regione, colore) {
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
    }
  
    aggiorna() {
      this.x = lerp(this.x, this.targetX, 0.1);
      this.y = lerp(this.y, this.targetY, 0.1);
    }
  
    disegna() {
      push();
      translate(this.x, this.y);
      rotate(this.rotazione);
      
      let strokeColor = lerpColor(color("grey"), color("white"), this.hoverState);
      let strokeW = lerp(0.5, 2, this.hoverState);
      stroke(strokeColor);
      strokeWeight(strokeW);
      
      drawingContext.shadowBlur = lerp(0, 50, this.hoverState);
      drawingContext.shadowColor = color(
        red(this.colore), 
        green(this.colore), 
        blue(this.colore), 
        lerp(0, 150, this.hoverState)
      );
      
      fill(0);
      beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * cos(angolo * PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * sin(angolo * PI / 3);
        vertex(verticeX, verticeY);
      }
      endShape(CLOSE);
      
      strokeWeight(0);
      fill(color(red(this.colore), green(this.colore), blue(this.colore), this.opacita));
      ellipse(0, 0, this.raggio * this.scaleMultiplier * 0.5);
      
      fill(color(red(this.colore), green(this.colore), blue(this.colore), this.opacita * 0.5));
      ellipse(0, 0, this.raggio * this.scaleMultiplier * 0.8);
      
      pop();
    }
  }