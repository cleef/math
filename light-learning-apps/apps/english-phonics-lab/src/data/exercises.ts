import { getPhoneme, phonemes, type Phoneme, type WordExample } from "./phonemes";

export type ExerciseKind =
  | "sound-to-word"
  | "word-to-sound"
  | "underline-match"
  | "contrast-choice";

export type ExerciseOption = {
  id: string;
  label: string;
  phonemeId?: string;
  word?: string;
};

export type ExerciseItem = {
  id: string;
  kind: ExerciseKind;
  phonemeId: string;
  prompt: string;
  target: string;
  options: ExerciseOption[];
  answerId: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
};

export type ExerciseAttempt = {
  exerciseId: string;
  phonemeId: string;
  selectedId: string;
  isCorrect: boolean;
  answeredAt: string;
};

const fallbackWords = (excludeId: string): Array<{ phoneme: Phoneme; word: WordExample }> =>
  phonemes
    .filter((phoneme) => phoneme.id !== excludeId)
    .flatMap((phoneme) => phoneme.exampleWords.map((word) => ({ phoneme, word })));

const uniqueOptions = (options: ExerciseOption[]): ExerciseOption[] => {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.id)) {
      return false;
    }
    seen.add(option.id);
    return true;
  });
};

const getContrast = (phoneme: Phoneme): Phoneme => {
  const contrastId = phoneme.confusableWith[0] ?? phonemes.find((item) => item.id !== phoneme.id)?.id;
  return contrastId ? getPhoneme(contrastId) : phoneme;
};

const distractorWords = (phoneme: Phoneme, count: number) => {
  const contrastWords = phoneme.confusableWith
    .flatMap((id) => getPhoneme(id).exampleWords.map((word) => ({ phoneme: getPhoneme(id), word })));
  return [...contrastWords, ...fallbackWords(phoneme.id)].slice(0, count);
};

