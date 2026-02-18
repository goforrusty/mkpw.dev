#!/usr/bin/env node
/**
 * build-wordlist.js
 *
 * Curates a high-quality passphrase wordlist from multiple sources.
 * Sources: EFF Large, EFF Short 1, BIP39
 * Filters: length 4-7, common English (top-20k frequency), no profanity,
 *          no near-homophones, alphabetic only.
 * Target: 4,096-5,000 words (12.0-12.3 bits/word)
 *
 * Usage: node scripts/build-wordlist.js
 * Output: js/wordlist.js
 */

var fs = require('fs');
var path = require('path');

var ROOT = path.resolve(__dirname, '..');
var SOURCES_DIR = path.join(__dirname, 'wordlist-sources');

// ============================================
// Load source wordlists
// ============================================

function loadEFF(filename) {
  var text = fs.readFileSync(path.join(SOURCES_DIR, filename), 'utf8');
  return text.trim().split('\n').map(function (line) {
    // EFF format: "11111\tabacus" or just "word"
    var parts = line.split('\t');
    return parts.length > 1 ? parts[1].trim().toLowerCase() : parts[0].trim().toLowerCase();
  }).filter(Boolean);
}

function loadPlain(filename) {
  var text = fs.readFileSync(path.join(SOURCES_DIR, filename), 'utf8');
  return text.trim().split('\n').map(function (w) {
    return w.trim().toLowerCase();
  }).filter(Boolean);
}

// ============================================
// Profanity list (common English profanity — exact match only)
// ============================================

var PROFANITY = new Set([
  'anal', 'anus', 'arse', 'arses', 'bastard', 'bitch', 'bloody', 'blowjob',
  'bollock', 'boob', 'boobs', 'bugger', 'bum', 'butt', 'cock', 'cocks',
  'coon', 'crap', 'cunt', 'cunts', 'damn', 'damned', 'dick', 'dicks',
  'dildo', 'dyke', 'fag', 'fags', 'fagot', 'feck', 'felch', 'fuck',
  'fucked', 'fucker', 'fucking', 'fudge', 'flange', 'gook', 'hell',
  'homo', 'hore', 'jerk', 'jizz', 'kike', 'knob', 'labia', 'lmao',
  'lmfao', 'minge', 'muff', 'niga', 'nigga', 'nigger', 'nob', 'nude',
  'nudes', 'omg', 'penis', 'pimp', 'piss', 'poop', 'porn', 'porno',
  'prick', 'pube', 'pubes', 'pussy', 'queer', 'rape', 'raped', 'rapist',
  'rectum', 'retard', 'rimjob', 'schlong', 'screw', 'semen', 'sex',
  'sexy', 'shaft', 'shit', 'shits', 'shitty', 'skank', 'slag', 'slut',
  'sluts', 'smegma', 'sperm', 'spunk', 'tit', 'tits', 'tosser', 'turd',
  'twat', 'vagina', 'wank', 'wanker', 'whore', 'wtf'
]);

// ============================================
// Near-homophone pairs (remove second of each pair)
// ============================================

