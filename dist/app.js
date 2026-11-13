'use strict';
const pairs = {
  height: {a:'Superior',b:'Inferior',ca:'TOWARD THE HEAD',cb:'TOWARD THE FEET',da:'Higher, toward the head.',db:'Lower, toward the feet.',ea:'The head is superior to the chest.',eb:'The ankle is inferior to the knee.',tip:"Describe the person's body in anatomical position, even when their posture changes.",symbol:'↕'},
  front: {a:'Anterior',b:'Posterior',ca:'TOWARD THE FRONT',cb:'TOWARD THE BACK',da:'Toward the front.',db:'Toward the back.',ea:'The sternum is anterior to the heart.',eb:'The vertebral column is posterior to the sternum.',tip:'Anterior and posterior describe front and back. They do not mean nearer and farther from the surface.',symbol:'↔'},
  midline: {a:'Medial',b:'Lateral',ca:'TOWARD THE MIDLINE',cb:'AWAY FROM THE MIDLINE',da:"Nearer the body's midline.",db:"Farther from the body's midline.",ea:'The nose is medial to the ears.',eb:'The ears are lateral to the nose.',tip:'The midline is the central reference. Anatomical right and left belong to the person being described.',symbol:'↔'},
  limb: {a:'Proximal',b:'Distal',ca:'TOWARD THE ATTACHMENT',cb:'AWAY FROM THE ATTACHMENT',da:"Nearer a limb's attachment to the trunk.",db:"Farther from a limb's attachment to the trunk.",ea:'The elbow is proximal to the wrist.',eb:'The fingers are distal to the elbow.',tip:'Follow the limb toward or away from its attachment. Proximal is not simply another word for above.',symbol:'↔'},
  surface: {a:'Superficial',b:'Deep',ca:'NEARER THE SURFACE',cb:'BENEATH THE SURFACE',da:'Nearer the body surface.',db:'Farther beneath the body surface.',ea:'The skin is superficial to skeletal muscle.',eb:'The brain is deep to the skull.',tip:'These terms describe depth beneath the body surface, not front versus back.',symbol:'↕'}
};
const tabs = Array.from(document.querySelectorAll('[data-pair]'));
const fields = {a:'term-a',b:'term-b',ca:'cue-a',cb:'cue-b',da:'definition-a',db:'definition-b',ea:'example-a',eb:'example-b',tip:'pair-tip'};
function selectPair(tab, focus = false) {
  const data = pairs[tab.dataset.pair];
  if (!data) return;
  for (const candidate of tabs) {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
  }
  for (const [key,id] of Object.entries(fields)) document.getElementById(id).textContent = data[key];
  document.querySelector('.pair-divider').textContent = data.symbol;
  document.getElementById('pair-panel').setAttribute('aria-labelledby',tab.id);
  if (focus) tab.focus();
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click', () => selectPair(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectPair(tabs[next],true); }
  });
});
const answers = Array.from(document.querySelectorAll('[data-answer]'));
answers.forEach(button => button.addEventListener('click', () => {
  answers.forEach(candidate => candidate.classList.toggle('selected',candidate === button));
  document.getElementById('answer-feedback').textContent = button.dataset.answer === 'proximal'
    ? 'Correct: proximal. The elbow is nearer the upper limb’s attachment to the trunk than the wrist is.'
    : 'Recheck the direction. The elbow is proximal to the wrist because it is nearer the upper limb’s attachment to the trunk. The wrist is distal to the elbow.';
}));
