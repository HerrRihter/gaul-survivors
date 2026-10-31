// live/setting.js — the game's setting: who fights, with what and where (NetSurvivors' «Дата-центр Utrace»). The engine (sim.js,
// scene.js, meta.js, cloud.js) reads root.SETTING and the look from setting-look.js; another game on the same engine replaces these
// two files and the art (docs/PLAN-GAUL.md, stage 1). Loaded before sim.js; in Node sim.js requires it.
(function (root) {
  const SET = (root.SETTING = root.SETTING || {});
  const HINT = 'WASD — движение · мышь — направление автоатаки · M — звук · N — музыка · Пробел — пакетный сброс · 1–3 — улучшение · R — заново';

  // ---------------- data: foes (key = art prefix), weapons, passives ----------------
  // kind: melee (burst at range), shoot (aimed shot or a ring: shots.count > 1), mortar (marks round the hero), pulse (area around itself)
  const FOE = {
    node:    { name: 'L3', kind: 'melee', hp: 70, sp: 156, dmg: 7, r: 26, range: 64, wind: 0.6, cd: 0.8, xp: 2, mark: 'L3', col: [0.36, 1, 0.6] },
    legion:  { name: 'Легионер', kind: 'melee', hp: 70, sp: 156, dmg: 7, r: 26, range: 64, wind: 0.6, cd: 0.8, xp: 2, col: [0.86, 0.3, 0.22] },
    aux:     { name: 'Ауксиларий', kind: 'melee', hp: 40, sp: 210, dmg: 5, r: 22, range: 56, wind: 0.5, cd: 0.8, xp: 1, col: [1, 0.6, 0.19] },
    spear:   { name: 'Копейщик', kind: 'melee', hp: 50, sp: 192, dmg: 6, r: 24, range: 58, wind: 0.45, cd: 0.7, xp: 2, col: [1, 0.55, 0.2] },
    boar:    { name: 'Кабан', kind: 'melee', hp: 105, sp: 164, dmg: 9, r: 28, range: 68, wind: 0.7, cd: 0.93, xp: 4, col: [0.25, 0.66, 1],
               dash: { trigger: 460, wind: 0.8, speed: 900, time: 0.45, cd: 6 } },
    turtle:  { name: 'Черепаха', hpBar: true, kind: 'melee', hp: 240, sp: 80, dmg: 12, r: 38, range: 92, wind: 1.2, cd: 2.0, xp: 10, front: 0.6, poise: 0.8, col: [1, 0.8, 0.3] },
    veteran: { name: 'Ветеран', kind: 'melee', hp: 240, sp: 92, dmg: 13, r: 38, range: 88, wind: 1.0, cd: 1.6, xp: 10, poise: 1.5, col: [0.9, 0.78, 0.44] },
    pilum:   { name: 'Метатель пилума', kind: 'shoot', hp: 130, sp: 116, dmg: 10, r: 30, range: 520, wind: 0.9, cd: 2.2, xp: 6, keep: 380,
               shots: { count: 1, speed: 430, dmg: 1 }, slow: { amount: 0.25, dur: 1.2 }, col: [1, 0.3, 0.25] },
    tower:   { name: 'Осадная башня', kind: 'shoot', hp: 100, sp: 140, dmg: 8, r: 28, range: 480, wind: 1.0, cd: 2.6, xp: 6, keep: 340,
               shots: { count: 8, speed: 330, dmg: 0.8 }, col: [1, 0.6, 0.85] },
    stonesq: { name: 'Отряд с камнем', kind: 'mortar', hp: 140, sp: 108, dmg: 11, r: 30, range: 600, wind: 1.0, cd: 3.0, xp: 8, keep: 460,
               mortar: { radius: 100, delay: 1.2, count: 2, scatter: 140 }, col: [0.85, 0.7, 0.45] },
    netter:  { name: 'Засадник с сетью', kind: 'pulse', hp: 320, sp: 80, dmg: 12, r: 36, range: 170, wind: 1.2, cd: 3.0, xp: 14, poise: 1.4,
               slow: { amount: 0.35, dur: 2 }, col: [0.45, 0.95, 0.75] },
    // the rest of the original roster, each with a mechanic of its own (Роял Канин, P&G, Марс Петфуд, Запрос в логи, the service desk and the
    // component bugs have no gaul-survivors unit yet: the old look for now, the owner 31.10)
    wine:    { name: 'Легионер-виночерпий', kind: 'melee', hp: 110, sp: 196, dmg: 7, r: 28, range: 60, wind: 0.45, cd: 0.8, xp: 4, zig: 1,
               trail: { every: 0.14, life: 3, r: 46, slow: { amount: 0.3, dur: 0.5 } }, col: [0.62, 0.4, 0.85] },
    merchant: { name: 'Торговец', kind: 'lob', hp: 130, sp: 128, dmg: 10, r: 30, range: 560, wind: 0.9, cd: 2.4, xp: 6, keep: 380,
               lob: { count: 2, bounces: 2, r: 70 }, col: [0.55, 0.8, 0.45] },
    royal:   { name: 'Роял Канин', kind: 'shoot', hp: 150, sp: 110, dmg: 9, r: 30, range: 520, wind: 0.9, cd: 2.6, xp: 6, keep: 360, emblem: 'royal_canin',
               shots: { count: 3, speed: 420, dmg: 1, fan: 0.35, back: 0.8 }, col: [0.85, 0.2, 0.25] },
    ram:     { name: 'Таран', kind: 'spin', hp: 230, sp: 100, dmg: 9, r: 36, range: 230, wind: 0.7, cd: 4, xp: 10, poise: 1.3,
               spin: { time: 1.6, r: 105, tick: 0.25, speed: 1.45 }, col: [0.75, 0.15, 0.25] },
    pg:      { name: 'Проктер энд Гэмбл', kind: 'melee', hp: 260, sp: 96, dmg: 11, r: 38, range: 88, wind: 1.0, cd: 1.8, xp: 12, poise: 1.5, emblem: 'procter_gamble',
               aura: { r: 260, reduce: 0.5 }, col: [0.3, 0.55, 1] },
    petfood: { name: 'Марс Петфуд', kind: 'shoot', hp: 150, sp: 120, dmg: 6, r: 30, range: 440, wind: 0.8, cd: 2.2, xp: 6, keep: 300, emblem: 'mars_petfood',
               shots: { count: 5, speed: 460, dmg: 1, fan: 0.6 }, col: [0.35, 0.8, 0.95] },
    logq:    { name: 'Запрос в логи', kind: 'beam', hp: 260, sp: 90, dmg: 16, r: 36, range: 640, wind: 1.3, cd: 3.2, xp: 10, front: 0.7, mark: 'LOG',
               beam: { len: 720, w: 40, hold: 0.25 }, col: [0.6, 0.48, 1] },
    sdesk:   { name: 'Сервисдеск Пепси', kind: 'desk', hp: 1400, sp: 0, dmg: 0, r: 64, range: 0, wind: 1, cd: 99, xp: 30, poise: 99, mini: true,
               desk: { every: 7, base: 2, grow: 40, max: 10, unit: 'boar', reach: 1700 }, col: [0.2, 0.45, 0.85] },
    // the five component minibosses: big (r 78, drawn ×1.8), tough and quick inside their circle, each with a lunge
    bug:     { name: 'Баг импорта', kind: 'mortar', hp: 2200, sp: 120, dmg: 20, r: 78, range: 700, wind: 0.9, cd: 2.0, xp: 40, poise: 3, mini: true, mark: 'BUG',
               mortar: { radius: 130, delay: 1.1, count: 5, scatter: 220 }, dash: { trigger: 560, wind: 0.6, speed: 760, time: 0.35, cd: 4 }, col: [0.61, 0.59, 1] },
    bugl:    { name: 'Баг логистики', kind: 'pulse', hp: 2400, sp: 125, dmg: 18, r: 78, range: 320, wind: 1.1, cd: 1.9, xp: 40, poise: 3, mini: true, mark: 'BUG',
               slow: { amount: 0.5, dur: 2.5 }, dash: { trigger: 560, wind: 0.6, speed: 760, time: 0.35, cd: 4 }, col: [0.93, 0.81, 0.4] },
    bugg:    { name: 'Баг товарных отчётов', kind: 'pulse', hp: 2200, sp: 125, dmg: 18, r: 78, range: 280, wind: 1.0, cd: 1.8, xp: 40, poise: 3, mini: true, mark: 'BUG',
               pools: { every: 3.5, count: 3, radius: 100, life: 4.5, scatter: 200, dmg: 0.6 }, dash: { trigger: 560, wind: 0.6, speed: 760, time: 0.35, cd: 4 }, col: [0.47, 0.81, 0.72] },
    bugu:    { name: 'Баг отчёта использования', kind: 'shoot', hp: 2000, sp: 115, dmg: 12, r: 78, range: 620, wind: 0.9, cd: 1.8, xp: 40, poise: 3, mini: true, mark: 'BUG', keep: 260,
               shots: { count: 14, speed: 380, dmg: 1 }, dash: { trigger: 560, wind: 0.6, speed: 760, time: 0.35, cd: 4 }, col: [0.89, 0.53, 0.83] },
    buga:    { name: 'Баг агрегации', kind: 'pulse', hp: 2400, sp: 120, dmg: 18, r: 78, range: 280, wind: 1.0, cd: 1.8, xp: 40, poise: 3, mini: true, mark: 'BUG',
               summon: { every: 6, count: 3, max: 7, units: ['legion'] }, dash: { trigger: 560, wind: 0.6, speed: 760, time: 0.35, cd: 4 }, col: [0.96, 0.55, 0.33] },
    // ЦРПТ: a miniboss of the «Дата-центр» since stage 5 of docs/PLAN-FEEDBACK-27-10.md (it opened the boss queue before)
    crpt:    { name: 'ЦРПТ', kind: 'pulse', hp: 3000, sp: 100, dmg: 20, r: 90, range: 220, wind: 1.3, cd: 2.6, xp: 60, poise: 4, mini: true, mark: 'ЦРПТ',
               shots: { count: 8, speed: 340, dmg: 0.5 }, summon: { every: 8, count: 3, max: 9, units: ['legion', 'boar', 'pilum'] }, col: [1, 0.84, 0],
               intro: 'ЦРПТ: проверка партии, подключены клиенты' },
    batch:   { name: 'Партионный учёт', kind: 'pulse', hp: 6000, sp: 70, dmg: 20, r: 100, range: 300, wind: 1.2, cd: 2.4, xp: 80, poise: 4, boss: true,
               shots: { count: 12, speed: 340, dmg: 0.5 }, summon: { every: 8, count: 4, max: 8, units: ['boar'] }, ward: 0.7, col: [0.3, 0.6, 1],
               intro: 'ПАРТИОННЫЙ УЧЁТ: щит держится, пока живы его клиенты' },
    boss:    { name: 'Критический инцидент', noChest: true, kind: 'pulse', hp: 9000, sp: 76, dmg: 22, r: 104, range: 330, wind: 1.2, cd: 2.6, xp: 100, poise: 4, boss: true,
               shots: { count: 10, speed: 380, dmg: 0.5 }, summon: { every: 7, count: 3, max: 12, units: ['boar', 'turtle', 'veteran'] }, escalate: { every: 30, max: 4 },
               slow: { amount: 0.35, dur: 2 }, col: [1, 0.36, 0.36], intro: 'КРИТИЧЕСКИЙ ИНЦИДЕНТ: уничтожьте его, чтобы закрыть смену' },
    // the «Дата-центр»'s own bosses (docs/PLAN-FEEDBACK-27-10.md, stage 5); the training centre keeps Партионный учёт and Критический инцидент.
    // split: at that share of its health a copy breaks away; tether: while both live, the line between them hurts the hero who crosses it
    repl:    { name: 'Падение репликации', kind: 'shoot', hp: 2600, sp: 105, dmg: 18, r: 90, range: 640, wind: 0.8, cd: 1.7, xp: 70, poise: 4, boss: true, keep: 320,
               shots: { count: 5, speed: 420, dmg: 0.6, fan: 0.5 }, split: { at: 0.5 }, tether: { w: 40, tick: 0.4, dmg: 0.5 }, col: [0.85, 0.3, 0.95],
               intro: 'ПАДЕНИЕ РЕПЛИКАЦИИ: при половине здоровья делится надвое — не стойте на линии между копиями' },
    // queue: a row of marks through where the hero is heading (lead: seconds ahead), each going off after the one before; the boss
    // is quicker while its marks are pending
    rstorm:  { name: 'Шторм ретраев', kind: 'queue', hp: 6200, sp: 85, dmg: 36, r: 96, range: 780, wind: 0.8, cd: 2.4, xp: 85, poise: 4, boss: true,
               queue: { count: 7, gap: 140, delay: 1.0, step: 0.24, r: 115, haste: 0.12, lead: 0.7 }, summon: { every: 8, count: 4, max: 10, units: ['aux', 'spear'] }, col: [1, 0.6, 0.15],
               intro: 'ШТОРМ РЕТРАЕВ: метки взрываются по очереди, и пока очередь не пуста, он быстрее' },
    // the final boss: the lights go out and a restored component goes down on arrival and on every escalation; every component down
    // cuts the damage it takes (restart one by standing in its circle)
    outage:  { name: 'Отказ дата-центра', kind: 'pulse', hp: 8500, sp: 72, dmg: 24, r: 108, range: 340, wind: 1.2, cd: 2.6, xp: 110, poise: 4, boss: true, final: true,
               shots: { count: 10, speed: 380, dmg: 0.5 }, summon: { every: 7, count: 3, max: 12, units: ['boar', 'turtle', 'logq'] }, escalate: { every: 30, max: 4 },
               outage: { dark: 9, ward: 0.15, minWard: 0.5 }, col: [0.9, 0.12, 0.1],
               intro: 'ОТКАЗ ДАТА-ЦЕНТРА: гасит свет и отключает компоненты — перезапускайте их, иначе урон по нему ниже' },
  };
  // the Romans' commanders (gaul-survivors) on the mechanics of the bosses they replace; the old entries stay for the engine's QA frames and tests
  Object.assign(FOE, {
    caius: { ...FOE.crpt, name: 'Каюс Бонус', mark: undefined, intro: 'КАЮС БОНУС: центурион ведёт подкрепление' },
    cavalry: { ...FOE.repl, name: 'Конница', intro: 'КОННИЦА: при половине здоровья делится надвое — не стойте на линии между всадниками' },
    malosinus: { ...FOE.batch, name: 'Казначей Малосинус', intro: 'КАЗНАЧЕЙ МАЛОСИНУС: щит держится, пока живы его солдаты' },
    centurion: { ...FOE.outage, name: 'Центурион Максимус', intro: 'ЦЕНТУРИОН МАКСИМУС: гасит свет и захватывает лагеря — отбивайте их, иначе урон по нему ниже' },
  });
  // the enemy list's lines (the collection's «Враги» tab): what each one does, read from its mechanics above
  const FOE_DESC = {
    node: 'Обычный узел: идёт к герою и бьёт вблизи', legion: 'Обычный легионер: идёт к герою и бьёт вблизи', aux: 'Слабый и быстрый, берёт числом', spear: 'Быстрый, бьёт вблизи короткими ударами',
    boar: 'Издалека разгоняется и делает рывок к герою', turtle: 'Медленный тяжеловес: бронированный перед, редкий сильный удар',
    veteran: 'Медленный тяжеловес, почти не отлетает от ударов', pilum: 'Стреляет издалека, попадание замедляет',
    tower: 'Стреляет залпом из восьми снарядов', stonesq: 'Миномёт: накрывает две точки возле героя',
    netter: 'Бьёт волной вокруг себя, волна замедляет', wine: 'Петляет зигзагом и оставляет липкий след, след замедляет',
    merchant: 'Бросает снаряды, которые отскакивают от пола', royal: 'Стреляет тремя снарядами веером, снаряды возвращаются',
    ram: 'Раскручивается и бьёт всех вокруг', pg: 'Аура: враги рядом с ним получают вдвое меньше урона',
    petfood: 'Стреляет веером из пяти снарядов', logq: 'Наводит длинный луч и бьёт им по линии',
    sdesk: 'Неподвижный стол поддержки: раз в 7 с вызывает кабанов', bug: 'Баг компонента: миномёт по площади и рывки',
    bugl: 'Баг компонента: волна, сильно замедляет, рывки', bugg: 'Баг компонента: оставляет жгучие лужи, рывки',
    bugu: 'Баг компонента: стреляет кольцом из 14 снарядов, рывки', buga: 'Баг компонента: вызывает легионеров, рывки',
    crpt: 'Мини-босс: стреляет кольцом и вызывает подкрепление', repl: 'Босс: делится надвое, линия между копиями обжигает',
    rstorm: 'Босс: очередь меток взрывается по одной, пока очередь не пуста — он быстрее', outage: 'Финальный босс: гасит свет и отключает компоненты', batch: 'Босс курса: пока живы его клиенты, урон по нему меньше',
    boss: 'Финальный босс: каждые 30 с злее, вызывает тяжеловесов, замедляет',
    caius: 'Мини-босс: стреляет кольцом и вызывает подкрепление', cavalry: 'Босс: делится надвое, линия между всадниками обжигает',
    malosinus: 'Босс: пока живы его солдаты, урон по нему меньше', centurion: 'Финальный босс: гасит свет и захватывает лагеря',
  };

  // weapon levels 1..6: base, then the project's five steps (data/weapons.js), distances ×2
  const WEAP0 = {
    trace:  { name: 'Трассировка кодов', ic: 'ic_trace', hero: 1, base: { dmg: 28, cd: 0.65, range: 175, half: Math.PI / 4, push: 290 },
              steps: [['+25% урона', { dmg: 0.25 }], ['+20% дальности', { range: 35 }], ['Быстрее на 15%', { cd: -0.15 }], ['+25% урона, шире сектор', { dmg: 0.25, half: 0.2 }], ['+35% урона', { dmg: 0.35 }]] },
    orbit:  { name: 'Орбитальный сканер', ic: 'ic_orbit', base: { dmg: 12, count: 2, radius: 144, spin: 3.2, rehit: 0.5 },
              steps: [['+1 сканер', { count: 1 }], ['+25% урона', { dmg: 0.25 }], ['+20% к радиусу орбиты', { radius: 28 }], ['+1 сканер', { count: 1 }], ['+30% урона, быстрее вращение', { dmg: 0.3, spin: 0.8 }]] },
    homing: { name: 'Криптохвост', ic: 'ic_homing', base: { dmg: 22, count: 1, cd: 1.4, speed: 660, life: 2.2 },
              steps: [['+25% урона', { dmg: 0.25 }], ['+1 снаряд', { count: 1 }], ['Быстрее на 15%', { cd: -0.15 }], ['+1 снаряд', { count: 1 }], ['+35% урона', { dmg: 0.35 }]] },
    mine:   { name: 'DataMatrix-мина', ic: 'ic_mine', base: { dmg: 34, count: 1, cd: 2.3, radius: 116, limit: 4, life: 12 },
              steps: [['+20% радиуса взрыва', { radius: 24 }], ['+25% урона', { dmg: 0.25 }], ['+1 мина за раз', { count: 1 }], ['Быстрее на 15%', { cd: -0.15 }], ['+35% урона, +3 мины на поле', { dmg: 0.35, limit: 3 }]] },
    ping:   { name: 'Пинг', ic: 'ic_ping', base: { dmg: 14, cd: 2.6, radius: 190, push: 440 },
              steps: [['+20% радиуса', { radius: 38 }], ['+30% урона', { dmg: 0.3 }], ['Быстрее на 15%', { cd: -0.15 }], ['+20% радиуса', { radius: 38 }], ['+40% урона', { dmg: 0.4 }]] },
    retry:  { name: 'Ретрай', ic: 'ic_retry', base: { dmg: 20, count: 1, cd: 1.9, speed: 860 },
              steps: [['+25% урона', { dmg: 0.25 }], ['+1 бумеранг', { count: 1 }], ['+20% скорости', { speed: 172 }], ['+30% урона', { dmg: 0.3 }], ['+1 бумеранг', { count: 1 }]] },
    cache:  { name: 'Горячий кэш', ic: 'ic_cache', base: { dmg: 9, count: 1, cd: 3.2, radius: 104, life: 3, tick: 0.5 },
              steps: [['+20% радиуса', { radius: 20 }], ['+30% урона', { dmg: 0.3 }], ['+1 зона', { count: 1 }], ['Быстрее на 15%', { cd: -0.15 }], ['+40% урона', { dmg: 0.4 }]] },
  };
  const WEAP = Object.assign(WEAP0, {
    // new (round 11): the Vampire Survivors / DRG Survivors staples in the project's terms
    udp:    { name: 'UDP-флуд', ic: 'ic_udp', base: { dmg: 9, count: 1, cd: 0.34, speed: 1150, life: 0.75, pierce: 0, spread: 0.1 },
              steps: [['+1 пакет', { count: 1 }], ['+25% урона', { dmg: 0.25 }], ['Быстрее на 15%', { cd: -0.15 }], ['Пробивает ещё 1 врага', { pierce: 1 }], ['+1 пакет, +30% урона', { count: 1, dmg: 0.3 }]] },
    chain:  { name: 'Эхо-запрос', ic: 'ic_chain', base: { dmg: 18, cd: 1.6, jumps: 3, range: 260 },
              steps: [['+1 переход', { jumps: 1 }], ['+25% урона', { dmg: 0.25 }], ['Быстрее на 15%', { cd: -0.15 }], ['+2 перехода', { jumps: 2 }], ['+35% урона', { dmg: 0.35 }]] },
    storm:  { name: 'Сетевой шторм', ic: 'ic_storm', base: { dmg: 30, count: 2, cd: 1.9, radius: 70 },
              steps: [['+1 разряд', { count: 1 }], ['+25% урона', { dmg: 0.25 }], ['+25% радиуса', { radius: 18 }], ['+1 разряд', { count: 1 }], ['+40% урона', { dmg: 0.4 }]] },
    turret: { name: 'Сторожевой сервер', ic: 'ic_turret', base: { dmg: 8, count: 1, cd: 9, life: 6, rate: 0.28, range: 560 },
              steps: [['Работает на 2 с дольше', { life: 2 }], ['+25% урона', { dmg: 0.25 }], ['Стреляет чаще', { rate: -0.06 }], ['+1 сервер', { count: 1 }], ['+35% урона', { dmg: 0.35 }]] },
    cryo:   { name: 'Криокулер', ic: 'ic_cryo', base: { dmg: 4, cd: 2.4, burst: 1.0, tick: 0.15, range: 230, half: 0.38 },
              steps: [['+25% урона', { dmg: 0.25 }], ['Струя дольше на 0,4 с', { burst: 0.4 }], ['+20% дальности', { range: 46 }], ['Быстрее на 15%', { cd: -0.15 }], ['+35% урона, шире струя', { dmg: 0.35, half: 0.12 }]] },
    fork:   { name: 'Форк-бомба', ic: 'ic_fork', base: { dmg: 40, cd: 3, radius: 110, split: 4, depth: 1 },
              steps: [['+20% радиуса', { radius: 22 }], ['+25% урона', { dmg: 0.25 }], ['+2 осколка', { split: 2 }], ['Быстрее на 15%', { cd: -0.15 }], ['+40% урона', { dmg: 0.4 }]] },
    // the force shield: a charge absorbs a whole hit (hurtHero), recharge cd s; push: a wave on a block (radius, damage)
    shield: { name: 'Отказоустойчивость', ic: 'ic_shield', kind: 'shield', base: { cd: 14, charges: 1, push: 0, radius: 220, dmg: 0 },
              steps: [['Перезарядка быстрее на 15%', { cd: -0.15 }], ['Поглощение отбрасывает врагов вокруг', { push: 1 }], ['Перезарядка быстрее на 15%', { cd: -0.15 }],
                      ['Волна поглощения наносит урон', { dmg: 40 }], ['Перезарядка быстрее на 20%, волна шире', { cd: -0.2, radius: 60 }]] },
    // evolutions: max level + the paired passive; one level, their own icon (ic_x_<base>)
    shield_x: { name: 'Кластер отказоустойчивости', of: 'shield', evo: 1, kind: 'shield', ic: 'ic_x_shield', base: { cd: 6, charges: 2, push: 1, radius: 320, dmg: 90 }, steps: [] },
    trace_x:  { name: 'Полная трассировка', of: 'trace', evo: 1, ic: 'ic_x_trace', base: { dmg: 50, cd: 0.5, range: 230, half: Math.PI / 3, push: 340, back: 1, heal: 0.6 }, steps: [] },
    orbit_x:  { name: 'Кольцо мониторинга', of: 'orbit', evo: 1, ic: 'ic_x_orbit', base: { dmg: 30, count: 6, radius: 210, spin: 4.6, rehit: 0.35 }, steps: [] },
    homing_x: { name: 'Рой криптохвостов', of: 'homing', evo: 1, ic: 'ic_x_homing', base: { dmg: 30, count: 3, cd: 0.4, speed: 780, life: 2.4 }, steps: [] },
    mine_x:   { name: 'Минное поле', of: 'mine', evo: 1, ic: 'ic_x_mine', base: { dmg: 62, count: 4, cd: 1.3, radius: 150, limit: 16, life: 10, ring: 150 }, steps: [] },
    ping_x:   { name: 'Heartbeat', of: 'ping', evo: 1, ic: 'ic_x_ping', base: { dmg: 28, cd: 1.5, radius: 310, push: 520, heal: 0.35 }, steps: [] },
    retry_x:  { name: 'Бесконечный ретрай', of: 'retry', evo: 1, ic: 'ic_x_retry', base: { dmg: 42, count: 8, cd: 1.3, speed: 1000 }, steps: [] },
    cache_x:  { name: 'Горячий кластер', of: 'cache', evo: 1, ic: 'ic_x_cache', base: { dmg: 15, count: 1, cd: 3, radius: 180, life: 3, tick: 0.3, follow: 1 }, steps: [] },
    udp_x:    { name: 'Широкополосный поток', of: 'udp', evo: 1, ic: 'ic_x_udp', base: { dmg: 15, count: 5, cd: 0.18, speed: 1300, life: 0.8, pierce: 99, spread: 0.16 }, steps: [] },
    chain_x:  { name: 'Широковещательный шторм', of: 'chain', evo: 1, ic: 'ic_x_chain', base: { dmg: 30, cd: 0.9, jumps: 14, range: 320 }, steps: [] },
    storm_x:  { name: 'DDoS', of: 'storm', evo: 1, ic: 'ic_x_storm', base: { dmg: 55, count: 8, cd: 1.0, radius: 110 }, steps: [] },
    turret_x: { name: 'Кластер серверов', of: 'turret', evo: 1, ic: 'ic_x_turret', base: { dmg: 14, count: 3, cd: 1, life: 1e9, rate: 0.14, range: 640, perm: 1 }, steps: [] },
    cryo_x:   { name: 'Абсолютный ноль', of: 'cryo', evo: 1, ic: 'ic_x_cryo', base: { dmg: 7, cd: 0, burst: 1e9, tick: 0.15, range: 300, half: 0.55, freeze: 1 }, steps: [] },
    fork_x:   { name: 'Fork-бомба ∞', of: 'fork', evo: 1, ic: 'ic_x_fork', base: { dmg: 70, cd: 2, radius: 140, split: 6, depth: 2 }, steps: [] },
    // the heroes' own attacks (hero: 1 — never offered to another hero)
    tchain:  { name: 'Цепочка прослеживаемости', ic: 'ic_tchain', hero: 1, base: { dmg: 24, cd: 0.9, range: 290, jumps: 6, cone: 1.0 },
               steps: [['+25% урона', { dmg: 0.25 }], ['+20% к длине перехода', { range: 58 }], ['Быстрее на 15%', { cd: -0.15 }], ['+2 цели', { jumps: 2 }], ['+35% урона', { dmg: 0.35 }]] },
    packet:  { name: 'Серийный пакет', ic: 'ic_packet', hero: 1, base: { dmg: 23, cd: 0.75, range: 775, speed: 1000, count: 1, spread: 0.2 },
               steps: [['+25% урона', { dmg: 0.25 }], ['+1 пакет', { count: 1 }], ['Быстрее на 15%', { cd: -0.15 }], ['+20% дальности', { range: 155 }], ['+35% урона, +1 пакет', { dmg: 0.35, count: 1 }]] },
    req:     { name: 'Разбор требований', ic: 'ic_req', hero: 1, kind: 'trace', base: { dmg: 26, cd: 0.85, range: 212, half: Math.PI * 2 / 5, push: 230 },
               steps: [['+25% урона', { dmg: 0.25 }], ['+20% дальности', { range: 42 }], ['Быстрее на 15%', { cd: -0.15 }], ['Шире сектор', { half: 0.2 }], ['+35% урона', { dmg: 0.35 }]] },
    regress: { name: 'Регрессионная проверка', ic: 'ic_regress', hero: 1, base: { dmg: 19, cd: 1.05, range: 225, stun: 0.6 },
               steps: [['+25% урона', { dmg: 0.25 }], ['+15% к зоне', { range: 34 }], ['Быстрее на 15%', { cd: -0.15 }], ['Прерывание дольше на 0,3 с', { stun: 0.3 }], ['+35% урона', { dmg: 0.35 }]] },
    tchain_x:  { name: 'Обратная цепь', of: 'tchain', evo: 1, ic: 'ic_x_tchain', base: { dmg: 34, cd: 0.75, range: 340, jumps: 10, cone: 1.2, back: 1 }, steps: [] },
    packet_x:  { name: 'Расщеплённый пакет', of: 'packet', evo: 1, ic: 'ic_x_packet', base: { dmg: 32, cd: 0.6, range: 900, speed: 1100, count: 2, spread: 0.2, split: 3 }, steps: [] },
    req_x:     { name: 'Работа с ключевым клиентом', of: 'req', kind: 'trace', evo: 1, ic: 'ic_x_req', base: { dmg: 44, cd: 0.7, range: 250, half: Math.PI / 2, push: 300, client: 2, heal: 0.5 }, steps: [] },
    regress_x: { name: 'Метка дефекта', of: 'regress', evo: 1, ic: 'ic_x_regress', base: { dmg: 28, cd: 0.9, range: 280, stun: 1.0, mark: 1 }, steps: [] },
  });
  // the five heroes: speed is relative to K.SPEED; price in codes (Utrace is free); col = the hero's accent
  const HEROES = {
    asterix:       { name: 'Астерикс', role: 'Универсал', roleDesc: 'Хитрый и быстрый: лучший выбор для первой битвы.', price: 0, hp: 120, speed: 1, weapon: 'trace', art: 'hr_asterix', col: [0.86, 0.2, 0.16],
                     passive: { name: 'Галльская смекалка', desc: '+1 слот оружия: 5 видов вместе с атакой героя', slots: 1 },
                     training: { name: 'Школа фехтования', desc: '+6% к урону подобранного оружия', factor: 0.06 } },
    // the other Gauls (stage 3): each on a mechanic the engine has (weapon, passive, ability), named and drawn for the Gauls
    obelix:        { name: 'Обеликс', role: 'Силач', roleDesc: 'Метает менгиры насквозь через строй, крепче всех.', price: 0, hp: 175, speed: 0.9, weapon: 'packet', art: 'hr_obelix', col: [0.25, 0.45, 0.85],
                     passive: { name: 'Сила кабана', desc: '+3% урона за каждого врага ближе 400 px, до +30%', crowd: 0.03, cap: 0.3 },
                     training: { name: 'Таскать менгиры', desc: '+10% к пределу бонуса за толпу', factor: 0.1 } },
    cacofonix:     { name: 'Какофоникс', role: 'Контроль', roleDesc: 'Его песня оглушает всех вокруг.', price: 80, hp: 110, speed: 0.95, weapon: 'regress', art: 'hr_cacofonix', col: [0.95, 0.75, 0.2],
                     passive: { name: 'Невыносимый голос', desc: '10% шанс крита ×1,8; по оглушённым за 2 с ещё +35%', crit: 0.1, scanCrit: 0.35 },
                     training: { name: 'Распевка', desc: '+4% к шансу крита', factor: 0.04 } },
    antisanitarix: { name: 'Антисанитарикс', role: 'Против толпы', roleDesc: 'Тухлая рыба отскакивает от врага к врагу.', price: 100, hp: 120, speed: 0.95, weapon: 'tchain', art: 'hr_antisanitarix', col: [0.55, 0.75, 0.85],
                     passive: { name: 'Запах издалека', desc: '+20% урона по врагам дальше 375 px', far: 0.2 },
                     training: { name: 'Свежий улов', desc: '+7% к урону по дальним врагам', factor: 0.07 } },
    automatix:     { name: 'Автоматикс', role: 'Танк', roleDesc: 'Молот бьёт широко и отбрасывает далеко.', price: 120, hp: 165, speed: 0.85, weapon: 'req', art: 'hr_automatix', col: [0.85, 0.35, 0.15],
                     passive: { name: 'Кузница', desc: '+1 слот оружия: 5 видов вместе с атакой героя', slots: 1 },
                     training: { name: 'Кузнечная закалка', desc: '+6% к урону подобранного оружия', factor: 0.06 } },
    panoramix:     { name: 'Панорамикс', role: 'Друид', roleDesc: 'Разливает ядовитое зелье по своему следу.', price: 140, hp: 100, speed: 0.9, weapon: 'mine', art: 'hr_panoramix', col: [0.4, 0.8, 0.35],
                     passive: { name: 'Мудрость друида', desc: '+20% урона по врагам дальше 375 px', far: 0.2 },
                     training: { name: 'Рецепты друида', desc: '+7% к урону по дальним врагам', factor: 0.07 } },
    utrace:        { name: 'Utrace', role: 'Универсал', roleDesc: 'Ровный во всём, лучший выбор для первой смены.', price: 0, hp: 120, speed: 1, weapon: 'trace', art: 'hero', col: [0.0, 0.62, 0.73],
                     passive: { name: 'Универсальный стек', desc: '+1 слот оружия: 5 видов вместе с атакой героя', slots: 1 },
                     training: { name: 'Оптимизация Utrace', desc: '+6% к урону подобранного оружия', factor: 0.06 } },
    traceability:  { name: 'Полная прослеживаемость', role: 'Против толпы', roleDesc: 'Чем плотнее толпа вокруг, тем сильнее каждый удар.', price: 80, hp: 110, speed: 145 / 150, weapon: 'tchain', art: 'hr_trc', col: [0.43, 0.89, 0.8],
                     passive: { name: 'Связанные данные', desc: '+3% урона за каждого врага ближе 400 px, до +30%', crowd: 0.03, cap: 0.3 },
                     training: { name: 'Оптимизация: Полная прослеживаемость', desc: '+10% к пределу бонуса за толпу', factor: 0.1 } },
    serialization: { name: 'Сериализация', role: 'Дальний бой', roleDesc: 'Держит дистанцию и расстреливает врагов на подходе.', price: 100, hp: 100, speed: 160 / 150, weapon: 'packet', art: 'hr_ser', col: [0.98, 0.35, 0.27],
                     passive: { name: 'Дальняя доставка', desc: '+20% урона по врагам дальше 375 px', far: 0.2 },
                     training: { name: 'Оптимизация: Сериализация', desc: '+7% к урону по дальним врагам', factor: 0.07 } },
    ba:            { name: 'БА', role: 'Танк', roleDesc: 'Крепнет по ходу смены, побеждая своего клиента.', price: 120, hp: 135, speed: 140 / 150, weapon: 'req', art: 'hr_ba', col: [0.97, 0.81, 0.44],
                     passive: { name: 'Ключевой клиент', desc: '+1 HP (и к максимуму) за каждого побеждённого выбранного клиента', clientHp: 1 },
                     training: { name: 'Оптимизация: БА', desc: '+0,5 HP за убийство клиента', factor: 0.5 } },
    qa:            { name: 'QA', role: 'Контроль', roleDesc: 'Останавливает врагов и добивает отмеченные цели критами.', price: 140, hp: 115, speed: 1, weapon: 'regress', art: 'hr_qa', col: [0.47, 0.93, 0.74],
                     passive: { name: 'Найденный дефект', desc: '10% шанс крита ×1,8; по целям скана за 2 с ещё +35%', crit: 0.1, scanCrit: 0.35 },
                     training: { name: 'Оптимизация: QA', desc: '+4% к шансу крита', factor: 0.04 } },
  };
  // БА's key client: client brands only (no regulators, bugs or staff), as in the original's ba-specialization
  const CLIENTS = ['boar', 'turtle', 'veteran', 'pilum', 'tower', 'spear', 'stonesq', 'wine', 'merchant', 'royal', 'ram', 'pg', 'petfood'];

  // evolution recipes: weapon at max level + this passive (any level) → evolved weapon (Vampire Survivors style)
  const EVO = { trace: ['power', 'trace_x'], orbit: ['speed', 'orbit_x'], homing: ['haste', 'homing_x'], mine: ['area', 'mine_x'], ping: ['hp', 'ping_x'],
    retry: ['amount', 'retry_x'], cache: ['dur', 'cache_x'], udp: ['magnet', 'udp_x'], chain: ['haste', 'chain_x'], storm: ['area', 'storm_x'],
    turret: ['dur', 'turret_x'], cryo: ['hp', 'cryo_x'], fork: ['power', 'fork_x'],
    tchain: ['amount', 'tchain_x'], packet: ['speed', 'packet_x'], req: ['hp', 'req_x'], regress: ['area', 'regress_x'], shield: ['firewall', 'shield_x'] };
  const WSUM = { trace: 'Сектор перед героем, отбрасывает', orbit: 'Сканеры кружат вокруг героя', homing: 'Пакеты взлетают веером и пикируют на случайных врагов', mine: 'Мина остаётся позади, на вашем следе',
    ping: 'Волна вокруг героя отталкивает врагов', retry: 'Летит дугой вверх в сторону от курсора и падает', cache: 'Горячая зона жжёт врагов',
    udp: 'Очередь пакетов по ходу движения', chain: 'Молния бьёт случайного врага рядом и перескакивает', storm: 'Разряды с неба по случайным врагам на экране',
    turret: 'Ставит сервер-турель, она стреляет сама', cryo: 'Струя холода вращается вокруг героя: урон и замедление', fork: 'Граната летит в самую плотную толпу и делится',
    trace_x: 'Бьёт вперёд и назад, лечит за каждое попадание', orbit_x: 'Шесть сканеров на широкой орбите', homing_x: 'Непрерывный рой самонаводящихся пакетов',
    mine_x: 'Мины ложатся кольцом вокруг героя', ping_x: 'Мощная волна, лечит за каждого задетого', retry_x: 'Восемь бумерангов во все стороны',
    cache_x: 'Горячая зона всегда вокруг героя', udp_x: 'Веер пакетов, пробивающих всех', chain_x: 'Молния перескакивает по всей толпе',
    storm_x: 'Восемь разрядов разом', turret_x: 'Три постоянных сервера-турели рядом с героем', cryo_x: 'Холод не выключается и замораживает врагов',
    fork_x: 'Осколки делятся ещё раз', shield: 'Щит полностью поглощает один удар, затем перезаряжается', shield_x: 'Два заряда щита, быстрая перезарядка, поглощение бьёт волной',
    tchain: 'Цепь от ближайшей цели впереди перескакивает на соседей, до 6 целей', packet: 'Пробивающий пакет в сторону курсора',
    req: 'Широкий сектор перед героем, сильно отбрасывает', regress: 'Квадрат проверки вокруг героя прерывает атаки обычных врагов',
    tchain_x: 'До 10 целей, цепь возвращается и бьёт ещё раз', packet_x: 'Пакеты расщепляются на три при первом попадании',
    req_x: 'Вдвое больнее выбранному клиенту, лечит за попадания', regress_x: 'Отмеченные цели 2 с получают на 50% больше урона' };
  const PASS = {
    hp:     { name: 'Резервное питание', ic: 'ic_hp', desc: '+20 к максимуму HP и лечение' },
    speed:  { name: 'Оптоволокно', ic: 'ic_speed', desc: '+8% к скорости' },
    magnet: { name: 'Широкий канал', ic: 'ic_magnet', desc: '+40% к радиусу сбора' },
    power:  { name: 'Оверклокинг', ic: 'ic_power', desc: '+12% ко всему урону' },
    haste:  { name: 'Низкая задержка', ic: 'ic_haste', desc: '−8% к перезарядке' },
    area:   { name: 'Широкий охват', ic: 'ic_area', desc: '+10% к радиусу и дальности оружия' },
    amount: { name: 'Репликация', ic: 'ic_amount', desc: '+1 снаряд на уровнях 2 и 4' },
    dur:    { name: 'Keep-alive', ic: 'ic_dur', desc: '+12% к времени действия' },
    firewall: { name: 'Брандмауэр', ic: 'ic_firewall', desc: '−7% получаемого урона' },
    repair: { name: 'Самовосстановление', ic: 'ic_repair', desc: '+0,3 HP в секунду' },
  };
  // hero skins (plan stage 4, round 23): a full part sheet of the SAME character in its own style — art: its sprites' prefix (body, leg,
  // foot, arm); the hero's rig and scanner stay, the base drawing is never replaced. Cosmetic only. col: the menus' accent colour.
  // every hero: a recolour (40), a calm (80) and an aggressive (120) one
  const SKINS = {
    utrace_arctic: { hero: 'utrace', name: 'Арктика', style: 'другая расцветка', price: 40, art: 'sk_utrace_arctic', col: [0.56, 0.83, 1] },
    utrace_zen:    { hero: 'utrace', name: 'Дзен', style: 'спокойный', price: 80, art: 'sk_utrace_zen', col: [0.62, 0.9, 0.81] },
    utrace_storm:  { hero: 'utrace', name: 'Штурм', style: 'агрессивный', price: 120, art: 'sk_utrace_storm', col: [1, 0.29, 0.24] },
    trc_sapphire: { hero: 'traceability', name: 'Сапфир', style: 'другая расцветка', price: 40, art: 'sk_trc_sapphire', col: [0.35, 0.55, 1] },
    trc_still: { hero: 'traceability', name: 'Тишина', style: 'спокойный', price: 80, art: 'sk_trc_still', col: [0.66, 0.92, 0.84] },
    trc_intercept: { hero: 'traceability', name: 'Перехват', style: 'агрессивный', price: 120, art: 'sk_trc_intercept', col: [0.56, 0.36, 1] },
    ser_cobalt: { hero: 'serialization', name: 'Кобальт', style: 'другая расцветка', price: 40, art: 'sk_ser_cobalt', col: [0.3, 0.5, 1] },
    ser_cloud: { hero: 'serialization', name: 'Облако', style: 'спокойный', price: 80, art: 'sk_ser_cloud', col: [0.65, 0.83, 1] },
    ser_breach: { hero: 'serialization', name: 'Взлом', style: 'агрессивный', price: 120, art: 'sk_ser_breach', col: [0.22, 1, 0.53] },
    ba_platinum: { hero: 'ba', name: 'Платина', style: 'другая расцветка', price: 40, art: 'sk_ba_platinum', col: [0.81, 0.84, 0.87] },
    ba_consult: { hero: 'ba', name: 'Консультант', style: 'спокойный', price: 80, art: 'sk_ba_consult', col: [0.56, 0.85, 0.81] },
    ba_deadline: { hero: 'ba', name: 'Дедлайн', style: 'агрессивный', price: 120, art: 'sk_ba_deadline', col: [1, 0.2, 0.33] },
    qa_onyx: { hero: 'qa', name: 'Оникс', style: 'другая расцветка', price: 40, art: 'sk_qa_onyx', col: [0.37, 0.94, 0.75] },
    qa_sandbox: { hero: 'qa', name: 'Песочница', style: 'спокойный', price: 80, art: 'sk_qa_sandbox', col: [0.71, 0.86, 1] },
    qa_crash: { hero: 'qa', name: 'Краш-тест', style: 'агрессивный', price: 120, art: 'sk_qa_crash', col: [1, 0.83, 0] },
  };
  // the heroes' E abilities (data/characters/abilities.js of the original): cd and dur in s, radius ×2; rank (level-up cards, max AB_MAX)
  // adds rankDur s, rankPow damage share or rankStun s
  const ABIL = {
    asterix:       { id: 'overclock', name: 'Волшебное зелье', ic: 'ab_overclock', cd: 22, dur: 6, rankDur: 1, haste: 1.6, speed: 1.15,
                     desc: 'Глоток зелья: на 6 с темп атак ×1,6 и скорость +15%', up: 'Зелье действует на 1 с дольше' },
    obelix:        { id: 'overclock', name: 'Боевой аппетит', ic: 'ab_overclock', cd: 22, dur: 6, rankDur: 1, haste: 1.6, speed: 1.15,
                     desc: 'Кабан на обед: на 6 с темп атак ×1,6 и скорость +15%', up: 'Аппетит действует на 1 с дольше' },
    cacofonix:     { id: 'negotiate', name: 'Сольный концерт', ic: 'ab_negotiate', cd: 24, dur: 4, rankDur: 1, radius: 480,
                     desc: 'На 4 с враги рядом зажимают уши и не атакуют', up: 'Концерт длится на 1 с дольше' },
    antisanitarix: { id: 'registry', name: 'Рыбный развал', ic: 'ab_registry', cd: 20, dur: 5, rankDur: 1,
                     desc: 'На 5 с рыба отскакивает по всей группе врагов без лимита', up: 'Развал длится на 1 с дольше' },
    automatix:     { id: 'field', name: 'Удар по наковальне', ic: 'ab_field', cd: 18, dur: 3, radius: 280, stun: 2, rankStun: 0.5,
                     desc: 'Звон на 3 с: враги в зоне замирают на 2 с', up: 'Враги в зоне замирают на 0,5 с дольше' },
    panoramix:     { id: 'volley', name: 'Бурлящий настой', ic: 'ab_volley', cd: 14, dur: 0.3, count: 12, power: 0.8, rankPow: 0.25,
                     desc: '12 капель зелья веером во все стороны', up: '+25% к урону капель' },
    utrace:        { id: 'overclock', name: 'Оверклокинг', ic: 'ab_overclock', cd: 22, dur: 6, rankDur: 1, haste: 1.6, speed: 1.15,
                     desc: 'Разгон ядра: на 6 с темп атак ×1,6 и скорость +15%', up: 'Оверклокинг действует на 1 с дольше' },
    traceability:  { id: 'registry', name: 'Реестр', ic: 'ab_registry', cd: 20, dur: 5, rankDur: 1,
                     desc: 'На 5 с цепь бьёт всю связанную группу без лимита целей', up: 'Реестр действует на 1 с дольше' },
    serialization: { id: 'volley', name: 'Залп', ic: 'ab_volley', cd: 14, dur: 0.3, count: 12, power: 0.8, rankPow: 0.25,
                     desc: '12 пробивающих пакетов веером во все стороны', up: '+25% к урону пакетов залпа' },
    ba:            { id: 'negotiate', name: 'Переговоры', ic: 'ab_negotiate', cd: 24, dur: 4, rankDur: 1, radius: 480,
                     desc: 'На 4 с обычные враги рядом не атакуют, а выбранный клиент — по всей карте', up: 'Переговоры действуют на 1 с дольше' },
    qa:            { id: 'field', name: 'Регресс', ic: 'ab_field', cd: 18, dur: 3, radius: 280, stun: 2, rankStun: 0.5,
                     desc: 'Зона регресса на 3 с: обычные враги в ней замирают на 2 с', up: 'Враги в зоне замирают на 0,5 с дольше' },
  };

  // ground footprints [half width, half depth], measured from each drawing at its in-game size: the front edge sits on the ground
  // point, the depth runs back like the top face of the 3/4 drawing
  const FOOT = { hut: [150, 74], cauldron: [62, 30], menhir: [38, 18], ups: [56, 26], pdu: [36, 20], cart: [32, 16], cart_b: [38, 18], core: [205, 104], cage: [157, 72], crac: [127, 58], tray: [51, 17],
    firerack: [35, 15], switch: [37, 18], desk: [62, 30], tapelib: [45, 21], patch: [28, 17], cell: [38, 20],
    blade: [37, 18], dock: [37, 24], holopillar: [25, 16], spool: [42, 23], manifold: [44, 22], batbank: [54, 25], switchstack: [43, 24], crates: [42, 23], mast: [44, 24], rack_open: [69, 31] };

  // the five components of the original (data/enemies/nodes.js): name, bug miniboss, floor colour and pattern, structure style, set kit
  const COMPONENTS = [
    { id: 'production-aggreagtion', name: 'АГРЕГАЦИЯ', bug: 'buga', col: [0.0, 0.9, 1.0], pat: 1, style: 'racks', kit: ['crates', 'spool', 'rack_open', 'manifold'] },
    { id: 'code-usage-report', name: 'ОТЧЁТ О НАНЕСЕНИИ', bug: 'bugu', col: [0.39, 1.0, 0.85], pat: 0, style: 'desks', kit: ['holopillar', 'mast', 'desk', 'crates'] },
    { id: 'inport-operation-processor', name: 'ИМПОРТ', bug: 'bug', col: [0.45, 0.8, 1.0], pat: 2, style: 'import', kit: ['dock', 'switchstack', 'crates', 'rack_open'] },
    { id: 'logistic-processor', name: 'ЛОГИСТИКА', bug: 'bugl', col: [0.2, 0.7, 1.0], pat: 3, style: 'logistics', kit: ['crates', 'spool', 'cart_b', 'dock', 'manifold'] },
    { id: 'goods-reports', name: 'ТОВАРНЫЕ ОТЧЁТЫ', bug: 'bugg', col: [0.6, 0.85, 1.0], pat: 4, style: 'goods', kit: ['blade', 'patch', 'crates', 'holopillar'] },
  ];
  // zone rectangles round the plaza: NW, NE, SE, S, SW (the north hall between NW and NE is neutral)
  const RECTS = [{ x0: 0, y0: 0, x1: 2900, y1: 2500 }, { x0: 5100, y0: 0, x1: 8000, y1: 2500 }, { x0: 5100, y0: 3500, x1: 8000, y1: 6000 },
    { x0: 2900, y0: 4150, x1: 5100, y1: 6000 }, { x0: 0, y0: 3500, x1: 2900, y1: 6000 }];
  const PLAZA = { col: [0.0, 0.9, 1.0] };

  // the maps this setting brings (the engine adds its training centre): build(seed, room, E) returns a layout; E = the engine's world
  // constants and helpers (WORLD, SPAWN, NODE_R, R: reference px → world)
  // ---- the data centre ----
  function buildDC(seed, room, E) { const { WORLD, SPAWN, NODE_R, R } = E;
    let rs = seed | 0; const lr = () => { rs = (rs + 0x6D2B79F5) | 0; let t = rs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const jit = (a) => (lr() - 0.5) * 2 * a;
    const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(lr() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const order = shuffle([0, 1, 2, 3, 4]);
    const ZONES = RECTS.map((r, i) => { const c = COMPONENTS[order[i]], mx = NODE_R + 170, my = NODE_R * 0.62 + 230;
      const nx = Math.max(r.x0 + mx, Math.min(r.x1 - mx, (r.x0 + r.x1) / 2 + jit((r.x1 - r.x0) * 0.1))), ny = Math.max(r.y0 + my, Math.min(r.y1 - my, (r.y0 + r.y1) / 2 + 50 + jit((r.y1 - r.y0) * 0.08)));
      return Object.assign({}, c, r, { nx: Math.round(nx), ny: Math.round(ny) }); });
    const PROPS = [], BOXES = [], LAMPS = [], TANKS = [], STENCILS = [], CABLES = [], TAPES = [], HOLOS = [], RINGS = [];
    const add = (k, x, y, f = 0) => PROPS.push([k, Math.round(x), Math.round(y), f]);
    const clear = (x, y, r) => Math.hypot(x - SPAWN[0], (y - SPAWN[1]) * 1.3) > r;
    const offNode = (x, y, m = 0) => ZONES.every((z) => Math.hypot(x - z.nx, (y - z.ny) * 1.25) > NODE_R + 160 + m);
    const lane = (x, y) => Math.abs(x - 4000) < 300 && (y < 2450 || y > 3550);            // the N–S cold corridor (north hall, Логистика) stays open
    const ok = (x, y) => clear(x, y, 1150) && offNode(x, y) && !lane(x, y) && x > 300 && x < WORLD.x1 - 300;
    const row = (x0, y, n, f = 0) => { for (let i = 0; i < n; i++) add(i % 3 ? 'rack' : 'rack_b', x0 + i * 150, y, (i + f) % 2);
      BOXES.push({ x: x0 + (n - 1) * 75, y: y - 20, hw: n * 75 - 28, hh: 20 }); TAPES.push([[x0 - 90, y + 46], [x0 + (n - 1) * 150 + 90, y + 46]]); };
    const rowOk = (x0, y, n) => { for (let i = 0; i < n; i++) if (!ok(x0 + i * 150, y)) return false; return true; };
    // the central plaza: the village centre round the hero's start — huts, the druid's cauldron, menhirs (stage 2 slice)
    add('hut', ...R(150, 250)); add('hut', ...R(1180, 300), 1); add('hut', ...R(820, 70)); add('hut', ...R(330, 690), 1);
    add('cauldron', ...R(930, 600));
    for (const [x, y] of [[470, 120], [1130, 640], [60, 520]]) add('menhir', ...R(x, y));
    for (const [x, y] of [[1010, 345], [1040, 365], [1068, 338], [1090, 372]]) TANKS.push(R(x, y));
    // outer walls: rack rows top and bottom, cooling units on the sides
    for (let x = 140; x < WORLD.x1 - 700; x += 900) { row(x, 150, 5); row(x + 75, WORLD.y1 - 10, 5, 1); }
    for (let y = 430; y < WORLD.y1 - 160; y += 320) { add('crac', 110, y); add('crac', WORLD.x1 - 110, y, 1); }
    // each zone's structure by its component's style, fitted to whichever rectangle it landed in (lengths, gaps and offsets vary)
    const STYLE = {
      racks: (r) => { for (let y = r.y0 + 620 + jit(40), ri = 0; y < r.y1 - 230; y += 520 + jit(30), ri++) for (let x0 = r.x0 + 420 + (ri % 2) * 110 + jit(60); ;) {
        const n = 3 + Math.floor(lr() * 3); if (x0 + (n - 1) * 150 > r.x1 - 300) break; if (lr() > 0.15 && rowOk(x0, y, n)) row(x0, y, n, ri); x0 += n * 150 + 260 + jit(60); } },
      desks: (r) => { for (let y = r.y0 + 600 + jit(30), ri = 0; y < r.y1 - 200; y += 520 + jit(30), ri++) for (let x = r.x0 + 350 + (ri % 2) * 250 + jit(50); x < r.x1 - 400; x += 700 + jit(40)) {
        if (lr() < 0.12 || !ok(x, y) || !ok(x + 150, y)) continue; const m = Math.floor(lr() * 3);
        if (m === 0) { add('tapelib', x, y); add('tapelib', x + 150, y); } else if (m === 1) { add('desk', x, y); HOLOS.push([Math.round(x), Math.round(y - 150), 0]); } else { add('holopillar', x, y); add('holopillar', x + 120, y); } } },
      import: (r) => { for (let y = r.y0 + 350 + jit(30), ri = 0; y < r.y1 - 200; y += 520 + jit(30), ri++) for (let x0 = r.x0 + 300 + (ri % 2) * 140 + jit(50); x0 + 470 < r.x1 - 250; x0 += 820 + jit(40)) {
        if (lr() < 0.12 || !rowOk(x0, y, 3) || !ok(x0 + 470, y)) continue; row(x0, y, 3, ri); add('switchstack', x0 + 470, y); } },
      logistics: (r) => { for (let y = r.y0 + 250 + jit(30), ri = 0; y < r.y1 - 200; y += 520 + jit(30), ri++) for (let x = r.x0 + 250 + (ri % 2) * 200 + jit(50); x + 230 < r.x1 - 200; x += 760 + jit(40)) {
        if (lr() < 0.12 || !ok(x, y) || !ok(x + 230, y)) continue; add(lr() < 0.5 ? 'batbank' : 'ups', x, y); add('cart', x + 230, y); } },
      goods: (r) => { for (let y = r.y0 + 350 + jit(30), ri = 0; y < r.y1 - 200; y += 520 + jit(30), ri++) for (let x = r.x0 + 400 + (ri % 2) * 200 + jit(50); x + 140 < r.x1 - 200; x += 620 + jit(30)) {
        if (lr() < 0.12 || !ok(x, y) || !ok(x + 140, y)) continue; if (lr() < 0.5) { add('tapelib', x, y); add('patch', x + 140, y); } else { add('blade', x, y); add('patch', x + 120, y); } } },
    };
    ZONES.forEach((z) => STYLE[z.style](z));
    // the neutral north hall: two columns of rack rows either side of the cold corridor
    for (let y = 620 + jit(40), ri = 0; y < 2300; y += 520 + jit(30), ri++) { const nl = 3 + Math.floor(lr() * 2), nr = 3 + Math.floor(lr() * 2), xl = 3680 - (nl - 1) * 150 - lr() * 120, xr = 4320 + lr() * 100;
      if (lr() > 0.15 && rowOk(xl, y, nl)) row(xl, y, nl, ri); if (lr() > 0.15 && xr + (nr - 1) * 150 < 4800 && rowOk(xr, y, nr)) row(xr, y, nr, ri + 1); }
    // set dressing scatter (checks every footprint, 70 px clear round each)
    const fits = (k, x, y, m) => { const [hw, hh] = FOOT[k], cy = y - hh; if (x - hw < 250 || x + hw > WORLD.x1 - 250 || y < 420 || y > WORLD.y1 - 200) return false;
      if (BOXES.some((b) => Math.abs(x - b.x) < hw + b.hw + m && Math.abs(cy - b.y) < hh + b.hh + m)) return false;
      if (TANKS.some(([tx, ty]) => Math.abs(x - tx) < hw + 60 + m && Math.abs(y - ty) < hh + 40 + m)) return false;
      return !PROPS.some(([k2, x2, y2]) => FOOT[k2] && Math.abs(x - x2) < hw + FOOT[k2][0] + m && Math.abs(cy - (y2 - FOOT[k2][1])) < hh + FOOT[k2][1] + m); };
    // energy cells: the plaza's (first, fixed) + 8 clusters of 3 picked from 14 spots
    const CELLS = [[3500, 4660], [4500, 4660], [3500, 5650], [4500, 5650], [2650, 3100], [5400, 3100], [4300, 900], [3700, 2100], [1500, 2900], [6500, 2900], [2100, 3250], [5900, 3250], [1450, 5650], [6550, 5650]];
    let nc = 0; for (const [cx0, cy0] of shuffle(CELLS)) { if (nc >= 8) break; const cx = cx0 + jit(60), cy = cy0 + jit(40); const pts = [0, 1, 2].map((i) => [Math.round(cx + i * 46 - 46), Math.round(cy + (i % 2) * 24)]);
      if (!offNode(cx, cy) || !pts.every(([x, y]) => fits('cell', x, y, 20))) continue; TANKS.push(...pts); nc++; }
    // set dressing on 42% of the grid spots, as in the hand-made layout
    ZONES.forEach((z) => { for (let gy = z.y0 + 300; gy < z.y1 - 150; gy += 290) for (let gx = z.x0 + 300; gx < z.x1 - 150; gx += 330) {
      if (lr() > 0.42) continue; const k = z.kit[Math.floor(lr() * z.kit.length)], x = gx + jit(60), y = gy + jit(40);
      if (clear(x, y, 1000) && offNode(x, y) && !lane(x, y) && fits(k, x, y, 70)) add(k, x, y, lr() > 0.5 ? 1 : 0); } });
    for (const z of ZONES) STENCILS.push({ x: z.nx, y: z.ny + NODE_R * 0.62 + 90, rot: 0, s: z.name, sz: 72 });
    STENCILS.push({ x: 4000, y: 1400, rot: 0.03, s: 'ХОЛОДНЫЙ КОРИДОР', sz: 64 }, { x: 4000, y: 3950, rot: -0.03, s: 'НЕ ПЕРЕЗАГРУЖАТЬ!', sz: 60 });
    // daylight: no light pools, no fibre trunks in the village
    // two Pepsi service desks on open floor (foes, not solids): picked from candidate spots, clear of props and nodes
    const DESKS = []; for (const [x0, y0] of shuffle([[4000, 1250], [5400, 2940], [2600, 2940], [4000, 4250], [1450, 2950], [6550, 3000]])) { if (DESKS.length >= 2) break;
      const x = Math.round(x0 + jit(80)), y = Math.round(y0 + jit(50)); if (offNode(x, y) && clear(x, y, 700) && fits('desk', x, y, 90)) DESKS.push([x, y]); }
    return { ZONES, PROPS, BOXES, LAMPS, TANKS, STENCILS, CABLES, TAPES, HOLOS, RINGS, DESKS, START: SPAWN, needDesks: 1 };
  }
  // the map select's card (desc, note) and the leaderboard's filter (short)
  const MAPS = { dc: { name: 'Дата-центр Utrace', short: 'Дата-центр', build: buildDC,
    desc: 'Пять компонентов вокруг ядра: в каждом свой баг. Победи бага или продержись 30 с в его круге, затем закрой «Отказ дата-центра».', note: 'Каждая смена — новая раскладка' } };
  // the engine's training centre (edu.js, course.js) is offered on the map select
  const EDU = true;

  // the run (read by sim.js): the default hero and map, the bosses by time (the final one comes at RUN_T, or once every component is
  // closed), the roster growing over the shift ([type, weight, from minute, fade: the weight falls by this share a minute, to 35%]),
  // the swarms every 75 s (alternating), the attract demo, the training centre's hall bosses by the course's unit
  const RUN = {
    hero: 'asterix', map: 'dc',
    bosses: [[150, 'caius'], [270, 'cavalry'], [420, 'rstorm']], final: 'centurion',
    roster: [['legion', 1, 0, 0.08], ['aux', 0.6, 0], ['spear', 0.5, 0.3], ['wine', 0.4, 1.0], ['boar', 0.7, 1], ['pilum', 0.45, 1.3], ['merchant', 0.35, 2.0], ['petfood', 0.35, 2.2],
      ['turtle', 0.3, 2.3], ['tower', 0.35, 2.6], ['royal', 0.3, 3.0], ['veteran', 0.3, 3.2], ['ram', 0.25, 3.5], ['stonesq', 0.3, 3.8], ['pg', 0.18, 4.0], ['netter', 0.18, 4.5], ['logq', 0.2, 4.8]],
    swarms: [{ unit: 'aux', toast: 'ВЫЛАЗКА: ауксиларии со всех сторон' }, { unit: 'spear', toast: 'НАПЛЫВ КОПЕЙЩИКОВ: римляне спешат к деревне' }],
    demo: { hero: 'asterix', wp: { trace: 2, homing: 2, orbit: 1 }, wcd: { trace: 0.2, homing: 0.6, orbit: 0 }, boss: 'centurion',
      kinds: ['legion', 'spear', 'boar', 'aux', 'pilum', 'turtle', 'tower', 'legion', 'aux', 'veteran', 'boar', 'stonesq'] },
    eduBoss: { batch_accounting: 'malosinus', critical_incident: 'boss', default: 'boss' },
  };
  // the hero rig shared by the sim and the scene: shoulder height and half-width (shX: the shoulder joint's centre on the body's side
  // outline, round 24), arm length, and the tool's tip from the hand (gun forward, gunUp up): the trace strike starts there
  // Asterix, measured on his design (art/refs/gaul/asterix_design.jpg): about 72 px tall, shoulders at 60% of the height, the arm 27%;
  // the torso about 16 px wide at the shoulders; a short sword
  const RIG = { shY: 43, shX: 8, arm: 20, gun: 20, gunUp: 10 };

  // the shop's permanent upgrades (meta.js): price 30 × the next rank
  const SHOP = [
    { id: 'health', name: 'Буфер памяти', desc: '+10 HP к стабильности ядра', max: 5, ic: 'ic_hp' },
    { id: 'power', name: 'Пропускная способность', desc: '+5% ко всему урону', max: 5, ic: 'ic_power' },
    { id: 'speed', name: 'Тактовая частота', desc: '+3% к скорости', max: 5, ic: 'ic_speed' },
    { id: 'haste', name: 'Многопоточность', desc: '−4% к перезарядке', max: 5, ic: 'ic_haste' },
    { id: 'range', name: 'Радиус сканирования', desc: '+4% к радиусу и дальности', max: 5, ic: 'ic_area' },
    { id: 'magnet', name: 'Сбор пакетов', desc: '+10% к радиусу сбора', max: 5, ic: 'ic_magnet' },
    { id: 'armor', name: 'Криптозащита', desc: '−1 входящего урона (минимум 1)', max: 3, ic: 'ic_amount' },
    { id: 'regen', name: 'Автовосстановление', desc: '+0,15 HP в секунду', max: 5, ic: 'heal' },
    { id: 'greed', name: 'Монетизация', desc: '+5% кодов в конце смены', max: 5, ic: 'code_tex' },
    { id: 'luck', name: 'Удачный парсинг', desc: '+0,2 п.п. к шансу кода, +0,1 п.п. к лечилке', max: 5, ic: 'gem_c' },
    { id: 'head', name: 'Предзагрузка', desc: 'Смена начинается с выбора улучшения', max: 2, ic: 'chest' },
    { id: 'rerolls', name: 'Перегенерация', desc: '+1 перегенерация карточек за смену', max: 3, ic: 'ic_retry' },
    { id: 'skips', name: 'Отложенный релиз', desc: '+1 пропуск выбора за смену', max: 3, ic: 'ic_dur' },
  ];
  // localStorage keys start with this (games on one site keep their saves apart)
  const SAVE = 'ns';

  Object.assign(SET, { RIG, SAVE, SHOP, EDU, HINT, FOE, FOE_DESC, WEAP, HEROES, CLIENTS, EVO, WSUM, PASS, SKINS, ABIL, FOOT, COMPONENTS, RECTS, PLAZA, MAPS, RUN });
  if (typeof module !== 'undefined') module.exports = SET;
})(typeof window !== 'undefined' ? window : globalThis);
