class IntroManager {
    constructor() {
        this.statsElement = document.getElementById('prison-stats');
        this.startButton = document.getElementById('start-button');
        this.introPage = document.getElementById('intro-page');
        this.mainElement = document.querySelector('main');
        
        this.setupEventListeners();
        this.loadAndDisplayStats();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => {
            this.introPage.style.display = 'none';
            this.mainElement.style.display = 'block';
            // Qui puoi aggiungere il codice per inizializzare la mappa
        });
    }

    async loadAndDisplayStats() {
        try {
            const response = await fetch('Database/Data_Comp.csv');
            const data = await response.text();
            const rows = data.split('\n').slice(1); // Salta l'header
            
            const totalPrisons = rows.length;
            const overcrowdedPrisons = rows.filter(row => {
                const cols = row.split(',');
                const overcrowdingRate = parseFloat(cols[11]);
                return overcrowdingRate > 100;
            }).length;

            this.statsElement.textContent = 
                `In Italia ci sono ${totalPrisons} carceri, ${overcrowdedPrisons} di questi sono sovraffollati.`;
        } catch (error) {
            console.error('Errore nel caricamento dei dati:', error);
            this.statsElement.textContent = 
                'Errore nel caricamento delle statistiche.';
        }
    }
}

// Inizializza l'IntroManager quando il documento è caricato
document.addEventListener('DOMContentLoaded', () => {
    new IntroManager();
}); 