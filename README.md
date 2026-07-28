# KI-Strukturmodell-Labor v0.8.0

## Ziel von v0.8.0

Diese Version konsolidiert das MBP-Beispiel, ohne neue technische Komplexität einzubauen.

## Neu

- Die Maltose-Beschriftung wird standardmäßig nicht mehr angezeigt.
- Die Maltose bleibt deutlich sichtbar in Hellblau.
- Die geschlossene Bindetasche bleibt orange.
- Die offene Bindetasche ist hellviolett.
- Die langen PDB-Diagnosemeldungen sind im normalen Betrieb ausgeblendet.
- Die MBP-Statusmeldungen sind kürzer und stärker didaktisch formuliert.

## Farben im MBP-Beispiel

```text
offene Struktur:             grün
geschlossene Struktur:       orange/braun
Maltose / Ligand:            hellblau
Bindetasche geschlossen:     orange-gelb
Bindetasche offen:           hellviolett
```

## Update

Für ein Update auf v0.8.0 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
