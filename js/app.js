(function () {
  'use strict';

  // ============================================
  // Crypto Utilities
  // ============================================

  function randomInt(max) {
    // Unbiased random integer in [0, max) using rejection sampling
    var array = new Uint32Array(1);
    var limit = Math.floor(0xFFFFFFFF / max) * max;
    do {
      crypto.getRandomValues(array);
    } while (array[0] >= limit);
    return array[0] % max;
  }

  function shuffle(arr) {
    // Fisher-Yates shuffle
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = randomInt(i + 1);
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  // ============================================
  // Character Sets
  // ============================================

  var UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var LOWER = 'abcdefghijklmnopqrstuvwxyz';
  var DIGITS = '0123456789';
  var LETTERS = UPPER + LOWER;
  var SAFE_SYMBOLS = '!@#$%';
  var BROAD_SYMBOLS = '*&_-.+';
  var EXTENDED_SYMBOLS = '=?^~|()';

  var CHARSETS = {
    upper: UPPER,
    lower: LOWER,
    digits: DIGITS,
    safe: SAFE_SYMBOLS,
    broad: SAFE_SYMBOLS + BROAD_SYMBOLS,
    extended: SAFE_SYMBOLS + BROAD_SYMBOLS + EXTENDED_SYMBOLS
  };

  // ============================================
  // Syntax Highlighting
  // ============================================

  var CHAR_CLASS = {
    upper: /[A-Z]/,
    lower: /[a-z]/,
    digit: /[0-9]/
  };

  function charClass(ch) {
    if (CHAR_CLASS.upper.test(ch)) return 'syn-u';
    if (CHAR_CLASS.lower.test(ch)) return 'syn-l';
    if (CHAR_CLASS.digit.test(ch)) return 'syn-d';
    return 'syn-s';
  }

  function renderHighlighted(el, text) {
    el.textContent = '';
    el.setAttribute('aria-label', text);
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.textContent = text[i];
      span.className = charClass(text[i]);
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
    }
  }

  function renderPassphraseHighlighted(el, text) {
    el.textContent = '';
    el.setAttribute('aria-label', text);
    var wordIndex = 0;
    var parts = text.split(/(-)/);
    for (var p = 0; p < parts.length; p++) {
      var part = parts[p];
      for (var i = 0; i < part.length; i++) {
        var span = document.createElement('span');
        span.textContent = part[i];
        span.setAttribute('aria-hidden', 'true');
        if (part === '-' || CHAR_CLASS.digit.test(part[i])) {
          span.className = 'syn-d';
        } else {
          span.className = (wordIndex % 2 === 0) ? 'syn-u' : 'syn-l';
        }
        el.appendChild(span);
      }
      if (part === '-') continue;
      if (!CHAR_CLASS.digit.test(part)) wordIndex++;
    }
  }

  // ============================================
  // Slogan Data
  // ============================================

  var SLOGANS = [
    'Your 847th account deserves better.',
    'The tab you\'ll close in four seconds.',
    'Uppercase, lowercase, special character, done.',
    'No sign-up. Yes, really.',
    'We made you five. Pick one.',
    'Stop pretending your cat\'s name is secure.',
    'One clipboard away from moving on.',
    'For when your brain suggests \'qwerty.\'',
    'Five passwords. Zero opinions.',
    'You have 84 accounts. None of them use this.',
    'Warm passwords from a cold, indifferent website.',
    'Because you\'re still staring at that form.',
    'Randomness you don\'t have to trust.',
    'Just the good bits.',
    'Your secrets never leave.',
    'Made fresh. Served local.',
    'cat /dev/urandom for the rest of us.',
    'No account. No audit trail. No problem.',
    'Weapons-grade randomness. One click.',
    'The page forgets you were here.',
    'Strong passwords from thin air.',
    'No servers were harmed in the making.',
    'Where entropy meets the clipboard.',
    'Math, not promises.',
    'Passwords. Nothing else.',
    'Open. Copy. Gone.',
    'The whole tool.',
    'Make password. Leave.',
    'Already done.',
    'Nothing to learn.',
    'Less than a bookmark.',
    'Strong and forgettable.',
    'Just the output.',
    'Five. Fresh. Yours.',
    'No sign-up. No sign-in. No catch.',
    'One page. One purpose.',
    'your passwords are ready.',
    'ctrl+c and leave.',
    'no account. no tracker. no small talk.',
    'touch grass after this one.',
    'we generated before you loaded.',
    'the whole app is one page.',
    'make password. take password. leave.',
    'client-side or it didn\'t happen.',
    'nothing was remembered.',
    'the last good website.',
    'localhost energy.',
    'closed the tab. that\'s the whole tutorial.',
    'we don\'t even know you\'re here.',
    'passwords hit different when nobody\'s watching.',
    'Make password. Make haste.',
    'Five ready. Go.',
    'The password is yours.',
    'No account necessary.',
    'Just the passwords.',
    'Copy. Close. Forget us.',
    'Open tab. Closed book.',
    'Strong as written.',
    'We don\'t remember you.',
    'Arrives made.',
    'Keys, not keychains.',
    'Take what you need.',
    'Nothing to join.',
    'Your password, then gone.',
    'A website that wants you to leave.',
    'We don\'t want your email.',
    'Not a funnel. Just a tool.',
    'Yes, this is the entire website.',
    'This is the whole app.',
    'The world\'s least ambitious startup.',
    'We peaked on launch day.',
    'Copy. Paste. Forget we exist.',
    'Grab one. Go.',
    'One job. Done.',
    'Open tab. Close tab. That\'s the tour.',
    'Generate. Copy. Close tab.',
    'It\'s not that deep.',
    'Literally just passwords.',
    'No one will remember this. That\'s the point.',
    'The shortest relationship you\'ll have with a website.',
    'Entropy as a service.',
    'Made fresh. Never stored.',
    'Unguessable in every sense.',
    'Free as in beer. Free as in go away.',
    'Passwords. Not a relationship.',
    'mkdir strong-password',
    'mkdir for entropy.',
    'Warm keys, cold math.',
    'Five seeds. No strings.',
    'Pure noise, zero signal.',
    'chmod 000 your attack surface.',
    'You needed this 5 minutes ago.',
    'No account needed to make your account.',
    'Passwords for people with shit to do.',
    'Because \'password123\' isn\'t a personality.',
    'Ctrl+V and move on with your life.',
    'Because you need a password, not a subscription.',
    'Your password is bad and you know it.',
    'Skip the sales pitch. Here\'s your password.',
    'Faster than thinking of one yourself.',
    'Strong passwords for weak moments.'
  ];

  var lastSloganIndex = -1;
  function randomSlogan() {
    var i;
    do { i = randomInt(SLOGANS.length); } while (i === lastSloganIndex);
    lastSloganIndex = i;
    return SLOGANS[i];
  }

  // ============================================
  // Password Generation
  // ============================================

  function hasConsecutive(str, count) {
    for (var i = 0; i <= str.length - count; i++) {
      var allSame = true;
      for (var j = 1; j < count; j++) {
        if (str[i + j] !== str[i]) { allSame = false; break; }
      }
      if (allSame) return true;
    }
    return false;
  }

  function hasSequentialRun(str) {
    for (var i = 0; i <= str.length - 3; i++) {
      var a = str.charCodeAt(i);
      var b = str.charCodeAt(i + 1);
      var c = str.charCodeAt(i + 2);
      if (b - a === 1 && c - b === 1) return true;
      if (a - b === 1 && b - c === 1) return true;
    }
    return false;
  }

  function generateFromPool(length, pool, requirements) {
    for (var attempt = 0; attempt < 100; attempt++) {
      var chars = [];

      if (requirements) {
        for (var r = 0; r < requirements.length; r++) {
          chars.push(requirements[r][randomInt(requirements[r].length)]);
        }
      }

      while (chars.length < length) {
        chars.push(pool[randomInt(pool.length)]);
      }

      chars = shuffle(chars);
      var password = chars.join('');

      var valid = true;

      if (requirements && requirements.startsWithLetter) {
        if (!LETTERS.includes(password[0])) { valid = false; }
      }

      if (requirements && requirements.noTripleConsecutive) {
        if (hasConsecutive(password, 3)) { valid = false; }
      }

      if (requirements && requirements.noDoubleConsecutive) {
        if (hasConsecutive(password, 2)) { valid = false; }
      }

      if (requirements && requirements.noSequentialRun) {
        if (hasSequentialRun(password)) { valid = false; }
      }

      if (valid) return password;
    }
    return chars.join('');
  }

  var archetypes = [
    {
      name: 'Universal',
      generate: function () {
        var pool = UPPER + LOWER + DIGITS + SAFE_SYMBOLS;
        var reqs = [UPPER, LOWER, DIGITS, SAFE_SYMBOLS];
        reqs.startsWithLetter = true;
        reqs.noTripleConsecutive = true;
        reqs.noSequentialRun = true;
        return generateFromPool(14, pool, reqs);
      },
      poolSize: 26 + 26 + 10 + 5,
      length: 14
    },
    {
      name: 'Letters & Numbers',
      generate: function () {
        var pool = UPPER + LOWER + DIGITS;
        var reqs = [UPPER, LOWER, DIGITS];
        reqs.noDoubleConsecutive = true;
        return generateFromPool(14, pool, reqs);
      },
      poolSize: 26 + 26 + 10,
      length: 14
    },
    {
      name: 'Short & Safe',
      generate: function () {
        var pool = UPPER + LOWER + DIGITS + '!@#$';
        var reqs = [UPPER, LOWER, DIGITS, '!@#$'];
        reqs.startsWithLetter = true;
        return generateFromPool(10, pool, reqs);
      },
      poolSize: 26 + 26 + 10 + 4,
      length: 10
    },
    {
      name: 'Passphrase',
      generate: function () {
        if (!window.EFF_WORDLIST) return null;
        var list = window.EFF_WORDLIST;
        var words = [];
        for (var i = 0; i < 4; i++) {
          var w = list[randomInt(list.length)];
          words.push(w.charAt(0).toUpperCase() + w.slice(1));
        }
        var digit = randomInt(10);
        return words[0] + '-' + digit + '-' + words[1] + '-' + words[2] + '-' + words[3];
      },
      isPassphrase: true
    },
    {
      name: 'Maximum',
      generate: function () {
        var symbols = '!@#$%*&_-.+';
        var pool = UPPER + LOWER + DIGITS + symbols;
        var reqs = [UPPER, LOWER, DIGITS, symbols];
        reqs.noTripleConsecutive = true;
        return generateFromPool(24, pool, reqs);
      },
      poolSize: 26 + 26 + 10 + 11,
      length: 24
    }
  ];

  var PASSPHRASE_INDEX = (function () {
    for (var i = 0; i < archetypes.length; i++) {
      if (archetypes[i].isPassphrase) return i;
    }
    return -1;
  })();

  // ============================================
  // Crack Time Estimation
  // ============================================

  var GUESSES_PER_SECOND = 1e10;

  function estimateEntropy(poolSize, length) {
    return length * Math.log2(poolSize);
  }

  function formatCrackTime(entropy) {
    var seconds = Math.pow(2, entropy) / GUESSES_PER_SECOND / 2;
    if (seconds < 1) return 'instant';
    if (seconds < 60) return '~' + Math.round(seconds) + ' seconds';
    if (seconds < 3600) return '~' + Math.round(seconds / 60) + ' minutes';
    if (seconds < 86400) return '~' + Math.round(seconds / 3600) + ' hours';
    if (seconds < 86400 * 365) return '~' + Math.round(seconds / 86400) + ' days';
    var years = seconds / (86400 * 365);
    if (years < 1000) return '~' + Math.round(years) + ' years';
    if (years < 1e6) return '~' + Math.round(years / 1000) + ' thousand years';
    if (years < 1e9) return '~' + Math.round(years / 1e6) + ' million years';
    if (years < 1e12) return '~' + Math.round(years / 1e9) + ' billion years';
    return '~' + Math.round(years / 1e12) + ' trillion years';
  }

  function getDIYCrackTime(poolSize, length) {
    if (poolSize === 0 || length === 0) return '';
    var time = formatCrackTime(estimateEntropy(poolSize, length));
    if (time === 'instant') return 'guessable instantly';
    return 'takes ' + time + ' to guess';
  }

  // ============================================
  // Clipboard
  // ============================================

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return fallbackCopy(text);
      });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(textarea);
    return ok;
  }

  // ============================================
  // Favicon
  // ============================================

  var baseFaviconHref = '';

  function generateFavicon(text, bgColor, textColor) {
    var canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = textColor;
    ctx.font = '600 22px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (text.length === 4) {
      // Two-line layout: "mk" / "pw"
      ctx.fillText(text.slice(0, 2), 32, 23);
      ctx.fillText(text.slice(2), 32, 43);
    } else {
      // Single-character (checkmark) stays centered
      ctx.fillText(text, 32, 34);
    }

    return canvas.toDataURL('image/png');
  }

  var faviconTimer;
  function flashFavicon() {
    var link = document.getElementById('favicon');
    if (!link) return;
    clearTimeout(faviconTimer);
    link.href = generateFavicon('\u2713',
      isLight ? '#F5F3EE' : '#1A1A2E',
      isLight ? '#B8960A' : '#E8C547');
    faviconTimer = setTimeout(function () {
      link.href = baseFaviconHref;
    }, 1500);
  }

  // ============================================
  // Audio & Haptics
  // ============================================

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var audioCtx;
  function playTick() {
    if (reducedMotion) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 1800;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
      // silent failure
    }
  }

  function hapticCopy() {
    if (reducedMotion) return;
    if (navigator.vibrate) navigator.vibrate(8);
  }

  function hapticRegenerate() {
    if (reducedMotion) return;
    if (navigator.vibrate) navigator.vibrate([6, 30, 6]);
  }

  // ============================================
  // Scramble Animation
  // ============================================

  var SCRAMBLE_CHARS = UPPER + LOWER + DIGITS + '!@#$%*&';

  function scrambleAnimate(el, finalText, callback) {
    if (reducedMotion) {
      el.textContent = finalText;
      if (callback) callback();
      return;
    }

    var len = finalText.length;
    var duration = 350;
    var interval = 30;
    var frames = Math.ceil(duration / interval);
    var resolved = new Array(len).fill(false);
    var current = new Array(len);

    for (var i = 0; i < len; i++) {
      current[i] = SCRAMBLE_CHARS[randomInt(SCRAMBLE_CHARS.length)];
    }

    el.classList.add('scrambling');
    var frame = 0;

    var timer = setInterval(function () {
      frame++;
      var resolveUpTo = Math.floor((frame / frames) * len);

      for (var i = 0; i < len; i++) {
        if (i < resolveUpTo) {
          resolved[i] = true;
          current[i] = finalText[i];
        } else if (!resolved[i]) {
          current[i] = SCRAMBLE_CHARS[randomInt(SCRAMBLE_CHARS.length)];
        }
      }

      el.textContent = current.join('');

      if (frame >= frames) {
        clearInterval(timer);
        el.classList.remove('scrambling');
        if (callback) callback();
      }
    }, interval);
  }

  // ============================================
  // Slogan Animation Engines
  // ============================================

  var SLOGAN_ANIMS = ['scramble', 'typewriter', 'fade'];

  function animateSloganScramble(el, text, onDone) {
    var len = text.length;
    var resolved = new Array(len).fill(false);
    var display = new Array(len);
    var totalFrames = 30;
    var staggerFrames = Math.max(1, Math.floor(totalFrames / len));

    for (var i = 0; i < len; i++) {
      display[i] = text[i] === ' ' ? ' ' : SCRAMBLE_CHARS[randomInt(SCRAMBLE_CHARS.length)];
    }
    el.textContent = display.join('');

    var frame = 0;
    var interval = setInterval(function () {
      frame++;
      for (var i = 0; i < len; i++) {
        if (resolved[i]) continue;
        if (frame > (i * staggerFrames) + (totalFrames * 0.4)) {
          resolved[i] = true;
          display[i] = text[i];
        } else {
          display[i] = text[i] === ' ' ? ' ' : SCRAMBLE_CHARS[randomInt(SCRAMBLE_CHARS.length)];
        }
      }
      el.textContent = display.join('');

      if (resolved.every(Boolean)) {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, 30);
  }

  function animateSloganTypewriter(el, text, onDone) {
    el.textContent = '\u258C'; // block cursor
    var i = 0;
    var interval = setInterval(function () {
      if (i < text.length) {
        el.textContent = text.slice(0, i + 1) + '\u258C';
        i++;
      } else {
        clearInterval(interval);
        setTimeout(function () {
          el.textContent = text;
          if (onDone) onDone();
        }, 800);
      }
    }, 45);
  }

  function animateSloganFade(el, text, onDone) {
    el.classList.add('slogan-fade-out');
    setTimeout(function () {
      el.textContent = text;
      el.classList.remove('slogan-fade-out');
      el.classList.add('slogan-fade-in');
      if (onDone) onDone();
      setTimeout(function () {
        el.classList.remove('slogan-fade-in');
      }, 300);
    }, 200);
  }

  function animateSlogan(el, text, style) {
    if (reducedMotion) {
      el.textContent = text;
      return;
    }
    if (style === 'scramble') {
      animateSloganScramble(el, text);
    } else if (style === 'typewriter') {
      animateSloganTypewriter(el, text);
    } else {
      animateSloganFade(el, text);
    }
  }

  // ============================================
  // Freshness Timer
  // ============================================

  var freshnessTimers = {};

  function startFreshnessTimer(index) {
    clearTimeout(freshnessTimers[index]);
    var el;
    if (index === 'diy') {
      el = diyOutput.querySelector('.password-value');
    } else {
      el = rows[index].querySelector('.password-value');
    }
    el.style.filter = '';
    el.style.transition = '';
    freshnessTimers[index] = setTimeout(function () {
      if (reducedMotion) {
        el.style.filter = 'saturate(0.85)';
      } else {
        el.style.transition = 'filter 5s ease';
        el.style.filter = 'saturate(0.85)';
      }
    }, 60000);
  }

  // ============================================
  // DOM References
  // ============================================

  var rows = document.querySelectorAll('.password-row');
  var diyOutput = document.querySelector('.diy-output');
  var diySlider = document.getElementById('diy-length');
  var diyReadout = document.querySelector('.length-readout');
  var togglePills = document.querySelectorAll('.toggle-pill');
  var proTip = document.querySelector('.pro-tip');
  var announcer = document.querySelector('.sr-announcer');
  var logo = document.querySelector('.logo');
  var logoText = logo.querySelector('.logo-text');
  var logoTld = logo.querySelector('.logo-tld');
  var sloganEl = document.querySelector('.slogan');
  var diySection = document.querySelector('.diy-section');

  // ============================================
  // State
  // ============================================

  var passwords = new Array(5);
  var diyPassword = '';
  var wordlistLoaded = false;
  var proTipShown = false;
  var sloganRotationTimer = null;

  // ============================================
  // Archetype Row Logic
  // ============================================

  function generateArchetype(index) {
    var pw = archetypes[index].generate();
    passwords[index] = pw;
    return pw;
  }

  function renderArchetype(index) {
    var row = rows[index];
    var pw = passwords[index];
    var el = row.querySelector('.password-value');

    if (pw === null) {
      el.textContent = 'loading...';
      el.classList.add('loading');
      return;
    }

    el.classList.remove('loading');
    if (archetypes[index].isPassphrase) {
      renderPassphraseHighlighted(el, pw);
    } else {
      renderHighlighted(el, pw);
    }
  }

  function regenerateArchetype(index) {
    var pw = generateArchetype(index);
    if (pw === null) return;

    var row = rows[index];
    var el = row.querySelector('.password-value');

    el.classList.remove('loading');

    scrambleAnimate(el, pw, function () {
      if (archetypes[index].isPassphrase) {
        renderPassphraseHighlighted(el, pw);
      } else {
        renderHighlighted(el, pw);
      }
    });
    hapticRegenerate();
    startFreshnessTimer(index);
    announce('Regenerated ' + archetypes[index].name + ' password');
  }

  function regenerateAll() {
    for (var i = 0; i < 5; i++) {
      (function (idx) {
        setTimeout(function () {
          if (archetypes[idx].isPassphrase && !wordlistLoaded) return;
          regenerateArchetype(idx);
        }, idx * 120);
      })(i);
    }
  }

  // ============================================
  // Copy Logic
  // ============================================

  function copyRow(row, password, label, index) {
    if (!password) return;

    copyToClipboard(password).then(function (ok) {
      var copyBtn = row.querySelector('.btn-copy');
      if (ok) {
        showCopySuccess(row, copyBtn, index);
        announce('Copied ' + label + ' password to clipboard');
        showProTip();
      } else {
        showCopyFail(row, copyBtn);
        var pwEl = row.querySelector('.password-value');
        if (pwEl) {
          var range = document.createRange();
          range.selectNodeContents(pwEl);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        announce('Copy failed. Select the password and press Ctrl+C.');
      }
    });
  }

  function showCopySuccess(row, btn, index) {
    btn.classList.remove('fail');
    btn.classList.add('success');
    row.classList.add('copied');

    // Copy glow
    row.classList.add('copy-glow');
    setTimeout(function () {
      row.classList.remove('copy-glow');
    }, 400);

    // Delight effects
    playTick();
    hapticCopy();
    flashFavicon();
    if (index !== undefined) startFreshnessTimer(index);

    setTimeout(function () {
      btn.classList.remove('success');
      row.classList.remove('copied');
    }, 1500);
  }

  function showCopyFail(row, btn) {
    btn.classList.remove('success');
    btn.classList.add('fail');

    setTimeout(function () {
      btn.classList.remove('fail');
    }, 1500);
  }

  // ============================================
  // Pro Tip (in-memory only — zero persistence)
  // ============================================

  function showProTip() {
    if (proTipShown) return;
    proTipShown = true;

    if (window.matchMedia('(hover: none)').matches) return;

    proTip.hidden = false;

    setTimeout(function () {
      dismissProTip();
    }, 5000);
  }

  function dismissProTip() {
    proTip.classList.add('dismissing');
    setTimeout(function () {
      proTip.hidden = true;
      proTip.classList.remove('dismissing');
    }, 300);
  }

  proTip.addEventListener('click', dismissProTip);

  // ============================================
  // Screen Reader Announcements
  // ============================================

  function announce(msg) {
    announcer.textContent = '';
    requestAnimationFrame(function () {
      announcer.textContent = msg;
    });
  }

  // ============================================
  // Archetype Event Handlers
  // ============================================

  rows.forEach(function (row, i) {
    row.querySelector('[data-copy]').addEventListener('click', function () {
      copyRow(row, passwords[i], archetypes[i].name, i);
    });

    row.querySelector('[data-copy-btn]').addEventListener('click', function () {
      copyRow(row, passwords[i], archetypes[i].name, i);
    });

    row.querySelector('[data-refresh]').addEventListener('click', function () {
      regenerateArchetype(i);
    });
  });

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  document.addEventListener('keydown', function (e) {
    var tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.activeElement.getAttribute('role') === 'switch') return;

    var key = e.key;

    var shiftMap = { '!': 0, '@': 1, '#': 2, '$': 3, '%': 4 };

    if (e.shiftKey && shiftMap.hasOwnProperty(key)) {
      e.preventDefault();
      regenerateArchetype(shiftMap[key]);
      return;
    }

    var num = parseInt(key, 10);
    if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && num >= 1 && num <= 5) {
      e.preventDefault();
      var row = rows[num - 1];
      copyRow(row, passwords[num - 1], archetypes[num - 1].name, num - 1);
    }
  });

  // ============================================
  // DIY Section
  // ============================================

  var diyDebounceTimer = null;

  function getDIYCharsets() {
    var pool = '';
    var poolSize = 0;
    var enabledCount = 0;

    togglePills.forEach(function (pill) {
      if (pill.getAttribute('aria-checked') === 'true') {
        var key = pill.dataset.charset;
        enabledCount++;
        if (key === 'extended') {
          pool += SAFE_SYMBOLS + BROAD_SYMBOLS + EXTENDED_SYMBOLS;
          poolSize += SAFE_SYMBOLS.length + BROAD_SYMBOLS.length + EXTENDED_SYMBOLS.length;
        } else if (key === 'broad') {
          pool += SAFE_SYMBOLS + BROAD_SYMBOLS;
          poolSize += SAFE_SYMBOLS.length + BROAD_SYMBOLS.length;
        } else {
          pool += CHARSETS[key] || '';
          poolSize += (CHARSETS[key] || '').length;
        }
      }
    });

    return { pool: pool, poolSize: poolSize, enabledCount: enabledCount };
  }

  function getDIYPoolSizeForEntropy() {
    var chars = new Set();
    togglePills.forEach(function (pill) {
      if (pill.getAttribute('aria-checked') === 'true') {
        var key = pill.dataset.charset;
        var set;
        if (key === 'extended') {
          set = SAFE_SYMBOLS + BROAD_SYMBOLS + EXTENDED_SYMBOLS;
        } else if (key === 'broad') {
          set = SAFE_SYMBOLS + BROAD_SYMBOLS;
        } else {
          set = CHARSETS[key] || '';
        }
        for (var i = 0; i < set.length; i++) chars.add(set[i]);
      }
    });
    return chars.size;
  }

  function generateDIY() {
    var info = getDIYCharsets();
    if (info.pool.length === 0) {
      diyPassword = '';
      return;
    }

    var length = parseInt(diySlider.value, 10);

    var uniquePool = Array.from(new Set(info.pool.split(''))).join('');
    var pw = '';
    for (var i = 0; i < length; i++) {
      pw += uniquePool[randomInt(uniquePool.length)];
    }
    diyPassword = pw;
  }

  function renderDIY() {
    var el = diyOutput.querySelector('.password-value');
    var crackEl = diyOutput.querySelector('.crack-time');
    var length = parseInt(diySlider.value, 10);
    var poolSize = getDIYPoolSizeForEntropy();

    if (diyPassword) {
      renderHighlighted(el, diyPassword);
      el.classList.remove('loading');
      crackEl.textContent = getDIYCrackTime(poolSize, length);
    } else {
      el.textContent = '\u2014';
      el.classList.add('loading');
      crackEl.textContent = '';
    }
  }

  function updateDIY() {
    generateDIY();
    renderDIY();
    startFreshnessTimer('diy');
  }

  function updateSliderFill() {
    var min = parseFloat(diySlider.min);
    var max = parseFloat(diySlider.max);
    var val = parseFloat(diySlider.value);
    var pct = ((val - min) / (max - min)) * 100;
    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    var surface = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
    diySlider.style.background = 'linear-gradient(to right, ' + accent + ' 0%, ' + accent + ' ' + pct + '%, ' + surface + ' ' + pct + '%, ' + surface + ' 100%)';
  }

  diySlider.addEventListener('input', function () {
    var val = diySlider.value;
    diyReadout.textContent = val;
    diySlider.setAttribute('aria-valuenow', val);
    diySlider.setAttribute('aria-valuetext', val + ' characters');
    updateSliderFill();

    clearTimeout(diyDebounceTimer);
    diyDebounceTimer = setTimeout(updateDIY, 50);
  });

  togglePills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var isChecked = pill.getAttribute('aria-checked') === 'true';

      if (isChecked) {
        var enabledCount = 0;
        togglePills.forEach(function (p) {
          if (p.getAttribute('aria-checked') === 'true') enabledCount++;
        });

        if (enabledCount <= 1) {
          pill.classList.add('shake');
          setTimeout(function () { pill.classList.remove('shake'); }, 300);
          announce('At least one character type required');
          return;
        }
      }

      pill.setAttribute('aria-checked', isChecked ? 'false' : 'true');

      var info = getDIYCharsets();
      var currentLength = parseInt(diySlider.value, 10);
      if (currentLength < info.enabledCount) {
        diySlider.value = info.enabledCount;
        diyReadout.textContent = info.enabledCount;
        diySlider.setAttribute('aria-valuenow', info.enabledCount);
        diySlider.setAttribute('aria-valuetext', info.enabledCount + ' characters');
      }

      updateDIY();
      updateSliderFill();
    });

    pill.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pill.click();
      }
    });
  });

  diyOutput.querySelector('[data-copy]').addEventListener('click', function () {
    copyRow(diyOutput, diyPassword, 'custom', 'diy');
  });

  diyOutput.querySelector('[data-copy-btn]').addEventListener('click', function () {
    copyRow(diyOutput, diyPassword, 'custom', 'diy');
  });

  diyOutput.querySelector('[data-refresh]').addEventListener('click', function () {
    generateDIY();
    var el = diyOutput.querySelector('.password-value');
    var crackEl = diyOutput.querySelector('.crack-time');
    var length = parseInt(diySlider.value, 10);
    var poolSize = getDIYPoolSizeForEntropy();
    crackEl.textContent = getDIYCrackTime(poolSize, length);
    scrambleAnimate(el, diyPassword, function () {
      renderHighlighted(el, diyPassword);
    });
    hapticRegenerate();
    startFreshnessTimer('diy');
    announce('Regenerated custom password');
  });

  // ============================================
  // Shake to Regenerate (Android-only)
  // ============================================

  function initShakeDetection() {
    if (reducedMotion) return;
    if (!window.DeviceMotionEvent) return;
    if (typeof DeviceMotionEvent.requestPermission === 'function') return;

    var lastAccel = { x: 0, y: 0, z: 0 };
    var shakeDebounce = false;

    window.addEventListener('devicemotion', function (e) {
      if (shakeDebounce) return;
      var a = e.accelerationIncludingGravity;
      if (!a) return;
      var delta = Math.abs(a.x - lastAccel.x) + Math.abs(a.y - lastAccel.y) + Math.abs(a.z - lastAccel.z);
      lastAccel = { x: a.x, y: a.y, z: a.z };
      if (delta > 15) {
        shakeDebounce = true;
        regenerateAll();
        hapticRegenerate();
        setTimeout(function () { shakeDebounce = false; }, 2000);
      }
    });
  }

  // ============================================
  // Slogan Rotation
  // ============================================

  function startSloganRotation() {
    sloganRotationTimer = setInterval(function () {
      var text = randomSlogan();
      var style = SLOGAN_ANIMS[randomInt(SLOGAN_ANIMS.length)];
      animateSlogan(sloganEl, text, style);
    }, 10000);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        clearInterval(sloganRotationTimer);
      } else {
        var text = randomSlogan();
        var style = SLOGAN_ANIMS[randomInt(SLOGAN_ANIMS.length)];
        animateSlogan(sloganEl, text, style);
        sloganRotationTimer = setInterval(function () {
          var t = randomSlogan();
          var s = SLOGAN_ANIMS[randomInt(SLOGAN_ANIMS.length)];
          animateSlogan(sloganEl, t, s);
        }, 10000);
      }
    });
  }

  // ============================================
  // Logo Color System
  // ============================================

  var LOGO_CHARS = 'mkpw';
  var LOGO_CLASSES = ['syn-u', 'syn-d', 'syn-s', 'syn-l'];

  function renderLogoColors(el) {
    el.textContent = '';
    for (var i = 0; i < LOGO_CHARS.length; i++) {
      var span = document.createElement('span');
      span.textContent = LOGO_CHARS[i];
      span.className = LOGO_CLASSES[i];
      el.appendChild(span);
    }
  }

  function cascadeLogoColors(callback) {
    // First render as all-gold spans, then cascade to syntax colors
    logoText.textContent = '';
    var spans = [];
    for (var i = 0; i < LOGO_CHARS.length; i++) {
      var span = document.createElement('span');
      span.textContent = LOGO_CHARS[i];
      span.style.color = 'var(--accent)';
      logoText.appendChild(span);
      spans.push(span);
    }

    // Stagger each letter's color transition
    for (var j = 0; j < spans.length; j++) {
      (function (idx) {
        setTimeout(function () {
          spans[idx].className = LOGO_CLASSES[idx];
          spans[idx].style.color = '';
        }, idx * 60);
      })(j);
    }

    // Callback after all letters have transitioned
    setTimeout(function () {
      if (callback) callback();
    }, spans.length * 60 + 250);
  }

  // ============================================
  // Boot Sequence
  // ============================================

  function showCursorBlink(el, callback) {
    el.textContent = '>';
    var blinks = 0;
    var visible = true;
    var blinkTimer = setInterval(function () {
      visible = !visible;
      el.style.opacity = visible ? '1' : '0';
      blinks++;
      if (blinks >= 4) {
        clearInterval(blinkTimer);
        el.textContent = '';
        el.style.opacity = '1';
        if (callback) callback();
      }
    }, 100);
  }

  function cascadeRows(index, callback) {
    if (index >= rows.length) {
      // Also reveal DIY section
      diySection.classList.remove('boot-hidden');
      diySection.classList.add('boot-reveal');
      if (callback) callback();
      return;
    }

    var row = rows[index];
    row.classList.remove('boot-hidden');
    row.classList.add('boot-reveal');

    var el = row.querySelector('.password-value');
    var pw = passwords[index];

    if (pw === null) {
      // Passphrase not loaded yet — show loading, wordlist onload will handle it
      setTimeout(function () {
        cascadeRows(index + 1, callback);
      }, 120);
      return;
    }

    scrambleAnimate(el, pw, function () {
      if (archetypes[index].isPassphrase) {
        renderPassphraseHighlighted(el, pw);
      } else {
        renderHighlighted(el, pw);
      }
      startFreshnessTimer(index);
    });

    setTimeout(function () {
      cascadeRows(index + 1, callback);
    }, 120);
  }

  function fadeInSlogan(text) {
    sloganEl.style.opacity = '0';
    sloganEl.textContent = text;
    // Force reflow then transition
    sloganEl.offsetHeight; // eslint-disable-line no-unused-expressions
    sloganEl.style.transition = 'opacity 0.5s ease';
    sloganEl.style.opacity = '1';
  }

  function bootSequence() {
    if (reducedMotion) {
      logo.classList.remove('boot-hidden');
      renderLogoColors(logoText);
      logoTld.classList.add('visible');
      rows.forEach(function (r) { r.classList.remove('boot-hidden'); });
      diySection.classList.remove('boot-hidden');
      for (var i = 0; i < archetypes.length; i++) {
        if (i === PASSPHRASE_INDEX && !passwords[i]) continue;
        renderArchetype(i);
        startFreshnessTimer(i);
      }
      renderDIY();
      startFreshnessTimer('diy');
      sloganEl.textContent = randomSlogan();
      startSloganRotation();
      return;
    }

    // Step 1: Logo appears (> visible), mkpw scrambles
    logo.classList.remove('boot-hidden');
    logo.classList.add('boot-reveal');
    scrambleAnimate(logoText, 'mkpw', function () {
      // Step 2: Cascade logo colors (60ms stagger per letter)
      cascadeLogoColors(function () {
        // Step 3: .dev and definition fade in
        logoTld.classList.add('visible');
        // Step 4: Password cascade + slogan
        setTimeout(function () {
          cascadeRows(0, function () {
            // Step 5: Render DIY section + slogan
            renderDIY();
            startFreshnessTimer('diy');
            fadeInSlogan(randomSlogan());
            startSloganRotation();
          });
        }, 250);
      });
    });
  }

  // ============================================
  // Word List Lazy Loading
  // ============================================

  function loadWordList() {
    var script = document.createElement('script');
    script.src = 'js/wordlist.js';
    script.onload = function () {
      wordlistLoaded = true;
      var pw = generateArchetype(PASSPHRASE_INDEX);
      if (pw) {
        var el = rows[PASSPHRASE_INDEX].querySelector('.password-value');
        el.classList.remove('loading');
        // If row is already revealed (boot finished), scramble-animate
        if (rows[PASSPHRASE_INDEX].classList.contains('boot-reveal') || reducedMotion) {
          scrambleAnimate(el, pw, function () {
            renderPassphraseHighlighted(el, pw);
          });
        }
        startFreshnessTimer(PASSPHRASE_INDEX);
      }
    };
    script.onerror = function () {
      var el = rows[PASSPHRASE_INDEX].querySelector('.password-value');
      el.textContent = 'word list unavailable';
    };
    document.body.appendChild(script);
  }

  // ============================================
  // Mask Toggle
  // ============================================

  var maskBtn = document.querySelector('.btn-mask');
  var isMasked = false;

  function updateMaskAriaLabels() {
    var allValues = document.querySelectorAll('.password-value');
    allValues.forEach(function (el) {
      if (isMasked) {
        el.setAttribute('aria-label', 'Password hidden');
      } else {
        // Restore real password text — the render functions set aria-label
        // For elements that have syntax-highlighted spans, read the text content
        var text = el.textContent;
        if (text && text !== 'loading...' && text !== '\u2014') {
          el.setAttribute('aria-label', text);
        }
      }
    });
  }

  if (maskBtn) {
    maskBtn.addEventListener('click', function () {
      isMasked = !isMasked;
      document.querySelector('main').classList.toggle('masked', isMasked);
      maskBtn.setAttribute('aria-pressed', isMasked ? 'true' : 'false');
      maskBtn.setAttribute('aria-label', isMasked ? 'Show passwords' : 'Hide passwords');
      announce(isMasked ? 'Passwords hidden' : 'Passwords visible');
      updateMaskAriaLabels();
    });
  }

  // ============================================
  // Theme Toggle
  // ============================================

  var themeBtn = document.querySelector('.btn-theme');
  var isLight = false;

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      isLight = !isLight;
      document.documentElement.classList.toggle('light', isLight);
      themeBtn.setAttribute('aria-label',
        isLight ? 'Switch to dark mode' : 'Switch to light mode');
      announce(isLight ? 'Light mode' : 'Dark mode');
      // Update theme-color meta tag
      document.querySelector('meta[name="theme-color"]').content =
        isLight ? '#F5F3EE' : '#1A1A2E';
      // Update slider fill for new theme colors
      updateSliderFill();
      // Regenerate favicon with theme colors
      baseFaviconHref = generateFavicon('mkpw',
        isLight ? '#F5F3EE' : '#1A1A2E',
        isLight ? '#B8960A' : '#E8C547');
      document.getElementById('favicon').href = baseFaviconHref;
    });
  }

  // ============================================
  // Initialization
  // ============================================

  function init() {
    // Generate all archetypes immediately, except passphrase (needs wordlist)
    for (var i = 0; i < archetypes.length; i++) {
      if (i === PASSPHRASE_INDEX) continue;
      generateArchetype(i);
    }

    // Passphrase — null until wordlist loads
    passwords[PASSPHRASE_INDEX] = null;
    renderArchetype(PASSPHRASE_INDEX);
    loadWordList();

    // Generate DIY password (data ready before boot)
    generateDIY();

    // Set up favicon once fonts are loaded
    document.fonts.ready.then(function () {
      baseFaviconHref = generateFavicon('mkpw', '#1A1A2E', '#E8C547');
      var link = document.getElementById('favicon');
      if (link) link.href = baseFaviconHref;
    });

    // Initialize slider fill indicator
    updateSliderFill();

    // Run boot sequence (visual only — data and handlers already attached)
    bootSequence();

    // Shake detection (Android only)
    initShakeDetection();
  }

  init();
})();