export const buildExercisesForPhoneme = (phoneme: Phoneme): ExerciseItem[] => {
  const primaryWord = phoneme.exampleWords[0];
  const secondWord = phoneme.exampleWords[1] ?? primaryWord;
  const contrast = getContrast(phoneme);
  const minimalPair = phoneme.minimalPairs[0];
  const wrongWords = distractorWords(phoneme, 3);
  const patternDistractors = phoneme.spellingPatterns
    .filter((pattern) => pattern.grapheme !== primaryWord.pattern)
    .map((pattern) => pattern.grapheme);
  const otherPatternDistractors = phonemes
    .filter((item) => item.id !== phoneme.id)
    .flatMap((item) => item.spellingPatterns.map((pattern) => pattern.grapheme));

  return [
    {
      id: `${phoneme.id}-sound-to-word-1`,
      kind: "sound-to-word",
      phonemeId: phoneme.id,
      prompt: `Which word has ${phoneme.ipa}?`,
      target: phoneme.ipa,
      options: uniqueOptions([
        {
          id: primaryWord.word,
          label: primaryWord.word,
          word: primaryWord.word,
          phonemeId: phoneme.id
        },
        ...wrongWords.map(({ phoneme: itemPhoneme, word }) => ({
          id: word.word,
          label: word.word,
          word: word.word,
          phonemeId: itemPhoneme.id
        }))
      ]).slice(0, 4),
      answerId: primaryWord.word,
      feedback: {
        correct: `${primaryWord.word} uses ${primaryWord.pattern} for ${phoneme.ipa}.`,
        incorrect: `Listen for ${phoneme.ipa}: ${phoneme.soundHint}`
      }
    },
    {
      id: `${phoneme.id}-sound-to-word-2`,
      kind: "sound-to-word",
      phonemeId: phoneme.id,
      prompt: `Find another ${phoneme.ipa} word.`,
      target: phoneme.ipa,
      options: uniqueOptions([
        {
          id: secondWord.word,
          label: secondWord.word,
          word: secondWord.word,
          phonemeId: phoneme.id
        },
        ...wrongWords.slice(1).map(({ phoneme: itemPhoneme, word }) => ({
          id: word.word,
          label: word.word,
          word: word.word,
          phonemeId: itemPhoneme.id
        }))
      ]).slice(0, 4),
      answerId: secondWord.word,
      feedback: {
        correct: `${secondWord.word} carries ${phoneme.ipa}.`,
        incorrect: `Look for the sound before the spelling pattern.`
      }
    },
    {
      id: `${phoneme.id}-word-to-sound-1`,
      kind: "word-to-sound",
      phonemeId: phoneme.id,
      prompt: `What sound do you hear in "${primaryWord.word}"?`,
      target: primaryWord.word,
      options: uniqueOptions([
        { id: phoneme.id, label: phoneme.ipa, phonemeId: phoneme.id },
        { id: contrast.id, label: contrast.ipa, phonemeId: contrast.id },
        { id: phonemes[0].id, label: phonemes[0].ipa, phonemeId: phonemes[0].id },
        { id: phonemes[1].id, label: phonemes[1].ipa, phonemeId: phonemes[1].id }
      ]).slice(0, 4),
      answerId: phoneme.id,
      feedback: {
        correct: `${primaryWord.word} belongs with ${phoneme.ipa}.`,
        incorrect: `The ${primaryWord.pattern} part carries ${phoneme.ipa}.`
      }
    },
    {
      id: `${phoneme.id}-word-to-sound-2`,
      kind: "word-to-sound",
      phonemeId: phoneme.id,
      prompt: `Choose the sound for "${secondWord.word}".`,
      target: secondWord.word,
      options: uniqueOptions([
        { id: phoneme.id, label: phoneme.ipa, phonemeId: phoneme.id },
        { id: contrast.id, label: contrast.ipa, phonemeId: contrast.id },
        { id: phonemes[2].id, label: phonemes[2].ipa, phonemeId: phonemes[2].id },
        { id: phonemes[3].id, label: phonemes[3].ipa, phonemeId: phonemes[3].id }
      ]).slice(0, 4),
      answerId: phoneme.id,
      feedback: {
        correct: `${secondWord.word} has ${phoneme.ipa}.`,
        incorrect: `Compare the mouth shape with ${contrast.ipa}.`
      }
    },
    {
      id: `${phoneme.id}-underline-match-1`,
      kind: "underline-match",
      phonemeId: phoneme.id,
      prompt: `Which letters make ${phoneme.ipa} in "${primaryWord.word}"?`,
      target: primaryWord.word,
      options: uniqueOptions([
        { id: primaryWord.pattern, label: primaryWord.pattern },
        ...[...patternDistractors, ...otherPatternDistractors].map((pattern) => ({
          id: pattern,
          label: pattern
        }))
      ]).slice(0, 4),
      answerId: primaryWord.pattern,
      feedback: {
        correct: `${primaryWord.pattern} is the spelling pattern in ${primaryWord.word}.`,
        incorrect: `Look at the part of the word that carries ${phoneme.ipa}.`
      }
    },
    {
      id: `${phoneme.id}-underline-match-2`,
      kind: "underline-match",
      phonemeId: phoneme.id,
      prompt: `Tap the pattern for "${secondWord.word}".`,
      target: secondWord.word,
      options: uniqueOptions([
        { id: secondWord.pattern, label: secondWord.pattern },
        ...[...patternDistractors.reverse(), ...otherPatternDistractors].map((pattern) => ({
          id: pattern,
          label: pattern
        }))
      ]).slice(0, 4),
      answerId: secondWord.pattern,
      feedback: {
        correct: `${secondWord.pattern} carries the sound.`,
        incorrect: `Say the word slowly and find the sound group.`
      }
    },
    {
      id: `${phoneme.id}-contrast-choice-1`,
      kind: "contrast-choice",
      phonemeId: phoneme.id,
      prompt: minimalPair
        ? `Which sound is in "${minimalPair.targetWord}"?`
        : `Choose the target sound.`,
      target: minimalPair?.targetWord ?? phoneme.ipa,
      options: [
        { id: phoneme.id, label: phoneme.ipa, phonemeId: phoneme.id },
        { id: contrast.id, label: contrast.ipa, phonemeId: contrast.id }
      ],
      answerId: phoneme.id,
      feedback: {
        correct: `${phoneme.ipa} wins this contrast.`,
        incorrect: `${contrast.ipa} is nearby, but ${phoneme.mouthHint.toLowerCase()}`
      }
    },
    {
      id: `${phoneme.id}-contrast-choice-2`,
      kind: "contrast-choice",
      phonemeId: phoneme.id,
      prompt: minimalPair
        ? `"${minimalPair.targetWord}" or "${minimalPair.contrastWord}": which one belongs to ${phoneme.ipa}?`
        : `Which label belongs to ${phoneme.ipa}?`,
      target: phoneme.ipa,
      options: uniqueOptions([
        {
          id: minimalPair?.targetWord ?? phoneme.id,
          label: minimalPair?.targetWord ?? phoneme.label,
          phonemeId: phoneme.id
        },
        {
          id: minimalPair?.contrastWord ?? contrast.id,
          label: minimalPair?.contrastWord ?? contrast.label,
          phonemeId: contrast.id
        }
      ]),
      answerId: minimalPair?.targetWord ?? phoneme.id,
      feedback: {
        correct: `That word belongs with ${phoneme.ipa}.`,
        incorrect: `Use the contrast: ${phoneme.ipa} vs ${contrast.ipa}.`
      }
    }
  ];
};

export const exerciseBank = phonemes.flatMap(buildExercisesForPhoneme);

export const getExercisesForPhoneme = (phonemeId: string): ExerciseItem[] =>
  exerciseBank.filter((exercise) => exercise.phonemeId === phonemeId);

export const getExercisesForDay = (phonemeIds: string[], limit: number): ExerciseItem[] => {
  const items = phonemeIds.flatMap(getExercisesForPhoneme);
  return items.slice(0, limit);
};
