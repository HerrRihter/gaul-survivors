import {getWaveSchedule} from './wave-schedule.js';

export function seedPopulation(c) {
  const spec = getWaveSchedule(c.state.map).population;
  if (!spec) return;
  const radius = c.Legion.units[spec.unit].r;
  for (let i = 0; i < spec.initial; i++) {
    for (let attempt = 0; attempt < 80; attempt++) {
      const position = {x:c.rand(100, c.WORLD-100), y:c.rand(120, c.WORLD-100)};
      if (c.dist(position, c.state.p) < 140 || c.Village.blocked(position.x, position.y, radius)) continue;
      if (c.Village.reachable && !c.Village.reachable(position.x, position.y, radius)) continue;
      c.spawn(spec.unit, false, {...position, variant:i % spec.variants});
      break;
    }
  }
}

export function replenishPopulation(c) {
  const s = c.state, spec = getWaveSchedule(s.map).population;
  if (!spec || s.t < s.populationNext) return;
  s.populationNext = s.t + spec.every;
  const count = s.enemies.filter(e => e.unit === spec.unit && e.hp > 0).length;
  const desired = Math.min(spec.maximum, spec.initial + Math.floor(s.t / spec.growthEvery));
  // In a city, newcomers step out of doors within sight of the hero but not under the hero's
  // feet, as fast as others go indoors (up to three at a time).
  const doors = (c.Village.pointsOfInterest?.doors || []).filter(d => {const r = c.dist(d, s.p); return r > 260 && r < 700;});
  for (let i = 0; i < Math.min(desired - count, doors.length ? 3 : 1); i++) {
    const door = doors.length ? doors[Math.floor(c.rand(0, doors.length)) % doors.length] : null;
    c.spawn(spec.unit, false, door && {...door, variant:Math.floor(c.rand(0, spec.variants)) % spec.variants});
  }
}
