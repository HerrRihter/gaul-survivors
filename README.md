# Галлы: последний пир

Небольшая неофициальная фан-игра в жанре survival arena. Графика использует локальные PNG-кадры и Canvas; внешних зависимостей, сетевых запросов и установки нет.

Актуальные анимации персонажей используют отдельные PNG-кадры **256×256**, общую точку стоп **(128, 236)** и реестр `data/animations/character-frames.json`. Старые атласы персонажей больше не загружаются в игре. Правила размеров, добавление кадров и замеры скорости описаны в [docs/CHARACTER-FRAMES.md](docs/CHARACTER-FRAMES.md); описания атласов ниже относятся к исходным художественным материалам.

## Запуск

Откройте `index.html` двойным щелчком в современном браузере. Игра и страницы просмотра графики работают без сервера: для открытия из файла предусмотрены готовые обычные скрипты в `runtime/`. Музыка и эффекты запускаются после первого нажатия. Кнопка «ЗВУК» выключает всё аудио, а «♫ ГРОМКОСТЬ» открывает отдельные ползунки музыки и эффектов. Настройки сохраняются; при паузе и скрытии вкладки музыка останавливается. Локальные CC0 треки и эффекты: [источники и лицензии](assets/audio/CREDITS.md).

При запуске через HTTP используются исходные ES-модули. После изменения исходников обновите готовые скрипты командой `npm run generate`; проверки и сборка обнаруживают устаревшие копии.

Для локальной разработки: `node tools/server.cjs`, затем откройте http://127.0.0.1:8765/ . Проверка публикации: `node tools/build-site.cjs`, затем `node tools/server.cjs --site --prefix /gaul-survivors/` и http://127.0.0.1:8765/gaul-survivors/ . Перед сменой режима остановите предыдущий сервер.

Игровые изображения лежат в `assets/runtime/`, оригиналы, промпты и метаданные — в `assets/source/`; локальные художественные страницы — в `previews/`, проверки — в `tests/`, инструменты — в `tools/`, документация — в `docs/`. Таблица переноса с исходными контрольными суммами: `docs/MIGRATION-PATHS.json`. Опубликованные адреса `index.html`, `legion-preview.html` и `village-preview.html` сохранены. Данные баланса остаются в JS до отдельного этапа разделения модулей.

## Публикация на GitHub Pages

Создайте GitHub-репозиторий для этой папки, загрузите её содержимое в корень ветки `main` или `master` и в **Settings → Pages** выберите **GitHub Actions** в качестве источника публикации. Workflow `.github/workflows/deploy-pages.yml` автоматически опубликует игру при push; адрес сайта появится в **Settings → Pages**.

Ветка `preserve/current-code-before-rollback-20261011` также публикуется при push. Для ручной публикации выберите **Actions → Deploy to GitHub Pages → Run workflow** и нужную ветку. Перед отправкой изменений выполните `npm run generate`, `npm test` и `npm run build`. Окончания строк исходников и готовых скриптов закреплены в `.gitattributes`, чтобы проверки генерации одинаково работали на Windows и Linux.

## Как играть

- WASD / стрелки: движение. На сенсорном экране тяните пальцем по арене.
- На телефоне сцена подстраивается под ориентацию экрана без растягивания; виртуальный стик доступен в альбомном режиме и появляется у места касания в портретном.
- Атаки автоматические. Зелёные кристаллы дают опыт; при повышении уровня выбирайте одну из трёх способностей мышью или клавишами 1–3.
- Escape / P: пауза. При переключении окна игра автоматически ставится на паузу.
- Астерикс бьёт вокруг себя; Обеликс бросает пробивающие менгиры в ближайшего врага.
- Еда восстанавливает здоровье. Менгиры и песню барда можно получить через улучшения.
- Для победы продержитесь 5 минут и победите центуриона, который появляется на 3:50. Если он ещё жив на 5:00, бой продолжается до победы над ним.
- Рекорд сохраняется локально в браузере, если доступен localStorage.

