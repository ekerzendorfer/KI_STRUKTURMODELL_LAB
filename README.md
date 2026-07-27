# KI-Strukturmodell-Labor v0.7.6

## Neu in v0.7.6

Die MBP-Bindetasche wird robuster dargestellt:

- Maltose/Ligand wird als eigenes Zusatzmodell über die Cartoon-Struktur gelegt.
- Die Bindetaschen-Reste werden ebenfalls als eigene Stick-Darstellung ergänzt.
- Dadurch hängt die Darstellung nicht mehr davon ab, ob `addStyle` auf dem 3Dmol-Hauptmodell greift.
- Zusätzlich erscheint ein Label **Maltose / Ligand**.
- Das Statusfeld meldet vorhandene HETATM-Namen, falls kein Ligand gefunden wird.

## Update

Für ein Update auf v0.7.6 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
