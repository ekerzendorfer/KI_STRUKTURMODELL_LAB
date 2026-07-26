# KI-Strukturmodell-Labor v0.6.0

Schlanke GitHub-Pages-Webapp zum Vergleich von KI-Proteinstrukturmodellen mit experimentellen Referenzstrukturen.

## Neu in v0.6.0

- Didaktische Konsolidierung direkt in der App:
  - Tabelle **Modelltypen richtig lesen**
  - Aufgabenmodus mit drei Schritten:
    1. Beobachte
    2. Vergleiche
    3. Formuliere die Modellgrenze
- Aufgaben sind pro Beispiel datengetrieben in `data/examples.json` hinterlegt.
- Protokolltext übernimmt den Aufgabenmodus.
- Begleitkurs-Seite ergänzt:
  - `begleitkurs/strukturmodell_lab.md`

## Update

Für ein Update auf v0.6.0 mindestens ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Zusätzlich neu kopieren:

```text
begleitkurs/strukturmodell_lab.md
```

Der Ordner `structures/` soll nicht überschrieben werden, wenn dort bereits PDB-Dateien liegen.

## Didaktische Linie

- Trp-cage: kleine Peptide und Modellvariation
- Ubiquitin: stabile Proteine und starke KI-Vorhersagen
- Calmodulin: Zustand, Calcium-Kontext und Grenzen eines einzelnen Strukturmodells
