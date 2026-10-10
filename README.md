# Галлы: последний пир

Небольшая неофициальная фан-игра в жанре survival arena. Графика использует локальные PNG-атласы и Canvas; внешних зависимостей, сетевых запросов и установки нет.

## Запуск

Откройте `index.html` в современном браузере двойным щелчком. Звук включается кнопкой в правом нижнем углу.

## Публикация на GitHub Pages

Создайте GitHub-репозиторий для этой папки, загрузите её содержимое в корень ветки `main` или `master` и в **Settings → Pages** выберите **GitHub Actions** в качестве источника публикации. Workflow `.github/workflows/deploy-pages.yml` автоматически опубликует игру при push; адрес сайта появится в **Settings → Pages**.

## Как играть

- WASD / стрелки: движение. На сенсорном экране тяните пальцем по арене.
- Атаки автоматические. Зелёные кристаллы дают опыт; при повышении уровня выбирайте одну из трёх способностей мышью или клавишами 1–3.
- Escape / P: пауза. При переключении окна игра автоматически ставится на паузу.
- Астерикс бьёт вокруг себя; Обеликс бросает пробивающие менгиры в ближайшего врага.
- Еда восстанавливает здоровье. Менгиры и песню барда можно получить через улучшения.
- Для победы продержитесь 5 минут и победите центуриона, который появляется на 3:50. Если он ещё жив на 5:00, бой продолжается до победы над ним.
- Рекорд сохраняется локально в браузере, если доступен localStorage.

Это локальный игровой прототип: деревня, два героя, шесть типов войск легиона, центурион и десять улучшений. Сетевого режима нет. Названия персонажей и мир используются как фанатская интерпретация.

## Графика римлян

Римляне используют новый прозрачный атлас roman-atlas-v2.png, созданный встроенным imagegen по кадру из мультфильма «Двенадцать подвигов Астерикса». Три разных легионера и центурион преобразуются в спрайты 96×128. В игре используются новые покадровые анимации из animation-art.js. art-preview.html показывает персонажей крупно. Источник и полный запрос генерации записаны в ART-SOURCES.md. Старый набор сохранён в roman-art-legacy.js как резерв при ошибке загрузки. Пираты и монстры отключены на первой карте; старые резервные спрайты сохранены.

Проверка игровой механики: `node test.cjs`.

## Герои

Астерикс и Обеликс обновлены по кадру из того же мультфильма. `hero-atlas-v2.png` содержит прозрачные изображения, `hero-art.js` готовит спрайты 128×128 для арены и экрана выбора. Обеликс заметно выше и шире Астерикса. Увеличенный просмотр вместе с легионером: `hero-preview.html`. Герои используют отдельные фазы шага и атаки. Источник и запрос генерации сохранены в `ART-SOURCES.md`.



## Анимация движения и атаки

48 рисованных кадров: по четыре фазы ходьбы и атаки для двух героев, трёх легионеров и центуриона. Остановка возвращает персонажа в стойку. Атака имеет подготовку, замах, удар и возврат; удар кулаком, выпуск менгира и урон копьём/мечом происходят на третьем кадре. Легионеры останавливаются для атаки, и из зоны выпада можно уйти. При паузе и выборе улучшений анимации останавливаются. Скорость ходьбы соответствует пройденному расстоянию; ускорение атаки сокращает её длительность.

Откройте animation-preview.html, чтобы переключать ходьбу/атаку, менять скорость, разворот и листать отдельные кадры. Проверки: node test.cjs и node test-animation.cjs.

## Здоровье, реакция на удар и менгир

У легионеров теперь 60 базовых HP вместо 22, без роста HP по времени на первой карте. Несмертельный урон запускает 4 кадра реакции на 0,34 секунды, останавливает ходьбу и прерывает замах. Смертельный урон не запускает эту анимацию.

Летящий менгир использует отдельный рисунок menhir-flight.png с гранитными гранями, сколами и заострённой верхушкой. В полёте камень вращается и имеет тень на земле. Посмотреть можно в animation-preview.html под блоком персонажей. В этой же странице есть кнопка «Получение урона». Всего 60 кадров анимации.

Локальный сервер: node server.cjs, затем http://127.0.0.1:8765/ . Можно также открыть index.html напрямую.


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

Разведданные со всеми типами и планом карты: legion-preview.html (также кнопка в главном меню). Параметры и отрисовка войск — legion.js, карта и навигация — village.js. Проверки test.cjs покрывают полный забег, состав волн, уклонение, пилумы/укрытия, защиту черепахи, таран и обход дома. test-animation.cjs проверяет 60 кадров.


## Графика новых войск

Пять прозрачных атласов `unit-spear-v1.png`, `unit-pilum-v1.png`, `unit-veteran-v1.png`, `unit-turtle-v1.png`, `unit-ram-v1.png` созданы встроенным imagegen по существующему `legion-animation.png`. Полные запросы — `unit-art-prompts.json`. `unit-layout.js` хранит измеренные границы 60 кадров; `unit-art.js` кэширует их и выбирает состояние. Масштаб фиксирован внутри каждого атласа, ноги выровнены, отражение соответствует направлению атаки. Старая графика используется только при ошибке загрузки. Общая библиотека игры теперь содержит 120 рисованных кадров.