Это локальный игровой прототип: деревня, шесть героев, шесть типов войск легиона, центурион и ветки общих и личных улучшений. Сетевого режима нет. Названия персонажей и мир используются как фанатская интерпретация.

## Графика римлян

Римляне используют новый прозрачный атлас assets/runtime/characters/enemies/shared/roman-atlas-v2.png, созданный встроенным imagegen по кадру из мультфильма «Двенадцать подвигов Астерикса». Три разных легионера и центурион преобразуются в спрайты 96×128. В игре используются новые покадровые анимации из src/rendering/art/animation-art.js. previews/art-preview.html показывает персонажей крупно. Источник и полный запрос генерации записаны в docs/ART-SOURCES.md. Старый набор сохранён в src/rendering/art/roman-art-legacy.js как резерв при ошибке загрузки. Пираты и монстры отключены на первой карте; старые резервные спрайты сохранены.

Проверка игровой механики: `node --experimental-vm-modules tests/test.cjs`.

## Герои

Графика Астерикса и Обеликса разделена: у каждого есть собственные `portrait.png` и `animations.png` в папках `assets/runtime/characters/heroes/asterix/` и `assets/runtime/characters/heroes/obelix/`. Они загружаются независимо. Общие исходные атласы хранятся в `assets/source/atlases/`.

Астерикс и Обеликс обновлены по кадру из того же мультфильма. `assets/source/atlases/hero-atlas-v2.png` содержит прозрачные изображения, `src/rendering/art/hero-art.js` готовит спрайты 128×128 для арены и экрана выбора. Обеликс заметно выше и шире Астерикса. Увеличенный просмотр вместе с легионером: `previews/hero-preview.html`. Герои используют отдельные фазы шага и атаки. Источник и запрос генерации сохранены в `docs/ART-SOURCES.md`.



## Анимация движения и атаки

48 рисованных кадров: по четыре фазы ходьбы и атаки для двух героев, трёх легионеров и центуриона. Остановка возвращает персонажа в стойку. Атака имеет подготовку, замах, удар и возврат; удар кулаком, выпуск менгира и урон копьём/мечом происходят на третьем кадре. Легионеры останавливаются для атаки, и из зоны выпада можно уйти. При паузе и выборе улучшений анимации останавливаются. Скорость ходьбы соответствует пройденному расстоянию; ускорение атаки сокращает её длительность.

Откройте previews/animation-preview.html, чтобы переключать ходьбу/атаку, менять скорость, разворот и листать отдельные кадры. Проверки: node --experimental-vm-modules tests/test.cjs и node --experimental-vm-modules tests/test-animation.cjs.

## Здоровье, реакция на удар и менгир

У легионеров теперь 60 базовых HP вместо 22, без роста HP по времени на первой карте. Несмертельный урон запускает 4 кадра реакции на 0,34 секунды, останавливает ходьбу и прерывает замах. Смертельный урон не запускает эту анимацию.

Летящий менгир использует отдельный рисунок assets/runtime/projectiles/menhir-flight-v2.png с гранитными гранями, сколами и заострённой верхушкой. В полёте камень вращается и имеет тень на земле. Посмотреть можно в previews/animation-preview.html под блоком персонажей. В этой же странице есть кнопка «Получение урона». Всего 60 кадров анимации.

Локальный сервер: node tools/server.cjs, затем http://127.0.0.1:8765/ . Запуск через file:// больше не поддерживается: используйте локальный сервер.


## Первая локация: деревня и легион

Основа карты — восемь домов, центральная площадь, дороги и визуальный частокол. Дома блокируют героя, врагов и пилумы. Навигация римлян обходит дома; таран останавливается при столкновении. Частокол пока декоративный. Разрушаемых зданий и отдельной прочности деревни пока нет.

