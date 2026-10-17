# Как добавить героя, врага, карту или улучшение

Весь игровой контент описан в `data/`. Код в `src/` читает поведение из полей определения (`attack.kind`, `ai`, `attack`, `heavy`, `layout`…), а не из ID. Поэтому новый элемент на существующей механике добавляется **только данными и картинками**. Новая механика — отдельная правка кода; где именно, указано в каждом разделе.

Порядок для любого элемента:

1. **Картинки** → `assets/runtime/…` и `data/animations/character-frames.json`.
2. **Определение** → файл в `data/` (таблица ниже).
3. **Связи** → расписание волн, умения героя и т. п.
4. **Проверка** → `npm test`, затем игра в `npm run dev`.

| Что | Где | Что подхватится само |
| --- | --- | --- |
| Герой | `data/characters/heroes.js` | лавка, выбор героя, карточки оружия, тренировка, сохранения |
| Умения героя (Q/E) | `data/characters/abilities.js` | кнопки, подсказки, ранги на карточках |
| Противник | `data/enemies/units.js` | разведданные, трупы, подписи, бестиарий |
| Волны | `data/enemies/waves.js` | спавн, анонсы, состав на странице разведданных |
| Карта | `data/maps/maps.js` + расписание в `waves.js` | меню, просмотр карты, разведданные |
| Карточки, припасы, лавка, шлемы | `data/upgrades.js` | экран уровня, лавка |
| Достижения | `data/achievements.js` | экран достижений |

**Тексты не повторяют числа вручную.** В `desc`, `description`, `upgrade` пишите `{field}`, `{nested.field}` или `{field%}` — значение подставит `data/text.js` из того же определения. `tests/test-content.cjs` падает с ID виновника, если плейсхолдер не разрешился, ссылка ведёт в никуда или не хватает поля.

---

## Кадры персонажа

- Отдельный PNG **256×256**, RGBA, персонаж смотрит **вправо** (влево игра зеркалит сама). Ступни — в точке **(128, 236)**.
- Действия `walk`, `attack`, `hurt` (по 4 кадра, можно больше; удар засчитывается на середине атаки), по желанию `idle`, `death`.
- Путь: `assets/runtime/characters/<heroes|enemies|civilians>/<id>/animations/<action>/<n>.png` (проверяет `npm run check:structure`).
- Регистрация в `data/animations/character-frames.json` → `characters.<id>`: `renderer` (`villager` — герои, `unit` — противники), `actions` с путями от `assets/runtime/`, `idle`.
- Большие исходные листы и промпты — в `assets/source/`, они не публикуются.
- Производные файлы (`data/animations/*.js` кроме `action-timing.js`, папка `runtime/`) не хранятся в git: их создаёт `npm run generate`, который сам запускается перед `dev`, `start`, `build` и `test`.

---

## Герой

**1. Кадры** — `renderer: "villager"`.

**2. Определение** в `data/characters/heroes.js`:

```js
bravix:{
  name:'Бравикс',price:80,hp:125,speed:140,walkStride:70,
  interval:.9,wind:.5,                      // нет у пассивных героев (aura, trail)
  attack:{kind:'melee',damage:34,arc:120,reach:75,push:160,
    stats:{damage:'clubDamage',reach:'clubReach',push:'clubForce'}},
  weapon:'✦ БОЕВАЯ ДУБИНА',
  desc:'Удар дубиной: {attack.damage} урона в секторе {attack.arc}°.',
  upgrades:[
    {id:'clubDamage',name:'Дубовая дубина',desc:'+{value%}% к урону дубины.',stat:'clubDamage',value:.2},
    {id:'clubReach',name:'Длинный замах',desc:'+{value} к дальности удара.',stat:'clubReach',value:12},
    {id:'clubForce',name:'В ворота!',desc:'+{value} к отбрасыванию.',stat:'clubForce',value:60},
  ],
  training:{name:'Утренняя зарядка',desc:'+{factor%}% к урону дубины',stat:'clubDamage',factor:.08},
  palette:['#607c4b','#a66334'],            // заглушка, пока грузятся кадры
},
```

