'use strict';

const contactForm = document.getElementById('contact-form');
const contactStatus = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const fields = new FormData(contactForm);
    const subject = `Study Bench: ${fields.get('subject')}`;
    const body = [
      `Name: ${fields.get('name')}`,
      `Reply email: ${fields.get('email')}`,
      '',
      fields.get('message')
    ].join('\n');

    contactStatus.querySelector('strong').textContent = 'Email draft opened';
    window.location.href = `mailto:mwscrafts@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
