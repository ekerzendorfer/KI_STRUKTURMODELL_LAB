# KI-Strukturmodell-Labor v0.3.0

Mini-Tool zum Vergleich von KI-Strukturmodellen und experimentellen Proteinstrukturen.

## Neu in v0.3.0

- Beobachtungsauftrag pro Beispiel
- Modellgrenze pro Beispiel
- Button **Protokolltext erzeugen**
- Button **Protokolltext kopieren**
- Viewer-Optionen aus v0.2.5 bleiben erhalten:
  - dunkler / hellgrauer Hintergrund
  - Cartoon, Bänder + Seitenketten, Rückgrat-Stäbchen, Stäbchen, Linien, Kalotten / Spacefill
  - atomnahe Darstellungen mit Jmol/CPK-Elementfarben

## Enthaltene Beispiele

- Trp-cage: experimentelle NMR-Struktur 1L2Y, Einstieg / Mini-Protein
- Ubiquitin: experimentelle Struktur 1UBQ, Referenzprotein für späteren KI-Modellvergleich
- Calmodulin: als spätere Erweiterung für Ca²⁺, Zustandsabhängigkeit und optionales AF3-Modell vorbereitet

## Aktueller technischer Status

Die experimentellen Strukturen werden in dieser Version weiterhin remote von RCSB geladen. KI-Modelle werden vorerst per Upload getestet oder später als lokale, kuratierte PDB-Dateien ergänzt.

AlphaFold3 wird nicht angebunden. Ein AF3-Calmodulin-Modell kann später als manuell erzeugte, kuratierte Zusatzstruktur eingebunden werden.

## Repo-Struktur

```text
KI_STRUKTURMODELL_LAB/
├── index.html
├── app.js
├── style.css
├── data/
│   └── examples.json
└── colab/
    └── colabfold_template.ipynb
```

## Lokaler Test

Bitte nicht per Doppelklick öffnen, sondern im Projektordner starten:

```bash
python -m http.server 8000
```

Dann öffnen:

```text
http://localhost:8000
```
