# KI-Strukturmodell-Labor v0.2.0

Mini-Tool für den Vergleich von KI-Strukturmodellen und experimentellen Proteinstrukturen.

Didaktischer Kern:

> Sequenz → KI-Strukturmodell → Experiment → Overlay → Modellgrenzen verstehen.

## Neu in v0.2.0

- Viewer-Fix aus v0.1.2 bleibt erhalten.
- Ubiquitin verwendet nun nicht mehr den alten, fest verdrahteten AlphaFold-Dateilink.
- Das AlphaFold-Modell wird über die AlphaFold-DB-API anhand der aktuellen UniProt-ID `P62987` angefragt.
- Die frühere obsolete/instabile Referenz `P62988` wurde entfernt.
- Wenn ein KI-Modell nicht geladen werden kann, bleibt die experimentelle Struktur trotzdem sichtbar.
- Statusmeldungen unterscheiden Experiment, KI-Modell, Overlay und mögliche Warnungen.
- RMSD-Wert der Cα-Überlagerung wird im Statusbereich ausgegeben, wenn eine Überlagerung möglich ist.
- `structures/`-Ordner vorbereitet, damit spätere Versionen lokale, kuratierte PDB-Dateien nutzen können.

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
