# KI-Strukturmodell-Labor v0.4.1

Schlanke GitHub-Pages-Webapp zum Vergleich von KI-Proteinstrukturmodellen mit experimentellen Referenzstrukturen.

## Neu in v0.4.1

- Optionale **didaktische Störmodelle** ergänzt.
- Erwarteter Dateiname pro Beispiel: `didactic_decoy.pdb`.
- Fehlt diese Datei, entsteht kein Fehler: Die App zeigt nur einen Hinweis.
- Der Umschalter heißt nun **KI-/Vergleichsmodell**.
- Das Störmodell wird ausdrücklich als **kein AlphaFold/ColabFold-Ergebnis** gekennzeichnet.
- Viewer-Großansicht bleibt unverändert.

## Erwartete Strukturdateien

```text
structures/
├── trp_cage/
│   ├── experimental.pdb
│   ├── af2_best.pdb
│   ├── af2_alternative.pdb
│   └── didactic_decoy.pdb        # optional
└── ubiquitin/
    ├── experimental.pdb
    ├── af2_best.pdb
    ├── af2_alternative.pdb
    └── didactic_decoy.pdb        # optional
```

## Begriffe

- **beste Bewertung**: höchstbewertetes ColabFold-Modell
- **Vergleichsmodell**: niedriger bewertetes ColabFold-Modell
- **didaktisches Störmodell**: bewusst ausgewähltes oder erzeugtes Modell, das stärkere Abweichungen sichtbar macht; kein AlphaFold/ColabFold-Ergebnis

Das didaktische Störmodell darf z. B. aus PEP-FOLD, QUARK, Phyre2, I-TASSER oder aus einer transparent künstlich veränderten Struktur stammen. Wichtig ist die klare Kennzeichnung.

## Update

Für ein Update auf v0.4.1 mindestens ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
colab/colabfold_template.ipynb
```

Den Ordner `structures/` nicht mit einem leeren Ordner überschreiben, wenn dort bereits PDB-Dateien liegen.
