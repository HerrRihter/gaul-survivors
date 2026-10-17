// `layout` picks the scenery generator in src/world/arenas.js: 'village' (hand-placed houses),
// 'forest' and 'camp' (seeded scatter), 'lutetia' (city blocks). `cachedVignette` reuses a
// rasterised darkening overlay on dense maps.
export const mapDefinitions={
 village:{layout:'village',notes:"Площадь в центре даёт место для манёвров. Дома и дерево барда создают укрытия и проходы. Частокол и стволы деревьев блокируют движение; через ворота можно пройти.",victoryTag:'ДЕРЕВНЯ НЕ СДАЁТСЯ',name:'Деревня',description:'Знакомые дома и легион. Исходная карта.'},
 // openFor: trees are cleared until bodies of these radii reach every glade from the centre.
 forest:{layout:'forest',seed:731,openFor:[14,20],notes:"Деревья и камни ограничивают проходы. На поляне в центре больше места, чтобы уклониться от кабана, сети или каменного отряда.",victoryTag:'ГАЛЛЫ ПОБЕЖДАЮТ',name:'Лес',description:'Извилистая лесная дорога, камни и густые заросли. Остерегайся засад.'},
 camp:{layout:'camp',seed:192,notes:"Палатки и частокол образуют ряды укрытий. Пять горизонтальных и пять вертикальных проездов открыты для конницы. После 2:00 опасны все эти маршруты.",victoryTag:'ГАЛЛЫ ПОБЕЖДАЮТ',name:'Римский лагерь',description:'Ряды палаток и широкие проезды. После 2:00 конница атакует по всему лагерю.'},
 lutetia:{layout:'lutetia',cachedVignette:true,notes:"Кривые улицы и рынок создают укрытия. Торговцы охраняют прилавки; гражданские бегают по улицам, куртизанки подбирают добычу.",victoryTag:'ГАЛЛЫ ПОБЕЖДАЮТ',name:'Лютеция',description:'Кривые улицы, рынок и городская стража. Торговцы бросают товары, куртизанки подбирают опыт и еду. Босс Лютеции — казначей Малосинус: появляется в 3:50, бьёт мешком денег и лечится, подбирая опыт.'}
};