| Поле | Смысл |
| --- | --- |
| `price` | Цена в шлемах; `0` — доступен с начала |
| `walkStride` | Пикселей на цикл ходьбы: 55 — небольшие фигуры, 90 — крупные |
| `interval`, `wind` | Период атак и длительность замаха (с) |
| `attack.stats` | Какие ключи статистики читает оружие; их повышают `upgrades` и `training` |
| `upgrades` | Ровно 3 карточки оружия, `max` по умолчанию 3 |
| `spriteScale`, `markerHeight` | Размер тени и высота метки над героем (для крупных фигур) |

| `attack.kind` | Механика | Поля | Ключи `stats` |
| --- | --- | --- | --- |
| `melee` | сектор перед героем | `damage`, `arc`°, `reach`, `push`, `swingSound?` | `damage`, `reach`, `push`, `tempo` |
| `stones` | веер пробивающих снарядов | `damage`, `speed`, `spread`, `radius`, `life` | `count`, `damage`, `size` |
| `fish` | бумеранг | `damage`, `speed`, `outbound`, `radius` | `count`, `returnDamage`, `speed` |
| `aura` | пассивное кольцо урона | `damage`, `period`, `radius` | `range`, `damage`, `push` |
| `trail` | пассивные лужи яда при ходьбе | `damage`, `tick`, `life`, `radius`, `drop` | `duration`, `range`, `damage` |

Новый `kind` — это ветка в `heroImpact` (`src/systems/combat.js`) или в `update` (`src/entities/heroes.js`) и строка в `kinds` в `tests/test-content.cjs`.

**3. Умения** — два элемента под ключом героя в `data/characters/abilities.js` (см. ниже). Без них контракт не пройдёт.

---

## Умение (Q/E)

```js
bravix:[
  {id:'roar',name:'Боевой клич',cooldown:20,duration:0,damage:15,radius:140,stun:.8,rankDamage:.25,
   description:'Клич в радиусе {radius}: {damage} урона и оглушение на {stun} с.',
   upgrade:'+{rankDamage%}% к урону за ранг.'},
  {...},
],
```

Числа — поля определения; что даёт ранг — поля `rankDamage`, `rankDuration`, `rankRadius`, `rankStun`, `rankCount`, `rankHeal`, `cooldownPerRank`. `grantsArmorRank: true` — умение повышает постоянную броню (карточки рангов пропадают, когда броня максимальна). Поведение — ветка по `id` в `activate`/`update` (`src/systems/abilities.js`); существующее умение можно дать другому герою, скопировав его определение.

---

## Противник

**1. Кадры** — `renderer: "unit"`, папка `characters/enemies/<id>/`.

**2. Определение** в `data/enemies/units.js` (новые — в конец объекта):

```js
slinger:{name:'Пращник',ai:'legion',attack:'pilum',spriteType:'slinger',keepDistance:240,projectileSpeed:230,
  hp:70,speed:58,damage:11,r:12,range:280,wind:1.2,cooldown:2.4,xp:2,color:'#c8b27a',
  role:'Стрелок',desc:'Держится в {keepDistance} px и мечет камни. Укрытия останавливают снаряд.'},
```

| Поле | Смысл |
| --- | --- |
| `ai` | `legion` (общий цикл пехоты, `simulation.js`), `specialist` (`expansion.js`), `civilian`, `thief` (`city-population.js`), `treasurer` (`malosinus.js`) |
| `attack` | legion: `slash`, `lunge`, `pilum`, `charge`; specialist: ещё `net`, `volley`, `goods`, `cavalry`, `none` |
| `spriteType` | Своя папка кадров; без него юнит рисуется кадрами легионера и попадание сбивает его замах |
| `heavy` | Устойчив к оглушению умений, замедляется максимум на 15% |
| `frontGuard` | Множитель урона спереди (щиты) |
| `knockback` | Доля отбрасывания (по умолчанию 0,12 для тел шире 30, иначе 1) |
| `keepDistance`, `stationary` | Дистанция остановки; не двигается вовсе |
| `chargeSpeed`, `chargeTime`, `telegraph` | Рывок и длина предупреждающей полосы |
| `crush`, `trail`, `arrows`/`arrowSpread`, `stun`/`stunGrace`, `hidesBeyondRange`, `lootEvery`, `projectileSpeed` | Особые свойства (см. комментарий в начале файла) |
| `corpses`, `labelHeight`, `variants`, `title` | Тела отряда, высота подписи, варианты кадров, имя в полосе босса |

