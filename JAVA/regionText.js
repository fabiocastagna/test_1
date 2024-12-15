const regionTexts = {
    "Abruzzo": {
        title: "Abruzzo",
        description: "Con 1543 posti e 2025 detenuti, il sovraffollamento è al 131%. Spazi pro capite ridotti, con 37 locali inutilizzabili. Docce e sanitari insufficienti aggravano la convivenza. Mediamente 3-4 persone per stanza, rendendo l'ambiente carcerario sovraccarico e poco vivibile."
    },
    "Basilicata": {
        title: "Basilicata",
        description: "Capienza di 368 posti e 464 detenuti (126%). La riduzione di locali (41 inutilizzabili) limita gli spazi pro capite. Condizioni migliorabili, con circa 3 persone per stanza e sanitari che non coprono le necessità."
    },
    "Calabria": {
        title: "Calabria",
        description: "2711 posti per 2997 detenuti (110%). Spazi limitati, con 68 locali inutilizzabili, e un sovraffollamento che spesso porta a 4-5 persone per cella. Servizi igienici e docce non soddisfano le esigenze della popolazione carceraria."
    },
    "Campania": {
        title: "Campania",
        description: "6222 posti previsti per 7568 detenuti (122%). Spazi sovraccarichi, con 281 locali inutilizzabili. Mediamente 5 detenuti per stanza, con condizioni di vivibilità al limite e servizi igienici spesso insufficienti."
    },
    "Emilia-Romagna": {
        title: "Emilia-Romagna",
        description: "2984 posti e 3827 detenuti (128%). Il sovraffollamento riduce gli spazi pro capite, con 129 locali inutilizzabili. Circa 4 persone per stanza, servizi doccia migliorabili per garantire condizioni dignitose."
    },
    "Friuli-Venezia Giulia": {
        title: "Friuli-Venezia Giulia",
        description: "484 posti per 689 detenuti (142%). Sovraffollamento grave, con 6 locali non disponibili. Spazi ridotti e circa 4 persone per cella, situazione resa critica da carenze nei servizi sanitari."
    },
    "Lazio": {
        title: "Lazio",
        description: "5282 posti e 6772 detenuti (128%). Grave sovraffollamento con 496 locali inutilizzabili. Spazi pro capite insufficienti, circa 5-6 persone per stanza e servizi sovraccarichi rendono il contesto particolarmente difficile."
    },
    "Liguria": {
        title: "Liguria", 
        description: "1608 posti e 1953 detenuti (121%). Con 72 locali non disponibili, gli spazi pro capite sono ridotti. Mediamente 4 detenuti per stanza, con sanitari insufficienti per garantire condizioni ottimali."
    },
    "Lombardia": {
        title: "Lombardia",
        description: "6258 posti e 9123 detenuti (146%). Regione con il maggiore sovraffollamento, con 261 locali inutilizzabili. Spazi ridotti costringono 5-6 persone per stanza. Servizi sanitari e docce non adeguati."
    },
    "Marche": {
        title: "Marche",
        description: "837 posti per 955 detenuti (114%). Spazi ridotti, con 85 locali inutilizzabili. Circa 3-4 persone per cella, con condizioni accettabili ma migliorabili nei servizi igienici."
    },
    "Molise": {
        title: "Molise",
        description: "275 posti e 367 detenuti (133%). Spazi sovraffollati, con 32 locali inutilizzabili. Mediamente 4 persone per stanza, sanitari limitati e docce insufficienti."
    },
    "Piemonte": {
        title: "Piemonte",
        description: "3325 posti per 3712 detenuti (112%). Con 202 locali inutilizzabili, gli spazi pro capite sono ridotti. Circa 3-4 persone per stanza, con docce e sanitari al limite della sufficienza."
    },
    "Puglia": {
        title: "Puglia",
        description: "2943 posti per 4388 detenuti (149%). Sovraffollamento grave, con 209 locali non disponibili. Mediamente 5 persone per stanza, con servizi sanitari e docce inadeguati."
    },
    "Sardegna": {
        title: "Sardegna",
        description: "2614 posti per 2280 detenuti (87%). Unica regione con capienza quasi adeguata, ma 99 locali inutilizzabili. Mediamente 2-3 persone per stanza, condizioni gestibili ma con spazi da ottimizzare."
    },
    "Sicilia": {
        title: "Sicilia",
        description: "6439 posti e 6930 detenuti (108%). Leggero sovraffollamento, con 313 locali inutilizzabili. Mediamente 3-4 persone per stanza, con servizi migliorabili per adeguarsi alle necessità."
    },
    "Toscana": {
        title: "Toscana",
        description: "3162 posti per 3254 detenuti (103%). Condizioni non critiche ma 391 locali inutilizzabili riducono gli spazi pro capite. Mediamente 3 persone per stanza, con sanitari al limite."
    },
    "Trentino-Alto Adige": {
        title: "Trentino-Alto Adige",
        description: "510 posti per 486 detenuti (95%). Situazione equilibrata, con 4 locali inutilizzabili. Mediamente 2-3 persone per cella, spazi gestibili e servizi adeguati."
    },
    "Umbria": {
        title: "Umbria",
        description: "1429 posti e 1595 detenuti (112%). Sovraffollamento moderato, con 63 locali non disponibili. Circa 3-4 persone per cella, docce e sanitari inadeguati per le necessità."
    },
    "Valle d'Aosta": {
        title: "Valle d'Aosta",
        description: "181 posti per 148 detenuti (82%). Situazione ottimale, con 13 locali inutilizzabili nell'unica struttura carceraria presente nella regione. Mediamente 1-2 persone per cella, spazi e servizi ampiamente sufficienti."
    },
    "Veneto": {
        title: "Veneto",
        description: "1946 posti per 2656 detenuti (136%). Grave sovraffollamento, con 119 locali inutilizzabili. Circa 4-5 persone per stanza, con servizi sanitari al di sotto delle necessità."
    }
};

// Funzione per ottenere il testo di una regione
function getRegionText(regionName) {
    return regionTexts[regionName] || {
        title: regionName,
        description: "Informazioni non disponibili per questa regione."
    };
} 