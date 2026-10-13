export const abilityDefinitions = {
 asterix:[{id:'dash',name:'Галльский прорыв',cooldown:10,duration:.22,description:'Рывок: 35 урона и отталкивание.'},{id:'potion',name:'Волшебное зелье',cooldown:26,duration:6,description:'6 с: быстрее удары и движение.'}],
 obelix:[{id:'jump',name:'Галльский обвал',cooldown:14,duration:.55,description:'Прыжок: 65 урона вокруг приземления.'},{id:'appetite',name:'Боевой аппетит',cooldown:30,duration:7,description:'7 с: каждое убийство восстанавливает 2 HP.'}],
 automatix:[{id:'forge',name:'Кузнечная закалка',cooldown:24,cooldownPerRank:6,duration:0,description:'Навсегда повысить Крепкую кожу на 1 ранг (макс. 3). Бесплатно.'},{id:'spin',name:'Кузнечный вихрь',cooldown:20,duration:3,description:'3 с: круговые удары молотом, движение медленнее.'}],
 cacofonix:[{id:'note',name:'Высокая нота',cooldown:18,duration:0,description:'Звуковая волна: урон, толчок и оглушение.'},{id:'concert',name:'Сольный концерт',cooldown:28,duration:3,radiusMultiplier:3,radiusPerRank:.5,description:'3 с: радиус музыкальной ауры ×3.'}],
 antisanitarix:[{id:'volley',name:'Рыбный развал',cooldown:16,duration:0,description:'Веер из пяти рыб-бумерангов.'},{id:'cloud',name:'Несвежий товар',cooldown:24,duration:5,description:'Облако: урон и замедление на 5 с.'}],
 panoramix:[{id:'brew',name:'Бурлящий настой',cooldown:18,duration:4,description:'Большая ядовитая область впереди.'},{id:'elixir',name:'Дубовый эликсир',cooldown:30,duration:5,description:'Восстановить 20 HP за 5 с и защититься от отравления.'}]
};

// Ranks belong to the current run; activation snapshots them for running effects.
export const abilityUpgradeDescriptions = {
 dash:'+25% к базовому урону рывка за ранг.',
 potion:'Зелье действует на 1 секунду дольше за ранг.',
 jump:'+25% к базовому урону приземления за ранг.',
 appetite:'+1 HP за убийство во время аппетита за ранг.',
 forge:`−${abilityDefinitions.automatix.find(a=>a.id==='forge').cooldownPerRank} секунд перезарядки закалки за ранг. Применение по-прежнему даёт 1 ранг Крепкой кожи.`,
 spin:'+25% к базовому урону каждого удара вихря за ранг.',
 note:'+25% к базовому урону и +0,3 с оглушения высокой ноты за ранг.',
 concert:'Ещё +0,5 к множителю радиуса концерта за ранг: ×3,5 / ×4 / ×4,5. Длительность — 3 с.',
 volley:'Ещё одна рыба в активном залпе за ранг.',
 cloud:'+25% к базовому урону и +10% к базовому радиусу облака за ранг.',
 brew:'+25% к базовому урону и +10% к базовому радиусу настоя за ранг.',
 elixir:'+1 HP в секунду лечения эликсиром за ранг.'
};
export const abilityUpgradeMax=3;
export const abilityUpgradeId=id=>'ability_'+id;
export const abilityRank=(state,id)=>state.upgradeRanks?.[abilityUpgradeId(id)]||0;
