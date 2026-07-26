# KI-Strukturmodell-Labor v0.5.1

Schlanke GitHub-Pages-Webapp zum Vergleich von KI-Proteinstrukturmodellen mit experimentellen Referenzstrukturen.

## Neu in v0.5.1

- Calmodulin erhält zwei optionale zusätzliche Vergleichspartner:
  - **AlphaFold-DB P0DP23** (`af2_alphafold_db.pdb`)
  - **AF3 mit Ca²⁺** (`af3_ca_model.pdb`, vorbereitet für später)
- Fehlende Dateien erzeugen nur Hinweise; die vorhandenen Modelle bleiben nutzbar.
- Für das AlphaFold-DB-Modell wird Residuum 1, das zusätzliche Start-Methionin der UniProt-Sequenz, ausgeblendet.
- Danach wird die Residuen-Nummerierung um -1 verschoben, damit der Vergleich mit der 1CLL-Referenz sinnvoll bleibt.

## AlphaFold-DB-Modell für Calmodulin

Download:

```text
https://alphafold.ebi.ac.uk/files/AF-P0DP23-F1-model_v4.pdb
```

Speichern als:

```text
structures/calmodulin/af2_alphafold_db.pdb
```

AlphaFold-DB-Eintrag:

```text
https://alphafold.ebi.ac.uk/entry/P0DP23
```

## Erwartete Strukturdateien für Calmodulin

```text
structures/calmodulin/
├── experimental_ca_bound.pdb
├── af2_best.pdb
├── af2_alternative.pdb
├── af2_alphafold_db.pdb      # optional, öffentliches AFDB-Modell P0DP23
├── didactic_decoy.pdb        # optional
└── af3_ca_model.pdb          # optional, späterer AF3-Server-Lauf mit Ca²⁺
```

## Update

Für ein Update auf v0.5.1 mindestens ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
colab/colabfold_template.ipynb
```

Den Ordner `structures/` nicht mit einem leeren Ordner überschreiben, wenn dort bereits PDB-Dateien liegen.