Новый `attack` — ветка в `advanceAction` (`simulation.js` для legion, `expansion.js` для specialist) и значение в `attacks` в `tests/test-content.cjs`.

**3. Волны** — без записи в `waves.js` противник в игре не появится.

---

## Волны

У каждой карты одно расписание с тем же ключом, что в `maps.js`. Формат проверяет `tools/check-game-contracts.cjs`:

```js
forest: {
  normal:{firstDelay:.5, stages:[
    {time:0, interval:.95, minInterval:.35, timeFactor:.0018, batch:1, batchEvery:110, cap:120, weights:[['roman',100]]},
    {time:40, ..., weights:[['roman',60],['slinger',40]]},
  ]},
  recurring:[{unit:'boar', first:4, populationCap:120, stages:[{time:0, every:9, cap:8}], message:'КАБАН · Уйди с линии рывка.'}],
  boss:{unit:'boss', time:230, message:'…', sound:'boss'},
  population:null,          // горожане: {unit, initial, maximum, every, growthEvery, variants}
  residents:[],             // юниты, стоящие на местах из генератора карты (торговцы Лютеции)
  notifications:[{time:40, message:'…'}],
},
```

- **Поток** (`normal.stages`): с момента `time` враги идут пачками по `batch` каждые `interval` секунд (минус `timeFactor` в секунду, не меньше `minInterval`), пачка растёт на 1 каждые `batchEvery` секунд, живых не больше `cap`; тип выбирается по весам `weights`.
- **Периодические** (`recurring`): первый в `first`, далее по этапам `stages` (`every`, `cap`), пока боеспособных врагов меньше `populationCap`.
- **Босс** появляется один раз; победа — босс повержен и таймер забега истёк.

---

## Карта

**1. Определение** в `data/maps/maps.js`:

```js
marsh:{layout:'forest',seed:4242,openFor:[14,20],
  name:'Болото',description:'Топкие тропы и редкие деревья.',
  notes:'Узкие гати между кочками.',victoryTag:'БОЛОТО ЗА ГАЛЛАМИ'},
```

| `layout` | Генератор (`src/world/arenas.js`) | Поля |
| --- | --- | --- |
| `village` | Дома деревни вручную (`src/world/village/village-data.js`) | — |
| `forest` | Деревья и камни по сиду вдоль дорог | `seed`, `openFor` |
| `camp` | Кварталы палаток между проездами конницы | `seed` |
| `lutetia` | Городские кварталы, рынок, жители (`src/world/lutetia.js`) | `cachedVignette` |

`openFor` — радиусы тел, для которых лес обязан быть связным: генератор вырубает деревья, отрезающие поляны от центра. На любой карте враги появляются только там, откуда их размер дойдёт до героя. `tests/test-map-connectivity.cjs` падает, если карта распадается на изолированные участки. Новый `layout` — новая фабрика в `createArenas` и значение в списке в `tests/test-content.cjs`.

**2. Расписание** с тем же ключом в `waves.js` — обязательно.

---

## Карточки, лавка и шлемы

`data/upgrades.js`:

- `runUpgradeDefinitions` — общие карточки уровня `{id,name,desc,stat,value,max}`; `stat` — ключ статистики (`damage`, `haste`, `range`, `speed`, `regen`, `armor`, `magnet`) или `maxHp`.
- `supplyDefinitions` — бесконечные «припасы»: `stat` = ключ статистики, `fullHeal`, `helmets`, `reserve`.
- `permanentUpgradeDefinitions` — лавка; цены героев и тренировки берутся из `heroes.js`.
- `helmetRewards` — шлем за убийства, шанс кучки шлемов и еды; тексты лавки строятся из этих чисел.

---

## Проверка и публикация

```bash
npm test
```

```bash
npm run dev
```

- `npm test` создаёт производные файлы, проверяет структуру, расписания и контент, затем запускает **все** `tests/test*.cjs` (новый тест подхватывается сам) и последней — сборку сайта.
- Новый файл в `data/` или `assets/runtime/` добавьте в `tools/publication-manifest.cjs`; кадры персонажей подхватываются оттуда автоматически. Контракт проверяет и то, и другое.
- Картинки ужимайте до 2× размера отрисовки: запись в `tools/image-budget.json`, затем `node tools/optimize-images.cjs --apply`. Если атлас кадрируется или масштабируется, обновите координаты в данных — инструмент печатает коэффициент.
