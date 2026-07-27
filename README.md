# KI-Strukturmodell-Labor v0.7.5

## Neu in v0.7.5

Korrektur der MBP-Einzelansicht und der Bindetaschen-Erkennung:

- Beim Öffnen von MBP bleibt die App jetzt wirklich bei **offen** statt wieder auf Overlay zu springen.
- Beim Klick auf **geschlossen** wird 1ANF als Einzelzustand gezeigt und nicht automatisch an 1OMP ausgerichtet.
- Die vielen Abweichungslisten erscheinen bei der geschlossenen Einzelansicht nicht mehr.
- Liganden werden robuster erkannt:
  - bevorzugt bekannte Maltose-/Zucker-Namen
  - falls diese nicht gefunden werden, Fallback auf übrige HETATM nach Wasserfilter
- Das Statusfeld nennt den tatsächlich gefundenen Ligandennamen und die Zahl der markierten Bindetaschenreste.

## Erwartete lokale MBP-Dateien

```text
structures/mbp/experimental_open_apo.pdb
structures/mbp/experimental_closed_maltose.pdb
```

## Update

Für ein Update auf v0.7.5 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
