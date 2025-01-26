class GestoreAnimazioni {
    constructor() {
        const config = CONFIGURAZIONE.animazioni;
        this.VELOCITA_ANIMAZIONE = config.velocita.base;
        this.VELOCITA_ANIMAZIONE_TESTO = config.velocita.testo;
        this.VELOCITA_ANIMAZIONE_SCALA = config.velocita.scala;
        this.FLUIDITA_SCALA = config.velocita.fluidita;
        this.DURATA_TRANSIZIONE = config.durata.transizione;
        this.VELOCITA_TESTO = config.velocita.testo;
        this.ultimoAggiornamento = 0;
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

    // Nuova funzione per animare l'opacità
    animaOpacita(opacitaCorrente, opacitaTarget, velocita = 0.1) {
        return lerp(opacitaCorrente, opacitaTarget, velocita);
    }

    // Nuova funzione per animare la scala con durata
    animaScalaConDurata(scalaCorrente, scalaTarget, tempoInizio, durata) {
        const tempoTrascorso = millis() - tempoInizio;
        const progresso = Math.min(tempoTrascorso / durata, 1);
        const easeProgresso = this.easeInOutCubic(progresso);
        
        return lerp(scalaCorrente, scalaTarget, easeProgresso);
    }

    // Nuova funzione per gestire le transizioni generiche
    gestisciTransizione(valoreCorrente, valoreTarget, durata, tempoInizio) {
        const tempoTrascorso = millis() - tempoInizio;
        const progresso = Math.min(tempoTrascorso / durata, 1);
        return {
            valore: lerp(valoreCorrente, valoreTarget, this.easeInOutCubic(progresso)),
            completata: progresso >= 1
        };
    }
} 