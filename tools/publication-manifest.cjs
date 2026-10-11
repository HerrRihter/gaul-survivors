'use strict';
const characterFrames=require('../data/animations/character-frames.json');
module.exports={
  "pages": [
    "index.html",
    "legion-preview.html",
    "village-preview.html"
  ],
  "groups": [
    {purpose:'Independent character poses and shared loader',consumers:['index.html','legion-preview.html'],files:['src/rendering/character-frames.js','data/animations/character-frames.js',...[...new Set(Object.values(characterFrames.characters).flatMap(c=>Object.values(c.actions).flat()))].map(file=>"assets/runtime/"+file)]},
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
        "src/rendering/art/villager-art.js",
        "src/rendering/art/hero-art.js",
        "data/animations/menhir-layout.js",
        "src/rendering/art/menhir-art.js",
        "src/systems/corpses.js",
        "src/ui/menu-portraits.js",
        "src/ui/character-preview.js",
        "data/animations/character-bounds.js",
        "assets/runtime/world/expansion/command-v1.png", "assets/runtime/world/expansion/supplies-v1.png", "assets/runtime/world/expansion/fire-v1.png", "assets/runtime/world/expansion/standard-v1.png", "assets/runtime/world/expansion/tent-round-v1.png", "assets/runtime/world/expansion/weapons-v1.png", "assets/runtime/world/expansion/tent-v1.png", "assets/runtime/world/expansion/rocks-v1.png", "src/rendering/art/scenery-art.js", "src/world/arenas.js", "data/enemies/expansion.js", "src/systems/expansion.js", "src/rendering/art/expansion-art.js",
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
      "purpose": "Roman portraits, animation adapters and units; legacy load-failure fallback",
      "consumers": [
        "index.html",
        "legion-preview.html"
      ],
      "files": [
        "src/rendering/art/roman-art-legacy.js",
        "src/rendering/art/roman-art.js",
        "src/rendering/art/animation-art.js",
        "src/rendering/art/unit-art.js",
        "src/entities/legion.js",
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
      "purpose": "Static hero portraits, projectiles and helmet currency",
      "consumers": [
        "index.html"
      ],
      "files": [
        "assets/runtime/characters/heroes/asterix/portrait.png",
        "assets/runtime/characters/heroes/obelix/portrait.png",
        "assets/runtime/projectiles/projectiles-v2.png",
        "assets/runtime/projectiles/menhir-flight-v2.png",
        "assets/runtime/ui/roman-helmet-v1.png"
      ]
    }
  ]
};
