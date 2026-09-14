(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;
    var STEP = 70, MAX_STEPS = 4;

    function safe(name, fn) {
      try { fn(); } catch (err) { console.warn('[portfolio] ' + name + ' skipped:', err); }
    }
    function list(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

    /* Reveals once, then lets go of both the observer and the safety timer. */
    function revealOnce(nodes, cls) {
      if (!nodes.length) return;
      if (!('IntersectionObserver' in window)) {
        nodes.forEach(function (el) { el.classList.add(cls); });
        return;
      }
      var remaining = nodes.length, timer = null, io = null;
      function done() {
        if (timer !== null) { clearTimeout(timer); timer = null; }
        if (io) { io.disconnect(); io = null; }
      }
      function revealAll() {
        nodes.forEach(function (el) { el.classList.add(cls); });
        remaining = 0;
        done();
      }
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(cls);
          if (io) io.unobserve(entry.target);
          remaining--;
        });
        if (remaining <= 0) done();
      }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
      nodes.forEach(function (el) { io.observe(el); });

      /* Safety net: if something on screen still hasn't revealed after 4.5s, the
         observer isn't working, so reveal everything. Off-screen elements are
         left for the scroll. */
      timer = setTimeout(function () {
        timer = null;
        var brokenObserver = nodes.some(function (el) {
          if (el.classList.contains(cls)) return false;
          var r = el.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0 && r.height > 0;
        });
        if (brokenObserver) revealAll();
      }, 4500);
    }

    /* The dot tracks the pointer exactly, so no animation loop is needed.
       It only grows over things that actually do something when clicked. */
    function initCursor() {
      if (!finePointer || reduced) return;
      var dot = document.createElement('div');
      dot.id = 'cursor-dot';
      dot.setAttribute('aria-hidden', 'true');
      document.body.appendChild(dot);

      document.addEventListener('mousemove', function (e) {
        dot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
        document.body.classList.add('cursor-on');
      }, { passive: true });

      document.addEventListener('mouseleave', function () {
        document.body.classList.remove('cursor-on');
      });

      var GROW = 'a, button, summary, .zoomable';
      document.addEventListener('mouseover', function (e) {
        var target = e.target instanceof Element ? e.target : null;
        document.body.classList.toggle('cursor-grow', !!(target && target.closest(GROW)));
      });
    }

    function initProgress() {
      var rail = document.createElement('div');
      rail.id = 'progress-rail';
      rail.setAttribute('aria-hidden', 'true');
      var fill = document.createElement('span');
      fill.id = 'progress-fill';
      rail.appendChild(fill);
      document.body.appendChild(rail);

      var ticking = false;
      function update() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        fill.style.transform = 'scaleX(' + pct + ')';
        ticking = false;
      }
      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      }, { passive: true });
      window.addEventListener('resize', update, { passive: true });
      update();
    }

    /* The hero's three parts share a parent, so they come in as one short
       sequence on load. Everything else reveals as it scrolls into view. */
    var TILE_SELECTOR = [
      '.mega', '.hero-desc', '.hero-links', '.big-heading', '.sec-lead',
      '.portrait', '.edu-row', '.project-media', '.project-body',
      '.proof-card', '.skills-sub', '.also-chip', '.note-card',
      '.desk-shot', '.setup-details', '.social-btn', '.contact-mail'
    ].join(',');

    function initTiles() {
      if (reduced) return;
      /* Anything inside the closed parts list is left alone: it isn't rendered
         until opened, so an observer would never see it. */
      var nodes = list(TILE_SELECTOR).filter(function (el) {
        return !(el.parentElement && el.parentElement.closest('details'));
      });
      if (!nodes.length) return;
      /* Delay is per parent, so each group counts from zero. */
      var counts = new Map();
      nodes.forEach(function (el) {
        el.classList.add('tile');
        var parent = el.parentNode;
        var i = counts.get(parent) || 0;
        counts.set(parent, i + 1);
        el.style.setProperty('--d', (Math.min(i, MAX_STEPS) * STEP) + 'ms');
      });
      revealOnce(nodes, 'in');
    }

    /* The address is split across two data attributes so it isn't sitting in the
       HTML for scrapers. There's no backend: the form builds a mailto: link. */
    function address(el) {
      return el.dataset.user + '@' + el.dataset.domain;
    }

    function initMailReveal() {
      var form = document.getElementById('mailForm');
      var btn = document.getElementById('mailReveal');
      var label = document.getElementById('mailRevealText');
      if (!form || !btn || !label) return;
      btn.addEventListener('click', function () {
        label.textContent = address(form);
        btn.disabled = true;
      });
    }

    function initMailForm() {
      var form = document.getElementById('mailForm');
      if (!form) return;
      var status = document.getElementById('mf-status');

      function check(field, errId) {
        var err = document.getElementById(errId);
        var empty = !field.value.trim();
        field.setAttribute('aria-invalid', String(empty));
        err.hidden = !empty;
        return !empty;
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var subject = document.getElementById('mf-subject');
        var message = document.getElementById('mf-message');
        var okSubject = check(subject, 'mf-subject-err');
        var okMessage = check(message, 'mf-message-err');

        if (!okSubject || !okMessage) {
          status.textContent = '';
          (okSubject ? message : subject).focus();
          return;
        }

        /* A real link click rather than assigning location.href: several
           in-app browsers (Messenger, Instagram) silently ignore a scripted
           location change to a mailto:, but will follow an anchor. */
        var link = document.createElement('a');
        link.href = 'mailto:' + address(form)
          + '?subject=' + encodeURIComponent(subject.value.trim())
          + '&body=' + encodeURIComponent(message.value.trim());
        link.rel = 'noopener';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        status.textContent = 'Opening your mail app…';
      });

      // clear the error the moment they start fixing it
      ['mf-subject', 'mf-message'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', function () {
          if (this.getAttribute('aria-invalid') === 'true' && this.value.trim()) {
            this.setAttribute('aria-invalid', 'false');
            document.getElementById(id + '-err').hidden = true;
          }
        });
      });
    }

    /* Hover covers pointers; touch screens have none, so a tap toggles the
       same state. Gated to coarse pointers so a mouse click can't leave the
       image stuck zoomed. */
    function initZoomTouch() {
      if (finePointer) return;
      list('.zoomable').forEach(function (frame) {
        frame.addEventListener('click', function () {
          frame.classList.toggle('is-active');
        });
      });
    }

    function initNav() {
      var t = document.getElementById('navToggle');
      var l = document.getElementById('navList');
      if (!t || !l) return;
      function close() {
        l.classList.remove('open');
        t.setAttribute('aria-expanded', 'false');
      }
      t.addEventListener('click', function () {
        var open = l.classList.toggle('open');
        t.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
      l.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') close();
      });
      // a tap anywhere outside the open menu closes it
      document.addEventListener('click', function (e) {
        if (!l.classList.contains('open') || t.contains(e.target) || l.contains(e.target)) return;
        close();
      });
    }

    function boot() {
      safe('cursor', initCursor);
      safe('progress', initProgress);
      safe('tiles', initTiles);
      safe('nav', initNav);
      safe('mail-reveal', initMailReveal);
      safe('mail-form', initMailForm);
      safe('zoom-touch', initZoomTouch);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  })();
