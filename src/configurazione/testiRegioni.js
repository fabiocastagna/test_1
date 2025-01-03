const testiRegioni = {
    "Abruzzo": {
        titolo: "Abruzzo",
        descrizione: "Con 1543 posti e 2025 detenuti, il sovraffollamento è al 131%. Spazi pro capite ridotti, con 37 locali inutilizzabili. Docce e sanitari insufficienti aggravano la convivenza. Mediamente 3-4 persone per stanza, rendendo l'ambiente carcerario sovraccarico e poco vivibile."
    },
    "Basilicata": {
        titolo: "Basilicata",
        descrizione: "Capienza di 368 posti e 464 detenuti (126%). La riduzione di locali (41 inutilizzabili) limita gli spazi pro capite. Condizioni migliorabili, con circa 3 persone per stanza e sanitari che non coprono le necessità."
    },
    // ... altre regioni ...
};

// Funzione per ottenere il testo di una regione
function ottieniTestoRegione(nomeRegione) {
    return testiRegioni[nomeRegione] || {
        titolo: nomeRegione,
        descrizione: "Informazioni non disponibili per questa regione."
    };
} 