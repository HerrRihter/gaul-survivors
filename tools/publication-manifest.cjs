'use strict';
module.exports={
  "pages": [
    "index.html",
    "legion-preview.html",
    "village-preview.html"
  ],
  "groups": [
    {
      "purpose": "Game rules, persistence, input, UI and render loop",
      "consumers": [
        "index.html",
        "legion-preview.html",
        "village-preview.html"
      ],
      "files": [
        "runtime/src/main.js",
        "runtime/src/pages/legion-preview.js",
        "runtime/src/pages/village-preview.js",
        "src/rendering/asset-paths.js",
        "src/systems/upgrades.js",
        "src/systems/persistence.js",
        "src/rendering/art/projectile-art.js",
        "src/entities/heroes.js",
        "data/animations/villager-layout.js",
        "data/animations/motion-v2-layout.js",
        "src/rendering/art/villager-art.js",
        "src/rendering/art/hero-art.js",
        "data/animations/menhir-layout.js",
        "src/rendering/art/menhir-art.js",
        "src/systems/corpses.js",
        "src/ui/menu-portraits.js",
        "src/app/game-session.js",
        "src/main.js", "src/core/math.js", "src/rendering/depth-order.js", "src/rendering/animation-player.js", "data/animations/action-timing.js",
        "src/world/village/village-data.js",
        "src/world/village/navigation.js",
        "src/world/village/village-renderer.js",
        "src/rendering/canvas.js",
        "src/core/audio.js",
        "src/rendering/sprite-renderer.js",
        "src/ui/game-ui.js",
        "src/app/game-flow.js",
        "src/systems/enemy-spawning.js",
        "src/systems/combat.js",
        "src/systems/simulation.js",
        "src/rendering/scene-renderer.js",
        "src/core/input.js",
        "src/core/game-loop.js",
        "src/pages/legion-preview.js",
        "src/pages/village-preview.js",
        "styles/game.css",
        "data/characters/heroes.js",
        "data/enemies/units.js", "data/enemies/waves.js"
      ]
    },
    {
      "purpose": "Roman art, animation bounds and units; legacy load-failure fallback",
      "consumers": [
        "index.html",
        "legion-preview.html"
      ],
      "files": [
        "src/rendering/art/roman-art-legacy.js",
        "src/rendering/art/roman-art.js",
        "data/animations/animation-layout.js",
        "src/rendering/art/animation-art.js",
        "data/animations/unit-layout.js",
        "src/rendering/art/unit-art.js",
        "src/entities/legion.js",
        "assets/runtime/characters/enemies/shared/roman-atlas-v2.png",
        "assets/runtime/characters/heroes/asterix/animations.png",
        "assets/runtime/characters/heroes/obelix/animations.png",
        "assets/runtime/characters/heroes/obelix/walk-v3.png",
        "assets/runtime/characters/heroes/cacofonix/walk-v3.png",
        "assets/runtime/characters/heroes/antisanitarix/walk-v3.png",
        "assets/runtime/characters/heroes/automatix/walk-v3.png",
        "assets/runtime/characters/heroes/panoramix/walk-v3.png",
        "assets/runtime/characters/enemies/shared/legion-animation.png",
        "assets/runtime/characters/enemies/shared/centurion-animation.png",
        "assets/runtime/characters/enemies/shared/legion-hurt.png",
        "assets/runtime/characters/enemies/spear/unit-spear-v1.png",
        "assets/runtime/characters/enemies/pilum/unit-pilum-v1.png",
        "assets/runtime/characters/enemies/veteran/unit-veteran-v1.png",
        "assets/runtime/characters/enemies/turtle/unit-turtle-v1.png",
        "assets/runtime/characters/enemies/ram/unit-ram-v1.png"
      ]
    },
    {
      "purpose": "Village scenery, ground texture, collision and navigation",
      "consumers": [
        "index.html",
        "legion-preview.html",
        "village-preview.html"
      ],
      "files": [
        "src/rendering/art/village-art.js",
        "src/world/village/collision.js",
        "src/world/village/village.js",
        "assets/runtime/world/village/village-chief.png",
        "assets/runtime/world/village/village-asterix.png",
        "assets/runtime/world/village/village-obelix.png",
        "assets/runtime/world/village/village-bard.png",
        "assets/runtime/world/village/village-forge.png",
        "assets/runtime/world/village/village-fish.png",
        "assets/runtime/world/village/village-gate.png",
        "assets/runtime/world/village/village-trees.png",
        "assets/runtime/world/village/village-fence.png",
        "assets/runtime/world/village/village-ground-v1.png"
      ]
    },
    {
      "purpose": "Hero portraits, projectiles, helmet currency and replacement walking sheets",
      "consumers": [
        "index.html"
      ],
      "files": [
        "assets/runtime/characters/heroes/asterix/portrait.png",
        "assets/runtime/characters/heroes/obelix/portrait.png",
        "assets/runtime/projectiles/projectiles-v2.png",
        "assets/runtime/projectiles/menhir-flight-v2.png",
        "assets/runtime/ui/roman-helmet-v1.png",
        "assets/runtime/characters/heroes/antisanitarix/hero-antisanitarix-walk-v2.png",
        "assets/runtime/characters/heroes/automatix/hero-automatix-walk-v2.png",
        "assets/runtime/characters/heroes/panoramix/hero-panoramix-walk-v2.png"
      ]
    },
    {
      "purpose": "Twelve isolated animation frames per unlockable hero",
      "consumers": [
        "index.html"
      ],
      "files": [
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-0.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-1.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-2.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-3.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-4.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-5.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-6.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-7.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-8.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-9.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-10.png",
        "assets/runtime/characters/heroes/cacofonix/animations/cacofonix-11.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-0.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-1.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-2.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-3.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-4.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-5.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-6.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-7.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-8.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-9.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-10.png",
        "assets/runtime/characters/heroes/antisanitarix/animations/antisanitarix-11.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-0.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-1.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-2.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-3.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-4.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-5.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-6.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-7.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-8.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-9.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-10.png",
        "assets/runtime/characters/heroes/automatix/animations/automatix-11.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-0.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-1.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-2.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-3.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-4.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-5.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-6.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-7.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-8.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-9.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-10.png",
        "assets/runtime/characters/heroes/panoramix/animations/panoramix-11.png"
      ]
    }
  ]
};
