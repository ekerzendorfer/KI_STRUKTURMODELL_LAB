# KI-Strukturmodell-Labor v0.7.4

## Neu in v0.7.4

Korrektur zur MBP-Bindetaschen-Hervorhebung:

- Maltose/HETATM werden nicht mehr versehentlich durch den Chain-A-Filter entfernt.
- Die geschlossene MBP-Struktur darf Protein-Kette A verwenden, während die Maltose eine andere oder keine Chain-ID trägt.
- Das Statusfeld meldet jetzt, ob Maltose gefunden wurde und wie viele Proteinreste in der Bindetasche markiert wurden.
- Die Hervorhebung ist robuster gegenüber unterschiedlichen PDB-Ligandennamen wie `MAL`, `BMA`, `GLC`, `MLT`, `A2G`.

## Erwartete lokale MBP-Dateien

```text
structures/mbp/experimental_open_apo.pdb
structures/mbp/experimental_closed_maltose.pdb
```

## Update

Für ein Update auf v0.7.4 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
