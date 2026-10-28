// live/setting-look.js — the setting's look (NetSurvivors' data centre), read by scene.js as SETTING.LOOK: the palette, the clients'
// code-drawn emblems, prop heights, the rig of every actor, icon and art stand-ins. Another game on the engine replaces this file with
// setting.js and the art (docs/PLAN-GAUL.md, stage 1). Loaded after sim.js (the hero rig shares SIM.RIG) and before scene.js.
(function (root) {
  const SIM = root.SIM, G = root.G;
  // effect and interface colours (linear 0..1); the effect families: ICE cold, ELEC electric, PHYS physical objects, *_HI evolutions
  const INK = [0.02, 0.06, 0.09], CYAN = [1.0, 0.8, 0.32], MINT = [0.39, 1.0, 0.85], CORAL = [1.0, 0.4, 0.35], HAZ = [1.0, 0.84, 0.0];
  const ICE = [0.8, 0.94, 1], ELEC = [0.62, 0.5, 1], ELEC_HI = [0.82, 0.74, 1], CYAN_HI = [1.0, 0.94, 0.7], PHYS = [0.8, 0.88, 1], PHYS_HI = [0.95, 0.98, 1];

  // client emblems and marks, ported from utreys-survivors (src/rendering/art/client-emblems.js), painted once into textures and
  // laid on the plain area of each body (never mirrored, so lettering always reads)
  const EMB_AT = { mars: [0.6, 0.5, 'mars'], loreal: [0.62, 0.62, 'loreal'], multon: [0.63, 0.56, 'multon'], baltika: [0.62, 0.62, 'baltika'], ferrero: [0.62, 0.56, 'ferrero'],
    vetis: [0.6, 0.55, 'vetis'], keg: [0.8, 0.42, 'inbev'], bugu: [0.65, 0.5, 'bug'], buga: [0.63, 0.42, 'bug'], bugl: [0.62, 0.4, 'bug'], bugg: [0.62, 0.4, 'bug'], crpt: [0.6, 0.48, 'crpt'],
    mond: [0.6, 0.5, 'mondelez'], prog: [0.56, 0.5, 'progress'], royal: [0.6, 0.5, 'royal_canin'], cherk: [0.66, 0.46, 'cherkizovo'], pg: [0.56, 0.46, 'procter_gamble'],
    petfood: [0.6, 0.48, 'mars_petfood'], logq: [0.8, 0.36, 'log'] };
  function emblems() {
    const neon = (g, c) => { g.save(); g.shadowColor = c; g.shadowBlur = 4; g.strokeStyle = c; g.lineWidth = 2; g.stroke(); g.restore(); };
    const word = (g, t, x, y, sz, c, wt = 'bold', fam = 'Arial, sans-serif') => { g.save(); g.font = `${wt} ${sz}px ${fam}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = c; g.shadowBlur = 3; g.fillStyle = c; g.fillText(t, x, y); g.restore(); };
    const plate = 'rgba(6,16,24,0.88)';
    const ell = (g, x, y, rx, ry, fill, st) => { g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = plate; g.fill(); neon(g, st || fill); };
    const poly = (g, pts, fill, st) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = plate; g.fill(); neon(g, st || fill); };
    const D = {
      mars: (g) => { poly(g, [[-26, -40], [26, -40], [26, -4], [-26, -4]], '#ff4a3d'); word(g, 'M', 0, -22, 22, '#ffeb3b', 'italic 900'); },
      inbev: (g) => { poly(g, [[-28, -40], [28, -40], [28, -6], [-28, -6]], '#d4af37'); word(g, 'INBEV', 0, -23, 12, '#ffd700'); },
      baltika: (g) => { ell(g, 0, -22, 25, 29, '#3a7bff', '#e5c76f'); word(g, 'Балтика', 0, -29, 11, '#ffffff', 'italic bold');
        for (let i = 0; i < 3; i++) { g.strokeStyle = '#e5c76f'; g.lineWidth = 2; g.beginPath(); g.moveTo(-17, -18 + i * 6); g.bezierCurveTo(-6, -25 + i * 6, 6, -11 + i * 6, 17, -18 + i * 6); g.stroke(); } },
      multon: (g) => { poly(g, [[-24, -34], [-10, -47], [18, -42], [27, -17], [14, 0], [-18, -3]], '#a9b6ad', '#ef833f'); ell(g, 12, -36, 9, 4, '#53ab55');
        word(g, 'multon', 0, -24, 12, '#7fc4ff'); word(g, 'partners', 0, -12, 7, '#7fc4ff'); ell(g, -17, -8, 3, 3, '#f7ad31'); },
      loreal: (g) => { poly(g, [[-29, -36], [25, -36], [29, -5], [-25, -5]], '#14131c', '#e8b9cb'); g.fillStyle = '#e8b9cb'; g.fillRect(-21, -31, 42, 1);
        word(g, 'L’ORÉAL', 0, -21, 11, '#ffffff', 'normal'); word(g, 'PARIS', 0, -11, 6, '#e8b9cb'); },
      ferrero: (g) => { ell(g, 0, -22, 31, 22, '#b7b29b', '#e2c27a'); word(g, 'FERRERO', 0, -22, 11, '#f0d9a8', 'bold', 'Georgia, serif');
        g.strokeStyle = '#c4a565'; g.beginPath(); g.moveTo(-16, -13); g.lineTo(16, -13); g.stroke(); },
      vetis: (g) => { poly(g, [[0, -49], [25, -39], [22, -10], [0, 5], [-22, -10], [-25, -39]], '#114f47', '#8edbb9'); g.strokeStyle = '#f1d882'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(0, -42); g.lineTo(0, -17); g.stroke(); g.beginPath(); g.moveTo(6, -39); g.bezierCurveTo(-16, -37, 15, -28, -5, -22); g.stroke(); word(g, 'ВЕТИС', 0, -8, 9, '#ffffff'); },
      bug: (g) => { word(g, 'BUG', 0, -22, 22, '#ffd600', 'italic 900'); },
      crpt: (g) => { word(g, 'ЦРПТ', 0, -22, 18, '#ffd600', 'bold', 'Consolas, monospace'); },
      mondelez: (g) => { ell(g, 0, -22, 32, 23, '#4e247a', '#bda0e3'); word(g, 'mondelēz', 0, -26, 11, '#ffffff', 'italic bold'); word(g, 'international', 0, -15, 6, '#f0dffc');
        g.strokeStyle = '#ee537b'; g.lineWidth = 3; g.beginPath(); g.arc(0, -15, 14, 0.45, Math.PI - 0.45); g.stroke(); },
      progress: (g) => { ell(g, 0, -22, 28, 25, '#b6c6b8', '#4e8b51'); const cs = ['#ec4050', '#f2a52c', '#5baf45', '#2595c6', '#985bb7'];
        [...'Фруто'].forEach((ch, i) => word(g, ch, -19 + i * 9.5, -28, 14, cs[i])); word(g, 'Няня', 0, -13, 16, '#db365d'); },
      royal_canin: (g) => { ell(g, 0, -21, 29, 26, '#b9c4ba', '#ce2942'); poly(g, [[-15, -29], [-18, -40], [-8, -34], [0, -45], [8, -34], [18, -40], [15, -29]], '#cf233c');
        word(g, 'ROYAL', 0, -20, 10, '#ff5a6e'); word(g, 'CANIN', 0, -9, 10, '#ff5a6e'); },
      cherkizovo: (g) => { poly(g, [[-28, -39], [28, -39], [24, -9], [0, 4], [-24, -9]], '#ad153d', '#f5c2ac'); g.strokeStyle = '#ffffff'; g.lineWidth = 3;
        g.beginPath(); g.moveTo(-8, -32); g.lineTo(-8, -24); g.lineTo(7, -24); g.moveTo(7, -32); g.lineTo(7, -15); g.stroke(); word(g, 'ЧЕРКИЗОВО', 0, -7, 7, '#ffffff'); },
      procter_gamble: (g) => { ell(g, 0, -22, 27, 27, '#0753ba', '#83c7ff'); g.strokeStyle = '#83c7ff'; g.lineWidth = 2; g.beginPath(); g.arc(0, -22, 22, 0.7, 4.2); g.stroke();
        word(g, 'P&G', 0, -21, 20, '#ffffff', 'italic bold', 'Georgia, serif'); },
      mars_petfood: (g) => { ell(g, 0, -21, 25, 25, '#123ba5', '#73d9ed'); word(g, 'MARS', 0, -26, 13, '#ffffff'); ell(g, 0, -13, 6, 4, '#73d9ed');
        for (const [x, y] of [[-7, -18], [-2, -21], [3, -21], [8, -18]]) { g.beginPath(); g.arc(x, y, 2.3, 0, 6.29); g.fillStyle = '#73d9ed'; g.fill(); } },
      log: (g) => { word(g, '> LOG_', 0, -22, 16, '#b49cff', 'bold', 'Consolas, monospace'); },
    };
    for (const k in D) { const cv = document.createElement('canvas'), sc = 6; cv.width = 70 * sc; cv.height = 64 * sc; const g = cv.getContext('2d'); g.scale(sc, sc); g.translate(35, 52); D[k](g);
      G.canvasTex('emb_' + k, cv); }
  }

  // props' drawn heights (view px), unless sizes.js measured them
  const PH = { hut: 330, cauldron: 150, menhir: 250, rack: 230, rack_b: 230, ups: 96, pdu: 96, cell: 112, cart: 116, cart_b: 116, core: 400, cage: 470, crac: 200, tray: 130, firerack: 150, switch: 112, desk: 140, tapelib: 220, patch: 230, blade: 150, dock: 70, holopillar: 150, spool: 110, manifold: 110, batbank: 110, switchstack: 220, crates: 120, mast: 170, rack_open: 230 };   // prop heights, view px

  // ---------------- rigs: per actor type, view px; legs and arms are one drawing each, cut at the joint ----------------
  // hipY = hip height at rest, leg = hip→ankle length (two equal bones), hipW = half hip width, sh* = shoulders, stride = one gait cycle
  const RIGS = {
    // the Gauls and Romans by their designs (gaul-survivors): a legionary about 95 px tall, Asterix 1.35× smaller; body = head and torso
    // (Asterix 69%, the legionary 74% of the height), short legs (about 22%), big shoes; the drawn limbs are thin, legK / armK widen them
    hero:  { body: 55, hipY: 22, leg: 27, legW: 6, legK: 1.4, lift: 0.11, D: 0.35, hipW: 6, foot: [20, 9], shY: SIM.RIG.shY, shW: SIM.RIG.shX, arm: SIM.RIG.arm, armW: 6, armK: 1.25, stride: 60, bob: 4, flip: true },
    node:  { body: 60, hipY: 26, leg: 31, legW: 13, hipW: 14, foot: [21, 12], shY: 50, shW: 30, arm: 24, armW: 11, stride: 52, bob: 3, flip: true },
    legion: { body: 78, hipY: 23, leg: 28, legW: 6, legK: 1.25, hipW: 9, foot: [19, 10], shY: 58, shW: 13, arm: 27, armW: 6, armK: 1.5, stride: 52, bob: 3, flip: true },
    panel: { body: 58, hipY: 24, leg: 29, legW: 11, hipW: 10, foot: [19, 11], shY: 44, shW: 34, arm: 21, armW: 10, stride: 48, bob: 3, flip: true },
    orb:   { body: 68, hipY: 25, leg: 30, legW: 13, hipW: 16, foot: [23, 13], shY: 46, shW: 33, arm: 23, armW: 12, stride: 52, bob: 3, flip: true },
    keg:   { body: 88, hipY: 29, leg: 34, legW: 18, hipW: 22, foot: [29, 15], shY: 64, shW: 42, arm: 29, armW: 16, stride: 62, bob: 4, flip: true },
    boss:  { body: 210, hipY: 60, leg: 66, legW: 40, hipW: 52, foot: [62, 32], shY: 168, shW: 100, arm: 70, armW: 34, stride: 150, bob: 9, flip: true },
    bug:   { body: 150, hex: true, hipY: 18, leg: 60, legW: 18, reach: 80, stride: 120, bob: 3, flip: true },
    mars:    { body: 64, hipY: 25, leg: 30, legW: 14, hipW: 16, foot: [24, 13], shY: 46, shW: 33, arm: 25, armW: 12, bob: 3, flip: true },
    loreal:  { body: 62, hipY: 25, leg: 30, legW: 13, hipW: 17, foot: [24, 13], shY: 44, shW: 40, arm: 24, armW: 12, bob: 3, flip: true },
    multon:  { body: 58, hipY: 24, leg: 29, legW: 12, hipW: 13, foot: [22, 12], shY: 42, shW: 32, arm: 22, armW: 11, bob: 3, flip: true },
    baltika: { body: 94, hipY: 29, leg: 34, legW: 18, hipW: 22, foot: [29, 15], shY: 68, shW: 40, arm: 29, armW: 16, bob: 4, flip: true },
    ferrero: { body: 62, hipY: 25, leg: 30, legW: 14, hipW: 20, foot: [25, 13], shY: 42, shW: 48, arm: 25, armW: 12, bob: 3, flip: true },
    vetis:   { body: 86, hipY: 28, leg: 33, legW: 16, hipW: 18, foot: [27, 14], shY: 60, shW: 38, arm: 28, armW: 14, bob: 4, flip: true },
    bugu:    { body: 82, hipY: 27, leg: 32, legW: 15, hipW: 20, foot: [27, 14], shY: 56, shW: 42, arm: 27, armW: 14, bob: 4, flip: true },
    bugl:    { body: 84, hipY: 27, leg: 32, legW: 15, hipW: 22, foot: [28, 14], shY: 56, shW: 46, arm: 27, armW: 14, bob: 4, flip: true },
    bugg:    { body: 84, hipY: 27, leg: 32, legW: 15, hipW: 20, foot: [27, 14], shY: 56, shW: 44, arm: 27, armW: 14, bob: 4, flip: true },
    buga:    { body: 82, hipY: 27, leg: 32, legW: 15, hipW: 20, foot: [27, 14], shY: 56, shW: 44, arm: 27, armW: 14, bob: 4, flip: true },
    mond:    { body: 58, hipY: 24, leg: 29, legW: 12, hipW: 16, foot: [23, 12], shY: 40, shW: 46, arm: 23, armW: 11, bob: 4, flip: true },
    prog:    { body: 66, hipY: 25, leg: 30, legW: 13, hipW: 16, foot: [24, 13], shY: 46, shW: 34, arm: 24, armW: 12, bob: 3, flip: true },
    royal:   { body: 66, hipY: 25, leg: 30, legW: 13, hipW: 17, foot: [24, 13], shY: 46, shW: 40, arm: 24, armW: 12, bob: 3, flip: true },
    cherk:   { body: 84, hipY: 29, leg: 34, legW: 18, hipW: 22, foot: [29, 15], shY: 62, shW: 44, arm: 29, armW: 16, bob: 4, flip: true },
    pg:      { body: 92, hipY: 29, leg: 34, legW: 17, hipW: 22, foot: [29, 15], shY: 58, shW: 44, arm: 29, armW: 16, bob: 4, flip: true },
    petfood: { body: 64, hipY: 25, leg: 30, legW: 13, hipW: 16, foot: [24, 13], shY: 46, shW: 34, arm: 24, armW: 12, bob: 3, flip: true },
    logq:    { body: 88, hipY: 28, leg: 33, legW: 16, hipW: 22, foot: [28, 14], shY: 60, shW: 46, arm: 28, armW: 14, bob: 3, flip: true },
    batch:   { body: 230, hipY: 62, leg: 68, legW: 42, hipW: 58, foot: [64, 32], shY: 180, shW: 112, arm: 72, armW: 36, bob: 9, flip: true },
    sdesk:   { body: 200, desk: true, hipY: 0, leg: 1, legW: 1, hipW: 60, foot: [1, 1], shY: 0, shW: 0, arm: 1, armW: 1, bob: 0, flip: false },
    crpt:    { body: 200, hipY: 58, leg: 64, legW: 38, hipW: 50, foot: [60, 30], shY: 160, shW: 96, arm: 68, armW: 32, bob: 9, flip: true },
    // the «Дата-центр»'s bosses (stage 5): the replica is wide and low, the retry storm tall, the outage the biggest of all
    repl:    { body: 190, hipY: 56, leg: 60, legW: 38, hipW: 56, foot: [60, 30], shY: 150, shW: 104, arm: 64, armW: 32, bob: 8, flip: true },
    rstorm:  { body: 220, hipY: 62, leg: 70, legW: 38, hipW: 50, foot: [60, 30], shY: 176, shW: 96, arm: 72, armW: 32, bob: 10, flip: true },
    outage:  { body: 250, hipY: 66, leg: 72, legW: 46, hipW: 62, foot: [70, 34], shY: 196, shW: 120, arm: 78, armW: 40, bob: 8, flip: true },
  };
  // the component minibosses are drawn 1.8× (every length of the rig scales with the body)
  for (const k of ['bugu', 'bugl', 'bugg', 'buga']) { const r = RIGS[k]; for (const f of ['body', 'hipY', 'leg', 'legW', 'hipW', 'shY', 'shW', 'arm', 'armW', 'bob']) r[f] *= 1.8; r.foot = r.foot.map((v) => v * 1.8); }

  // the floor: dark panels, a thin 100 px grid, a bright 500 px grid with a halo, circuit traces with pads, pulses running along
  // the major lines; the neon colour comes from the zone (soft 150 px blend at zone edges), world-anchored (u_cam)
  // the floor shader (scene.js draws it full screen; uniforms: u_cam world offset, u_t time, u_z0..4 zone rectangles, u_c0..4 their
  // colours, u_pc the plaza colour, u_pat / u_pat4 each zone's pattern index; v_px the pixel; hash, vnoise, fbm from gl.js)
  const FLOOR = `uniform vec2 u_cam; uniform vec4 u_z0, u_z1, u_z2, u_z3, u_z4; uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4, u_pc; uniform vec4 u_pat; uniform float u_pat4;
void main(){ vec2 w0 = v_px + u_cam, w = vec2(w0.x, w0.y / 0.62);
  vec2 c = vec2(4000.0, 3000.0 / 0.62); float wob = (fbm(w / 260.0) - 0.5) * 260.0;
  float plaza = 1.0 - smoothstep(1050.0, 1250.0, length((w - c) * vec2(1.0, 0.8)) + wob);                        // the trampled village square
  float road = 1.0 - smoothstep(170.0, 260.0, abs(w.x - 4000.0 + sin(w.y / 900.0) * 140.0) + wob * 0.4);       // the north–south track
  float dirt = max(plaza, road);
  float g = fbm(w / 180.0), gd = fbm(w / 37.0);
  vec3 grass = mix(vec3(0.42, 0.58, 0.27), vec3(0.58, 0.70, 0.33), g) * (0.92 + 0.12 * gd);
  float tuft = smoothstep(0.72, 0.8, vnoise(w / 9.0 + vec2(0.0, w.x / 31.0))) * (1.0 - dirt);                       // grass blades
  grass = mix(grass, vec3(0.33, 0.48, 0.22), tuft * 0.5);
  vec3 earth = mix(vec3(0.80, 0.69, 0.60), vec3(0.72, 0.60, 0.52), fbm(w / 120.0)) * (0.95 + 0.08 * gd);
  float pebble = smoothstep(0.86, 0.9, vnoise(w / 7.0)) * dirt;
  earth = mix(earth, vec3(0.62, 0.55, 0.50), pebble * 0.6);
  float edge = smoothstep(0.35, 0.5, dirt) * (1.0 - smoothstep(0.5, 0.7, dirt));                                // a soft grassy fringe
  vec3 col = mix(grass, earth, smoothstep(0.4, 0.6, dirt)); col = mix(col, vec3(0.5, 0.6, 0.32), edge * 0.35);
  float sy = v_px.y / 1080.0; col = mix(col * 0.9 + vec3(0.03, 0.04, 0.05), col, smoothstep(0.0, 0.5, sy));     // light haze toward the top
  o = vec4(col, 1.0); }`;

  // the hero's handheld tool (its attack comes from the tip): the sprite and, in its texture px, the grip and the tip
  const TOOL = { sprite: 'sword', grip: [270, 182], tip: [1308, 184] };         // Asterix's sword (art/gen/sword.png): the handle's middle and the point

  // actors drawn by whole poses instead of the rig, by art prefix: { h: the standing pose's height (view px), bob } (scene.js poseActor)
  const POSES = {};

  // icons and art missing from the sheets are drawn with these
  const IC_FB = { ic_shield: 'ic_amount', ic_firewall: 'ic_hp', ic_repair: 'heal', ic_udp: 'ic_homing', ic_chain: 'ic_ping', ic_storm: 'ic_power', ic_turret: 'ic_cache', ic_cryo: 'ic_haste', ic_fork: 'ic_mine',
    ic_area: 'ic_magnet', ic_amount: 'ic_power', ic_dur: 'ic_haste', chest: 'code_tex', turret: 'switch' };
  const ART_FALLBACK = { petfood: 'mars', logq: 'vetis', batch: 'boss', sdesk: 'desk', repl: 'boss', rstorm: 'boss', outage: 'boss' };

  root.SETTING.LOOK = { PAL: { INK, CYAN, MINT, CORAL, HAZ, ICE, ELEC, ELEC_HI, CYAN_HI, PHYS, PHYS_HI }, EMB_AT, emblems, PH, RIGS, IC_FB, ART_FALLBACK, FLOOR, TOOL, POSES };
})(window);
