class AnimationManager {
    constructor() {
        this.ANIMATION_SPEED = 0.1;  // Velocità base delle animazioni
        this.TEXT_ANIMATION_SPEED = 50;  // Velocità animazione testo (millisecondi)
        this.SCALE_ANIMATION_SPEED = 0.05;  // Ridotto per un'animazione più fluida
        this.SCALE_SMOOTHNESS = 0.03;      // Nuovo parametro per la fluidità
    }

    // Animazione posizione
    lerp(start, end, amount = this.ANIMATION_SPEED) {
        return start + (end - start) * amount;
    }

    // Animazione movimento esagono migliorata
    animateHexagon(esagono) {
        // Animazione posizione
        esagono.x = this.lerp(esagono.x, esagono.targetX);
        esagono.y = this.lerp(esagono.y, esagono.targetY);
        
        // Debug
        console.log("Current Scale:", esagono.currentScale);
        console.log("Target Scale:", esagono.scaleMultiplier);
        
        // Animazione scala con controllo più stretto
        if (esagono.currentScale !== esagono.scaleMultiplier) {
            let nextScale = this.lerp(
                esagono.currentScale,
                esagono.scaleMultiplier,
                0.03  // Valore più basso per una transizione più lenta
            );
            
            // Assicuriamoci che la scala non cambi troppo bruscamente
            let maxChange = 0.5; // Massimo cambiamento permesso per frame
            let scaleChange = nextScale - esagono.currentScale;
            if (Math.abs(scaleChange) > maxChange) {
                scaleChange = Math.sign(scaleChange) * maxChange;
                nextScale = esagono.currentScale + scaleChange;
            }
            
            esagono.currentScale = nextScale;
        }
    }

    // Animazione transizione regione
    animateRegionTransition(esagoni, targetPositions) {
        esagoni.forEach((esagono, index) => {
            const target = targetPositions[index];
            esagono.targetX = target.x;
            esagono.targetY = target.y;
            esagono.targetScale = target.scale;
            this.animateHexagon(esagono);
        });
    }

    // Animazione testo
    animateText(currentText, targetText, elapsedTime) {
        if (elapsedTime > this.TEXT_ANIMATION_SPEED) {
            if (currentText.length < targetText.length) {
                return targetText.substring(0, currentText.length + 1);
            }
        }
        return currentText;
    }
} 