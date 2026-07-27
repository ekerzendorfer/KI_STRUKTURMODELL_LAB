# KI-Strukturmodell-Labor v0.7.2

## Neu in v0.7.2

Korrektur der MBP-Bedienung als eigenes experimentelles Zustandspaar:

- MBP nutzt keine KI-Modell-Dropdown-Logik mehr.
- Die Schaltflächen heißen bei MBP:
  - **offen**
  - **geschlossen**
  - **offen + geschlossen**
  - **Unterschiede**
- Beim Öffnen wird nur die offene Struktur **1OMP** angezeigt.
- „geschlossen“ zeigt nur die maltosegebundene Struktur **1ANF**.
- „offen + geschlossen“ überlagert beide experimentellen Zustände.
- Die geschlossene Struktur wird nicht mehr als KI-/Vergleichsmodell angeboten.

## Erwartete lokale MBP-Dateien

```text
structures/mbp/experimental_open_apo.pdb
structures/mbp/experimental_closed_maltose.pdb
```

## Update

Für ein Update auf v0.7.2 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
