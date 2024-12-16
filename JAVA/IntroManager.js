class IntroManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadAndDisplayStats();
    }

    initializeElements() {
        this.statsElement = document.getElementById('prison-stats');
        this.startButton = document.getElementById('start-button');
        this.introPage = document.getElementById('intro-page');
        this.mainElement = document.querySelector('main');
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => {
            this.introPage.style.display = 'none';
            this.mainElement.style.display = 'block';
        });
    }

    async loadAndDisplayStats() {
        try {
            const data = await this.fetchData();
            const { totalPrisons, overcrowdedPrisons } = this.processData(data);
            this.displayStats(totalPrisons, overcrowdedPrisons);
            this.setupAnimations();
        } catch (error) {
            console.error('Errore nel caricamento dei dati:', error);
            this.statsElement.textContent = 'Errore nel caricamento delle statistiche.';
        }
    }

    async fetchData() {
        const response = await fetch('Database/Data_Comp.csv');
        return await response.text();
    }

    processData(data) {
        const rows = data.split('\n').slice(1);
        const totalPrisons = rows.length;
        const overcrowdedPrisons = rows.filter(row => {
            const cols = row.split(',');
            return parseFloat(cols[11]) > 100;
        }).length;
        return { totalPrisons, overcrowdedPrisons };
    }

    displayStats(totalPrisons, overcrowdedPrisons) {
        this.statsElement.innerHTML = `
            <span class="line1">In Italia ci sono <span class="number bold">${totalPrisons}</span> carceri</span>
            <div class="line2-container">
                <span class="line2"><span class="number">${overcrowdedPrisons}</span> di questi sono sovraffollati.</span>
            </div>
        `;
    }

    setupAnimations() {
        setTimeout(() => {
            const line1 = this.statsElement.querySelector('.line1');
            line1.classList.add('typing-done');
        }, 2500);

        setTimeout(() => {
            const line2 = this.statsElement.querySelector('.line2');
            line2.classList.add('visible');
        }, 3500);

        setTimeout(() => {
            const line2 = this.statsElement.querySelector('.line2');
            line2.classList.add('typing-done');
            this.statsElement.classList.add('typing-done');
        }, 6000);
    }
}

document.addEventListener('DOMContentLoaded', () => new IntroManager()); 