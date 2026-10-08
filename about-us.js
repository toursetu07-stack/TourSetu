/* TourSetu About Us — lightweight utility-menu extension.
   Adds a safe, keyboard-accessible About Us item below Privacy Policy.
   No user-controlled HTML is injected into the modal body. */
(() => {
  'use strict';

  const ABOUT_US_TEXT =
    'TOURSETU (Operated under Udyam Registration) is currently running a Pilot/Private Beta Testing in Uttarakhand to empower local operators. Official public enrollment & state trade scale is under Phase-1 onboarding.';

  function closeModal(modal) {
    if (modal) modal.remove();
  }

  function openAboutUs() {
    if (document.getElementById('toursetu-about-us-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'toursetu-about-us-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'toursetu-about-us-title');

    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      background: 'rgba(15,23,42,.68)',
      backdropFilter: 'blur(3px)'
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      width: 'min(92vw, 560px)',
      maxHeight: 'min(80vh, 620px)',
      overflowY: 'auto',
      background: '#fff',
      border: '1px solid #ffb36b',
      borderRadius: '18px',
      boxShadow: '0 24px 70px rgba(0,0,0,.28)',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#2d3436'
    });

    const title = document.createElement('h2');
    title.id = 'toursetu-about-us-title';
    title.textContent = 'ℹ️ About TourSetu';
    Object.assign(title.style, {
      margin: '0 0 14px',
      color: '#e67e22',
      fontSize: '22px'
    });

    const body = document.createElement('p');
    body.textContent = ABOUT_US_TEXT;
    Object.assign(body.style, {
      margin: '0',
      lineHeight: '1.7',
      fontSize: '15px',
      color: '#4b5563'
    });

    const note = document.createElement('p');
    note.textContent = 'TourSetu is currently in its Uttarakhand onboarding phase.';
    Object.assign(note.style, {
      margin: '14px 0 0',
      padding: '12px 14px',
      borderRadius: '10px',
      background: '#fff7ed',
      border: '1px solid #fed7aa',
      lineHeight: '1.5',
      fontSize: '13px',
      color: '#7c2d12',
      fontWeight: '700'
    });

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'CLOSE';
    close.setAttribute('aria-label', 'Close About TourSetu');
    Object.assign(close.style, {
      width: '100%',
      marginTop: '20px',
      padding: '12px 16px',
      border: '0',
      borderRadius: '10px',
      background: '#ff9f43',
      color: '#fff',
      fontWeight: '800',
      cursor: 'pointer',
      minHeight: '44px'
    });

    close.addEventListener('click', () => closeModal(overlay));
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeModal(overlay);
    });

    card.append(title, body, note, close);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    close.focus();

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        closeModal(overlay);
        document.removeEventListener('keydown', onKeyDown);
      }
    };
    document.addEventListener('keydown', onKeyDown);
  }

  function addAboutUsItem() {
    const menu = document.getElementById('toursetu-utility-menu-root');
    if (!menu || menu.querySelector('[data-toursetu-about-us]')) return;

    const candidates = Array.from(menu.querySelectorAll('button, a, [role="button"], div'));
    const privacy = candidates.find(el =>
      (el.textContent || '').trim().toLowerCase() === 'privacy policy'
    );

    if (!privacy) return;

    const item = document.createElement('button');
    item.type = 'button';
    item.setAttribute('data-toursetu-about-us', 'true');
    item.textContent = 'ℹ️ About Us';
    item.addEventListener('click', openAboutUs);

    Object.assign(item.style, {
      display: 'block',
      width: '100%',
      margin: '6px 0 0',
      padding: '12px 10px',
      boxSizing: 'border-box',
      border: '1px solid #ffb36b',
      borderRadius: '8px',
      background: '#fff',
      color: '#2d3436',
      textAlign: 'left',
      font: '600 13px Inter, system-ui, sans-serif',
      cursor: 'pointer'
    });

    privacy.insertAdjacentElement('afterend', item);
  }

  function init() {
    addAboutUsItem();
    const observer = new MutationObserver(addAboutUsItem);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
