/* Flipp landing — reveal on scroll, nav hairline, gentle no-ops when
   the visitor has asked for reduced motion. */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveal — one observer, unobserve once shown so it never re-runs. */
  var items = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // stagger siblings a touch so a grid lands like dealt cards
        var sibs = Array.prototype.slice.call(e.target.parentNode.children);
        var i = Math.max(0, sibs.indexOf(e.target));
        e.target.style.transitionDelay = Math.min(i * 55, 260) + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Failsafe: whatever happens to the observer — a tab that never paints,
     an occluded pane, a browser that throttles callbacks — nothing stays
     invisible for more than a couple of seconds. */
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      el.style.transitionDelay = '0ms';
      el.classList.add('in');
    });
  }, 2500);

  /* Nav gets its hairline only once the page has moved. */
  var nav = document.getElementById('nav');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      nav.classList.toggle('stuck', window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Only one FAQ answer open at a time — long pages of open details
     make the section impossible to scan. */
  var faqs = document.querySelectorAll('.faq details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   The live try-it panel.

   A deliberately cut-down copy of the rules in the app's noteParser: enough
   to show that questions really are built out of the visitor's own words,
   not enough to pretend it is the real thing. Everything runs here in the
   page — nothing is uploaded, which is the same promise the app makes.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var input = document.getElementById('tryInput');
  if (!input) return;

  var out    = document.getElementById('tryOut'),
      chips  = document.getElementById('tryChips'),
      count  = document.getElementById('tryCount'),
      panel  = document.getElementById('try');

  var SAMPLES = {
    bio: [
      'Photosynthesis: the process plants use to turn light energy into glucose',
      'Chlorophyll: the green pigment that absorbs light in the chloroplast',
      'Mitochondria produce 36 ATP per glucose molecule.',
      'The three states of matter are solid, liquid and gas.',
      'Osmosis: the movement of water across a semi-permeable membrane',
      'The four chambers of the heart are the left atrium, right atrium, left ventricle and right ventricle.'
    ].join('\n'),
    hist: [
      'Feudalism: the system where land was held in exchange for service',
      'The Berlin Wall fell in 1989.',
      'Magna Carta: the charter that limited the power of the English king',
      'The three estates of pre-revolutionary France were the clergy, the nobility and the commoners.',
      'The Treaty of Versailles was signed in 1919.'
    ].join('\n'),
    chem: [
      'Catalyst: a substance that speeds up a reaction without being consumed',
      'The pH of pure water is 7.',
      'Isotope: an atom with the same protons but a different number of neutrons',
      'The three subatomic particles are protons, neutrons and electrons.',
      'Water boils at 100 degrees celsius at sea level.'
    ].join('\n')
  };

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Bracketed asides and "e.g." tails make a prompt read badly, so they go
     before the question is built — same reason the app trims them. */
  function tighten(t) {
    return t.replace(/\s*\([^)]*\)/g, '').replace(/,?\s*(?:e\.g\.|for example).*$/i, '').trim();
  }

  function readLines(text) {
    return text.split('\n').map(function (l) { return l.trim(); })
               .filter(function (l) { return l.length > 3; });
  }

  function parse(text) {
    var lines = readLines(text), defs = [], qs = [];

    lines.forEach(function (line) {
      var m = line.match(/^([^:]{2,60}):\s*(.+)$/);
      if (m && !/^https?$/i.test(m[1])) defs.push({ term: m[1].trim(), meaning: tighten(m[2]) });
    });

    function distractors(term) {
      return defs.map(function (d) { return d.term; })
                 .filter(function (t) { return t !== term; })
                 .slice(0, 3);
    }

    lines.forEach(function (line) {
      var m = line.match(/^([^:]{2,60}):\s*(.+)$/);
      if (m && !/^https?$/i.test(m[1])) {
        var term = m[1].trim(), meaning = tighten(m[2]), wrong = distractors(term);
        if (wrong.length >= 2) {
          qs.push({ kind: 'Multiple choice', ask: 'Which term means: ' + meaning + '?',
                    answer: term, opts: wrong.concat([term]), src: line });
        } else {
          qs.push({ kind: 'Identification', ask: meaning.charAt(0).toUpperCase() + meaning.slice(1) + ' is ___',
                    answer: term, src: line });
        }
        return;
      }

      /* "The three states of matter are solid, liquid and gas." */
      var e = line.match(/^(?:the\s+)?(.+?)\s+(?:are|were)\s+(.+?)\.?$/i);
      if (e && /,| and /i.test(e[2])) {
        var items = e[2].replace(/\band\b/gi, ',').split(',')
                        .map(function (x) { return x.trim(); }).filter(Boolean);
        if (items.length >= 2) {
          qs.push({ kind: 'Enumeration', ask: 'Name the ' + e[1].replace(/^the\s+/i, '') + '.',
                    answer: items.join(', '), src: line });
          return;
        }
      }

      /* A number is the load-bearing word, so that is what gets removed. */
      var n = line.match(/\b(\d[\d.,]*)\b/);
      if (n) {
        qs.push({ kind: 'Fill in the blank', ask: line.replace(n[1], '___'),
                  answer: n[1], src: line });
        return;
      }

      if (/\s/.test(line) && line.length > 18) {
        qs.push({ kind: 'True or False', ask: line.replace(/\.?$/, '.'), answer: 'True', src: line });
      }
    });

    return { lines: lines, defs: defs, qs: qs };
  }

  function render() {
    var res = parse(input.value);

    chips.innerHTML =
      '<span class="try-chip">' + res.lines.length + ' lines</span>' +
      '<span class="try-chip ' + (res.qs.length ? 'good' : 'warn') + '">' +
        res.qs.length + ' we can use</span>' +
      '<span class="try-chip">' + res.defs.length + ' definitions</span>';

    var shown = res.qs.slice(0, 8);
    count.textContent = res.qs.length > shown.length ? '(first ' + shown.length + ' of ' + res.qs.length + ')' : '';

    if (!shown.length) {
      out.innerHTML = '<p class="try-empty">' + (input.value.trim()
        ? 'Nothing here it can turn into a question yet — try a line like "Osmosis: the movement of water across a membrane".'
        : 'Type or paste a few lines of notes.') + '</p>';
      return;
    }

    out.innerHTML = shown.map(function (q) {
      var html = '<div class="q-card"><span class="q-kind">' + esc(q.kind) + '</span>' +
                 '<p class="q-ask">' + esc(q.ask) + '</p>';
      if (q.opts) {
        html += '<ul class="q-opts">' + q.opts.map(function (o) {
          return '<li class="' + (o === q.answer ? 'right' : '') + '">' + esc(o) + '</li>';
        }).join('') + '</ul>';
      } else {
        html += '<p class="q-ans">Answer: <b>' + esc(q.answer) + '</b></p>';
      }
      return html + '</div>';
    }).join('');
  }

  var timer;
  input.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(render, 140);
  });

  panel.addEventListener('click', function (e) {
    var b = e.target.closest('[data-sample]');
    if (!b) return;
    var key = b.getAttribute('data-sample');
    input.value = key === 'clear' ? '' : SAMPLES[key];
    render();
    if (key !== 'clear') input.focus();
  });

  input.value = SAMPLES.bio;
  render();
})();