| Враг | HP | Урон | Появление | Поведение |
| --- | ---: | ---: | --- | --- |
| Легионер | 60 | 9 | 0:00 | Ближний удар, прерывается попаданием |
| Копейщик | 90 | 15 | 0:25 | Выпад на 108 пикселей по зафиксированной линии |
| Метатель пилума | 75 | 13 | 0:50 | Дистанция 220, бросок до 310, снаряд блокируется домами |
| Ветеран | 150 | 23 | 1:25 | Долгий замах, уменьшенное отбрасывание |
| Черепаха | 480 | 20 | 1:40, каждые 65 с | Шесть солдат с общим HP; спереди проходит 35% урона, сбоку/сзади — весь |
| Таран | 650 | 32 | 2:35, каждые 80 с | Подготовка 1,1 с, разгон до 416 пикселей; стены останавливают |
| Центурион | 1600 | 24 | 3:50 | Финальный противник |

Не более двух черепах и двух таранов одновременно. Оранжевая область показывает направление готовящегося удара, которое фиксируется в начале замаха. Тяжёлые отряды не прерывают атаку от обычного попадания. Копейщик, метатель, ветеран, черепаха и таран используют отдельные рисованные атласы. Каждый содержит 4 кадра движения, 4 атаки и 4 реакции на урон. Осадные отряды показывают реакцию без прерывания разгона или атаки.

Разведданные со всеми типами и планом карты: legion-preview.html (также кнопка в главном меню). Параметры и отрисовка войск — src/entities/legion.js, карта и навигация — src/world/village/village.js. Проверки tests/test.cjs покрывают полный забег, состав волн, уклонение, пилумы/укрытия, защиту черепахи, таран и обход дома. tests/test-animation.cjs проверяет 60 кадров.


## Графика новых войск

Пять прозрачных атласов `assets/runtime/characters/enemies/spear/unit-spear-v1.png`, `assets/runtime/characters/enemies/pilum/unit-pilum-v1.png`, `assets/runtime/characters/enemies/veteran/unit-veteran-v1.png`, `assets/runtime/characters/enemies/turtle/unit-turtle-v1.png`, `assets/runtime/characters/enemies/ram/unit-ram-v1.png` созданы встроенным imagegen по существующему `assets/runtime/characters/enemies/shared/legion-animation.png`. Полные запросы — `assets/source/prompts/unit-art-prompts.json`. `data/animations/unit-layout.js` хранит измеренные границы 60 кадров; `src/rendering/art/unit-art.js` кэширует их и выбирает состояние. Масштаб фиксирован внутри каждого атласа, ноги выровнены, отражение соответствует направлению атаки. Старая графика используется только при ошибке загрузки. Общая библиотека игры теперь содержит 120 рисованных кадров.

Летящие пилум и рыба в `src/rendering/art/projectile-art.js` нарисованы в том же стиле, что оружие в руках: деревянное древко с металлическим наконечником и пятнистая рыба с жёлтым глазом. Снаряды поворачиваются по направлению полёта; возвращающаяся рыба разворачивается вслед за хозяином. Проверка рисунков и ориентации: `node --experimental-vm-modules tests/test-projectile-art.cjs`; траектория рыбы также проверяется в `tests/test.cjs`.

В `legion-preview.html` есть выбор движения/атаки/урона/стойки, пауза и разворот. Дополнительная проверка: `node --experimental-vm-modules tests/test-unit-art.cjs`.

## Тела погибших

Римляне падают за 0,32 секунды, лежат до шестой секунды и плавно исчезают за следующие две. Тела рисуются под живыми персонажами и добычей, не мешают движению, не получают урон и не дают повторных наград. Черепаха оставляет шесть тел, расчёт тарана — четыре. На паузе время исчезновения останавливается. Максимум 180 тел; при переполнении удаляются самые старые. Код — src/systems/corpses.js, проверки включены в tests/test.cjs.


Менгир в полёте обновлён по камню из анимации броска: assets/runtime/projectiles/menhir-flight-v2.png, широкий серый силуэт с тёмным контуром и трещинами. Размер 62×36 пикселей соответствует камню в руках при игровом масштабе. Направление падения тел определяется последним смертельным импульсом (для кулака и менгира) либо направлением от источника урона (для круговой волны), включая вертикальные и диагональные попадания.


