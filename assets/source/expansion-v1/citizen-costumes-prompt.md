# Additional citizen outfits

Generated with built-in image_gen, using citizen-0/1/2 walk/0.png as identity references.

Shared prompt: Preserve the original citizen's face, body type and Asterix-style inked cartoon design. Make a new costume variant, with exactly 16 full-body right-facing poses in four columns and four rows on a truly transparent background. Same costume and scale throughout. WALK: alternating strides and passing legs. TALK: listening, raised hand, open-hand gesture, settling. SHOP: examining coin, extending payment, inspecting purchase, holding purchase. REST: relaxed, sigh, gentle stretch, recovery. Keep signature prop visible; generous empty gutters, no scenery, labels, borders or shadows.

- citizen-3: baker in light cyan tunic, navy apron, cream cap, burgundy sash and brown sandals, carrying loaf.
- citizen-4: porter in cobalt blue sleeveless tunic, orange sash and tan sandals, carrying beige sack.
- citizen-5: scribe in sage green tunic, purple cloak, bronze clasp and brown sandals, carrying scroll.
- citizen-6: wealthy well-fed citizen in cream tunic with broad purple trim, gold clasp and buckle, fine sandals, small coin purse; no professional prop.
- citizen-7: sturdy builder with short brown beard, rolled-sleeve sand-coloured work tunic, leather apron and small wooden mallet tucked into belt; no modern hardhat, no combat.
- citizen-8: ordinary clean-shaven man in a plain terracotta tunic, rope belt and sandals; no cape, hat, jewellery, weapon or professional prop.

For citizen-6/7/8 the reference specifies art style only. All six additions have the same four animation actions. The builder remains a peaceful civilian; tools are part of the outfit.

Import: `node tools/import-expansion-art.cjs citizen-N <sheet.png>`. Four frames each for walk/talk/shop/rest; noncombat attack/hurt aliases follow the existing citizen convention. Runtime uses individual 256 × 256 RGBA files with foot anchor [128, 236].