var HOMOPHONE_REMOVE = new Set([
  // affect/effect — keep "affect"
  'effect',
  // desert/dessert — keep "desert"
  'dessert',
  // accept/except — keep "accept"
  'except',
  // brake/break — keep "break"
  'brake',
  // peace/piece — keep "piece"
  'peace',
  // plain/plane — keep "plane"
  'plain',
  // than/then — keep "then"
  'than',
  // hear/here — keep "here"
  'hear',
  // right/write — keep "write"
  'right',
  // night/knight — keep "night"
  'knight',
  // flour/flower — keep "flower"
  'flour',
  // bear/bare — keep "bear"
  'bare',
  // mail/male — keep "male"
  'mail',
  // sail/sale — keep "sale"
  'sail',
  // tail/tale — keep "tale"
  'tail',
  // wait/weight — keep "wait"
  'weight',
  // weak/week — keep "week"
  'weak',
  // steal/steel — keep "steel"
  'steal',
  // stair/stare — keep "stare"
  'stair',
  // rain/reign — keep "rain"
  'reign',
  // vain/vein — keep "vein"
  'vain',
  // waist/waste — keep "waste"
  'waist',
  // pair/pear — keep "pair"
  'pear',
  // die/dye — keep "dye"
  'die',
  // deer/dear — keep "dear"
  'deer',
  // wore/war — keep "war" (not true homophones, skip)
  // isle/aisle — keep "aisle"
  'isle',
  // heal/heel — keep "heel"
  'heal',
  // meat/meet — keep "meet"
  'meat',
  // sea/see — too short, both <4 chars
  // hole/whole — keep "whole"
  'hole',
  // role/roll — keep "roll"
  'role',
  // sole/soul — keep "soul"
  'sole',
  // stake/steak — keep "steak"
  'stake',
  // tied/tide — keep "tide"
  'tied',
  // wade/weighed — keep "wade"
  // nose/knows — keep "nose"
  'knows',
  // bored/board — keep "board"
  'bored',
  // maid/made — keep "made"
  'maid',
]);

// ============================================
// Ambiguous / hard-to-spell words
// ============================================

var HARD_TO_SPELL = new Set([
  'acquire', 'amateur', 'believe', 'bizarre',
  'bureau', 'colonel', 'gauge', 'hygiene',
  'leisure', 'liaison', 'license', 'maneuver',
  'memento', 'mischief', 'nausea', 'occurred',
  'pharaoh', 'plateau', 'receipt', 'rhythm',
  'science', 'seizure', 'special', 'vacuum',
  'weird', 'queue', 'quiche', 'cliche',
  'debris', 'faux', 'genre', 'niche',
  'psyche', 'psalm', 'subtle', 'sword',
  'wraith', 'wrath', 'knack', 'gnash',
  'gnome', 'gnat', 'kneel', 'knelt',
  'pneum', 'pseudo'
]);

// ============================================
// Main build
// ============================================

// Load sources
var effLarge = loadEFF('eff-large.txt');
var effShort1 = loadEFF('eff-short1.txt');
var bip39 = loadPlain('bip39.txt');
var google20k = loadPlain('google-20k.txt');

console.log('Source counts:');
console.log('  EFF Large:  ' + effLarge.length);
console.log('  EFF Short1: ' + effShort1.length);
console.log('  BIP39:      ' + bip39.length);
console.log('  Google 20k: ' + google20k.length);

// Build frequency set (top 20k — already ranked)
var frequencySet = new Set(google20k);

// Merge all sources, deduplicate
var allWords = new Set();
effLarge.forEach(function (w) { allWords.add(w); });
effShort1.forEach(function (w) { allWords.add(w); });
bip39.forEach(function (w) { allWords.add(w); });

// Track all source words (EFF + BIP39 — all curated for passphrase use)
var allSourceWords = new Set();
effLarge.forEach(function (w) { allSourceWords.add(w); });
effShort1.forEach(function (w) { allSourceWords.add(w); });
bip39.forEach(function (w) { allSourceWords.add(w); });

console.log('\nMerged unique: ' + allWords.size);

// Filter pipeline
var filtered = [];
var stats = {
  tooShort: 0,
  tooLong: 0,
  notAlpha: 0,
  notCommon: 0,
  profanity: 0,
  homophone: 0,
  hardSpell: 0,
  passed: 0
};

allWords.forEach(function (word) {
  // Length filter: 4-7 chars
  if (word.length < 4) { stats.tooShort++; return; }
  if (word.length > 7) { stats.tooLong++; return; }

  // Alpha only (no hyphens, apostrophes, numbers)
  if (!/^[a-z]+$/.test(word)) { stats.notAlpha++; return; }

  // Common word filter — prefer words in top 20k frequency list
  // All passphrase source words (EFF, BIP39) pass since they were already curated
  // This filter only catches words not in any source AND not in frequency list
  // (currently all candidates are from source lists, so this is a no-op —
  //  kept for future-proofing if we add raw word sources)
  if (!frequencySet.has(word) && !allSourceWords.has(word)) { stats.notCommon++; return; }

  // Profanity filter (exact match)
  if (PROFANITY.has(word)) { stats.profanity++; return; }

  // Near-homophone filter
  if (HOMOPHONE_REMOVE.has(word)) { stats.homophone++; return; }

  // Hard to spell filter
  if (HARD_TO_SPELL.has(word)) { stats.hardSpell++; return; }

  stats.passed++;
  filtered.push(word);
});

