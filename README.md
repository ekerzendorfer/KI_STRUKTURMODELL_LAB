# KI-Strukturmodell-Labor v0.2.1

Mini-Tool für den Vergleich von KI-Strukturmodellen und experimentellen Proteinstrukturen.

Didaktischer Kern:

> Sequenz → KI-Strukturmodell → Experiment → Overlay → Modellgrenzen verstehen.

## Neu in v0.2.1

- Cache-Schutz: `index.html` lädt `app.js` und `style.css` mit Versionsparameter.
- `app.js` lädt `data/examples.json` ebenfalls mit Versionsparameter und Zeitstempel.
- Ubiquitin ruft vorerst keine AlphaFold-Remote-PDB mehr auf. Dadurch verschwinden fragile 404-Fehler durch alte/unstabile AlphaFold-Dateilinks.
- Trp-cage und Ubiquitin laden in v0.2.1 stabil die experimentellen RCSB-Strukturen.
- KI-Modelle können über den Upload getestet werden und werden in einer Folgeversion als lokale, kuratierte PDB-Dateien im Repo ergänzt.
- Der Viewer-Fix aus v0.1.2 bleibt erhalten.

## Repo-Struktur

```text
KI_STRUKTURMODELL_LAB/
├── index.html
├── app.js
├── style.css
├── data/
│   └── examples.json
├── structures/
│   ├── trp_cage/
│   ├── ubiquitin/
│   └── calmodulin/
└── colab/
    └── colabfold_template.ipynb
```

## Lokal testen

Nicht per Doppelklick öffnen, sondern im Repo-Ordner starten mit:

```bash
python -m http.server 8000
```

Dann im Browser:

```text
http://localhost:8000
```

## GitHub Pages

Für GitHub Pages sollte `index.html` im Root-Verzeichnis des Repos liegen.

Empfohlene Pages-Einstellung:

```text
Settings → Pages → Deploy from branch → main → /root
```

## Hinweise

- Trp-cage nutzt in v0.2 die experimentelle RCSB-Struktur 1L2Y.
- Ubiquitin nutzt die experimentelle RCSB-Struktur 1UBQ und versucht zusätzlich, über die AlphaFold-DB-API das aktuelle Modell zu laden.
- Calmodulin ist weiterhin nur als spätere Erweiterung vorbereitet.
- AlphaFold3 wird nicht angebunden; ein AF3-Calmodulin-Modell kann später als kuratierte Zusatzstruktur ergänzt werden.
