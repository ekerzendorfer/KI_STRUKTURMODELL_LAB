# KI-Strukturmodell-Labor v0.2.2

Mini-Tool für den Vergleich von KI-Strukturmodellen und experimentellen Proteinstrukturen.

Didaktischer Kern:

> Sequenz → KI-Strukturmodell → Experiment → Overlay → Modellgrenzen verstehen.

## Neu in v0.2.2

- Umschaltbarer Viewer-Hintergrund: dunkel oder hellgrau.
- Einfache Darstellungsoptionen: Bänder/Cartoon, Bänder + Stäbchen, Stäbchen, Linien, Kalotten/Sphären.
- Die stabilen Remote-Strukturen aus v0.2.1 bleiben unverändert.
- Trp-cage und Ubiquitin laden weiterhin die experimentellen RCSB-Strukturen.
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

- Trp-cage nutzt die experimentelle RCSB-Struktur 1L2Y.
- Ubiquitin nutzt die experimentelle RCSB-Struktur 1UBQ. Ein KI-Modell wird bewusst erst lokal/kuratiert oder per Upload ergänzt.
- Calmodulin ist weiterhin nur als spätere Erweiterung vorbereitet.
- AlphaFold3 wird nicht angebunden; ein AF3-Calmodulin-Modell kann später als kuratierte Zusatzstruktur ergänzt werden.
