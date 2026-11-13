import { BERRY_HEAL, gear } from './equipment.mjs?v=09';

// Emberwild's backpack renderer, with the inventory and equipment entries supplied by this game.
export function renderInventory(el, items, owned, equipped, equip, berries, health) {
  const root = el('bagItems');
  root.replaceChildren();
  for (const [icon, name, count, description] of items) {
    const row = document.createElement('div');
    row.className = 'bag-item';
    const title = document.createElement('strong');
    title.textContent = icon + ' ' + name + ' · ' + count;
    const note = document.createElement('small');
    note.textContent = description;
    row.append(title, note);
    root.append(row);
  }

  const rack = el('weaponRack');
  rack.replaceChildren();
  for (const [id, [icon, name, description]] of Object.entries(gear)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'weapon-card' + (equipped === id ? ' selected' : '');
    button.disabled = !owned(id);
    button.setAttribute('aria-pressed', String(equipped === id));
    button.textContent = icon + ' ' + name + (equipped === id ? ' · Equipped' : button.disabled ? ' · Locked' : '');
    button.title = description;
    button.addEventListener('click', () => equip(id));
    rack.append(button);
  }
  el('bagEat').disabled = berries < 1 || health >= 100;
  el('bagEat').textContent = 'Eat a berry · ' + berries + ' saved · +' + BERRY_HEAL + ' health';
  el('bagHealth').textContent = 'Health ' + health + ' / 100';
}
