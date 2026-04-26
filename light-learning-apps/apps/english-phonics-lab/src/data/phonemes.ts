export type PhonemeType =
  | "short-vowel"
  | "long-vowel"
  | "diphthong"
  | "r-controlled-vowel"
  | "weak-vowel"
  | "consonant";

export type SpellingPattern = {
  grapheme: string;
  examples: string[];
  note?: string;
};

export type WordExample = {
  word: string;
  pattern: string;
  level: 1 | 2 | 3;
  audioKey?: string;
};

export type MinimalPair = {
  targetWord: string;
  contrastWord: string;
  contrastPhonemeId: string;
};

export type Phoneme = {
  id: string;
  ipa: string;
  label: string;
  type: PhonemeType;
  day: number;
  soundHint: string;
  mouthHint: string;
  mouthSteps: string[];
  spellingPatterns: SpellingPattern[];
  exampleWords: WordExample[];
  confusableWith: string[];
  minimalPairs: MinimalPair[];
  teacherNote?: string;
};

const words = (items: Array<[string, string, 1 | 2 | 3]>): WordExample[] =>
  items.map(([word, pattern, level]) => ({ word, pattern, level }));

export const phonemes: Phoneme[] = [
  {
    id: "short-i",
    ipa: "/ɪ/",
    label: "i / y",
    type: "short-vowel",
    day: 1,
    soundHint: "A short, light sound. Do not stretch it into ee.",
    mouthHint: "Keep the lips relaxed and the tongue high but loose.",
    mouthSteps: ["Relax the lips.", "Lift the tongue lightly.", "Release a quick sound."],
    spellingPatterns: [
      { grapheme: "i", examples: ["sit", "ship", "thin"] },
      { grapheme: "y", examples: ["gym", "symbol"] }
    ],
    exampleWords: words([
      ["sit", "i", 1],
      ["ship", "i", 1],
      ["thin", "i", 2],
      ["gym", "y", 2]
    ]),
    confusableWith: ["long-ee"],
    minimalPairs: [{ targetWord: "ship", contrastWord: "sheep", contrastPhonemeId: "long-ee" }]
  },
  {
    id: "long-ee",
    ipa: "/i:/",
    label: "ee / ea / e",
    type: "long-vowel",
    day: 2,
    soundHint: "A long, clear high vowel.",
    mouthHint: "Smile slightly and hold the sound.",
    mouthSteps: ["Smile a little.", "Keep the tongue high.", "Hold the vowel steadily."],
    spellingPatterns: [
      { grapheme: "ee", examples: ["see", "tree", "green"] },
      { grapheme: "ea", examples: ["tea", "teacher", "read"] },
      { grapheme: "e", examples: ["me", "he", "she"] }
    ],
    exampleWords: words([
      ["see", "ee", 1],
      ["tree", "ee", 1],
      ["teacher", "ea", 2],
      ["me", "e", 1]
    ]),
    confusableWith: ["short-i"],
    minimalPairs: [{ targetWord: "sheep", contrastWord: "ship", contrastPhonemeId: "short-i" }]
  },
  {
    id: "short-e",
    ipa: "/e/",
    label: "e / ea",
    type: "short-vowel",
    day: 3,
    soundHint: "A short open front sound.",
    mouthHint: "Open more than /ɪ/, but do not drop into /æ/.",
    mouthSteps: ["Open the jaw gently.", "Keep the tongue forward.", "Make the sound short."],
    spellingPatterns: [
      { grapheme: "e", examples: ["pen", "red", "ten"] },
      { grapheme: "ea", examples: ["head", "bread"] }
    ],
    exampleWords: words([
      ["pen", "e", 1],
      ["red", "e", 1],
      ["head", "ea", 2],
      ["bread", "ea", 2]
    ]),
    confusableWith: ["short-a"],
    minimalPairs: [{ targetWord: "pen", contrastWord: "pan", contrastPhonemeId: "short-a" }]
  },
  {
    id: "short-a",
    ipa: "/æ/",
    label: "a",
    type: "short-vowel",
    day: 4,
    soundHint: "A wider short vowel.",
    mouthHint: "Open the mouth wider and keep the tongue low-front.",
    mouthSteps: ["Open wide.", "Keep the tongue forward.", "Release quickly."],
    spellingPatterns: [{ grapheme: "a", examples: ["cat", "map", "black"] }],
    exampleWords: words([
      ["cat", "a", 1],
      ["map", "a", 1],
      ["black", "a", 2],
      ["hand", "a", 2]
    ]),
    confusableWith: ["short-e"],
    minimalPairs: [{ targetWord: "pan", contrastWord: "pen", contrastPhonemeId: "short-e" }]
  },
  {
    id: "short-u",
    ipa: "/ʌ/",
    label: "u / o / ou",
    type: "short-vowel",
    day: 5,
    soundHint: "A short central vowel.",
    mouthHint: "Keep the mouth relaxed, not rounded.",
    mouthSteps: ["Relax the lips.", "Open the jaw a little.", "Keep the sound short."],
    spellingPatterns: [
      { grapheme: "u", examples: ["cup", "sun", "duck"] },
      { grapheme: "o", examples: ["son", "come"] },
      { grapheme: "ou", examples: ["young", "touch"] }
    ],
    exampleWords: words([
      ["cup", "u", 1],
      ["sun", "u", 1],
      ["come", "o", 2],
      ["young", "ou", 2]
    ]),
    confusableWith: ["ar"],
    minimalPairs: [{ targetWord: "cup", contrastWord: "carp", contrastPhonemeId: "ar" }]
  },
  {
    id: "ar",
    ipa: "/ɑ:/",
    label: "ar / a",
    type: "r-controlled-vowel",
    day: 6,
    soundHint: "A long open back vowel.",
    mouthHint: "Open low and hold the sound.",
    mouthSteps: ["Drop the jaw.", "Keep the tongue low.", "Hold the vowel."],
    spellingPatterns: [
      { grapheme: "ar", examples: ["car", "star", "farm"] },
      { grapheme: "a", examples: ["father", "class"] }
    ],
    exampleWords: words([
      ["car", "ar", 1],
      ["star", "ar", 1],
      ["farm", "ar", 2],
      ["father", "a", 2]
    ]),
    confusableWith: ["short-u"],
    minimalPairs: [{ targetWord: "cart", contrastWord: "cut", contrastPhonemeId: "short-u" }]
  },
  {
    id: "short-o",
    ipa: "/ɒ/",
    label: "o / a",
    type: "short-vowel",
    day: 7,
    soundHint: "A short rounded open vowel.",
    mouthHint: "Open the jaw and keep a light round shape.",
    mouthSteps: ["Open low.", "Round the lips slightly.", "Keep it short."],
    spellingPatterns: [
      { grapheme: "o", examples: ["hot", "shop", "clock"] },
      { grapheme: "a", examples: ["watch", "want"] }
    ],
    exampleWords: words([
      ["hot", "o", 1],
      ["shop", "o", 1],
      ["clock", "o", 2],
      ["watch", "a", 2]
    ]),
    confusableWith: ["long-oa"],
    minimalPairs: [{ targetWord: "not", contrastWord: "note", contrastPhonemeId: "long-oa" }]
  },
  {
    id: "long-oa",
    ipa: "/əʊ/",
    label: "oa / ow / o",
    type: "diphthong",
    day: 8,
    soundHint: "A glide from relaxed to rounded.",
    mouthHint: "Start relaxed, then round the lips.",
    mouthSteps: ["Start central.", "Move toward oo.", "Finish rounded."],
    spellingPatterns: [
      { grapheme: "oa", examples: ["boat", "road", "coat"] },
      { grapheme: "ow", examples: ["snow", "window"] },
      { grapheme: "o", examples: ["home", "go"] }
    ],
    exampleWords: words([
      ["boat", "oa", 1],
      ["road", "oa", 1],
      ["snow", "ow", 2],
      ["home", "o", 1]
    ]),
    confusableWith: ["short-o", "ow"],
    minimalPairs: [{ targetWord: "note", contrastWord: "not", contrastPhonemeId: "short-o" }]
  },
  {
    id: "oo-long",
    ipa: "/u:/",
    label: "oo / ue / ew",
    type: "long-vowel",
    day: 9,
    soundHint: "A long rounded high vowel.",
    mouthHint: "Round the lips and hold.",
    mouthSteps: ["Round the lips.", "Keep the tongue high-back.", "Hold steadily."],
    spellingPatterns: [
      { grapheme: "oo", examples: ["moon", "food"] },
      { grapheme: "ue", examples: ["blue", "true"] },
      { grapheme: "ew", examples: ["new", "flew"] }
    ],
    exampleWords: words([
      ["moon", "oo", 1],
      ["food", "oo", 1],
      ["blue", "ue", 2],
      ["new", "ew", 2]
    ]),
    confusableWith: ["oo-short"],
    minimalPairs: [{ targetWord: "fool", contrastWord: "full", contrastPhonemeId: "oo-short" }]
  },
  {
    id: "oo-short",
    ipa: "/ʊ/",
    label: "oo / u",
    type: "short-vowel",
    day: 10,
    soundHint: "A short rounded vowel.",
    mouthHint: "Round less than /u:/ and keep it brief.",
    mouthSteps: ["Round softly.", "Keep the tongue high-back.", "Release quickly."],
    spellingPatterns: [
      { grapheme: "oo", examples: ["book", "look", "good"] },
      { grapheme: "u", examples: ["put", "push"] }
    ],
    exampleWords: words([
      ["book", "oo", 1],
      ["look", "oo", 1],
      ["good", "oo", 2],
      ["put", "u", 2]
    ]),
    confusableWith: ["oo-long"],
    minimalPairs: [{ targetWord: "full", contrastWord: "fool", contrastPhonemeId: "oo-long" }]
  },
  {
    id: "er",
    ipa: "/ɜ:/",
    label: "er / ir / ur",
    type: "r-controlled-vowel",
    day: 11,
    soundHint: "A long central vowel.",
    mouthHint: "Keep the mouth relaxed and hold the center sound.",
    mouthSteps: ["Relax lips.", "Keep tongue central.", "Hold the vowel."],
    spellingPatterns: [
      { grapheme: "er", examples: ["her", "term"] },
      { grapheme: "ir", examples: ["bird", "girl"] },
      { grapheme: "ur", examples: ["turn", "nurse"] }
    ],
    exampleWords: words([
      ["her", "er", 1],
      ["bird", "ir", 1],
      ["turn", "ur", 2],
      ["nurse", "ur", 2]
    ]),
    confusableWith: ["schwa"],
    minimalPairs: [{ targetWord: "bird", contrastWord: "about", contrastPhonemeId: "schwa" }]
  },
  {
    id: "schwa",
    ipa: "/ə/",
    label: "weak vowel",
    type: "weak-vowel",
    day: 12,
    soundHint: "A weak relaxed vowel in unstressed syllables.",
    mouthHint: "Let the mouth relax; do not make a strong vowel.",
    mouthSteps: ["Relax fully.", "Use a tiny central sound.", "Keep it unstressed."],
    spellingPatterns: [
      { grapheme: "a", examples: ["about", "sofa"] },
      { grapheme: "e", examples: ["open", "taken"] },
      { grapheme: "er", examples: ["teacher", "mother"] }
    ],
    exampleWords: words([
      ["about", "a", 1],
      ["sofa", "a", 1],
      ["open", "e", 2],
      ["teacher", "er", 2]
    ]),
    confusableWith: ["er"],
    minimalPairs: [{ targetWord: "about", contrastWord: "bird", contrastPhonemeId: "er" }]
  },
  {
    id: "air",
    ipa: "/eə/",
    label: "air / ear / are",
    type: "diphthong",
    day: 13,
    soundHint: "A glide from /e/ toward a relaxed /ə/.",
    mouthHint: "Open gently, then let the jaw and tongue relax.",
    mouthSteps: ["Start with /e/.", "Relax the jaw.", "Fade toward /ə/."],
    spellingPatterns: [
      { grapheme: "air", examples: ["hair", "chair", "stairs"] },
      { grapheme: "ear", examples: ["pear", "bear", "wear"] },
      { grapheme: "are", examples: ["care", "share", "square"] }
    ],
    exampleWords: words([
      ["hair", "air", 1],
      ["chair", "air", 1],
      ["pear", "ear", 2],
      ["where", "ere", 2]
    ]),
    confusableWith: ["ear"],
    minimalPairs: [{ targetWord: "hair", contrastWord: "here", contrastPhonemeId: "ear" }]
  },
  {
    id: "ear",
    ipa: "/ɪə/",
    label: "ear / eer",
    type: "diphthong",
    day: 14,
    soundHint: "A glide from short /ɪ/ toward /ə/.",
    mouthHint: "Start narrow, then relax.",
    mouthSteps: ["Start with /ɪ/.", "Keep it light.", "Relax toward /ə/."],
    spellingPatterns: [
      { grapheme: "ear", examples: ["ear", "near", "clear"] },
      { grapheme: "eer", examples: ["deer", "cheer"] },
      { grapheme: "ere", examples: ["here", "sphere"] }
    ],
    exampleWords: words([
      ["ear", "ear", 1],
      ["near", "ear", 1],
      ["deer", "eer", 2],
      ["here", "ere", 2]
    ]),
    confusableWith: ["air"],
    minimalPairs: [{ targetWord: "here", contrastWord: "hair", contrastPhonemeId: "air" }]
  },
  {
    id: "ai",
    ipa: "/eɪ/",
    label: "ai / ay / a-e",
    type: "diphthong",
    day: 15,
    soundHint: "A glide from /e/ toward /ɪ/.",
    mouthHint: "Start open-front and finish higher.",
    mouthSteps: ["Start at /e/.", "Lift the tongue.", "Finish lighter."],
    spellingPatterns: [
      { grapheme: "ai", examples: ["rain", "train"] },
      { grapheme: "ay", examples: ["day", "play"] },
      { grapheme: "a-e", examples: ["cake", "name"] }
    ],
    exampleWords: words([
      ["rain", "ai", 1],
      ["train", "ai", 1],
      ["play", "ay", 1],
      ["cake", "a-e", 2]
    ]),
    confusableWith: ["short-e"],
    minimalPairs: [{ targetWord: "late", contrastWord: "let", contrastPhonemeId: "short-e" }]
  },
  {
    id: "ow",
    ipa: "/aʊ/",
    label: "ow / ou",
    type: "diphthong",
    day: 16,
    soundHint: "A glide from open /a/ toward rounded /ʊ/.",
    mouthHint: "Open first, then round.",
    mouthSteps: ["Open wide.", "Move upward.", "Finish rounded."],
    spellingPatterns: [
      { grapheme: "ow", examples: ["cow", "now"] },
      { grapheme: "ou", examples: ["out", "cloud"] }
    ],
    exampleWords: words([
      ["cow", "ow", 1],
      ["now", "ow", 1],
      ["out", "ou", 1],
      ["cloud", "ou", 2]
    ]),
    confusableWith: ["long-oa"],
    minimalPairs: [{ targetWord: "now", contrastWord: "no", contrastPhonemeId: "long-oa" }]
  },
  {
    id: "oi",
    ipa: "/ɔɪ/",
    label: "oi / oy",
    type: "diphthong",
    day: 17,
    soundHint: "A glide from rounded /ɔ/ toward /ɪ/.",
    mouthHint: "Round first, then lift toward a light finish.",
    mouthSteps: ["Start rounded.", "Move forward.", "Finish light."],
    spellingPatterns: [
      { grapheme: "oi", examples: ["coin", "boil"] },
      { grapheme: "oy", examples: ["boy", "toy"] }
    ],
    exampleWords: words([
      ["coin", "oi", 1],
      ["boil", "oi", 2],
      ["boy", "oy", 1],
      ["toy", "oy", 1]
    ]),
    confusableWith: ["short-o"],
    minimalPairs: [{ targetWord: "boy", contrastWord: "bore", contrastPhonemeId: "short-o" }]
  },
  {
    id: "th-voiceless",
    ipa: "/θ/",
    label: "th",
    type: "consonant",
    day: 18,
    soundHint: "A quiet th with air.",
    mouthHint: "Place the tongue lightly between the teeth.",
    mouthSteps: ["Tongue touches teeth.", "No voice.", "Let air pass."],
    spellingPatterns: [{ grapheme: "th", examples: ["thin", "three", "bath"] }],
    exampleWords: words([
      ["thin", "th", 1],
      ["three", "th", 1],
      ["bath", "th", 2],
      ["think", "th", 1]
    ]),
    confusableWith: ["sh"],
    minimalPairs: [{ targetWord: "thin", contrastWord: "sin", contrastPhonemeId: "sh" }]
  },
  {
    id: "th-voiced",
    ipa: "/ð/",
    label: "th",
    type: "consonant",
    day: 19,
    soundHint: "A voiced th.",
    mouthHint: "Use the same tongue place as /θ/, but turn voice on.",
    mouthSteps: ["Tongue touches teeth.", "Turn voice on.", "Keep it smooth."],
    spellingPatterns: [{ grapheme: "th", examples: ["this", "that", "mother"] }],
    exampleWords: words([
      ["this", "th", 1],
      ["that", "th", 1],
      ["mother", "th", 2],
      ["they", "th", 1]
    ]),
    confusableWith: ["j"],
    minimalPairs: [{ targetWord: "they", contrastWord: "day", contrastPhonemeId: "j" }]
  },
  {
    id: "sh",
    ipa: "/ʃ/",
    label: "sh / ti / ci",
    type: "consonant",
    day: 20,
    soundHint: "A quiet hush sound.",
    mouthHint: "Round slightly and let air flow through the middle.",
    mouthSteps: ["Round softly.", "Raise the tongue.", "Push air quietly."],
    spellingPatterns: [
      { grapheme: "sh", examples: ["ship", "shop"] },
      { grapheme: "ti", examples: ["station"] },
      { grapheme: "ci", examples: ["special"] }
    ],
    exampleWords: words([
      ["ship", "sh", 1],
      ["shop", "sh", 1],
      ["station", "ti", 3],
      ["special", "ci", 3]
    ]),
    confusableWith: ["ch", "short-i"],
    minimalPairs: [{ targetWord: "ship", contrastWord: "chip", contrastPhonemeId: "ch" }]
  },
  {
    id: "ch",
    ipa: "/tʃ/",
    label: "ch / tch",
    type: "consonant",
    day: 21,
    soundHint: "A quick stop plus sh sound.",
    mouthHint: "Start blocked, then release into /ʃ/.",
    mouthSteps: ["Block lightly.", "Release quickly.", "Finish with /ʃ/."],
    spellingPatterns: [
      { grapheme: "ch", examples: ["chip", "chair"] },
      { grapheme: "tch", examples: ["watch", "catch"] }
    ],
    exampleWords: words([
      ["chip", "ch", 1],
      ["chair", "ch", 1],
      ["watch", "tch", 2],
      ["catch", "tch", 2]
    ]),
    confusableWith: ["sh", "j"],
    minimalPairs: [{ targetWord: "chip", contrastWord: "ship", contrastPhonemeId: "sh" }]
  },
  {
    id: "j",
    ipa: "/dʒ/",
    label: "j / g / dge",
    type: "consonant",
    day: 22,
    soundHint: "A voiced stop plus zh-like release.",
    mouthHint: "Start like /d/, then release with voice.",
    mouthSteps: ["Block with voice.", "Release smoothly.", "Keep vibration on."],
    spellingPatterns: [
      { grapheme: "j", examples: ["jam", "jump"] },
      { grapheme: "g", examples: ["giant", "magic"] },
      { grapheme: "dge", examples: ["bridge", "badge"] }
    ],
    exampleWords: words([
      ["jam", "j", 1],
      ["jump", "j", 1],
      ["giant", "g", 2],
      ["bridge", "dge", 2]
    ]),
    confusableWith: ["ch"],
    minimalPairs: [{ targetWord: "jam", contrastWord: "cham", contrastPhonemeId: "ch" }]
  },
  {
    id: "ng",
    ipa: "/ŋ/",
    label: "ng / nk",
    type: "consonant",
    day: 23,
    soundHint: "A back nasal sound.",
    mouthHint: "Lift the back of the tongue; air goes through the nose.",
    mouthSteps: ["Back tongue lifts.", "Mouth path closes.", "Sound through nose."],
    spellingPatterns: [
      { grapheme: "ng", examples: ["sing", "long"] },
      { grapheme: "nk", examples: ["think", "bank"] }
    ],
    exampleWords: words([
      ["sing", "ng", 1],
      ["long", "ng", 1],
      ["think", "nk", 2],
      ["bank", "nk", 2]
    ]),
    confusableWith: ["short-i"],
    minimalPairs: [{ targetWord: "sing", contrastWord: "sin", contrastPhonemeId: "short-i" }]
  },
  {
    id: "v",
    ipa: "/v/",
    label: "v / ve",
    type: "consonant",
    day: 24,
    soundHint: "A voiced lip-teeth sound.",
    mouthHint: "Touch top teeth to lower lip and turn voice on.",
    mouthSteps: ["Teeth touch lip.", "Turn voice on.", "Let air vibrate."],
    spellingPatterns: [
      { grapheme: "v", examples: ["van", "very"] },
      { grapheme: "ve", examples: ["five", "love"] }
    ],
    exampleWords: words([
      ["van", "v", 1],
      ["very", "v", 1],
      ["five", "ve", 1],
      ["love", "ve", 2]
    ]),
    confusableWith: ["ow"],
    minimalPairs: [{ targetWord: "vest", contrastWord: "west", contrastPhonemeId: "ow" }]
  },
  {
    id: "r",
    ipa: "/r/",
    label: "r / wr",
    type: "consonant",
    day: 25,
    soundHint: "A smooth English r.",
    mouthHint: "Do not tap the tongue; keep it curled or bunched.",
    mouthSteps: ["Round slightly.", "Keep tongue away from teeth.", "Hold a smooth voice."],
    spellingPatterns: [
      { grapheme: "r", examples: ["red", "rain"] },
      { grapheme: "wr", examples: ["write", "wrong"] }
    ],
    exampleWords: words([
      ["red", "r", 1],
      ["rain", "r", 1],
      ["write", "wr", 2],
      ["wrong", "wr", 2]
    ]),
    confusableWith: ["long-ee"],
    minimalPairs: [{ targetWord: "right", contrastWord: "light", contrastPhonemeId: "long-ee" }]
  },
  {
    id: "aw",
    ipa: "/ɔ:/",
    label: "or / aw / au",
    type: "long-vowel",
    day: 26,
    soundHint: "A long rounded back vowel.",
    mouthHint: "Round the lips and hold the sound.",
    mouthSteps: ["Open the jaw.", "Round the lips.", "Hold the back vowel."],
    spellingPatterns: [
      { grapheme: "or", examples: ["horse", "short"] },
      { grapheme: "aw", examples: ["saw", "draw"] },
      { grapheme: "au", examples: ["August", "cause"] }
    ],
    exampleWords: words([
      ["horse", "or", 1],
      ["short", "or", 1],
      ["saw", "aw", 1],
      ["cause", "au", 2]
    ]),
    confusableWith: ["short-o"],
    minimalPairs: [{ targetWord: "short", contrastWord: "shot", contrastPhonemeId: "short-o" }]
  },
  {
    id: "long-i",
    ipa: "/aɪ/",
    label: "i-e / igh / y",
    type: "diphthong",
    day: 27,
    soundHint: "A glide from open /a/ toward /ɪ/.",
    mouthHint: "Open first, then lift toward a light finish.",
    mouthSteps: ["Open low.", "Lift the tongue.", "Finish lightly."],
    spellingPatterns: [
      { grapheme: "i-e", examples: ["bike", "time"] },
      { grapheme: "igh", examples: ["night", "light"] },
      { grapheme: "y", examples: ["my", "sky"] }
    ],
    exampleWords: words([
      ["bike", "i-e", 1],
      ["time", "i-e", 1],
      ["night", "igh", 2],
      ["sky", "y", 1]
    ]),
    confusableWith: ["ai"],
    minimalPairs: [{ targetWord: "time", contrastWord: "tame", contrastPhonemeId: "ai" }]
  },
  {
    id: "ure",
    ipa: "/ʊə/",
    label: "ure / our",
    type: "diphthong",
    day: 28,
    soundHint: "A glide from /ʊ/ toward /ə/.",
    mouthHint: "Start rounded, then relax.",
    mouthSteps: ["Round softly.", "Move to center.", "Relax the finish."],
    spellingPatterns: [
      { grapheme: "ure", examples: ["pure", "cure"] },
      { grapheme: "our", examples: ["tour", "gourd"] }
    ],
    exampleWords: words([
      ["pure", "ure", 1],
      ["cure", "ure", 1],
      ["tour", "our", 2],
      ["sure", "ure", 2]
    ]),
    confusableWith: ["oo-short"],
    minimalPairs: [{ targetWord: "pure", contrastWord: "poor", contrastPhonemeId: "oo-short" }]
  },
  {
    id: "p",
    ipa: "/p/",
    label: "p / pp",
    type: "consonant",
    day: 29,
    soundHint: "A quiet lip stop with a puff of air.",
    mouthHint: "Close both lips, then release without voice.",
    mouthSteps: ["Close lips.", "Hold air.", "Release quietly."],
    spellingPatterns: [
      { grapheme: "p", examples: ["pen", "pig"] },
      { grapheme: "pp", examples: ["apple", "happy"] }
    ],
    exampleWords: words([
      ["pen", "p", 1],
      ["pig", "p", 1],
      ["apple", "pp", 2],
      ["happy", "pp", 2]
    ]),
    confusableWith: ["b"],
    minimalPairs: [{ targetWord: "pat", contrastWord: "bat", contrastPhonemeId: "b" }]
  },
  {
    id: "b",
    ipa: "/b/",
    label: "b / bb",
    type: "consonant",
    day: 30,
    soundHint: "A voiced lip stop.",
    mouthHint: "Close both lips and turn voice on.",
    mouthSteps: ["Close lips.", "Use voice.", "Release strongly."],
    spellingPatterns: [
      { grapheme: "b", examples: ["bat", "big"] },
      { grapheme: "bb", examples: ["rabbit", "bubble"] }
    ],
    exampleWords: words([
      ["bat", "b", 1],
      ["big", "b", 1],
      ["rabbit", "bb", 2],
      ["bubble", "bb", 2]
    ]),
    confusableWith: ["p"],
    minimalPairs: [{ targetWord: "bat", contrastWord: "pat", contrastPhonemeId: "p" }]
  },
  {
    id: "t",
    ipa: "/t/",
    label: "t / tt",
    type: "consonant",
    day: 31,
    soundHint: "A quiet tongue stop.",
    mouthHint: "Touch behind the top teeth, then release without voice.",
    mouthSteps: ["Tongue touches top ridge.", "Hold air.", "Release quietly."],
    spellingPatterns: [
      { grapheme: "t", examples: ["ten", "top"] },
      { grapheme: "tt", examples: ["little", "letter"] }
    ],
    exampleWords: words([
      ["ten", "t", 1],
      ["top", "t", 1],
      ["little", "tt", 2],
      ["letter", "tt", 2]
    ]),
    confusableWith: ["d"],
    minimalPairs: [{ targetWord: "ten", contrastWord: "den", contrastPhonemeId: "d" }]
  },
  {
    id: "d",
    ipa: "/d/",
    label: "d / dd",
    type: "consonant",
    day: 32,
    soundHint: "A voiced tongue stop.",
    mouthHint: "Touch behind the top teeth and turn voice on.",
    mouthSteps: ["Tongue touches top ridge.", "Use voice.", "Release."],
    spellingPatterns: [
      { grapheme: "d", examples: ["day", "dog"] },
      { grapheme: "dd", examples: ["middle", "add"] }
    ],
    exampleWords: words([
      ["day", "d", 1],
      ["dog", "d", 1],
      ["middle", "dd", 2],
      ["add", "dd", 1]
    ]),
    confusableWith: ["t"],
    minimalPairs: [{ targetWord: "day", contrastWord: "tay", contrastPhonemeId: "t" }]
  },
  {
    id: "k",
    ipa: "/k/",
    label: "c / k / ck",
    type: "consonant",
    day: 33,
    soundHint: "A quiet back stop.",
    mouthHint: "Lift the back of the tongue, then release without voice.",
    mouthSteps: ["Back tongue lifts.", "Hold air.", "Release quietly."],
    spellingPatterns: [
      { grapheme: "c", examples: ["cat", "cup"] },
      { grapheme: "k", examples: ["kite", "key"] },
      { grapheme: "ck", examples: ["back", "duck"] }
    ],
    exampleWords: words([
      ["cat", "c", 1],
      ["kite", "k", 1],
      ["back", "ck", 1],
      ["duck", "ck", 1]
    ]),
    confusableWith: ["g"],
    minimalPairs: [{ targetWord: "coat", contrastWord: "goat", contrastPhonemeId: "g" }]
  },
  {
    id: "g",
    ipa: "/g/",
    label: "g / gg",
    type: "consonant",
    day: 34,
    soundHint: "A voiced back stop.",
    mouthHint: "Lift the back of the tongue and use voice.",
    mouthSteps: ["Back tongue lifts.", "Use voice.", "Release."],
    spellingPatterns: [
      { grapheme: "g", examples: ["go", "green"] },
      { grapheme: "gg", examples: ["egg", "bigger"] }
    ],
    exampleWords: words([
      ["go", "g", 1],
      ["green", "g", 1],
      ["egg", "gg", 1],
      ["bigger", "gg", 2]
    ]),
    confusableWith: ["k"],
    minimalPairs: [{ targetWord: "goat", contrastWord: "coat", contrastPhonemeId: "k" }]
  },
  {
    id: "f",
    ipa: "/f/",
    label: "f / ff / ph",
    type: "consonant",
    day: 35,
    soundHint: "A quiet lip-teeth sound.",
    mouthHint: "Touch top teeth to lower lip without voice.",
    mouthSteps: ["Teeth touch lip.", "No voice.", "Let air pass."],
    spellingPatterns: [
      { grapheme: "f", examples: ["fish", "fan"] },
      { grapheme: "ff", examples: ["off", "coffee"] },
      { grapheme: "ph", examples: ["phone", "photo"] }
    ],
    exampleWords: words([
      ["fish", "f", 1],
      ["fan", "f", 1],
      ["off", "ff", 1],
      ["phone", "ph", 2]
    ]),
    confusableWith: ["v"],
    minimalPairs: [{ targetWord: "fan", contrastWord: "van", contrastPhonemeId: "v" }]
  },
  {
    id: "s",
    ipa: "/s/",
    label: "s / ss / c",
    type: "consonant",
    day: 36,
    soundHint: "A quiet hissing sound.",
    mouthHint: "Keep the tongue close to the ridge and push air.",
    mouthSteps: ["Tongue near ridge.", "No voice.", "Push a thin stream of air."],
    spellingPatterns: [
      { grapheme: "s", examples: ["sun", "sit"] },
      { grapheme: "ss", examples: ["class", "kiss"] },
      { grapheme: "c", examples: ["city", "face"] }
    ],
    exampleWords: words([
      ["sun", "s", 1],
      ["sit", "s", 1],
      ["class", "ss", 2],
      ["city", "c", 2]
    ]),
    confusableWith: ["z", "th-voiceless"],
    minimalPairs: [{ targetWord: "sip", contrastWord: "zip", contrastPhonemeId: "z" }]
  },
  {
    id: "z",
    ipa: "/z/",
    label: "z / s",
    type: "consonant",
    day: 37,
    soundHint: "A voiced hissing sound.",
    mouthHint: "Use the /s/ shape but turn voice on.",
    mouthSteps: ["Tongue near ridge.", "Use voice.", "Keep air narrow."],
    spellingPatterns: [
      { grapheme: "z", examples: ["zoo", "zip"] },
      { grapheme: "s", examples: ["has", "nose"] }
    ],
    exampleWords: words([
      ["zoo", "z", 1],
      ["zip", "z", 1],
      ["has", "s", 1],
      ["nose", "s", 2]
    ]),
    confusableWith: ["s"],
    minimalPairs: [{ targetWord: "zip", contrastWord: "sip", contrastPhonemeId: "s" }]
  },
  {
    id: "zh",
    ipa: "/ʒ/",
    label: "s / si",
    type: "consonant",
    day: 38,
    soundHint: "A voiced sh-like sound.",
    mouthHint: "Use a /ʃ/ shape but turn voice on.",
    mouthSteps: ["Raise the tongue.", "Round slightly.", "Use voice."],
    spellingPatterns: [
      { grapheme: "s", examples: ["vision", "usual"] },
      { grapheme: "si", examples: ["decision", "measure"] }
    ],
    exampleWords: words([
      ["vision", "s", 2],
      ["usual", "s", 2],
      ["decision", "si", 3],
      ["measure", "si", 2]
    ]),
    confusableWith: ["sh", "j"],
    minimalPairs: [{ targetWord: "vision", contrastWord: "mission", contrastPhonemeId: "sh" }]
  },
  {
    id: "h",
    ipa: "/h/",
    label: "h",
    type: "consonant",
    day: 39,
    soundHint: "A soft breath sound.",
    mouthHint: "Let air pass freely; do not add a strong vowel.",
    mouthSteps: ["Open gently.", "Breathe out.", "Keep it light."],
    spellingPatterns: [{ grapheme: "h", examples: ["hat", "home", "behind"] }],
    exampleWords: words([
      ["hat", "h", 1],
      ["home", "h", 1],
      ["behind", "h", 2],
      ["happy", "h", 1]
    ]),
    confusableWith: ["short-a"],
    minimalPairs: [{ targetWord: "hat", contrastWord: "at", contrastPhonemeId: "short-a" }]
  },
  {
    id: "m",
    ipa: "/m/",
    label: "m / mm",
    type: "consonant",
    day: 40,
    soundHint: "A voiced lip nasal.",
    mouthHint: "Close lips; sound flows through the nose.",
    mouthSteps: ["Close lips.", "Use voice.", "Let sound through nose."],
    spellingPatterns: [
      { grapheme: "m", examples: ["man", "moon"] },
      { grapheme: "mm", examples: ["summer", "comma"] }
    ],
    exampleWords: words([
      ["man", "m", 1],
      ["moon", "m", 1],
      ["summer", "mm", 2],
      ["comma", "mm", 2]
    ]),
    confusableWith: ["n"],
    minimalPairs: [{ targetWord: "mat", contrastWord: "nat", contrastPhonemeId: "n" }]
  },
  {
    id: "n",
    ipa: "/n/",
    label: "n / nn",
    type: "consonant",
    day: 41,
    soundHint: "A voiced tongue nasal.",
    mouthHint: "Touch behind the top teeth; sound flows through the nose.",
    mouthSteps: ["Tongue touches ridge.", "Use voice.", "Let sound through nose."],
    spellingPatterns: [
      { grapheme: "n", examples: ["net", "name"] },
      { grapheme: "nn", examples: ["dinner", "sunny"] }
    ],
    exampleWords: words([
      ["net", "n", 1],
      ["name", "n", 1],
      ["dinner", "nn", 2],
      ["sunny", "nn", 2]
    ]),
    confusableWith: ["ng", "m"],
    minimalPairs: [{ targetWord: "sin", contrastWord: "sing", contrastPhonemeId: "ng" }]
  },
  {
    id: "l",
    ipa: "/l/",
    label: "l / ll",
    type: "consonant",
    day: 42,
    soundHint: "A clear side sound.",
    mouthHint: "Touch the ridge with the tongue and let air flow around the sides.",
    mouthSteps: ["Tongue touches ridge.", "Use voice.", "Let air pass around sides."],
    spellingPatterns: [
      { grapheme: "l", examples: ["light", "leaf"] },
      { grapheme: "ll", examples: ["bell", "yellow"] }
    ],
    exampleWords: words([
      ["light", "l", 1],
      ["leaf", "l", 1],
      ["bell", "ll", 1],
      ["yellow", "ll", 2]
    ]),
    confusableWith: ["r"],
    minimalPairs: [{ targetWord: "light", contrastWord: "right", contrastPhonemeId: "r" }]
  },
  {
    id: "w",
    ipa: "/w/",
    label: "w / wh",
    type: "consonant",
    day: 43,
    soundHint: "A rounded glide.",
    mouthHint: "Round the lips, then move quickly into the next vowel.",
    mouthSteps: ["Round lips.", "Use voice.", "Glide into the vowel."],
    spellingPatterns: [
      { grapheme: "w", examples: ["we", "water"] },
      { grapheme: "wh", examples: ["when", "why"] }
    ],
    exampleWords: words([
      ["we", "w", 1],
      ["water", "w", 1],
      ["when", "wh", 1],
      ["why", "wh", 1]
    ]),
    confusableWith: ["v"],
    minimalPairs: [{ targetWord: "west", contrastWord: "vest", contrastPhonemeId: "v" }]
  },
  {
    id: "y-consonant",
    ipa: "/j/",
    label: "y",
    type: "consonant",
    day: 44,
    soundHint: "A quick y glide.",
    mouthHint: "Start high and move quickly into the vowel.",
    mouthSteps: ["Tongue high.", "Use voice.", "Glide forward."],
    spellingPatterns: [
      { grapheme: "y", examples: ["yes", "yellow"] },
      { grapheme: "u", examples: ["use", "music"] }
    ],
    exampleWords: words([
      ["yes", "y", 1],
      ["yellow", "y", 1],
      ["use", "u", 2],
      ["music", "u", 2]
    ]),
    confusableWith: ["long-ee"],
    minimalPairs: [{ targetWord: "yes", contrastWord: "ears", contrastPhonemeId: "long-ee" }]
  }
];

export const phonemeById = new Map(phonemes.map((phoneme) => [phoneme.id, phoneme]));

export const getPhoneme = (id: string): Phoneme => {
  const phoneme = phonemeById.get(id);
  if (!phoneme) {
    throw new Error(`Unknown phoneme: ${id}`);
  }
  return phoneme;
};
