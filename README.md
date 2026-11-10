# Pizza Rush 🍕

A 3D pizza cooking game for mobile: run a pizzeria in cities around the world.
Stretch the dough, add sauce, cheese and toppings, bake it golden in the oven and serve
customers before they lose patience.

- App id: `com.devfoxmy.pizzarush` · portrait · Android (Capacitor 8)
- Engine: three.js + TypeScript, bundled with esbuild (shared engine with Street Food Rush)
- Languages: English, Français, Español, العربية

## Build
```
npm ci
npm run build          # www/js/game.js
npx cap sync android
```
GitHub Actions builds `app-debug.apk` and `app-unsigned.aab` on every push and publishes them
to the `builds` branch.
