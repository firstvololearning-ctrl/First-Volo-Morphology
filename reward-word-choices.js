/* Shared word choices for the optional arcade games. */
(function () {
  'use strict';

  const registry = window.FirstVoloRewardRegistry;
  const wordRounds = [
    {
      parts: ['ed', 'ing'],
      prompt: 'Which word shows the jump already happened?',
      answer: 'jumped',
      explanations: { jumped: 'The ending -ed shows it happened in the past.', jumping: 'The ending -ing describes the action as it happens.' }
    },
    {
      parts: ['pre', 're'],
      prompt: 'Which word means cook ahead of time?',
      answer: 'precook',
      explanations: { precook: 'Pre- means before. Precook means cook ahead of time.', recook: 'Re- means again here. Recook means cook again.' }
    },
    {
      parts: ['ful', 'less'],
      prompt: 'Which word means full of joy?',
      answer: 'joyful',
      explanations: { joyful: 'The ending -ful means full of.', joyless: 'The ending -less means without.' }
    },
    {
      parts: ['negative-in-family', 'location-in-family'],
      prompt: 'Which word uses in- to mean “not”?',
      answer: 'invisible',
      explanations: { invisible: 'Invisible means not able to be seen.', insert: 'Insert means put something into a place or opening.' }
    },
    {
      parts: ['negative-in-family', 'location-in-family'],
      prompt: 'Which word uses im- to mean “not”?',
      answer: 'impolite',
      explanations: { impolite: 'Impolite means not polite.', imprint: 'To imprint something is to press a mark into or onto a surface.' }
    },
    {
      parts: ['inter', 'trans'],
      prompt: 'Which word uses a prefix meaning “between”?',
      answer: 'intercity',
      explanations: { intercity: 'Inter- means between. Intercity travel goes between cities.', transatlantic: 'Trans- means across. A transatlantic trip crosses the Atlantic.' }
    },
    {
      parts: ['geo', 'bio'],
      prompt: 'Which word uses a root meaning “life”?',
      answer: 'biography',
      explanations: { biography: 'Bio means life. A biography is an account of someone’s life.', geography: 'Geo means earth. Geography studies places and features of Earth.' }
    },
    {
      parts: ['struct'],
      prompt: 'Which word contains struct, meaning “build”?',
      answer: 'structure',
      explanations: { structure: 'Struct means build. A structure is something built or arranged.', sculpture: 'A sculpture is a work of art shaped from material. Its word part sculpt refers to carving.' }
    },
    {
      parts: ['tract'],
      prompt: 'Which word contains tract, meaning “pull” or “draw”?',
      answer: 'tractor',
      explanations: { tractor: 'Tract means pull. A tractor can pull heavy equipment.', track: 'A track can be a path or a trail. It has a different root.' }
    },
    {
      parts: ['under', 'pre'],
      prompt: 'Which word means cook too little?',
      answer: 'undercook',
      explanations: { undercook: 'Under- means too little here. Undercook means cook too little.', precook: 'Pre- means before. Precook means cook ahead of time.' }
    },
    {
      parts: ['able-ible', 'ed'],
      prompt: 'Which word means able to be folded?',
      answer: 'foldable',
      explanations: { foldable: 'The ending -able means able to be. Foldable means able to be folded.', folded: 'Folded describes something that has already been folded.' }
    },
    {
      parts: ['graph', 'phon'],
      prompt: 'Which word contains a root connected with writing?',
      answer: 'autograph',
      explanations: { autograph: 'Graph relates to writing. An autograph is a signature someone writes.', earphone: 'Phone relates to sound. An earphone delivers sound to the ear.' }
    },
    {
      parts: ['ist'],
      prompt: 'Which word names a person who plays the piano?',
      answer: 'pianist',
      explanations: { pianist: 'The ending -ist can name a person connected with an activity. A pianist plays the piano.', piano: 'Piano names the instrument.' }
    },
    {
      parts: ['retro', 'pre'],
      prompt: 'Which word has a prefix that means “backward”?',
      answer: 'retrofire',
      explanations: { retrofire: 'Retro- means backward. Retrofiring uses backward thrust to slow a spacecraft.', precook: 'Pre- means before. Precook means cook ahead of time.' }
    },
    {
      parts: ['ant-ent-agent'],
      prompt: 'Which word names a person taking part in a contest?',
      answer: 'contestant',
      explanations: { contestant: 'Here -ant names a person who takes part. A contestant takes part in a contest.', contest: 'Contest names the competition.' }
    }
  ];

  function morphemeQuestions(reward) {
    const pool = reward.eligibleContent.morphemeIds.filter(id => registry.morpheme(id));
    const stopWords = ['a', 'an', 'the', 'of', 'to', 'or', 'and', 'in', 'is', 'that', 'with', 'being'];
    const tokens = id => registry.displayMeaning(id).toLowerCase().match(/[a-z]+/g).filter(word => !stopWords.includes(word));
    return pool.map(id => {
      const choices = [id];
      const labels = new Set([registry.promptLabel(id)]);
      const used = new Set(tokens(id));
      for (const other of pool) {
        const label = registry.promptLabel(other);
        const words = tokens(other);
        if (labels.has(label) || words.some(word => used.has(word))) continue;
        choices.push(other);
        labels.add(label);
        words.forEach(word => used.add(word));
        if (choices.length === 3) break;
      }
      return { id, answer: id, choices, prompt: `Which word part means “${registry.displayMeaning(id)}”?` };
    }).filter(question => question.choices.length >= 2);
  }

  function shuffled(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function deck(reward) {
    const eligible = new Set(reward.eligibleContent.morphemeIds);
    const protection = window.FirstVoloInstructionalProtection;
    const set = window.FIRST_VOLO_TOKEN_SETS?.find(set => set.id === reward.unlockToken);
    const current = new Set(set?.morphemeIds || []);
    const words = protection ? wordRounds.filter(round =>
      round.parts.every(id => eligible.has(id)) &&
      Object.keys(round.explanations).every(word => !protection.isProtected(word))
    ) : [];
    const focusRounds = words.filter(round => round.parts.some(id => current.has(id)));
    const reviewRounds = words.filter(round => !focusRounds.includes(round));
    const selected = [...shuffled(focusRounds), ...shuffled(reviewRounds)].slice(0, 3)
      .map(round => ({ ...round, choices: Object.keys(round.explanations) }));

    const generic = shuffled(morphemeQuestions(reward));
    const focusQuestions = generic.filter(question => current.has(question.id));
    const reviewQuestions = generic.filter(question => !current.has(question.id));
    // Give an earlier word part a review slot even when the current set can fill the round.
    const reviewSlot = reviewQuestions.slice(0, 1);
    const wordPartRounds = [...reviewSlot, ...focusQuestions, ...reviewQuestions.slice(1)]
      .slice(0, 5 - selected.length);
    return shuffled([...selected, ...wordPartRounds]);
  }

  function label(question, choice) {
    return question.explanations ? choice : registry.promptLabel(choice);
  }

  function explain(question, choice) {
    return question.explanations?.[choice] ??
      `${registry.promptLabel(choice)} means “${registry.displayMeaning(choice)}”.`;
  }

  window.FirstVoloGameQuestions = { deck, morphemeQuestions, label, explain, shuffled };
})();
