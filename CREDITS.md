# Credits & asset sources

Every asset in Pizza Rush is original. Nothing is copied from another game
(no names, logos, models, sounds or interface from any existing game).

## Generated with Higgsfield (owner's Pro account, commercial use under the account's plan)
| Asset | File | Tool / model |
|---|---|---|
| Chef mascot artwork (title screen, app icon, splash) | `art/concepts/chef2.jpg` → `www/img/chef.png`, icons | Higgsfield image (gpt_image_2_5) |
| Customer character, rigged + walk animation (8 outfits recolored in code: `src/outfits.ts`) | `www/models/customer.glb` (concept `art/concepts/cust1.jpg`) | Higgsfield image → Meshy Image-to-3D (texture, rigging, Casual_Walk) |
| Naples, New York, Tokyo, Istanbul, Mumbai, Rio de Janeiro style backgrounds | `www/img/nap.jpg`, `nyc.jpg`, `tyo.jpg`, `ist.jpg`, `bom.jpg`, `rio.jpg` | Canva AI image generation (owner's Canva account), generic streets, no real brands |
| 6 more customers (young woman, grandpa, teen, tourist, businesswoman, grandma), rigged + walk | `www/models/customer2.glb` … `customer7.glb` | Higgsfield image → Meshy Image-to-3D (PBR texture, rigging, Casual_Walk); textures resized to 1024 px WebP with glTF-Transform |

All prompts asked for generic designs: no text, no logos, no brands.

## Made in code (this repository)
- The street cat (`src/cat.ts`), pizzas, toppings, oven, bowls and cups (`src/food.ts`, `src/scene.ts`), the counter and the awning
- All sounds and music: generated with Web Audio in `src/audio.ts` (no sound files)
- App icon / splash composition: `tools/make_icons.py`

## Libraries
- three.js (MIT), Capacitor (MIT)
- Emoji in the order bubbles are rendered by the phone's system font.

