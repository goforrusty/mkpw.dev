(function () {
  'use strict';

  // ============================================
  // Crypto Utilities
  // ============================================

  var _rngBuf = new Uint32Array(1);

  function randomInt(max) {
    if (max <= 0) throw new RangeError('randomInt: max must be > 0, got ' + max);
    // Unbiased random integer in [0, max) using rejection sampling
    var limit = Math.floor(0xFFFFFFFF / max) * max;
    do {
      crypto.getRandomValues(_rngBuf);
    } while (_rngBuf[0] >= limit);
    return _rngBuf[0] % max;
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

  // Symbol tiers (strictly cumulative)
  var TIER1_SYMBOLS = '!@#$%^&*-_';                           // 10 chars — safe everywhere
  var TIER2_SYMBOLS = '+.=?~(){}[]';                           // 11 chars
  var TIER3_SYMBOLS = '"\'`\\/|:;<>,';                         // 11 chars

  // Cumulative pools
  var SYMBOLS_SAFE = TIER1_SYMBOLS;                            // 10
  var SYMBOLS_MORE = TIER1_SYMBOLS + TIER2_SYMBOLS;            // 21
  var SYMBOLS_FULL = TIER1_SYMBOLS + TIER2_SYMBOLS + TIER3_SYMBOLS; // 32

  // Full printable ASCII (codes 33-126)
  var FULL_ASCII = (function () {
    var s = '';
    for (var i = 33; i <= 126; i++) s += String.fromCharCode(i);
    return s;
  })();                                                        // 94 chars

  var CHARSETS = {
    upper: UPPER,
    lower: LOWER,
    digits: DIGITS,
    safe: SYMBOLS_SAFE,
    more: SYMBOLS_MORE,
    full: SYMBOLS_FULL
  };

  // ============================================
  // Syntax Highlighting
  // ============================================

  function charClass(ch) {
    var c = ch.charCodeAt(0);
    if (c >= 65 && c <= 90) return 'syn-u';   // A-Z
    if (c >= 97 && c <= 122) return 'syn-l';  // a-z
    if (c >= 48 && c <= 57) return 'syn-d';   // 0-9
    return 'syn-s';
  }

  function renderHighlighted(el, text) {
    el.textContent = '';
    el.setAttribute('aria-label', text);
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.textContent = text[i];
      span.className = charClass(text[i]);
      span.setAttribute('aria-hidden', 'true');
      frag.appendChild(span);
    }
    el.appendChild(frag);
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
    'Humanity\'s best defense against \'Password123\'.',
    'no account. no tracker. no small talk.',
    'touch grass after this one.',
    'we generated before you loaded.',
    'Leave this tab open. We don\'t mind.',
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
    'Open tab. Closed book.',
    'Strong as written.',
    'We don\'t remember you.',
    'Arrives made.',
    'Keys, not keychains.',
    'Take what you need.',
    'Nothing to join.',
    'Your password, then gone.',
    'No signups, no newsletters, no traces.',
    'We don\'t want your email.',
    'Not a funnel. Just a tool.',
    'Yes, this is the entire app.',
    'The world\'s least ambitious startup.',
    'We peaked on launch day.',
    'Grab one. Go.',
    'One job. Done.',
    'Open tab. Close tab. That\'s the tour.',
    'It\'s not that deep.',
    'Literally just passwords.',
    'No one will remember this. That\'s the point.',
    'The shortest relationship you\'ll have with a website.',
    'Entropy as a service.',
    'Made fresh. Never stored.',
    'Unguessable in every sense.',
    'Passwords. Not a relationship.',
    'mkdir strong-password',
    'mkdir for entropy.',
    'Warm keys, cold math.',
    'Five seeds. No strings.',
    'chmod 000 your attack surface.',
    'You needed this 5 minutes ago.',
    'No account needed to make your account.',
    'Passwords for people with shit to do.',
    'Because \'password123\' isn\'t a personality.',
    'Ctrl+V and move on with your life.',
    'Because you need a password, not a subscription.',
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

  function generateFromPool(length, pool, requiredSets, constraints) {
    for (var attempt = 0; attempt < 100; attempt++) {
      var chars = [];

      if (requiredSets) {
        for (var r = 0; r < requiredSets.length; r++) {
          chars.push(requiredSets[r][randomInt(requiredSets[r].length)]);
        }
      }

      while (chars.length < length) {
        chars.push(pool[randomInt(pool.length)]);
      }

      chars = shuffle(chars);
      var password = chars.join('');

      var valid = true;

      if (constraints && constraints.startsWithLetter) {
        if (!LETTERS.includes(password[0])) { valid = false; }
      }

      if (constraints && constraints.noTripleConsecutive) {
        if (hasConsecutive(password, 3)) { valid = false; }
      }

      if (constraints && constraints.noDoubleConsecutive) {
        if (hasConsecutive(password, 2)) { valid = false; }
      }

      if (constraints && constraints.noSequentialRun) {
        if (hasSequentialRun(password)) { valid = false; }
      }

      if (valid) return password;
    }
    // Best-effort fallback: probability of reaching here is ~10^-83 for all
    // current pool sizes and constraints. Returns last attempt despite not
    // meeting all constraints.
    return chars.join('');
  }

  var archetypes = [
    {
      name: 'Works with Most Sites',
      generate: function () {
        var pool = UPPER + LOWER + DIGITS + SYMBOLS_SAFE;
        return generateFromPool(18, pool,
          [UPPER, LOWER, DIGITS, SYMBOLS_SAFE],
          { startsWithLetter: true, noTripleConsecutive: true, noSequentialRun: true }
        );
      }
    },
    {
      name: 'If You Need to Remember It',
      generate: function () {
        return generateStoryPassword();
      }
    },
    {
      name: 'No Special Characters',
      generate: function () {
        var pool = UPPER + LOWER + DIGITS;
        return generateFromPool(22, pool,
          [UPPER, LOWER, DIGITS],
          { noDoubleConsecutive: true }
        );
      }
    },
    {
      name: 'If Character Limit Is Short',
      generate: function () {
        var pool = UPPER + LOWER + DIGITS + SYMBOLS_SAFE;
        return generateFromPool(12, pool,
          [UPPER, LOWER, DIGITS, SYMBOLS_SAFE],
          { startsWithLetter: true }
        );
      }
    },
    {
      name: 'Maximum Security',
      generate: function () {
        var pool = FULL_ASCII;
        var nonAlpha = '';
        for (var i = 0; i < pool.length; i++) {
          var cls = charClass(pool[i]);
          if (cls === 'syn-s') nonAlpha += pool[i];
        }
        return generateFromPool(32, pool, [UPPER, LOWER, DIGITS, nonAlpha]);
      }
    }
  ];

  var PASSPHRASE_INDEX = 1;

  // ============================================
  // Story Password Generation
  // ============================================

  var STORY_PUNCTUATION = ['!', '?'];
  var STORY_PATTERNS = ['ordinal', 'year', 'time', 'six'];

  var STORY_SCHEMAS = [
    { id: 'scene-a', base: ['X', 'V', 'R', 'A', 'O'], six: ['X', 'V', 'R', 'A', 'O', 'T'], actorPool: 'mixed' },
    { id: 'scene-b', base: ['A', 'O', 'V', 'R', 'X'], six: ['A', 'O', 'V', 'R', 'X', 'T'], actorPool: 'mixed' },
    { id: 'scene-c', base: ['X', 'V', 'O', 'R', 'A'], six: ['X', 'V', 'O', 'R', 'A', 'T'], actorPool: 'mixed' },
    { id: 'scene-d', base: ['O', 'V', 'R', 'X', 'A'], six: ['O', 'V', 'R', 'X', 'A', 'T'], actorPool: 'mixed' },
    { id: 'scene-e', base: ['A', 'X', 'V', 'R', 'O'], six: ['A', 'X', 'V', 'R', 'O', 'T'], actorPool: 'mixed' },
    { id: 'scene-f', base: ['X', 'V', 'R', 'A', 'O'], six: ['X', 'V', 'R', 'A', 'O', 'T'], actorPool: 'names' },
    { id: 'scene-g', base: ['O', 'R', 'A', 'X', 'V'], six: ['O', 'R', 'A', 'X', 'V', 'T'], actorPool: 'mixed' }
  ];

  function words(text) {
    return text.trim().split(/\s+/);
  }

  function uniqueWords(arr) {
    var out = [];
    var seen = {};
    for (var i = 0; i < arr.length; i++) {
      var w = String(arr[i] || '').trim().toLowerCase();
      if (!w || seen[w]) continue;
      seen[w] = true;
      out.push(w);
    }
    return out;
  }

  function makeWordSet(arr) {
    var set = {};
    for (var i = 0; i < arr.length; i++) {
      var w = String(arr[i] || '').trim().toLowerCase();
      if (w) set[w] = true;
    }
    return set;
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function hasAnySuffix(word, suffixes) {
    for (var i = 0; i < suffixes.length; i++) {
      if (word.length > suffixes[i].length + 1 && word.slice(-suffixes[i].length) === suffixes[i]) {
        return true;
      }
    }
    return false;
  }

  function hashWord(word) {
    var h = 2166136261;
    for (var i = 0; i < word.length; i++) {
      h ^= word.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
  }

  function capWordPool(pool, cap) {
    var unique = uniqueWords(pool);
    if (unique.length <= cap) return unique;
    unique.sort(function (a, b) {
      var ha = hashWord(a);
      var hb = hashWord(b);
      if (ha !== hb) return ha - hb;
      return a < b ? -1 : a > b ? 1 : 0;
    });
    return unique.slice(0, cap);
  }

  function loadBaseLexiconWords() {
    if (typeof window !== 'undefined' && typeof window.WORDLIST === 'string' && window.WORDLIST.length > 0) {
      return uniqueWords(window.WORDLIST.split('\n'));
    }
    return [];
  }

  function pick(pool) {
    return pool[randomInt(pool.length)];
  }

  function pickUnique(pool, used, maxAttempts) {
    var attempts = maxAttempts || 60;
    while (attempts-- > 0) {
      var w = pick(pool);
      if (!used[w]) {
        used[w] = true;
        return w;
      }
    }
    return pick(pool);
  }

  function pickBiasedUnique(primaryPool, fallbackPool, used, primaryChancePct) {
    if (primaryPool.length > 0 && randomInt(100) < primaryChancePct) {
      return pickUnique(primaryPool, used);
    }
    return pickUnique(fallbackPool, used);
  }

  function titleCaseWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  // Global short names (<=5 chars) across diverse origins, ASCII transliterated.
  var GLOBAL_NAME_WORDS = uniqueWords(
    // Spanish / Portuguese
    words('ana luis jose juan maria mario diego lucia sofia carla pablo rita ines raul pedro bruno')
      // Indian (multiple language groups)
      .concat(words('aarav arjun neha priya riya diya isha kabir anaya meera rohan rahul tara anil'))
      // Italian
      .concat(words('luca marco paolo enzo dario elia sara anna gino nina carlo'))
      // Arabic
      .concat(words('omar ali sami ziad noor lina yara rami salma amir faris nada'))
      // Greek
      .concat(words('niko yanni eleni irene dora petra alex yiota aris teo'))
      // German
      .concat(words('hans klaus petra heidi lars greta nina lena tobi erik'))
      // Russian
      .concat(words('ivan olga dima masha irina pavel yulia nika oleg lena'))
      // Ukrainian
      .concat(words('oleg ivan liza yura ira roman inna olena tara yana'))
      // Hungarian
      .concat(words('bela zoli anna reka lili adam tamas eszti vera dora'))
      // French
      .concat(words('lucie marie paul remi chloe clara hugo leo noel elise'))
      // Turkish
      .concat(words('emir elif deniz ece cenk berk selin kerem naz asli'))
      // Persian
      .concat(words('arya omid leila darya parsa shadi roza sina mina nilo'))
      // Polish
      .concat(words('ania ola marta piotr pawel marek lena kuba iga tomek'))
      // Czech / Slovak
      .concat(words('jana vera pavel klara roman david tomas lucie adela iveta'))
      // Romanian
      .concat(words('ion ioan ana mara vlad dora ilie radu oana sora'))
      // Hebrew
      .concat(words('noam yael lior idan itai aviv tal adi ori yona'))
      // Japanese (romanized)
      .concat(words('yuki riku ren mei aoi hina sota haru akira nao'))
      // Korean (romanized)
      .concat(words('min joon jiho yuna suji bora hana seon jiye taey'))
      // Chinese (pinyin)
      .concat(words('li wei hao ming yu chen yan lin mei tao'))
      // Vietnamese
      .concat(words('linh minh trang hanh an bao dung ngoc quynh phuc'))
      // Indonesian / Malay
      .concat(words('putri dewi adi putra agus sari reza bima rani eka'))
      // Filipino
      .concat(words('liza nico joel paolo mila ina rina carlo gina noel'))
      // East African / Swahili usage
      .concat(words('amani zuri juma neema imani alia zain omari ayan hali'))
  );

  var CREATURE_ROLE_WORDS = uniqueWords(words(
    'otter badger panda llama tiger eagle koala moose goose raven robin gecko puppy kitten falcon shark whale penguin beaver hamster weasel yak zebra parrot monkey dragon ninja pirate pilot ranger drummer baker barber coder doctor poet skater surfer captain scout monk robot droid farmer courier boxer sailor diver miner artist waiter singer dancer driver'
  ));
  var RELATION_WORDS = uniqueWords(words(
    'under over near beside around behind before after during while inside outside across between beyond beneath within toward against atop below along amid among past through'
  ));

  var STORY_RAW_BASE_WORDS = loadBaseLexiconWords();
  var STORY_ASCII_RE = /^[a-z]+$/;
  var STORY_COMMON_STOP_WORDS = makeWordSet(words(
    'a an and another as at be been being but by each few for from if in into is it its itself many me mine most much my myself no not of off on onto or our ours ourselves same she he him his her hers their theirs them themselves then they this those to too up very we what when where who why will with without you your yours yourself yourselves'
  ));
  var STORY_SFW_EXCLUDE_WORDS = makeWordSet(words(
    'badass asshole asshat bastard bitch bitchy bullshit cock cocksucker cunt damn douche douchebag fuck fucker fucking horny motherfucker prick pussy shit shitty slut thong whore panty gonad rectal racist racism islam islamic prozac walmart google yahoo xbox myspace ipad ipod'
  ));

  function isStoryBaseWord(word) {
    if (!STORY_ASCII_RE.test(word)) return false;
    if (word.length < 3 || word.length > 10) return false;
    if (hasOwn(STORY_COMMON_STOP_WORDS, word)) return false;
    if (hasOwn(STORY_SFW_EXCLUDE_WORDS, word)) return false;
    return true;
  }

  var STORY_BASE_WORDS = (function () {
    var out = [];
    for (var i = 0; i < STORY_RAW_BASE_WORDS.length; i++) {
      var w = STORY_RAW_BASE_WORDS[i];
      if (isStoryBaseWord(w)) out.push(w);
    }
    return uniqueWords(out);
  })();
  var STORY_BASE_SET = makeWordSet(STORY_BASE_WORDS);

  var VERB_ROOT_SEED_WORDS = uniqueWords(words(
    'juggle yodel launch paint tickle hug whistle zigzag moonwalk wobble balance spin twirl flip hop dash sneak race zoom glide drift bounce nudge poke tap knead fold stack mix stir grill toast fry brew sip munch chase bump boop zap weld patch tune polish spray knit crochet sketch doodle hum sing chant clap snap dribble paddle surf skate cart pack ship mail sort scan count measure map trace carve sculpt mold forge stitch iron vacuum sweep dust water plant trim harvest chop peel squeeze crack smash build code debug deploy refactor mock test merge rebase ping ponder mutter laugh grin smirk gawk blink daydream plot invent guess decide announce confess approve reject roast curse swear cuss bicker argue negotiate bargain trade borrow return hide reveal uncork uncap unwrap jam collect connect adapt adjust avoid await begin bring call carry catch change check climb close compare confess cook crawl create cross dance decide deliver design destroy divide draw drink drive drop edit enjoy enter escape evolve expand explain explore fade fail fetch fight fill find finish fix float follow force forget gather give glance grab grow guide handle help hike hold hover hunt imagine improve include inform invite join joke jump keep kick knock know leave lift like listen live lock look make march move need open order paint pass pause pick place plan play point pop pour prefer prepare press protect push reach read record relax remove repair replace reply report rescue rest ride ring roll rub run save scan score search seem send settle shape share shift shout show shut sing sit sketch skip sleep slide smile sniff solve sort sound speak spin split sprint stand start stay step stop stretch strike study surf swap swing switch taste teach tell think throw trace trade train travel treat trust turn twist type unlock update use visit wait walk watch wear whisper win wish work write zoom depend survive vanish remain exist continue appear happen allow'
  ));
  VERB_ROOT_SEED_WORDS = uniqueWords(VERB_ROOT_SEED_WORDS.concat(words(
    'accept achieve add admit adopt advise agree ask assume belong break buy cover cut describe disappear discover eat expect face fall feel get happen have hear hit hold keep know learn let lose love mean meet own pay prove put say see seem send set sit speak spend stand stay stop suggest take talk touch understand want'
  )));
  var VERB_ROOT_SEED_SET = makeWordSet(VERB_ROOT_SEED_WORDS);
  var VERB_NOUNISH_SUFFIXES = ['tion', 'sion', 'ment', 'ness', 'ity', 'ship', 'hood', 'ism', 'ist', 'age', 'ence', 'ance'];
  var VERB_HARD_BLOCK = makeWordSet(words(
    'acid actor actress agency album alcohol angel annual answer anyone avenue author award beauty because before beyond biology brother business camera capital century chapter charity cheese chicken citizen coffee college color company country custom culture damage decade degree demand dental doctor dollar double drawing driving during email energy engine entire episode ethics family federal female finance fitness forever freedom friend future gender general grocery guitar habit handle history holiday hundred impact income indeed injury inside island itself junior kidney kitchen language launch league legacy lesson letter little living manual member memory method middle minute modern module monday month mostly mother nature nearly nearby neither network notice number object office option origin parent people person phone photo piece planet policy popular portion power prayer premium present private problem process product project promise proper public purpose quarter random rather rating reason recent record region regular remain remote remove report result review reward rhythm school science season section senior service setting should signal simple sister social source speech square status steady street stress strong studio submit subject success summer sunday supply system target teacher thanks theory thirty though thought thread ticket title today toilet toward travel treaty truly trustuesday tuition unique unlock update upload utility valley variety versus victim video village visual volume wallet wanted warning wealth wedding weekend window winner winter within without wonder worker world writing'
  ));

  function hasVerbInflection(root, set) {
    var forms = [root + 'ing', root + 'ed'];

    if (root.length > 1 && root.slice(-1) === 'e') {
      forms.push(root.slice(0, -1) + 'ing');
      forms.push(root + 'd');
    }

    if (root.length > 1 && root.slice(-1) === 'y' && !/[aeiou]y$/.test(root)) {
      forms.push(root.slice(0, -1) + 'ied');
      forms.push(root + 'ing');
    }

    if (root.length > 2) {
      var c0 = root.charAt(root.length - 3);
      var c1 = root.charAt(root.length - 2);
      var c2 = root.charAt(root.length - 1);
      if (!/[aeiou]/.test(c0) && /[aeiou]/.test(c1) && !/[aeiouwxy]/.test(c2)) {
        forms.push(root + c2 + 'ing');
        forms.push(root + c2 + 'ed');
      }
    }

    for (var i = 0; i < forms.length; i++) {
      if (hasOwn(set, forms[i])) return true;
    }
    return false;
  }

  function isLikelyVerbRoot(word, set) {
    if (word.length < 3 || word.length > 9) return false;
    if (hasOwn(VERB_HARD_BLOCK, word)) return false;
    if (hasAnySuffix(word, VERB_NOUNISH_SUFFIXES)) return false;
    if (word.slice(-2) === 'ly') return false;
    if (hasOwn(VERB_ROOT_SEED_SET, word)) return true;
    if (hasVerbInflection(word, set)) return true;
    return false;
  }

  function toThirdPersonSingular(root) {
    if (root === 'be') return 'is';
    if (root === 'have') return 'has';
    if (root === 'do') return 'does';
    if (root === 'go') return 'goes';
    if (/(s|x|z|ch|sh|o)$/.test(root)) return root + 'es';
    if (/[^aeiou]y$/.test(root)) return root.slice(0, -1) + 'ies';
    return root + 's';
  }

  function buildVerbRoots() {
    var roots = VERB_ROOT_SEED_WORDS.slice();
    for (var i = 0; i < STORY_BASE_WORDS.length; i++) {
      var w = STORY_BASE_WORDS[i];
      if (isLikelyVerbRoot(w, STORY_BASE_SET)) roots.push(w);
    }
    return uniqueWords(roots);
  }

  function buildVerbWords(roots) {
    var verbs = [];
    for (var j = 0; j < roots.length; j++) {
      var form = toThirdPersonSingular(roots[j]);
      if (!STORY_ASCII_RE.test(form)) continue;
      if (form.length < 4 || form.length > 12) continue;
      if (hasOwn(STORY_SFW_EXCLUDE_WORDS, form)) continue;
      verbs.push(form);
    }
    return uniqueWords(verbs);
  }

  var ADJECTIVE_SEED_WORDS = uniqueWords(words(
    'fuzzy neon tiny sleepy crispy golden rubber cosmic wobbly spicy frosty silky mellow zesty dusty glossy noisy sneaky quirky nimble brisk calm brave goofy jazzy gritty shiny stormy sunny misty smoky fluffy prickly chunky bouncy wiry rusty icy peppery sugary salty minty sour bitter soft loud quiet rapid gentle odd fancy dapper clever cheeky scrappy tidy messy classy clumsy snappy glitchy pixel windy lunar solar velvet woolly speedy sturdy thirsty hungry cranky happy moody smug feral noble regal groovy funky silly absurd awkward vivid bright dim muted bold timid narrow broad mighty wee giant mini turbo stealthy sparkly fizzy gummy gooey loopy zippy punchy crunchy spooky kooky snazzy peppy perky rowdy nerdy dorky wonky feisty nifty breezy squishy jolly merry zany wacky sassy saucy tangy jammy toasty nutty citrusy creamy buttery herby glittery candy plush poppy radiant dreamy lanky boozy'
  ));
  var ADJECTIVE_SEED_SET = makeWordSet(ADJECTIVE_SEED_WORDS);
  var ADJECTIVE_SUFFIXES = ['ful', 'less', 'ous', 'ish'];
  var ADJECTIVE_BORING_WORDS = makeWordSet(words(
    'able basic certain common current direct exact final formal general global legal local major minor modern normal official proper public real regular related simple single standard typical usual valid various whole entire former latter neutral random ready recent serious stable superior inferior primary secondary corporate fiscal annual monthly weekly daily hourly digital analog numeric logical physical virtual modular popular private easy calm gentle curious high low payable liable'
  ));

  function isLikelyAdjective(word, set) {
    if (word.length < 3 || word.length > 10) return false;
    if (hasOwn(ADJECTIVE_BORING_WORDS, word)) return false;
    if (hasOwn(ADJECTIVE_SEED_SET, word)) return true;
    if (hasOwn(VERB_ROOT_SET, word)) return false;
    if (hasOwn(VERB_WORD_SET, word)) return false;
    if (hasVerbInflection(word, STORY_BASE_SET)) return false;
    if (hasOwn(set, word + 'ly') && word.length > 3 && word.slice(-2) !== 'ly') return true;
    if (word.slice(-1) === 'y' && hasOwn(set, word.slice(0, -1) + 'ily')) return true;
    if (hasAnySuffix(word, ADJECTIVE_SUFFIXES)) return true;
    return false;
  }

  function buildAdjectiveWords() {
    var out = ADJECTIVE_SEED_WORDS.slice();
    for (var i = 0; i < STORY_BASE_WORDS.length; i++) {
      var w = STORY_BASE_WORDS[i];
      if (isLikelyAdjective(w, STORY_BASE_SET)) out.push(w);
    }
    return uniqueWords(out);
  }

  var TWIST_SEED_WORDS = uniqueWords(words(
    'proudly cheerfully boldly gently brightly suddenly quietly loudly awkwardly wildly gladly neatly warmly softly swiftly slowly shamelessly weirdly playfully bravely eagerly lazily nervously calmly smugly politely gleefully oddly smoothly instantly carefully clumsily happily sadly grumpily sassily frankly plainly totally mostly lightly barely nearly hugely deeply sharply wisely merrily promptly honestly blatantly'
  ));
  var TWIST_BLOCK = makeWordSet(words('family italy july rally fully reply supply only ugly'));

  function isLikelyTwistWord(word) {
    if (word.length < 4 || word.length > 12) return false;
    if (hasOwn(TWIST_BLOCK, word)) return false;
    if (word.slice(-2) !== 'ly') return false;
    return true;
  }

  function buildTwistWords() {
    var out = TWIST_SEED_WORDS.slice();
    for (var i = 0; i < STORY_BASE_WORDS.length; i++) {
      var w = STORY_BASE_WORDS[i];
      if (isLikelyTwistWord(w)) out.push(w);
    }
    return uniqueWords(out);
  }

  var OBJECT_SEED_WORDS = uniqueWords(words(
    'toaster teapot burrito cactus rocket helmet guitar pickle donut muffin lantern scooter lamppost pancake waffle cookie kettle bucket hammer wrench zipper button pillow blanket slipper sandal backpack notebook stapler marker crayon whistle trumpet banjo ukulele tambourine boombox camera tripod compass magnet battery socket cable router modem keyboard mouse joystick gamepad puzzle marble domino kite frisbee skateboard surfboard kayak canoe umbrella raincoat mug goblet spoon fork spatula ladle colander saucepan skillet cupcake pretzel popcorn taco nacho dumpling ravioli baguette croissant bagel pineapple coconut avocado turnip carrot radish pumpkin melon grape cherry peach lemon lime onion garlic celery broccoli spinach tofu ramen sushi bento thermos flask bottle jar vase mirror candle towel soap sponge mop broom vacuum ladder shovel visor scarf mittens jacket poncho pinata confetti kazoo maracas bongos keytar clarinet marimba megaphone monocle beret tiara kimono sombrero jetpack hoverboard boomerang slingshot yoyo lollipop jellybean gumball snowglobe firework sparkler discoball pogo keychain sticker comic postcard teacup mooncake bathbomb goggles rubberduck mochi kimchi'
  ));
  var OBJECT_SEED_SET = makeWordSet(OBJECT_SEED_WORDS);
  var OBJECT_EXCLUDE_WORDS = makeWordSet(words(
    'about above across after again against almost along also among around because before behind below beside between beyond during either enough every maybe might never often other since some someone something their there these thing think those toward under until where while which whose without within unknown known likely likelyly maybe perhaps always usually mostly online offline upward downward inside outside'
  ));
  var OBJECT_BLAND_WORDS = makeWordSet(words(
    'account address agency amount answer area aspect attempt author average benefit capital category century chapter choice citizen client college comment company concept consent context control country county culture data decade degree demand detail device effect effort energy entity entry error example factor feature finance function future goal group history impact income index industry info insight issue item language level limit logic method minute model module moment month number office option output parent people person phase policy problem process product profile project purpose quality quantity quarter reason record region report request result review role section sector service setting signal source standard status subject success support survey system target theory title topic value version volume world another upper lower former latter manager proton ascent filth gory wince glance'
  ));
  var OBJECT_ABSTRACT_SUFFIXES = ['tion', 'sion', 'ness', 'ity', 'ship', 'hood', 'ism', 'ence', 'ance'];

  var VERB_ROOT_WORDS = buildVerbRoots();
  var VERB_ROOT_SET = makeWordSet(VERB_ROOT_WORDS);
  var VERB_WORDS = buildVerbWords(VERB_ROOT_WORDS);
  var VERB_WORD_SET = makeWordSet(VERB_WORDS);
  var ADJECTIVE_WORDS = buildAdjectiveWords();
  var ADJECTIVE_WORD_SET = makeWordSet(ADJECTIVE_WORDS);
  var TWIST_WORDS = buildTwistWords();
  var TWIST_WORD_SET = makeWordSet(TWIST_WORDS);

  function isConjugatedVerbForm(word) {
    if (word.length > 4 && (word.slice(-3) === 'ing' || word.slice(-2) === 'ed')) return true;
    if (word.length > 4 && word.slice(-3) === 'ies') {
      return hasOwn(VERB_ROOT_SET, word.slice(0, -3) + 'y');
    }
    if (word.length > 3 && word.slice(-2) === 'es') {
      var rootEs = word.slice(0, -2);
      if (hasOwn(VERB_ROOT_SET, rootEs)) return true;
      if (hasOwn(VERB_ROOT_SET, rootEs + 'e')) return true;
    }
    if (word.length > 3 && word.slice(-1) === 's') {
      return hasOwn(VERB_ROOT_SET, word.slice(0, -1));
    }
    return false;
  }

  function isLikelyObjectWord(word) {
    if (word.length < 3 || word.length > 10) return false;
    if (hasOwn(OBJECT_SEED_SET, word)) return true;
    if (hasOwn(OBJECT_EXCLUDE_WORDS, word)) return false;
    if (hasOwn(OBJECT_BLAND_WORDS, word)) return false;
    if (hasAnySuffix(word, OBJECT_ABSTRACT_SUFFIXES)) return false;
    if (hasAnySuffix(word, ['ate', 'ize', 'ise'])) return false;
    if (hasAnySuffix(word, ['ous', 'ive', 'ful', 'less', 'ish', 'able', 'ible'])) return false;
    if (word.slice(-2) === 'ly') return false;
    if (hasVerbInflection(word, STORY_BASE_SET)) return false;
    if (isConjugatedVerbForm(word)) return false;
    if (hasOwn(VERB_ROOT_SET, word)) return false;
    if (hasOwn(VERB_WORD_SET, word)) return false;
    if (hasOwn(ADJECTIVE_WORD_SET, word)) return false;
    if (hasOwn(TWIST_WORD_SET, word)) return false;
    if (hasOwn(STORY_COMMON_STOP_WORDS, word)) return false;
    return true;
  }

  function buildObjectWords() {
    var out = OBJECT_SEED_WORDS.slice();
    var dynamic = [];
    for (var i = 0; i < STORY_BASE_WORDS.length; i++) {
      var w = STORY_BASE_WORDS[i];
      if (!isLikelyObjectWord(w)) continue;
      if (!hasOwn(OBJECT_SEED_SET, w)) dynamic.push(w);
    }
    dynamic = capWordPool(dynamic, 900);
    return uniqueWords(out.concat(dynamic));
  }

  var OBJECT_WORDS = buildObjectWords();

  function buildVividAdjectiveWords() {
    var dynamic = [];
    for (var i = 0; i < ADJECTIVE_WORDS.length; i++) {
      var w = ADJECTIVE_WORDS[i];
      if (hasOwn(ADJECTIVE_SEED_SET, w)) continue;
      if (hasAnySuffix(w, ['y', 'ish', 'ous', 'ful', 'less'])) dynamic.push(w);
    }
    dynamic = capWordPool(dynamic, 420);
    return uniqueWords(ADJECTIVE_SEED_WORDS.concat(dynamic));
  }

  function buildVividObjectWords() {
    var dynamic = [];
    for (var i = 0; i < OBJECT_WORDS.length; i++) {
      var w = OBJECT_WORDS[i];
      if (hasOwn(OBJECT_SEED_SET, w)) continue;
      if (w.length < 4 || w.length > 8) continue;
      if (hasOwn(OBJECT_BLAND_WORDS, w)) continue;
      if (hasAnySuffix(w, OBJECT_ABSTRACT_SUFFIXES)) continue;
      dynamic.push(w);
    }
    dynamic = capWordPool(dynamic, 900);
    return uniqueWords(OBJECT_SEED_WORDS.concat(dynamic));
  }

  var ADJECTIVE_VIVID_WORDS = buildVividAdjectiveWords();
  var OBJECT_VIVID_WORDS = buildVividObjectWords();

  var EXTRA_ACTOR_WORDS = uniqueWords(words(
    'actor actress acrobat agent artist athlete baker barber boxer captain chef clerk coach courier dancer diver doctor driver farmer fighter friend guide hacker hero hunter judge knight leader mentor ninja nurse painter pilot pirate poet ranger reader rider runner sailor scout singer skater speaker surfer teacher traveler waiter warrior writer yak zebra rabbit dolphin turtle horse pony donkey wolf bear lion goat sheep owl hawk crow fox swan beagle collie spaniel poodle jaguar leopard panther'
  ));
  var MIXED_ACTOR_WORDS = uniqueWords(CREATURE_ROLE_WORDS.concat(GLOBAL_NAME_WORDS, EXTRA_ACTOR_WORDS));

  var PROFANE_ADJECTIVE_WORDS = uniqueWords(words(
    'shitty damn fucking filthy crappy bitchy horny raunchy nasty'
  ));

  var PROFANE_OBJECT_WORDS = uniqueWords(words(
    'bullshit shitshow asshole dumbass asshat bastard douchebag fuckery'
  ));

  var PROFANE_VERB_WORDS = uniqueWords(words(
    'swears curses cusses fucks bitches'
  ));

  var PROFANE_TWIST_WORDS = uniqueWords(words(
    'damnably shittily fuckingly foully bitchily'
  ));

  var storyState = {
    sfw: 'on',
    schemaId: '',
    patternId: '',
    password: ''
  };

  function randomYear1901to2099() {
    return String(1901 + randomInt(199));
  }

  function randomHalfHour24h() {
    var slot = randomInt(48);
    var hour = Math.floor(slot / 2);
    var minute = slot % 2 === 0 ? '00' : '30';
    var hh = hour < 10 ? '0' + hour : String(hour);
    return hh + ':' + minute;
  }

  function randomOrdinal10to99() {
    var value = 10 + randomInt(90);
    var mod100 = value % 100;
    var mod10 = value % 10;
    var suffix = 'th';
    if (mod100 < 11 || mod100 > 13) {
      if (mod10 === 1) suffix = 'st';
      else if (mod10 === 2) suffix = 'nd';
      else if (mod10 === 3) suffix = 'rd';
    }
    return String(value) + suffix;
  }

  function fillStorySlots(schema, includeTwist) {
    var used = {};
    var slots = {};
    var actorPool = schema.actorPool === 'names' ? GLOBAL_NAME_WORDS : MIXED_ACTOR_WORDS;

    slots.X = pickUnique(actorPool, used);
    slots.V = pickUnique(VERB_WORDS, used);
    slots.R = pick(RELATION_WORDS);
    slots.A = pickBiasedUnique(ADJECTIVE_VIVID_WORDS, ADJECTIVE_WORDS, used, 78);
    slots.O = pickBiasedUnique(OBJECT_VIVID_WORDS, OBJECT_WORDS, used, 72);
    if (includeTwist) {
      slots.T = pickUnique(TWIST_WORDS, used);
    }

    return slots;
  }

  function injectProfanity(slots) {
    var profanityTargets = [];
    if (slots.A) profanityTargets.push('A');
    if (slots.O) profanityTargets.push('O');
    if (slots.V) profanityTargets.push('V');
    if (slots.T) profanityTargets.push('T');
    var target = profanityTargets[randomInt(profanityTargets.length)];
    if (target === 'A') slots.A = pick(PROFANE_ADJECTIVE_WORDS);
    else if (target === 'O') slots.O = pick(PROFANE_OBJECT_WORDS);
    else if (target === 'V') slots.V = pick(PROFANE_VERB_WORDS);
    else slots.T = pick(PROFANE_TWIST_WORDS);
  }

  function renderStoryPassword(data) {
    var order = data.patternId === 'six' ? data.schema.six : data.schema.base;
    var parts = [];

    for (var i = 0; i < order.length; i++) {
      var slot = order[i];
      // Ordinal prepends before the O token (e.g., "43rd-toaster"), not replaces it
      if (data.patternId === 'ordinal' && slot === 'O') {
        parts.push(data.ordinal);
      }
      var token = data.slots[slot];
      if (slot === 'X') token = titleCaseWord(token);
      parts.push(token);
    }

    if (data.patternId === 'year') {
      parts.push('in');
      parts.push(data.year);
    }

    var body = parts.join('-');
    if (data.patternId === 'time') {
      body = 'At-' + data.time24 + '-' + body;
    }

    return body + data.punctuation;
  }

  function generateStoryPassword() {
    var schema = STORY_SCHEMAS[randomInt(STORY_SCHEMAS.length)];
    var patternId = STORY_PATTERNS[randomInt(STORY_PATTERNS.length)];
    var includeTwist = patternId === 'six';
    var slots = fillStorySlots(schema, includeTwist);

    if (storyState.sfw === 'off') {
      injectProfanity(slots);
    }

    var data = {
      schema: schema,
      patternId: patternId,
      slots: slots,
      punctuation: STORY_PUNCTUATION[randomInt(STORY_PUNCTUATION.length)],
      ordinal: '',
      year: '',
      time24: ''
    };

    if (patternId === 'ordinal') data.ordinal = randomOrdinal10to99();
    if (patternId === 'year') data.year = randomYear1901to2099();
    if (patternId === 'time') data.time24 = randomHalfHour24h();

    var password = renderStoryPassword(data);
    storyState.schemaId = schema.id;
    storyState.patternId = patternId;
    storyState.password = password;
    return password;
  }

  // ============================================
  // Entropy Display
  // ============================================

  var GUESSES_PER_SECOND = 1e10;

  function formatSeconds(seconds) {
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
    if (years < 1e15) return '~' + Math.round(years / 1e12) + ' trillion years';
    return 'longer than the age of the universe';
  }

  function formatEntropyDisplay(length, poolSize) {
    if (poolSize === 0 || length === 0) return '';
    var entropy = Math.round(length * Math.log2(poolSize));
    var seconds = Math.pow(2, entropy) / GUESSES_PER_SECOND;
    var timeStr;
    if (!isFinite(seconds)) {
      timeStr = 'longer than the age of the universe';
    } else {
      timeStr = formatSeconds(seconds);
    }
    return '~' + entropy + ' bits \u00B7 10B guesses/s = ' + timeStr + ' (offline GPU attack)';
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
    textarea.value = '';
    document.body.removeChild(textarea);
    return ok;
  }

  // ============================================
  // Favicon
  // ============================================

  var baseFaviconHref = '';
  var THEME_BG = { dark: '#1A1A2E', light: '#F5F3EE' };
  var THEME_FAVICON_COLORS = {
    dark: ['#E8C547', '#7EC8C8', '#E87B6B', '#C49030'],
    light: ['#9B7D0A', '#1A7F7F', '#B5422E', '#8A6510']
  };

  function themeBg() { return isLight ? THEME_BG.light : THEME_BG.dark; }
  function themeFaviconColors() { return isLight ? THEME_FAVICON_COLORS.light : THEME_FAVICON_COLORS.dark; }

  function generateFavicon(text, bgColor, textColors) {
    var S = 64, pad = 4, gap = 2;
    var canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, S, S);

    if (text.length === 4 && Array.isArray(textColors)) {
      // Find largest font where both 2-char rows fit within padding
      var maxW = S - 2 * pad, maxH = S - 2 * pad;
      var fontSize = 44, asc, desc;
      ctx.textBaseline = 'alphabetic';
      while (fontSize > 10) {
        ctx.font = '600 ' + fontSize + 'px "IBM Plex Mono", monospace';
        var w1 = ctx.measureText(text.slice(0, 2)).width;
        var w2 = ctx.measureText(text.slice(2)).width;
        var met = ctx.measureText(text);
        asc = met.actualBoundingBoxAscent;
        desc = met.actualBoundingBoxDescent;
        if (Math.max(w1, w2) <= maxW && 2 * (asc + desc) + gap <= maxH) break;
        fontSize--;
      }
      // Center the two-row block vertically
      var rowH = asc + desc;
      var y0 = (S - (2 * rowH + gap)) / 2;
      var baseline1 = y0 + asc;
      var baseline2 = y0 + rowH + gap + asc;

      ctx.textAlign = 'left';
      var rows = [[0, 1, baseline1], [2, 3, baseline2]];
      for (var r = 0; r < rows.length; r++) {
        var a = rows[r][0], b = rows[r][1], y = rows[r][2];
        var pw = ctx.measureText(text[a] + text[b]).width;
        var x0 = (S - pw) / 2;
        ctx.fillStyle = textColors[a];
        ctx.fillText(text[a], x0, y);
        ctx.fillStyle = textColors[b];
        ctx.fillText(text[b], x0 + ctx.measureText(text[a]).width, y);
      }
    } else {
      // Single-character (checkmark) — centered and large
      ctx.font = '600 40px "IBM Plex Mono", monospace';
      ctx.fillStyle = Array.isArray(textColors) ? textColors[0] : textColors;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, S / 2, S / 2);
    }

    return canvas.toDataURL('image/png');
  }

  var faviconTimer;
  function flashFavicon() {
    var link = document.getElementById('favicon');
    if (!link) return;
    clearTimeout(faviconTimer);
    link.href = generateFavicon('\u2713', themeBg(),
      isLight ? THEME_FAVICON_COLORS.light[0] : THEME_FAVICON_COLORS.dark[0]);
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
  var _scrambleTimers = new WeakMap();

  function scrambleAnimate(el, finalText, callback) {
    // Cancel any in-progress scramble on this element
    if (_scrambleTimers.has(el)) clearInterval(_scrambleTimers.get(el));
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
        _scrambleTimers.delete(el);
        el.classList.remove('scrambling');
        if (callback) callback();
      }
    }, interval);
    _scrambleTimers.set(el, timer);
  }

  // ============================================
  // Slogan Animation Engines
  // ============================================

  var SLOGAN_ANIMS = ['scramble', 'typewriter', 'fade'];

  function animateSloganScramble(el, text) {
    var len = text.length;
    var resolved = new Array(len).fill(false);
    var display = new Array(len);
    var totalFrames = 30;
    var staggerFrames = Math.max(1, Math.floor(totalFrames / len));
    var frame = 0;

    for (var i = 0; i < len; i++) {
      display[i] = text[i] === ' ' ? ' ' : SCRAMBLE_CHARS[randomInt(SCRAMBLE_CHARS.length)];
    }
    el.textContent = display.join('');

    var interval = setInterval(function () {
      frame++;
      for (var i = 0; i < len; i++) {
        if (resolved[i]) continue;
        if (frame >= (i + 1) * staggerFrames) {
          resolved[i] = true;
          display[i] = text[i];
        } else if (text[i] !== ' ') {
          display[i] = SCRAMBLE_CHARS[randomInt(SCRAMBLE_CHARS.length)];
        }
      }
      el.textContent = display.join('');
      if (frame >= totalFrames) clearInterval(interval);
    }, 30);
  }

  function animateSloganTypewriter(el, text) {
    el.textContent = '\u258C';
    var i = 0;
    var interval = setInterval(function () {
      if (i < text.length) {
        el.textContent = text.slice(0, i + 1) + '\u258C';
        i++;
      } else {
        clearInterval(interval);
        setTimeout(function () {
          el.textContent = text;
        }, 800);
      }
    }, 45);
  }

  function animateSloganFade(el, text) {
    el.classList.add('slogan-fade-out');
    setTimeout(function () {
      el.textContent = text;
      el.classList.remove('slogan-fade-out');
      el.classList.add('slogan-fade-in');
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
    renderHighlighted(el, pw);
  }

  function regenerateArchetype(index) {
    var pw = generateArchetype(index);
    if (pw === null) return;

    var row = rows[index];
    var el = row.querySelector('.password-value');

    el.classList.remove('loading');

    scrambleAnimate(el, pw, function () {
      renderHighlighted(el, pw);
    });
    hapticRegenerate();
    announce('Regenerated ' + archetypes[index].name + ' password');
  }

  function regenerateAll() {
    for (var i = 0; i < 5; i++) {
      (function (idx) {
        setTimeout(function () {
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

  // --- Copy toast ---
  var copyToast = document.querySelector('.copy-toast');
  var copyToastShowTimer = null;
  var copyToastHideTimer = null;

  function ensureCopyToast() {
    if (copyToast && copyToast.isConnected) return copyToast;
    copyToast = document.querySelector('.copy-toast');
    if (copyToast && copyToast.isConnected) return copyToast;
    copyToast = document.createElement('div');
    copyToast.className = 'copy-toast';
    copyToast.textContent = 'Copied!';
    copyToast.hidden = true;
    copyToast.setAttribute('role', 'status');
    copyToast.setAttribute('aria-live', 'polite');
    copyToast.setAttribute('aria-atomic', 'true');
    document.body.appendChild(copyToast);
    return copyToast;
  }

  function showCopyToast() {
    var toast = ensureCopyToast();
    if (!toast) return;
    clearTimeout(copyToastShowTimer);
    clearTimeout(copyToastHideTimer);
    toast.hidden = false;
    toast.classList.remove('dismissing');
    toast.classList.remove('visible');
    // Force reflow so transition restarts if already visible
    void toast.offsetHeight;
    toast.classList.add('visible');

    copyToastShowTimer = setTimeout(function () {
      toast.classList.add('dismissing');
      toast.classList.remove('visible');
      copyToastHideTimer = setTimeout(function () {
        toast.hidden = true;
        toast.classList.remove('dismissing');
      }, 200);
    }, 1000);
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
    showCopyToast();
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
  // SFW Toggle (If You Need to Remember It)
  // ============================================

  var sfwToggle = document.querySelector('.sfw-toggle');
  if (sfwToggle) {
    sfwToggle.addEventListener('click', function () {
      var isOn = sfwToggle.classList.toggle('active');
      sfwToggle.setAttribute('aria-checked', String(isOn));
      storyState.sfw = isOn ? 'on' : 'off';
      regenerateArchetype(PASSPHRASE_INDEX);
      announce(isOn ? 'SFW mode on' : 'SFW mode off');
    });
  }

  // ============================================
  // Keyboard Shortcuts
  // ============================================

  document.addEventListener('keydown', function (e) {
    if (modalOpen) return;
    var tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (document.activeElement.getAttribute('role') === 'switch') return;
    if (document.activeElement.getAttribute('role') === 'radio') return;

    var key = e.key;

    var shiftMap = { '!': 0, '@': 1, '#': 2, '$': 3, '%': 4 };

    if (e.shiftKey && hasOwn(shiftMap, key)) {
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
    var enabledCount = 0;

    togglePills.forEach(function (pill) {
      if (pill.getAttribute('aria-checked') === 'true') {
        var key = pill.dataset.charset;
        enabledCount++;
        pool += CHARSETS[key] || '';
      }
    });

    return { pool: pool, enabledCount: enabledCount };
  }

  function getDIYPoolSizeForEntropy() {
    var chars = new Set();
    togglePills.forEach(function (pill) {
      if (pill.getAttribute('aria-checked') === 'true') {
        var key = pill.dataset.charset;
        var set = CHARSETS[key] || '';
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
    var entropyEl = diyOutput.querySelector('.diy-entropy');
    var length = parseInt(diySlider.value, 10);
    var poolSize = getDIYPoolSizeForEntropy();

    if (diyPassword) {
      renderHighlighted(el, diyPassword);
      el.classList.remove('loading');
      entropyEl.textContent = formatEntropyDisplay(length, poolSize);
    } else {
      el.textContent = '\u2014';
      el.classList.add('loading');
      entropyEl.textContent = '';
    }
  }

  function updateDIY() {
    generateDIY();
    renderDIY();
  }

  function updateSliderFill() {
    var min = parseFloat(diySlider.min);
    var max = parseFloat(diySlider.max);
    var val = parseFloat(diySlider.value);
    var pct = ((val - min) / (max - min)) * 100;
    var styles = getComputedStyle(document.documentElement);
    var accent = styles.getPropertyValue('--accent').trim();
    var surface = styles.getPropertyValue('--surface').trim();
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

  function enforceCumulativeTiers(changedKey, newState) {
    var tierOrder = ['safe', 'more', 'full'];
    var idx = tierOrder.indexOf(changedKey);
    if (idx === -1) return;

    if (newState) {
      // Enabling: auto-enable all lower tiers
      for (var i = 0; i < idx; i++) {
        var p = document.querySelector('.toggle-pill[data-charset="' + tierOrder[i] + '"]');
        if (p) p.setAttribute('aria-checked', 'true');
      }
    } else {
      // Disabling: auto-disable all higher tiers
      for (var i = idx + 1; i < tierOrder.length; i++) {
        var p = document.querySelector('.toggle-pill[data-charset="' + tierOrder[i] + '"]');
        if (p) p.setAttribute('aria-checked', 'false');
      }
    }
  }

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

      var newState = !isChecked;
      pill.setAttribute('aria-checked', newState ? 'true' : 'false');

      // Enforce cumulative tiers for symbol pills
      enforceCumulativeTiers(pill.dataset.charset, newState);

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
    var entropyEl = diyOutput.querySelector('.diy-entropy');
    var length = parseInt(diySlider.value, 10);
    var poolSize = getDIYPoolSizeForEntropy();
    entropyEl.textContent = formatEntropyDisplay(length, poolSize);
    scrambleAnimate(el, diyPassword, function () {
      renderHighlighted(el, diyPassword);
    });
    hapticRegenerate();
    announce('Regenerated custom password');
  });

  // ============================================
  // Slogan Rotation
  // ============================================

  function startSloganRotation() {
    clearInterval(sloganRotationTimer);
    sloganRotationTimer = setInterval(function () {
      animateSlogan(sloganEl, randomSlogan(), SLOGAN_ANIMS[randomInt(SLOGAN_ANIMS.length)]);
    }, 10000);

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        clearInterval(sloganRotationTimer);
        sloganRotationTimer = null;
      } else {
        animateSlogan(sloganEl, randomSlogan(), SLOGAN_ANIMS[randomInt(SLOGAN_ANIMS.length)]);
        clearInterval(sloganRotationTimer);
        sloganRotationTimer = setInterval(function () {
          animateSlogan(sloganEl, randomSlogan(), SLOGAN_ANIMS[randomInt(SLOGAN_ANIMS.length)]);
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
      // Shouldn't happen during normal flow, but keep cascade resilient.
      setTimeout(function () {
        cascadeRows(index + 1, callback);
      }, 80);
      return;
    }

    el.classList.remove('loading');
    scrambleAnimate(el, pw, function () {
      renderHighlighted(el, pw);
    });

    setTimeout(function () {
      cascadeRows(index + 1, callback);
    }, 80);
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
        renderArchetype(i);
      }
      renderDIY();
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
            fadeInSlogan(randomSlogan());
            startSloganRotation();
          });
        }, 150);
      });
    });
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
      document.querySelector('meta[name="theme-color"]').content = themeBg();
      // Update slider fill for new theme colors
      updateSliderFill();
      // Regenerate favicon with theme colors
      baseFaviconHref = generateFavicon('mkpw', themeBg(), themeFaviconColors());
      document.getElementById('favicon').href = baseFaviconHref;
    });
  }

  // ============================================
  // Info Modal
  // ============================================

  var infoBtn = document.querySelector('.btn-info');
  var infoModal = document.querySelector('.info-modal');
  var infoBackdrop = infoModal.querySelector('.info-backdrop');
  var infoCloseBtn = infoModal.querySelector('.btn-info-close');
  var modalOpen = false;

  function openInfoModal() {
    modalOpen = true;
    infoModal.removeAttribute('hidden');
    infoModal.offsetHeight; // eslint-disable-line no-unused-expressions
    infoModal.classList.add('visible');
    document.body.style.overflow = 'hidden';
    document.querySelector('main').setAttribute('aria-hidden', 'true');
    document.querySelector('footer').setAttribute('aria-hidden', 'true');
    infoCloseBtn.focus();
  }

  function closeInfoModal() {
    modalOpen = false;
    infoModal.classList.remove('visible');
    document.body.style.overflow = '';
    document.querySelector('main').removeAttribute('aria-hidden');
    document.querySelector('footer').removeAttribute('aria-hidden');
    setTimeout(function () {
      if (!modalOpen) {
        infoModal.setAttribute('hidden', '');
      }
    }, 200);
    infoBtn.focus();
  }

  function trapFocus(e) {
    if (!modalOpen) return;
    var focusable = Array.prototype.slice.call(
      infoModal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    );
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  infoBtn.addEventListener('click', openInfoModal);
  infoBackdrop.addEventListener('click', closeInfoModal);
  infoCloseBtn.addEventListener('click', closeInfoModal);

  infoModal.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeInfoModal();
      return;
    }
    if (e.key === 'Tab') {
      trapFocus(e);
    }
  });

  // ============================================
  // Initialization
  // ============================================

  function init() {
    // Generate all archetypes immediately.
    for (var i = 0; i < archetypes.length; i++) {
      generateArchetype(i);
    }

    // Generate DIY password (data ready before boot)
    generateDIY();

    // Set up favicon once fonts are loaded
    document.fonts.ready.then(function () {
      baseFaviconHref = generateFavicon('mkpw', themeBg(), themeFaviconColors());
      var link = document.getElementById('favicon');
      if (link) link.href = baseFaviconHref;
    });

    // Initialize slider fill indicator
    updateSliderFill();

    // Run boot sequence (visual only — data and handlers already attached)
    bootSequence();

  }

  init();
})();