// Priority scoring: higher = more memorable/common
// Tier 1: In Google 20k frequency list (known common words)
// Tier 2: In BIP39 or EFF Short (curated for memorability, may not be in Google 20k)
// Tier 3: EFF Large only (may be less common)
// Within each tier, prefer shorter words (4-5 chars over 6-7)
filtered.sort(function (a, b) {
  var aFreq = frequencySet.has(a);
  var bFreq = frequencySet.has(b);
  var aCurated = allSourceWords.has(a) && (bip39.indexOf(a) !== -1 || effShort1.indexOf(a) !== -1);
  var bCurated = allSourceWords.has(b) && (bip39.indexOf(b) !== -1 || effShort1.indexOf(b) !== -1);

  // Tier priority: frequency > curated > other
  var aTier = aFreq ? 0 : (aCurated ? 1 : 2);
  var bTier = bFreq ? 0 : (bCurated ? 1 : 2);

  if (aTier !== bTier) return aTier - bTier;
  // Within same tier, prefer shorter words
  if (a.length !== b.length) return a.length - b.length;
  // Alphabetical as tiebreaker
  return a < b ? -1 : 1;
});

// Trim to target if above max
var TARGET = 4096;
if (filtered.length > TARGET) {
  console.log('\nTrimming from ' + filtered.length + ' to ' + TARGET + ' (removed least common words)');
  filtered = filtered.slice(0, TARGET);
}

// Re-sort alphabetically for output
filtered.sort();

console.log('\nFilter stats:');
console.log('  Too short (<4):   ' + stats.tooShort);
console.log('  Too long (>7):    ' + stats.tooLong);
console.log('  Non-alpha:        ' + stats.notAlpha);
console.log('  Not common:       ' + stats.notCommon);
console.log('  Profanity:        ' + stats.profanity);
console.log('  Homophone:        ' + stats.homophone);
console.log('  Hard to spell:    ' + stats.hardSpell);
console.log('  Passed:           ' + stats.passed);

// Check target range
var wordCount = filtered.length;
var bitsPerWord = Math.log2(wordCount);

console.log('\n=== RESULT ===');
console.log('Word count:    ' + wordCount);
console.log('Bits/word:     ' + bitsPerWord.toFixed(2));
console.log('4-word phrase: ~' + (bitsPerWord * 4).toFixed(1) + ' bits');

if (wordCount < 4096) {
  console.log('\nWARNING: Below 4,096 target. Consider relaxing filters.');
  console.log('Increasing frequency threshold or removing hard-to-spell filter may help.');
}

if (wordCount > 5000) {
  console.log('\nNote: Above 5,000. Consider tightening filters for higher quality.');
}

// Write output
var header = '// Curated wordlist (' + wordCount + ' words, ~' + bitsPerWord.toFixed(1) + ' bits/word)';
header += '\n// Sources: EFF Large, EFF Short, BIP39 — filtered for memorability';
header += '\n// Generated by scripts/build-wordlist.js';
var output = header + '\nwindow.WORDLIST="' + filtered.join('\\n') + '";\n';

fs.writeFileSync(path.join(ROOT, 'js', 'wordlist.js'), output, 'utf8');
console.log('\nWritten to js/wordlist.js');

// Print sample words
console.log('\nSample words (first 30):');
console.log('  ' + filtered.slice(0, 30).join(', '));
console.log('\nSample words (random 30):');
var sample = [];
for (var i = 0; i < 30; i++) {
  sample.push(filtered[Math.floor(Math.random() * filtered.length)]);
}
console.log('  ' + sample.join(', '));
