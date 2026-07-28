# KI-Strukturmodell-Labor v0.8.1

## Ziel von v0.8.1

Diese Version wertet den allgemeinen Unterschiede-Modus für Trp-cage, Ubiquitin und Calmodulin didaktisch auf.

MBP bleibt in dieser Version bewusst noch ohne eigene Domänenbewegungslogik. Diese folgt als separates, kleineres Arbeitspaket.

## Neu

- In der Ansicht **Unterschiede** werden die Gesamtmodelle blasser dargestellt.
- Abweichende Bereiche treten durch rot-orange Hervorhebung stärker hervor.
- Zusätzlich werden im Unterschiede-Modus Cα-Punkte markiert, damit beim Klick auf „Unterschiede“ sichtbar etwas im Viewer passiert.
- Das Textfeld unter dem Viewer erklärt jetzt klarer, was die hervorgehobenen Bereiche bedeuten.
- Residuen werden im Status und Textfeld zu übersichtlichen Bereichen zusammengefasst.

## Wichtig

Die Markierung ist kein „richtig/falsch“-Urteil. Sie zeigt nur, wo Modell und Vergleichsstruktur nach der Überlagerung am deutlichsten auseinanderliegen.

## Update

Für ein Update auf v0.8.1 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
