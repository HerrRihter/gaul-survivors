export const heroUnlockPrices = {
  cacofonix: 60,
  antisanitarix: 75,
  automatix: 90,
  panoramix: 100
};

export const permanentUpgradeDefinitions = {
  health: {name: 'Запас здоровья', desc: '+10 HP всем героям', max: 5, stat: 'hp', factor: 10},
  power: {name: 'Сила деревни', desc: '+5% урона всем героям', max: 5, stat: 'damage', factor: 0.05},
  speed: {name: 'Удобные сандалии', desc: '+3% скорости всем героям', max: 5, stat: 'speed', factor: 0.03},
  haste: {name: 'Выносливость', desc: '+4% к темпу атак', max: 5, stat: 'haste', factor: 0.04},
  range: {name: 'Размах', desc: '+4% к размеру атак', max: 5, stat: 'range', factor: 0.04},
  magnet: {name: 'Сумка трофеев', desc: '+10 к радиусу сбора', max: 5, stat: 'magnet', factor: 10},
  armor: {name: 'Крепкая кожа', desc: '−1 входящего урона; минимум 1', max: 3, stat: 'armor', factor: 1},
  regen: {name: 'Травяной чай', desc: '+0,15 HP в секунду', max: 5, stat: 'regen', factor: 0.15}
};

export const heroTrainingDefinitions = {
  asterix: {name: 'Школа кулачного боя', desc: '+6% к темпу кулаков', max: 3, stat: 'punchTempo', factor: 0.06},
  obelix: {name: 'Каменотёс', desc: '+8% к урону менгиров', max: 3, stat: 'stoneDamage', factor: 0.08},
  cacofonix: {name: 'Уроки вокала', desc: '+6% к радиусу музыки', max: 3, stat: 'musicRange', factor: 0.06},
  antisanitarix: {name: 'Выдержанный улов', desc: '+10% к урону возвращающейся рыбы', max: 3, stat: 'fishReturn', factor: 0.1},
  automatix: {name: 'Секрет кузнеца', desc: '+10% к урону молота', max: 3, stat: 'hammerDamage', factor: 0.1},
  panoramix: {name: 'Рецепт друида', desc: '+0,4 с к длительности яда', max: 3, stat: 'poisonDuration', factor: 0.4}
};

export const permanentUpgrades = {
  ...permanentUpgradeDefinitions,
  ...Object.fromEntries(
    Object.entries(heroTrainingDefinitions).map(([hero, def]) => [
      'training_' + hero,
      {name: def.name, desc: def.desc, max: def.max, hero, stat: def.stat, factor: def.factor}
    ])
  )
};