### Illustrated village
Open village-preview.html for the complete map or a closer plaza view. New stone/thatch houses, shops, bard tree, palisade and forest use generated raster scenery guided by 1976 film frames; see docs/ART-SOURCES.md and assets/source/prompts/village-art-prompts.json. Building footprints handle movement, cover and navigation; art is sorted with actors by ground depth, fading over the player. Terrain is cached once after loading. Perimeter props have ground collision polygons. Undocumented parts of the film layout are reconstructed for playability.

### Ground collision audit
All scenery objects use normalized ground polygons in src/world/village/collision.js (59 polygons), including individual tree trunks/roots, rocks, shop equipment, fence bases and the two sides of the open gate. Roofs/canopies are overhead. Circular actor clearance uses exact segment distances; movement checks the swept path and slides along free axes. Navigation uses a 25px grid with checked edges and separate caches for each actor radius (including the 29px centurion). Wide siege units route around gaps that cannot accommodate them. In village-preview.html enable «Границы препятствий» to inspect the shapes. Run node --experimental-vm-modules tests/test-village-collision.cjs for obstacle and route checks, and node --experimental-vm-modules tests/test.cjs for full combat regression.

Hero attacks automatically in the direction of the last movement input (including diagonals); facing persists while idle. During windup, attack animation and aim follow movement; the direction at impact determines where Asterix swings, Obelix throws, or a bonus menhir fan fires. Asterix hits a forward 90-degree sector, checking obstacle cover. A small gold ground arrow shows the active direction. Bard song remains the separate radial upgrade.


### Helmets and villager prototypes
Progression is stored locally under gaul-progression-v1: one helmet per 10 lifetime kills (partial milestones survive runs), plus a 5% chance per defeated unit of a ground pickup worth 3 helmets. Physical pickups must be collected; uncollected drops disappear with the run. Rewards already credited survive defeat and quitting. The menu shop unlocks Cacofonix (60), Antisanitarix (75), Automatix (90), Panoramix (100); Asterix/Obelix remain free. Permanent health (+10), power (+5%) and speed (+3%) upgrades each have five levels, costing 30/60/90/120/150 helmets, applied next run. Storage failures are shown in the shop; there is no server/cloud save.
New villagers use 48 drawn animation frames for walking, attacks and hurt reactions, with code-drawn fallback only while assets are unavailable. Cacofonix: radius 95 music aura, 12 damage per 0.6s. Antisanitarix: directional rotten-fish boomerang, 24 damage once per flight leg, returns to moving owner, stops at obstacles. Automatix: speed 105, 150 HP, 50 damage in a forward 180° swing; Asterix now uses a 90° sector. Panoramix: poison while moving, 3.5s lifetime, radius 30, 8 damage every 0.5s without stacking overlapping pools. Run upgrades affect their damage, rate and range. See tests/test-progression.cjs and tests/test.cjs.

Animation assets added 10 October: src/rendering/art/villager-art.js loads isolated frames from assets/runtime/characters/heroes/<hero>/animations/ without pixel readback; run the game through the local HTTP server. Cacofonix strums on aura ticks, Panoramix pours on trail pulses, fish/hammer animations follow the attack windup, and player damage triggers hurt reactions. Roman helmets use assets/runtime/ui/roman-helmet-v1.png both on the field and next to the currency counter. Prompts are in assets/source/prompts/new-heroes-animation-prompts.json. Validate with node --experimental-vm-modules tests/test-villager-art.cjs; previews/animation-audit.html checks all 168 cached frames for edge clipping.

Публикация: `node tools/build-site.cjs` собирает `_site/` для GitHub Pages. Доступны игра, разведданные и карта. `previews/animation-preview.html`, `previews/animation-audit.html`, `previews/art-preview.html` и `previews/hero-preview.html` остаются только в исходниках для локальной разработки.

Состав публикации задаётся в `tools/publication-manifest.cjs`: для каждой группы указаны назначение и страницы-потребители. Сборка копирует только перечисленные файлы, включая резервную графику и отдельные кадры героев. Исходные атласы, референсы, снимки проверок и инструменты в сайт не попадают. При добавлении игрового ресурса обновите манифест; отсутствующий файл останавливает сборку до очистки предыдущего результата.

