class Esagono {
    constructor(x, y, raggio, regione, colore, id) {
      this.x = x;
      this.y = y;
      this.originalX = x;
      this.originalY = y;
      this.raggio = raggio;
      this.regione = regione;
      this.colore = colore;
      this.opacita = 0;
      this.hoverState = 0;
      this.targetX = x;
      this.targetY = y;
      this.scaleMultiplier = 1;
      this.rotazione = HALF_PI;
      this.currentScale = 1;
      this.targetScale = 1;
      this.esagonoInterno = null;
      this.id = id;
      this.sovraffollamento = 0;
      this.spostamentoAttivo = false;
      this.tempoClick = 0;
      this.spostamentoBianco = 0;
      this.targetSpostamentoBianco = 0;
      this.inUscita = false;
      this.tempoInizioUscita = 0;
      this.durataUscita = 1000;
    }
  
    aggiorna() {
      this.x = lerp(this.x, this.targetX, 0.1);
      this.y = lerp(this.y, this.targetY, 0.1);
      
      if (this.tempoClick > 0 && !this.spostamentoAttivo && !this.inUscita) {
        if (millis() - this.tempoClick > 1000) {
          this.spostamentoAttivo = true;
          if (this.sovraffollamento > 100) {
            this.targetSpostamentoBianco = map(this.sovraffollamento, 100, 200, 0, this.raggio * 0.5);
          }
        }
      }
      
      if (this.inUscita) {
        let tempoTrascorso = millis() - this.tempoInizioUscita;
        let progresso = Math.min(tempoTrascorso / this.durataUscita, 1);
        
        let easeProgresso = this.easeInOutCubic(1 - progresso);
        
        this.spostamentoBianco = this.targetSpostamentoBianco * easeProgresso;
        
        if (progresso >= 1) {
          // Reset completo di tutte le proprietà di animazione
          this.inUscita = false;
          this.spostamentoAttivo = false;
          this.tempoClick = 0;
          this.spostamentoBianco = 0;
          this.targetSpostamentoBianco = 0;
          this.tempoInizioUscita = 0;
        }
      } else if (this.spostamentoAttivo) {
        this.spostamentoBianco = lerp(this.spostamentoBianco, this.targetSpostamentoBianco, 0.1);
      }
    }

    easeInOutCubic(t) {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    attivaAnimazione() {
      this.tempoClick = millis();
      this.spostamentoAttivo = false;
      this.spostamentoBianco = 0;
      this.inUscita = false;
    }

    disattivaAnimazione() {
      if (this.spostamentoAttivo && this.spostamentoBianco > 0) {
        this.inUscita = true;
        this.tempoInizioUscita = millis();
      } else {
        this.tempoClick = 0;
        this.spostamentoAttivo = false;
        this.spostamentoBianco = 0;
        this.targetSpostamentoBianco = 0;
      }
    }
  
    disegna() {
      push();
      translate(this.x, this.y);
      rotate(this.rotazione);
      
      // Disegna l'esagono rosso sotto (fermo)
      fill('red');
      beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * cos(angolo * PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * sin(angolo * PI / 3);
        vertex(verticeX, verticeY);
      }
      endShape(CLOSE);
      
      // Salva lo stato prima della traslazione dell'esagono bianco
      push();
      
      // Usa il valore animato per lo spostamento solo se l'animazione è attiva
      if (this.spostamentoAttivo || this.inUscita) {
        let spostamento = this.spostamentoBianco * this.scaleMultiplier;
        translate(spostamento * cos(2 * PI / 3), -spostamento * sin(2 * PI / 3));
      }
      
      // Disegna l'esagono nero
      fill('black');
      beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * cos(angolo * PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * sin(angolo * PI / 3);
        vertex(verticeX, verticeY);
      }
      endShape(CLOSE);
      
      // Ripristina lo stato per disegnare l'esagono con bordo nella posizione originale
      pop();
      
      // Disegna l'esagono con bordo (fermo)
      let strokeColor = lerpColor(color("grey"), color("white"), this.hoverState);
      let strokeW = lerp(2, 3, this.hoverState);
      stroke(strokeColor.levels[0], strokeColor.levels[1], strokeColor.levels[2], this.opacita);
      strokeWeight(strokeW);
      
      drawingContext.shadowBlur = lerp(0, 50, this.hoverState);
      drawingContext.shadowColor = color(
        red(this.colore), 
        green(this.colore), 
        blue(this.colore), 
        lerp(0, this.opacita, this.hoverState)
      );
      
      noFill();
      beginShape();
      for (let angolo = 0; angolo < 6; angolo++) {
        let verticeX = this.raggio * this.scaleMultiplier * cos(angolo * PI / 3);
        let verticeY = this.raggio * this.scaleMultiplier * sin(angolo * PI / 3);
        vertex(verticeX, verticeY);
      }
      endShape(CLOSE);
      
      // Disegna i cerchi colorati sempre, ma adatta le dimensioni in base alla scala
      strokeWeight(0);
      
      let targetOffsetX = -5.28 * this.scaleMultiplier;  // Offset per X
      let targetOffsetY = -5.2 * this.scaleMultiplier;  // Offset per Y
      let currentOffsetX = 0;
      let currentOffsetY = 0;
      
      if (this.scaleMultiplier > 1.5) {
        let progress = map(this.scaleMultiplier, 1.5, 20.0, 0, 1);
        currentOffsetX = lerp(0, targetOffsetX, progress);
        currentOffsetY = lerp(0, targetOffsetY, progress);
      }
      
      
      // Calcola la dimensione del cerchio interno in base allo scaleMultiplier
      let dimensioneInterna = map(this.scaleMultiplier, 1, 20, 0.5, 0.3);
      fill(color(red(this.colore), green(this.colore), blue(this.colore), this.opacita));
      ellipse(currentOffsetX, currentOffsetY, this.raggio * this.scaleMultiplier * dimensioneInterna);
      
      // Calcola la dimensione del cerchio esterno in base allo scaleMultiplier
      let dimensioneEsterna = map(this.scaleMultiplier, 1, 20, 1, 0.65);
      fill(color(red(this.colore), green(this.colore), blue(this.colore), this.opacita * 0.4));
      ellipse(currentOffsetX, currentOffsetY, this.raggio * this.scaleMultiplier * dimensioneEsterna);
      
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