Летящие пилум и рыба в `projectile-art.js` нарисованы в том же стиле, что оружие в руках: деревянное древко с металлическим наконечником и пятнистая рыба с жёлтым глазом. Снаряды поворачиваются по направлению полёта; возвращающаяся рыба разворачивается вслед за хозяином. Проверка рисунков и ориентации: `node test-projectile-art.cjs`; траектория рыбы также проверяется в `test.cjs`.

В `legion-preview.html` есть выбор движения/атаки/урона/стойки, пауза и разворот. Дополнительная проверка: `node test-unit-art.cjs`.

## Тела погибших

Римляне падают за 0,32 секунды, лежат до шестой секунды и плавно исчезают за следующие две. Тела рисуются под живыми персонажами и добычей, не мешают движению, не получают урон и не дают повторных наград. Черепаха оставляет шесть тел, расчёт тарана — четыре. На паузе время исчезновения останавливается. Максимум 180 тел; при переполнении удаляются самые старые. Код — corpses.js, проверки включены в test.cjs.


Менгир в полёте обновлён по камню из анимации броска: menhir-flight-v2.png, широкий серый силуэт с тёмным контуром и трещинами. Размер 62×36 пикселей соответствует камню в руках при игровом масштабе. Направление падения тел определяется последним смертельным импульсом (для кулака и менгира) либо направлением от источника урона (для круговой волны), включая вертикальные и диагональные попадания.


### Illustrated village
Open village-preview.html for the complete map or a closer plaza view. New stone/thatch houses, shops, bard tree, palisade and forest use generated raster scenery guided by 1976 film frames; see ART-SOURCES.md and village-art-prompts.json. Building footprints handle movement, cover and navigation; art is sorted with actors by ground depth, fading over the player. Terrain is cached once after loading. Perimeter props have ground collision polygons. Undocumented parts of the film layout are reconstructed for playability.

### Ground collision audit
All scenery objects use normalized ground polygons in village-collision.js (59 polygons), including individual tree trunks/roots, rocks, shop equipment, fence bases and the two sides of the open gate. Roofs/canopies are overhead. Circular actor clearance uses exact segment distances; movement checks the swept path and slides along free axes. Navigation uses a 25px grid with checked edges and separate caches for each actor radius (including the 29px centurion). Wide siege units route around gaps that cannot accommodate them. In village-preview.html enable «Границы препятствий» to inspect the shapes. Run node test-village-collision.cjs for obstacle and route checks, and node test.cjs for full combat regression.

Hero attacks automatically in the direction of the last movement input (including diagonals); facing persists while idle. During windup, attack animation and aim follow movement; the direction at impact determines where Asterix swings, Obelix throws, or a bonus menhir fan fires. Asterix hits a forward 120-degree sector, checking obstacle cover. A small gold ground arrow shows the active direction. Bard song remains the separate radial upgrade.


### Helmets and villager prototypes
Progression is stored locally under gaul-progression-v1: one helmet per 10 lifetime kills (partial milestones survive runs), plus a 5% chance per defeated unit of a ground pickup worth 3 helmets. Physical pickups must be collected; uncollected drops disappear with the run. Rewards already credited survive defeat and quitting. The menu shop unlocks Cacofonix (60), Antisanitarix (75), Automatix (90), Panoramix (100); Asterix/Obelix remain free. Permanent health (+10), power (+5%) and speed (+3%) upgrades each have five levels, costing 30/60/90/120/150 helmets, applied next run. Storage failures are shown in the shop; there is no server/cloud save.
New villagers use 48 drawn animation frames for walking, attacks and hurt reactions, with code-drawn fallback only while assets are unavailable. Cacofonix: radius 95 music aura, 12 damage per 0.6s. Antisanitarix: directional rotten-fish boomerang, 24 damage once per flight leg, returns to moving owner, stops at obstacles. Automatix: speed 105, 150 HP, 50 damage in a forward 180° swing; Asterix now uses a 90° sector. Panoramix: poison while moving, 3.5s lifetime, radius 30, 8 damage every 0.5s without stacking overlapping pools. Run upgrades affect their damage, rate and range. See test-progression.cjs and test.cjs.

Animation assets added 10 October: villager-art.js loads isolated frames from hero-frames/ without pixel readback, so local file rendering remains supported. Cacofonix strums on aura ticks, Panoramix pours on trail pulses, fish/hammer animations follow the attack windup, and player damage triggers hurt reactions. Roman helmets use roman-helmet-v1.png both on the field and next to the currency counter. Prompts are in new-heroes-animation-prompts.json. Validate with node test-villager-art.cjs; animation-audit.html checks all 168 cached frames for edge clipping.
