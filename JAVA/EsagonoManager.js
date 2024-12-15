class EsagonoManager {
    constructor(mappaManager) {
        this.mappaManager = mappaManager;
        this.esagonoIngrandito = null;
        this.ITALIA_OFFSET_X = -width * 0.5;
        this.REGIONE_OFFSET_X = width * 0.33;
    }

    gestisciClickEsagonoRegione(esagonoCliccato) {
        let regioneEsagoni = this.mappaManager.esagoni.filter(e => 
            e.regione === this.mappaManager.regioneSelezionata
        );

        // Se c'è già un esagono ingrandito e si clicca sulla regione a sinistra
        if (this.esagonoIngrandito && esagonoCliccato.scaleMultiplier === 1.2) {
            // Ripristina la vista della regione al centro
            let centerX = regioneEsagoni.reduce((sum, h) => sum + h.originalX, 0) / regioneEsagoni.length;
            let centerY = regioneEsagoni.reduce((sum, h) => sum + h.originalY, 0) / regioneEsagoni.length;
            
            regioneEsagoni.forEach(hex => {
                let offsetX = hex.originalX - centerX;
                let offsetY = hex.originalY - centerY;
                hex.targetX = width * 0.5 + offsetX * 1.2;
                hex.targetY = height * 0.5 + offsetY * 1.2;
                hex.scaleMultiplier = 1.2;
            });

            // Riporta l'Italia rimpicciolita a sinistra
            this.mappaManager.esagoni.filter(e => 
                e.regione !== this.mappaManager.regioneSelezionata
            ).forEach(hex => {
                hex.targetX = hex.originalX * 0.3 + width * 0.1;
                hex.targetY = hex.originalY * 0.3 + height * 0.35;
                hex.scaleMultiplier = 0.3;
            });

            this.esagonoIngrandito = null;
        } else {
            // Sposta l'esagono cliccato al centro e ingrandiscilo
            regioneEsagoni.forEach(hex => {
                if (hex === esagonoCliccato) {
                    hex.targetX = width * 0.5;
                    hex.targetY = height * 0.5;
                    hex.scaleMultiplier = 15.0;
                    this.esagonoIngrandito = hex;
                } else {
                    // Sposta gli altri esagoni della regione a 1/3 della viewport orizzontale e 1/2 di quella verticale
                    let centerX = regioneEsagoni.reduce((sum, h) => sum + h.originalX, 0) / regioneEsagoni.length;
                    let centerY = regioneEsagoni.reduce((sum, h) => sum + h.originalY, 0) / regioneEsagoni.length;
                    let offsetX = hex.originalX - centerX;
                    let offsetY = hex.originalY - centerY;
                    hex.targetX = this.REGIONE_OFFSET_X + offsetX * 1.2;
                    hex.targetY = height * 0.5 + offsetY * 1.2;
                    hex.scaleMultiplier = 1.2;
                }
            });

            // Sposta l'Italia a metà viewport
            this.mappaManager.esagoni.filter(e => 
                e.regione !== this.mappaManager.regioneSelezionata
            ).forEach(hex => {
                hex.targetX = hex.originalX * 0.3 + this.ITALIA_OFFSET_X;
                hex.targetY = hex.originalY * 0.3 + height * 0.35;
                hex.scaleMultiplier = 0.3;
            });
        }
    }
}