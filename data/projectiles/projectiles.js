// Atlas boxes are in pixels of the published (downscaled) textures; see tools/image-budget.json.
export const projectileDefinitions={
  fish:{name:'Рыба',source:'atlas',texture:'projectiles/projectiles-v2.png',box:[107,46,170,75],width:34,yOffset:48},
  pilum:{name:'Пилум',source:'atlas',texture:'projectiles/projectiles-v2.png',box:[28,187,333,19],width:72,yOffset:16},
  net:{name:'Сеть',source:'frame',unit:'netter',action:'attack',progress:.5,box:[183,172,64,44],yOffset:44},
  arrow:{name:'Стрела',source:'frame',unit:'tower',action:'attack',progress:.5,box:[185,109,33,10],arcStart:122,arcEnd:40},
  menhir:{name:'Менгир',source:'atlas',texture:'projectiles/menhir-flight-v2.png',box:[0,0,256,115],targetSize:[124,72]}
};

export const projectiles=projectileDefinitions;
