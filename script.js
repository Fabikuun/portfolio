(function () {
    'use strict';

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;
    var STEP = 80, MAX_STEPS = 4, WORD_STEP = 30;

    function safe(name, fn) {
      try { fn(); } catch (err) { console.warn('[preview] ' + name + ' skipped:', err); }
    }
    function list(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

    /* Reveals once, then lets go of both the observer and the safety timer —
       this is a one-shot animation, nothing here should outlive it. */
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

      /* Safety net against a stuck reveal — but it must not pre-empt the
         scroll. Revealing every node on a timer meant that on a page taller
         than a few screens, everything below the fold had already appeared
         before the reader got there, so scrolling down showed finished
         content instead of an entrance. So: only conclude the observer is
         broken if something plainly on screen still hasn't been revealed.
         If the visible ones came through, the observer works — stand down
         and leave the rest to the scroll. */
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

    /* The dot tracks the pointer exactly, so no animation loop is needed. */
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

      var GROW = 'a, button, .pill, .spec-panel, .social-btn, .contact-mail, .proof-card, .ask-card, .note-card';
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

    var TILE_SELECTOR = [
      '.portrait', '.project-media', '.project-body', '.proof-card', '.ask-card',
      '.also-chip', '.edu-card', '.social-btn', '.contact-mail', '.note-card',
      '.eyebrow', '.sec-lead', '.skills-sub'
    ].join(',');

    function initTiles() {
      if (reduced) return;
      var nodes = list(TILE_SELECTOR);
      if (!nodes.length) return;
      /* Delay is per parent, so each row/grid counts from zero rather than
         inheriting an ever-growing offset from earlier sections. */
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

    /* textContent would run the two halves of a <br>-split heading together
       ("Hey, I'mFabian."), so line breaks are read as spaces instead. */
    function readableText(el) {
      var out = '';
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeType === 3) out += node.nodeValue;
        else if (node.nodeName === 'BR') out += ' ';
        else out += node.textContent;
      });
      return out.replace(/\s+/g, ' ').trim();
    }

    function splitWords(el) {
      var frag = document.createDocumentFragment();
      var index = 0;
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeType !== 3) { frag.appendChild(node.cloneNode(true)); return; }
        node.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var span = document.createElement('span');
          span.className = 'w';
          span.textContent = part;
          span.style.setProperty('--d', (index * WORD_STEP) + 'ms');
          index++;
          frag.appendChild(span);
        });
      });
      el.textContent = '';
      el.appendChild(frag);
    }

    function initSplitText() {
      if (reduced) return;
      var headings = list('.big-heading, .mega');
      headings.forEach(function (el) {
        /* Screen readers get the whole heading as one label; the per-word spans
           are hidden so it isn't announced one word at a time. */
        var label = readableText(el);
        splitWords(el);
        el.setAttribute('aria-label', label);
        Array.prototype.slice.call(el.children).forEach(function (child) {
          child.setAttribute('aria-hidden', 'true');
        });
        el.classList.add('splitw');
      });
      revealOnce(headings, 'in');
    }

    /* The address is split across two data attributes and only joined at the
       moment it is needed. Harvesters read served HTML; they don't fill forms.

       There is no backend here and no third-party form service — the form
       composes a mailto: and hands it to whatever mail client the visitor
       already uses. That is why the button says "open" rather than "send":
       nothing is transmitted from this page, and claiming otherwise would be
       a lie the moment someone has no mail client configured. */
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
       same state. Gated to coarse pointers so a mouse user tapping doesn't
       leave the image stuck in the moved position. */
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
      t.addEventListener('click', function () {
        var open = l.classList.toggle('open');
        t.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { l.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); }
      });
      l.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') { l.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); }
      });
    }

    function boot() {
      safe('cursor', initCursor);
      safe('progress', initProgress);
      safe('split-text', initSplitText);
      safe('tiles', initTiles);
      safe('nav', initNav);
      safe('mail-reveal', initMailReveal);
      safe('mail-form', initMailForm);
      safe('zoom-touch', initZoomTouch);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  })();
