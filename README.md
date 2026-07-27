# KI-Strukturmodell-Labor v0.7.0

Schlanke GitHub-Pages-Webapp zum Vergleich von Proteinstrukturmodellen und experimentellen Strukturzuständen.

## Neu in v0.7.0

- Viertes Beispiel: **Maltose-Bindeprotein (MBP)**.
- Didaktischer Fokus: **Schlüssel-Schloss-Modell → induced fit**.
- Vergleich zunächst bewusst nur mit zwei experimentellen Strukturen:
  - `1OMP`: offene ligandfreie Form
  - `1ANF`: geschlossene maltosegebundene Form
- Die geschlossene maltosegebundene Struktur erscheint als **experimentelle Vergleichsstruktur**, nicht als KI-Modell.
- Maltose bleibt bei aktivierter Ligandenanzeige sichtbar.
- AF3 ohne/mit Maltose ist für spätere Versionen vorbereitet, aber noch nicht eingebaut.

## Erwartete Strukturdateien für MBP

```text
structures/mbp/
├── experimental_open_apo.pdb
└── experimental_closed_maltose.pdb
```

Download-Quellen:

```text
https://files.rcsb.org/download/1OMP.pdb
https://files.rcsb.org/download/1ANF.pdb
```

Die App nutzt diese RCSB-Links als Fallback. Für den stabilen Unterrichtsbetrieb sollten die Dateien aber lokal ins Repo gelegt werden.

## Update

Für ein Update auf v0.7.0 mindestens ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Zusätzlich aktualisiert:

```text
begleitkurs/strukturmodell_lab.md
```

Den Ordner `structures/` nicht überschreiben, wenn dort bereits PDB-Dateien liegen.

## Didaktische Linie

- Trp-cage: kleine Peptide und Modellvariation
- Ubiquitin: stabile Faltung und starke KI-Vorhersagen
- Calmodulin: Zustand, Calcium-Kontext und Grenzen eines einzelnen Strukturmodells
- MBP: Ligandenbindung, Domänenbewegung und induced fit
