# KI-Strukturmodell-Labor v0.8.2

## Ziel von v0.8.2

Diese Version ergänzt für MBP einen eigenen Unterschiede-Modus. Der Modus soll die Domänenbewegung beim Übergang von offener zu geschlossener Struktur didaktisch besser lesbar machen.

## Neu bei MBP

Die Schaltfläche **Unterschiede** bedeutet bei MBP nun:

```text
Domänenbewegung / induced fit sichtbar machen
```

Die Darstellung ist bewusst statisch:

- Die geschlossene Struktur wird über eine **Ankerdomäne** auf die offene Struktur ausgerichtet.
- Die **bewegte Domäne** wird in der offenen Form violett und in der geschlossenen Form orange hervorgehoben.
- Die **Hinge-/Scharnierbereiche** werden gelb markiert.
- Die Maltose bleibt hellblau.
- Die Bindetaschen bleiben sichtbar.

## Didaktische Einordnung

Diese Ansicht ist keine Animation und zeigt keinen realen Bewegungsweg. Sie stellt zwei experimentelle Endzustände so gegenüber, dass die Domänenbewegung besser erkennbar wird.

## Update

Für ein Update auf v0.8.2 ersetzen:

```text
index.html
app.js
style.css
data/examples.json
README.md
```

Den Ordner `structures/` nicht überschreiben.
