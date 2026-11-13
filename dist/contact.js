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

    if (contactStatus) {
      contactStatus.querySelector('strong').textContent = 'Continue in your email app to send. If it did not open, use Email us above.';
    }
    window.location.href = `mailto:mwscrafts@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
