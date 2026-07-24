# KI-Strukturmodell-Labor v0.4.0

Schlanke GitHub-Pages-Webapp zum Vergleich von KI-Proteinstrukturmodellen mit experimentellen Referenzstrukturen.

## Neu in v0.4.0

- Trp-cage und Ubiquitin sind auf vollständig lokale Strukturdateien vorbereitet.
- Pro Beispiel können zwei ColabFold-KI-Modelle gewählt werden:
  - **beste Bewertung** (`af2_best.pdb`)
  - **Vergleichsmodell** (`af2_alternative.pdb`)
- Die App bietet einen kleinen Umschalter **KI-Modell**.
- Experimentelle Strukturen werden lokal aus `experimental.pdb` geladen; RCSB bleibt als Fallback eingetragen.
- Das bisherige Viewer-Großfenster bleibt unverändert; kein schwebendes Fenster in dieser Version.

## Erwartete Strukturdateien

```text
structures/
├── trp_cage/
│   ├── experimental.pdb
│   ├── af2_best.pdb
│   └── af2_alternative.pdb
└── ubiquitin/
    ├── experimental.pdb
    ├── af2_best.pdb
    └── af2_alternative.pdb
```

Übergangsweise wird für das bestbewertete Modell auch noch der alte Name `af2_colabfold.pdb` akzeptiert, falls `af2_best.pdb` noch nicht vorhanden ist.

## Didaktische Begriffe

- **Experiment**: experimentell bestimmte Referenzstruktur
- **beste Bewertung**: höchstbewertetes ColabFold-Modell
- **Vergleichsmodell**: niedriger bewertetes Modell zur Diskussion von Modellqualität und Modellgrenzen

Das Vergleichsmodell ist nicht automatisch „falsch“. Es dient dazu, Bewertung, Unsicherheit und Interpretation von KI-Modellen sichtbar zu machen.

## Dateien für ein Update

Für ein Update auf v0.4.0 mindestens ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
colab/colabfold_template.ipynb
```

Den Ordner `structures/` im Repo nicht mit einem leeren Ordner aus einem ZIP überschreiben, wenn dort bereits PDB-Dateien liegen.
