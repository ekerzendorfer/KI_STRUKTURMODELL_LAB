# KI-Strukturmodell-Labor v0.5.2

Schlanke GitHub-Pages-Webapp zum Vergleich von KI-Proteinstrukturmodellen mit experimentellen Referenzstrukturen.

## Neu in v0.5.2

- Calmodulin-Erklärung didaktisch geschärft:
  - Experiment 1CLL = konkreter Ca²⁺-gebundener Zustand
  - ColabFold/AF2 = Sequenzmodell ohne explizit gesetzte Calcium-Ionen
  - AlphaFold-DB = öffentliches AF2-Modell AF-P0DP23-F1
  - AF3 mit Ca²⁺ = AlphaFold-Server-Modell mit vier explizit vorgegebenen Calcium-Ionen
  - didaktisches Störmodell = optional, klar als Vergleichsmodell gekennzeichnet
- Viewer-Hintergrund ist standardmäßig hellgrau.
- Einzelansichten der KI-/Vergleichsmodelle werden bereits an der experimentellen Referenz ausgerichtet.
- Neues Colab-Hilfsnotebook:
  - `colab/cif_to_pdb_converter.ipynb`
  - konvertiert CIF/mmCIF-Dateien nach PDB mit Gemmi.

## Calmodulin-Strukturdateien

```text
structures/calmodulin/
├── experimental_ca_bound.pdb
├── af2_best.pdb
├── af2_alternative.pdb
├── af2_alphafold_db.pdb
├── af3_ca_model.pdb
└── didactic_decoy.pdb        # optional
```

## Didaktisches Störmodell

Für Calmodulin ist ein didaktisches Störmodell optional. Es sollte nicht völlig willkürlich sein, sondern noch proteinartig wirken und z. B. eine andere Domänenorientierung oder stärker verschobene End-/Linkerbereiche zeigen.

Geeignete Quellen:
- stärker abweichendes QUARK-Modell
- stärker abweichendes Phyre2-Modell
- anderes transparent dokumentiertes Vergleichsmodell

Wenn ColabFold/AF2, AlphaFold-DB und AF3 mit Ca²⁺ bereits genügend Kontrast liefern, kann `didactic_decoy.pdb` auch weggelassen werden.

## Update

Für ein Update auf v0.5.2 mindestens ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
colab/colabfold_template.ipynb
colab/cif_to_pdb_converter.ipynb
```

Den Ordner `structures/` nicht mit einem leeren Ordner überschreiben, wenn dort bereits PDB-Dateien liegen.
