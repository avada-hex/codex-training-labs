const STOPWORDS = new Set([
  'the',
  'and',
  'or',
  'an',
  'a',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'by',
  'is',
  'are',
  'was',
  'were',
  'it',
  'this',
  'that',
  'as',
  'at',
  'from',
  'be',
  'has',
  'have',
  'but',
  'not'
]);

const SENTENCE_SPLIT_REGEX = /(?<=[.!?])\s+/;

function normalizeText(text) {
  return text.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function splitSentences(text) {
  const normalized = normalizeText(text || '');
  if (!normalized) {
    return [];
  }

  const fragments = normalized.split(SENTENCE_SPLIT_REGEX);
  return fragments.map((fragment) => fragment.trim()).filter(Boolean);
}

function buildWordScores(text) {
  const words = (text.toLowerCase().match(/[a-z\u00C0-\u017F]+/g) || []).filter(
    (word) => !STOPWORDS.has(word)
  );

  const frequencies = {};
  for (const word of words) {
    frequencies[word] = (frequencies[word] || 0) + 1;
  }

  return frequencies;
}

function scoreSentence(sentence, frequencies) {
  const tokens = (sentence.toLowerCase().match(/[a-z\u00C0-\u017F]+/g) || []).filter(
    (word) => !STOPWORDS.has(word)
  );

  if (!tokens.length) {
    return 0;
  }

  return tokens.reduce((sum, token) => sum + (frequencies[token] || 0), 0) / tokens.length;
}

function pickTopSentences(scoredSentences, count) {
  if (!scoredSentences.length) {
    return [];
  }

  const safeCount = Math.min(Math.max(count, 1), scoredSentences.length);

  const selection = [...scoredSentences]
    .sort((a, b) => {
      if (b.score === a.score) {
        return a.sentence.length - b.sentence.length;
      }
      return b.score - a.score;
    })
    .slice(0, safeCount)
    .sort((a, b) => a.index - b.index);

  return selection;
}

function summarizeText(text) {
  const sentences = splitSentences(text);
  const inputWords = normalizeText(text).split(' ').filter(Boolean).length;

  if (!sentences.length) {
    return {
      summary: '',
      sentences,
      inputWords,
      targetSentenceCount: 0,
      initialSelection: [],
      finalSelection: []
    };
  }

  const targetSentenceCount = Math.min(
    sentences.length,
    Math.max(1, Math.ceil(sentences.length / 3))
  );
  const initialSentenceCount = Math.min(
    sentences.length,
    Math.max(2, Math.ceil(sentences.length / 2))
  );

  const frequencies = buildWordScores(text);

  const scoredSentences = sentences.map((sentence, index) => ({
    sentence,
    index,
    score: scoreSentence(sentence, frequencies)
  }));

  const initialSelection = pickTopSentences(scoredSentences, initialSentenceCount);
  const finalSelection = pickTopSentences(scoredSentences, targetSentenceCount);

  const finalSummary = finalSelection.map((item) => item.sentence).join(' ');

  return {
    summary: finalSummary,
    sentences,
    inputWords,
    targetSentenceCount,
    initialSelection,
    finalSelection,
    scoredSentences
  };
}

module.exports = {
  summarizeText
};
