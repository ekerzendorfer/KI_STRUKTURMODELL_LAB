# KI-Strukturmodell-Labor v0.7.9

## Neu in v0.7.9

Korrektur für korrekte 1ANF-Dateien, bei denen HETATM-Zeilen vorhanden sind, aber in der App dennoch nicht sichtbar wurden:

- Für die geschlossene MBP-Datei wird keine Chain-Filterung mehr verwendet.
- Falls bei der Vorverarbeitung HETATM-Zeilen verloren gehen, übernimmt die App den Liganden direkt aus der **Roh-PDB**.
- Das Statusfeld zeigt eine Ligandendiagnose:
  - HETATM nach Vorverarbeitung vorhanden
  - oder HETATM aus Roh-PDB übernommen
  - oder HETATM-Namen in der Rohdatei
- Die eingebettete Maltose-Reserve bleibt nur als letzter Fallback erhalten.

## Update

Für ein Update auf v0.7.9 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
