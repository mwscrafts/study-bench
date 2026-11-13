'use strict';
// Preserve links to sections that used to live on the homepage.
const formerSections = {
  '#explore': 'anatomy-foundations.html#explore',
  '#planes': 'anatomy-foundations.html#planes',
  '#downloads': 'printables.html',
  '#library': 'lessons.html',
  '#approach': 'about.html#evidence-title'
};
function followFormerSection() {
  const destination = formerSections[window.location.hash];
  if (destination) window.location.replace(destination);
}
followFormerSection();
window.addEventListener('hashchange', followFormerSection);
