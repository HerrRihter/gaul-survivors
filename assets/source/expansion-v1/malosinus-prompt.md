# Malosinus animation source

Generated with the built-in image_gen tool. Reference: the user's long-nosed Roman treasurer and the game's centurion sprite for inked cartoon style.

Prompt: Transparent 4 × 4 sprite sheet, 16 full-body poses of the same lanky Roman treasurer facing right. Long hooked nose, receding black hair, stern eyebrows, pale green tunic, emerald cloak, gold clasp and belt, white sandals, heavy brown money sack with a gold coin emblem. Four idle breathing poses; four alternating walking poses with cloak and sack lag; four attack poses (ready, raised windup, forward bag impact, follow-through); four hurt poses (flinch, recoil, stagger, recovery). Consistent scale and costume, bold ink outlines and cel shading. No helmet, shield, other weapon, background, captions or grid lines.

Packaging: `tools/import-expansion-art.cjs malosinus <sheet>` separates disconnected figures while preserving transparency and applies one scale across all actions. Runtime frames share the 256 × 256 canvas and [128, 236] foot anchor. The third attack frame matches impact progress 0.5.
