(function () {
    'use strict';

    /* Plain ES5 so old engines can run it. Each feature is wrapped in safe(), so
       one that fails can't take the others down, and the page never depends on
       any of them: everything is readable with scripts off. */
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
      // 'Esc' is what old Edge reports
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.key === 'Esc') close();
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

    /* Marks the section being read: the glass lens slides under its nav link, and
       aria-current tells screen readers the same thing. The observer's root is a
       thin line across the middle of the screen, and whichever section crosses it
       is the current one. Above the first section nothing is marked. */
    function initSectionLens() {
      var menu = document.getElementById('navList');
      if (!menu || !('IntersectionObserver' in window)) return;
      var links = {}, current = null, seen = null, holding = false, holdTimer = null, queued = false;
      list('#navList a').forEach(function (a) { links[a.hash.slice(1)] = a; });

      function place() {
        queued = false;
        if (!current) return;
        /* Offsets add up to the menu: while the phone menu animates, each row has a
           transform and Chrome then measures the link from its row instead. */
        var x = 0, y = 0, s = menu.style;
        for (var el = current; el && el !== menu; el = el.offsetParent) {
          x += el.offsetLeft;
          y += el.offsetTop;
        }
        s.setProperty('--lens-x', x + 'px');
        s.setProperty('--lens-y', y + 'px');
        s.setProperty('--lens-w', current.offsetWidth + 'px');
        s.setProperty('--lens-h', current.offsetHeight + 'px');
      }
      function select(link) {
        if (link === current) return;
        if (current) current.removeAttribute('aria-current');
        current = link;
        if (link) {
          link.setAttribute('aria-current', 'true');
          place();
        }
        menu.classList.toggle('has-lens', !!link);
      }

      // `seen` is what's really on the line; it only moves the lens when no click is in flight.
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var link = links[entry.target.id];
          if (entry.isIntersecting) seen = link;
          else if (link === seen) seen = null;
        });
        if (!holding) select(seen);
      }, { rootMargin: '-45% 0px -54% 0px' });
      Object.keys(links).forEach(function (id) {
        var section = document.getElementById(id);
        if (section) io.observe(section);
      });

      /* A click sends the lens straight to the chosen link in one slide. The smooth
         scroll that follows passes every section in between, so those are ignored
         until the page has been still for 200ms. Then the lens settles on whatever is
         really in view, in case the reader scrolled somewhere else meanwhile. */
      function release() {
        holding = false;
        select(seen);
      }
      function hold() {
        clearTimeout(holdTimer);
        holdTimer = setTimeout(release, 200);
      }
      menu.addEventListener('click', function (e) {
        var link = links[(e.target.hash || '').slice(1)];
        if (!link) return;
        holding = true;
        select(link);
        hold();
      });
      window.addEventListener('scroll', function () {
        if (holding) hold();
      }, { passive: true });

      // The links move when the layout switches between bar and menu, and once the font loads.
      window.addEventListener('resize', function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(place);
      }, { passive: true });
      if (document.fonts) document.fonts.ready.then(place);
    }

    /* Chromium can run an SVG filter as a backdrop-filter, so there the glass also
       bends what passes behind its rim, the way Apple's Liquid Glass does. Other
       browsers keep the frosted glass. Skipped on devices under 4GB of memory and
       when motion, transparency or contrast settings ask for less. */
    function initRefraction() {
      var bar = document.querySelector('.nav');
      var menu = document.getElementById('navList');
      if (!bar || !menu || !navigator.userAgentData || !window.ResizeObserver) return;
      if ((navigator.deviceMemory || 8) < 4) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce), (prefers-reduced-transparency: reduce), (prefers-contrast: more)').matches) return;

      var NS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      document.body.appendChild(svg);
      var phone = window.matchMedia('(max-width: 960px)');

      // One filter per glass shape: a map image, and a displacement that follows it.
      function makeFilter(el, id) {
        var filter = document.createElementNS(NS, 'filter');
        var image = document.createElementNS(NS, 'feImage');
        var bend = document.createElementNS(NS, 'feDisplacementMap');
        var attrs = [
          [filter, { id: id, x: 0, y: 0, width: 1, height: 1, 'color-interpolation-filters': 'sRGB' }],
          [image, { result: 'map', preserveAspectRatio: 'none' }],
          [bend, { 'in': 'SourceGraphic', in2: 'map', scale: 40, xChannelSelector: 'R', yChannelSelector: 'G' }]
        ];
        attrs.forEach(function (pair) {
          for (var k in pair[1]) pair[0].setAttribute(k, pair[1][k]);
        });
        filter.appendChild(image);
        filter.appendChild(bend);
        svg.appendChild(filter);
        return { el: el, image: image, w: 0, h: 0 };
      }
      var shapes = [makeFilter(bar, 'lens-bar'), makeFilter(menu, 'lens-menu')];

      function update(shape) {
        // The menu is only glass on phones; on desktop it's the row of links in the bar.
        if (shape.el === menu && !phone.matches) return;
        var w = shape.el.offsetWidth, h = shape.el.offsetHeight;
        if (!w || !h || (w === shape.w && h === shape.h)) return;
        shape.w = w;
        shape.h = h;
        var r = Math.min(parseFloat(getComputedStyle(shape.el).borderTopLeftRadius) || 0, w / 2, h / 2);
        var url = lensMap(w, h, r), decoded = new Image();
        // Swapped in only once decoded, so the filter never runs on an empty map.
        decoded.onload = function () {
          shape.image.setAttribute('href', url);
          document.documentElement.classList.add('lens');
        };
        decoded.src = url;
      }
      var ro = new ResizeObserver(function () { shapes.forEach(update); });
      ro.observe(bar);
      ro.observe(menu);
    }

    /* Displacement map for a rounded rectangle: red moves pixels sideways, green up
       and down, 128 is no movement. Each pixel near the rim takes its colour from
       further in, so the edge magnifies what's behind it like the rim of a lens. */
    function lensMap(w, h, r) {
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      var img = ctx.createImageData(w, h), d = img.data;
      var band = Math.max(1, Math.min(r, 16)); // how far in from the rim the bending reaches
      var hx = w / 2 - r, hy = h / 2 - r;
      for (var y = 0, i = 0; y < h; y++) {
        for (var x = 0; x < w; x++, i += 4) {
          var px = x + 0.5 - w / 2, py = y + 0.5 - h / 2;
          var qx = Math.abs(px) - hx, qy = Math.abs(py) - hy;
          var nx = 0, ny = 0, inside;
          if (qx > 0 && qy > 0) {          // a rounded corner: bend along the curve
            var len = Math.sqrt(qx * qx + qy * qy);
            nx = qx / len;
            ny = qy / len;
            inside = r - len;
          } else if (qx > qy) {            // nearest a left or right edge
            nx = 1;
            inside = r - qx;
          } else {                         // nearest the top or bottom edge
            ny = 1;
            inside = r - qy;
          }
          var k = inside >= band ? 0 : Math.pow(1 - Math.max(inside, 0) / band, 2);
          d[i] = 128 - (px < 0 ? -1 : 1) * nx * k * 127;
          d[i + 1] = 128 - (py < 0 ? -1 : 1) * ny * k * 127;
          d[i + 2] = 128;
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
      return canvas.toDataURL();
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

        /* Clicks a hidden link. Several in-app browsers (Messenger, Instagram)
           silently ignore location.href set to a mailto:, but follow an anchor. */
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

    function boot() {
      // iOS Safari only shows :active press states once a touch listener exists.
      document.addEventListener('touchstart', function () {}, { passive: true });
      safe('tiles', initTiles);
      safe('nav', initNav);
      safe('section-lens', initSectionLens);
      safe('refraction', initRefraction);
      safe('mail-reveal', initMailReveal);
      safe('mail-form', initMailForm);
      safe('zoom-touch', initZoomTouch);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  })();
