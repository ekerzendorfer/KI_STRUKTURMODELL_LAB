# KI-Strukturmodell-Labor v0.7.1

## Neu in v0.7.1

Kleine Korrektur zur MBP-Bedienlogik:

- Beim Öffnen von MBP wird zunächst nur die offene ligandfreie Struktur **1OMP** angezeigt.
- Die geschlossene maltosegebundene Struktur **1ANF** wird als **experimenteller Vergleichszustand** geführt.
- Das Dropdown bleibt bei MBP sichtbar, aber gesperrt, weil es derzeit nur einen geschlossenen Vergleichszustand gibt.
- Overlay/Unterschiede werden erst aktiv genutzt, wenn man bewusst auf die Vergleichsansicht umschaltet.
- Die Beschriftung vermeidet stärker den Eindruck, dass 1ANF ein KI-Modell sei.

## Erwartete lokale MBP-Dateien

```text
structures/mbp/experimental_open_apo.pdb
structures/mbp/experimental_closed_maltose.pdb
```

## Update

Für ein Update auf v0.7.1 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