/* ── Screenshot gallery ─────────────────────────────────────────────────── */
(function () {
  'use strict';
  var list = document.getElementById('shotList');
  if (!list) return;
  var img = document.getElementById('shotImg'), cap = document.getElementById('shotCap');

  /* Preload so switching does not flash a blank phone. */
  Array.prototype.forEach.call(list.querySelectorAll('button'), function (b) {
    var p = new Image(); p.src = 'img/shots/' + b.getAttribute('data-src') + '.png';
  });

  list.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    Array.prototype.forEach.call(list.querySelectorAll('button'), function (o) {
      o.classList.toggle('on', o === b);
    });
    img.src = 'img/shots/' + b.getAttribute('data-src') + '.png';
    img.alt = b.getAttribute('data-alt');
    cap.textContent = b.getAttribute('data-cap');
  });
})();

/* ── Mastery slider ─────────────────────────────────────────────────────────
   The point of the section is that the number can fall, so let people push it
   down themselves: you keep answering the same 36 questions correctly, and
   adding notes still costs you percentage points. */
(function () {
  'use strict';
  var slider = document.getElementById('mastSlider');
  if (!slider) return;

  var KNOWN = 36, BASE = 50;
  var pct = document.getElementById('mastPct'), bar = document.getElementById('mastBar'),
      known = document.getElementById('mastKnown'), add = document.getElementById('mastAdd'),
      note = document.getElementById('mastNote');

  function update() {
    var extra = Number(slider.value), total = BASE + extra;
    var p = Math.round((KNOWN / total) * 100);
    pct.textContent = p + '%';
    bar.style.width = p + '%';
    add.textContent = extra;
    known.textContent = KNOWN + ' of ' + total + ' questions you can answer';
    note.textContent = extra === 0
      ? 'Drag it. The percentage falls because the subject grew, not because you forgot anything.'
      : 'You still know the same ' + KNOWN + ' answers. There is just more subject to know.';
  }

  slider.addEventListener('input', update);
  update();
})();
