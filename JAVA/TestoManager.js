class TestoManager {
    constructor(animationManager) {
        this.animationManager = animationManager;
        this.testoCorrente = "";
        this.testoTarget = "";
        this.ultimoAggiornamento = 0;
    }

    aggiornaTesto(regioneSelezionata) {
        if (!regioneSelezionata || !regionTexts[regioneSelezionata]) return;
        
        this.testoTarget = regionTexts[regioneSelezionata].description;
        const tempoTrascorso = millis() - this.ultimoAggiornamento;
        
        this.testoCorrente = this.animationManager.animateText(
            this.testoCorrente,
            this.testoTarget,
            tempoTrascorso
        );

        if (tempoTrascorso > this.animationManager.TEXT_ANIMATION_SPEED) {
            this.ultimoAggiornamento = millis();
        }
    }

    // ... resto della classe ...
}
