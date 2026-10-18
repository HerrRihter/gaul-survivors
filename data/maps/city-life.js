// Ambient city life for maps with `cityLife:true` (see data/maps/maps.js): pigeon flocks on the
// squares and short speech bubbles. Bubbles are rare on purpose: `max` on screen at once,
// `every` seconds between any two, `speakerEvery` seconds before the same unit talks again.
export const cityLife={
 pigeons:{flocks:3,birds:[5,8],scare:130,respawn:[9,18],minDistance:600},
 bubbles:{max:2,every:4,speakerEvery:14,life:2.2,range:560,advertEvery:9},
 citizens:{panic:170,stroll:.55,flee:1.3,linger:{stall:[4,9],plaza:[5,12]},talkDistance:52,perPlaza:4,goalRange:750,
  // Everyday activity while lingering: an action of citizen-N in character-frames.json.
  activities:{stall:'shop',chat:'talk',plaza:'rest'}},
 phrases:{
  merchant:['Свежая рыба! Почти свежая!','Кабаны! Дикие кабаны!','Амфоры из самой Массилии!','Сыр — лучший в Лютеции!','Подходи, не стесняйся!'],
  panic:['Галлы!','Спасайся!','Мои горшки!','Стража!','Помогите!'],
  cheer:['Малосинус пал!','Слава галлам!','Пир! Устроим пир!']
 }
};
