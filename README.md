# Tíz év – évfordulós játék

Astro + TypeScript évfordulós játék, statikus builddel és backend nélkül. GitHub Pages-re készül: `https://guzusoftware.github.io/10-years-anniversary/`.

## Fejlesztés

```bash
npm install
npm run dev
npm run test
npm run build
npx astro check
```

## Assetek

A fotók eredeti és optimalizált WebP-változatai a `public/assets/feladvany/` mappában találhatók. Az alkalmazás az optimalizált változatokat használja.

Az eszközökkel végzett helyi teszteléshez a `?dev=1&dog-preview=1` kapcsoló közvetlenül a 6. feladványt nyitja meg, ha nincs mentett játékállapot. A kutyás mini játék csak az `Indulás!` gomb megnyomása után kezdődik.

Ez a fejlesztői kapcsoló csak az Astro fejlesztői szerverén működik; a GitHub Pages-re készülő éles buildben le van tiltva.
