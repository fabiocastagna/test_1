class GestoreAnimazioni {
    constructor() {
        this.VELOCITA_ANIMAZIONE = 0.05;  // Velocità base delle animazioni
        this.VELOCITA_ANIMAZIONE_TESTO = 50;  // Velocità animazione testo (millisecondi)
        this.VELOCITA_ANIMAZIONE_SCALA = 0.05;  // Ridotto per un'animazione più fluida
        this.FLUIDITA_SCALA = 0.05;      // Nuovo parametro per la fluidità
        this.ultimoAggiornamento = 0;  // Aggiungi questa riga
        this.DURATA_TRANSIZIONE = 500; // 1 secondo per la transizione
        this.VELOCITA_TESTO = 50;  // millisecondi tra ogni carattere
        this.ultimoCarattereAggiunto = 0;
        this.inCancellazione = false;
    }

    // Animazione posizione
    interpolazione(start, end, amount = this.VELOCITA_ANIMAZIONE) {
        return start + (end - start) * amount;
    }

    // Animazione movimento esagono migliorata
    animaEsagono(esagono) {
        // Animazione posizione
        esagono.x = this.interpolazione(esagono.x, esagono.targetX);
        esagono.y = this.interpolazione(esagono.y, esagono.targetY);
        
        // Animazione scala con easing
        if (esagono.currentScale !== esagono.targetScale) {
            let nextScale = this.interpolazione(
                esagono.currentScale,
                esagono.targetScale,
                this.VELOCITA_ANIMAZIONE_SCALA
            );
            
            // Applica easing cubico
            let t = (nextScale - esagono.currentScale) / (esagono.targetScale - esagono.currentScale);
            t = this.easeInOutCubic(t);
            
            esagono.currentScale = lerp(esagono.currentScale, esagono.targetScale, t);
        }
    }

    // Animazione transizione regione
    animaTransizioneRegione(esagoni, posizioniTarget) {
        esagoni.forEach((esagono, index) => {
            const target = posizioniTarget[index];
            esagono.targetX = target.x;
            esagono.targetY = target.y;
            esagono.targetScale = target.scale;
            this.animaEsagono(esagono);
        });
    }

    // Funzione di easing cubico
    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Nuovo metodo per l'animazione del testo
    animaTesto(testoCorrente, testoTarget) {
        const tempoCorrente = millis();
        
        // Aggiunta caratteri
        if (testoCorrente.length < testoTarget.length) {
            if (tempoCorrente - this.ultimoCarattereAggiunto > this.VELOCITA_TESTO) {
                testoCorrente = testoTarget.substring(0, testoCorrente.length + 1);
                this.ultimoCarattereAggiunto = tempoCorrente;
            }
        }
        return testoCorrente;
    }
} 