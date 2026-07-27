# KI-Strukturmodell-Labor v0.7.10

## Neu in v0.7.10

Diese Version ist eine Diagnose-/Stabilisierungsfassung für MBP:

- Im Statusfeld steht bei MBP jetzt ausdrücklich:
  - verwendete App-Version
  - geladener Dateipfad
  - ATOM/HETATM-Zahl in der Roh-PDB
  - ATOM/HETATM-Zahl nach der Vorverarbeitung
  - ATOM/HETATM-Zahl im finalen Viewer-PDB
- Wenn final trotzdem kein Ligand vorhanden ist, wird die eingebettete Maltose-Reserve erzwungen.

## Erwartete Diagnose bei korrekter 1ANF-Datei

```text
PDB-Diagnose 0.7.10: geladen aus structures/mbp/experimental_closed_maltose.pdb
Roh-PDB: ATOM 2860, HETATM 127 (GLC, HOH)
...
```

## Update

Für ein Update auf v0.7.10 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
