class GestoreIntro {
    constructor(gestoreAnimazioni) {
        this.gestoreAnimazioni = gestoreAnimazioni;
        this.font = loadFont('FONT/AeionMono-Bold.ttf');
        this.attivo = false;
        
        const config = CONFIGURAZIONE;
        this.testoRiga1 = config.testi.intro.riga1;
        this.testoRiga2 = config.testi.intro.riga2;
        this.testoCorrente1 = "";
        this.testoCorrente2 = "";
        this.bottoneVisibile = false;
        this.opacitaBottone = 0;
        this.opacitaGenerale = 255;
        this.inTransizione = false;
        this.durataTransizione = config.animazioni.durata.transizione;
        this.tempoInizioTransizione = 0;
        this.bottoneHover = false;
        this.larghezzaBottone = config.dimensioni.bottone.larghezza;
        this.altezzaBottone = config.dimensioni.bottone.altezza;
        this.inCancellazione = false;
        this.ultimaCancellazione = 0;
        this.velocitaCancellazione = config.animazioni.velocita.cancellazione;
        this.opacitaBottoneHover = 255;
    }

    aggiorna() {
        if (!this.attivo && !this.inTransizione) return;

        if (this.inTransizione) {
            let tempoCorrente = millis();
            
            if (this.inCancellazione) {
                if (tempoCorrente - this.ultimaCancellazione > this.velocitaCancellazione) {
                    // Cancella prima il secondo testo
                    if (this.testoCorrente2.length > 0) {
                        this.testoCorrente2 = this.testoCorrente2.slice(0, -1);
                    } 
                    // Poi il primo testo
                    else if (this.testoCorrente1.length > 0) {
                        this.testoCorrente1 = this.testoCorrente1.slice(0, -1);
                    }
                    // Quando entrambi i testi sono vuoti, passa alla transizione dell'Italia
                    else {
                        this.inCancellazione = false;
                        this.tempoInizioTransizione = tempoCorrente;
                    }
                    this.ultimaCancellazione = tempoCorrente;
                }
                return;
            }

            let tempoTrascorso = tempoCorrente - this.tempoInizioTransizione;
            let progressione = tempoTrascorso / this.durataTransizione;
            
            if (progressione >= 1) {
                this.attivo = false;
                this.inTransizione = false;
                this.opacitaGenerale = 0;
                this.opacitaItalia = 255;
            } else {
                let easeProgressione = this.easeInOutCubic(progressione);
                this.opacitaGenerale = lerp(255, 0, easeProgressione);
                this.opacitaItalia = lerp(0, 255, easeProgressione);
            }
            return;
        }

        this.testoCorrente1 = this.gestoreAnimazioni.animaTesto(
            this.testoCorrente1,
            this.testoRiga1
        );

        if (this.testoCorrente1 === this.testoRiga1) {
            this.testoCorrente2 = this.gestoreAnimazioni.animaTesto(
                this.testoCorrente2,
                this.testoRiga2
            );
        }

        if (this.testoCorrente2 === this.testoRiga2) {
            this.bottoneVisibile = true;
            this.opacitaBottone = lerp(this.opacitaBottone, 255, 0.1);
        }
    }

    disegna() {
        if (!this.attivo && !this.inTransizione) return;

        push();
        textFont(this.font);
        textAlign(CENTER, CENTER);
        textSize(32);
        fill(255, this.opacitaGenerale);
        
        // Disegna i testi
        text(this.testoCorrente1, width/2, height/2 - 30);
        text(this.testoCorrente2, width/2, height/2 + 30);

        // Disegna il bottone
        if (this.bottoneVisibile) {
            // Interpola gradualmente l'opacità del bottone
            let opacitaTarget = this.bottoneHover ? 200 : 255;
            this.opacitaBottoneHover = lerp(this.opacitaBottoneHover, opacitaTarget, 0.1);
            
            fill(this.opacitaBottoneHover, min(this.opacitaBottone, this.opacitaGenerale));
            rect(width/2 - this.larghezzaBottone/2, height/2 + 80, 
                 this.larghezzaBottone, this.altezzaBottone, 8);
            
            fill(0, min(this.opacitaBottone, this.opacitaGenerale));
            textSize(16);
            text("scopri di più", width/2, height/2 + 100);
        }
        pop();

        // Aggiorna stato hover
        this.bottoneHover = this.isMouseOverButton();
    }

    isMouseOverButton() {
        return (
            this.bottoneVisibile &&
            mouseX > width/2 - this.larghezzaBottone/2 && 
            mouseX < width/2 + this.larghezzaBottone/2 &&
            mouseY > height/2 + 80 && 
            mouseY < height/2 + 80 + this.altezzaBottone
        );
    }

    gestisciClick() {
        if (this.isMouseOverButton() && !this.inTransizione) {
            this.inTransizione = true;
            this.inCancellazione = true;
            this.ultimaCancellazione = millis();
            return true;
        }
        return false;
    }

    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    getOpacitaItalia() {
        return this.opacitaItalia;
    }
}