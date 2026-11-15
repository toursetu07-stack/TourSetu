(() => {
      const toggle = document.querySelector('.menu-toggle');
      const nav = document.querySelector('#navlinks');
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? 'Close ✕' : 'Menu ☰';
      });
      nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu ☰';
      }));
      document.querySelector('#year').textContent = new Date().getFullYear();
      document.querySelector('#contact-form').addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const notice = document.querySelector('#form-notice');
        notice.textContent = 'Thanks! The page design is ready, but this demo form does not send or store messages yet. Connect an approved email service or secure backend before publishing.';
        notice.style.display = 'block';
      });
    })();
