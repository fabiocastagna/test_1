class GestoreIntro {
    constructor() {
        this.inizializzaElementi();
        this.impostaEventListeners();
        this.caricaEVisualizzaStatistiche();
    }

    inizializzaElementi() {
        this.elementoStatistiche = document.getElementById('prison-stats');
        this.pulsanteInizio = document.getElementById('start-button');
        this.paginaIntro = document.getElementById('intro-page');
        this.elementoPrincipale = document.querySelector('main');
    }

    impostaEventListeners() {
        this.pulsanteInizio.addEventListener('click', () => {
            this.paginaIntro.style.display = 'none';
            this.elementoPrincipale.style.display = 'block';
        });
    }

    async caricaEVisualizzaStatistiche() {
        try {
            const dati = await this.ottieniDati();
            const { totaleCarceri, carceriSovraffollate } = this.elaboraDati(dati);
            this.visualizzaStatistiche(totaleCarceri, carceriSovraffollate);
            this.impostaAnimazioni();
        } catch (error) {
            console.error('Errore nel caricamento dei dati:', error);
            this.elementoStatistiche.textContent = 'Errore nel caricamento delle statistiche.';
        }
    }

    async ottieniDati() {
        const risposta = await fetch('Database/Data_Comp.csv');
        return await risposta.text();
    }

    elaboraDati(dati) {
        const righe = dati.split('\n').slice(1);
        const totaleCarceri = righe.length;
        const carceriSovraffollate = righe.filter(riga => {
            const colonne = riga.split(',');
            return parseFloat(colonne[11]) > 100;
        }).length;
        return { totaleCarceri, carceriSovraffollate };
    }

    visualizzaStatistiche(totaleCarceri, carceriSovraffollate) {
        this.elementoStatistiche.innerHTML = `
            <span class="line1">In Italia ci sono <span class="number bold">${totaleCarceri}</span> carceri</span>
            <div class="line2-container">
                <span class="line2"><span class="number">${carceriSovraffollate}</span> di questi sono sovraffollati.</span>
            </div>
        `;
    }

    impostaAnimazioni() {
        setTimeout(() => {
            const line1 = this.elementoStatistiche.querySelector('.line1');
            line1.classList.add('typing-done');
        }, 2500);

        setTimeout(() => {
            const line2 = this.elementoStatistiche.querySelector('.line2');
            line2.classList.add('visible');
        }, 3500);

        setTimeout(() => {
            const line2 = this.elementoStatistiche.querySelector('.line2');
            line2.classList.add('typing-done');
            this.elementoStatistiche.classList.add('typing-done');
        }, 6000);
    }
}

document.addEventListener('DOMContentLoaded', () => new GestoreIntro()); 