Полная проверка: `node tools/test-all.cjs`. Она запускает 12 наборов проверок: девять игровых и художественных, `tests/test-session.cjs` для создания сессий и управления циклом, затем `tests/test-site.cjs` для состава сборки и HTTP-доступности ссылок трёх опубликованных страниц, включая вычисляемые пути к изображениям, под префиксом `/gaul-survivors/`. Проверка загрузчиков использует заглушки Image/Canvas и не заменяет визуальную проверку в браузере. GitHub Actions запускает все проверки перед публикацией. Для этих команд используйте Node.js 24; установка пакетов не требуется.

Дополнительная `tests/test-rendering.cjs` сравнивает порядок отрисовки с прежним алгоритмом и проверяет однократное событие попадания при пропуске кадров. Первичные границы кадров хранятся в `data/animations/*-layout.json`; `node tools/generate-layouts.cjs` создаёт JS-модули, а `--check` проверяет соответствие. Сборка и CI отклоняют устаревшие производные модули. Измерительные файлы в `assets/source/metadata/` сохранены как исторические материалы; они не являются вторым редактируемым runtime-источником. Характеристики героев и войск находятся в `data/characters/heroes.js` и `data/enemies/units.js`, расписание и вероятности волн — в `data/enemies/waves.js`, общий момент попадания — в `data/animations/action-timing.js`.

Зависимости задаются импортами; порядок списка HTML-скриптов больше не нужен. Стили игры вынесены в `styles/game.css`. `previews/performance.html` измеряет позднюю сцену со 120 врагами; `node tools/profile-depth.cjs` сравнивает алгоритмы сортировки. Результаты и ограничения измерений записаны в `docs/PERFORMANCE.md`.

Браузерный запуск находится в `src/main.js`: он создаёт `GameSession` из `src/app/game-session.js`, передавая DOM, Canvas через DOM-адаптер, хранилище, часы, планировщик и игровые системы. Создание сессии настраивает интерфейс, но не запускает цикл автоматически: `run()` запускает его один раз, `stop()` отменяет запланированный кадр. Для проверок доступно прямое продвижение симуляции через `update(dt)` и чтение `state`/`mode`. Один экземпляр сессии использует собственные DOM-адаптеры; `stop()` останавливает кадры, а не удаляет обработчики интерфейса. Портреты выделены в `src/ui/menu-portraits.js`; тесты загружают полные исходники без строковых замен или вырезания фрагментов.

## Общие и личные усиления
В забеге: 8 общих пассивных усилений (по 5 рангов) и 3 ветки оружия каждого героя (по 3 ранга, число снарядов — 2). Каждый уровень даёт три разных варианта; пока личная ветка доступна, один вариант гарантированно личный. Полностью развитые ветки исключаются, после исчерпания доступны припасы. Ранги сбрасываются при новом забеге.
Лавка: 8 общих постоянных бонусов и по одной персональной тренировке на 3 ранга. Тренировка недоступна до покупки героя. Старый gaul-progression-v1 сохраняет валюту, героев и прежние покупки. Проверки: node --experimental-vm-modules tests/test-upgrades.cjs, node --experimental-vm-modules tests/test-progression.cjs, node --experimental-vm-modules tests/test.cjs.
Ориентир разделения оружия и пассивных бонусов: https://vampire-survivors.fandom.com/wiki/Weapons и https://vampire-survivors.fandom.com/wiki/Passive_items . Эволюции и лимиты слотов в этой версии не вводились.

## Лес и римский лагерь

В выборе героя появился выбор из трёх карт. Две новые карты пока используют пиксельные заготовки; семь местных противников получили рисованные анимации с рабочими механиками. Старые войска продолжают появляться. Карты доступны через «Карта», все отряды — через «Разведданные». Параметры, ограничения прототипа и расположение модулей: [docs/NEW-MAPS.md](docs/NEW-MAPS.md).
