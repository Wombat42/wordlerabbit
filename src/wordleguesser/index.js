import { words } from "./word.js";

const VOWELS = ["a", "e", "i", "o", "u"];

// The letter frequency map: how many times each letter appears
// in the word list
// deduplicating version
const letterFrequencyMap = words.reduce((accum, word) => {
  const letterMap = {};
  [...word].forEach((character) => {
    if (!letterMap[character]) {
      letterMap[character] = character;
      if (accum[character]) {
        accum[character] += 1;
      } else {
        accum[character] = 1;
      }
    }
  });
  return accum;
}, {});

// creates a point value for each letter.
const letterPointMap = {};
for (const character in letterFrequencyMap) {
  letterPointMap[character] = Math.trunc(
    (letterFrequencyMap[character] / 26) * 10
  );
}
/**
 * Returns a duduplicated list of all the letters that must be in a word.
 * @param {[string]} positionFilters
 * @param {[character]} positionLock
 */
function getRequiredLetters(positionFilters, positionLock) {
  // Required letters that must be in the word
  const fullRequiredLetters = []
    .concat(positionFilters)
    .concat(positionLock)
    .join("");
  const requiredLetters = [...fullRequiredLetters].reduce(
    (accumString, character) => {
      const index = accumString.indexOf(character);
      if (index === -1) {
        accumString += character;
      }
      return accumString;
    },
    ""
  );
  return requiredLetters;
}

/**
 * Checks that a filter is not also in the required letters. Also checks
 * that there is only one character in each position locked string
 * @param {string} filters
 * @param {[string]} requiredLetters
 * @param {[character]} positionLock
 */
function validate(filters, requiredLetters, positionLock) {
  // validate that position lock has only one letter each
  if (positionLock.filter((str) => str.length > 1).length > 0) {
    throw new Error("A locked character string can only have one character");
  }

  // catch error where filter is also a required letter
  [...filters].forEach((character) => {
    if (requiredLetters.indexOf(character) > -1) {
      throw new Error(`A filter is also a required letter: ${character} `);
    }
  });
}

/**
 * Finds a matching word
 * @param {string} filters
 * @param {[string]} positionFilters
 * @param {[character]} positionLock
 */
function findWord(filters, positionFilters, positionLock) {
  const requiredLetters = getRequiredLetters(positionFilters, positionLock);
  validate(filters, requiredLetters, positionLock);

  const highMatch = Math.pow(2, requiredLetters.length) - 1;
  const wordPointsMap = words.map((word) => {
    const letterMap = {};
    let score = 0;
    let requiredLetterCounter = 0;
    for (let index = 0; index < word.length; index++) {
      const character = word[index];
      const positionLetter = positionLock[index];
      // Give a zero score for the word if...
      // it is a filtered letter
      // it is a position locked letter and does not match
      // it is there a required letter for this position and does not match
      if (
        (filters.length && filters.indexOf(character) > -1) ||
        (positionFilters.length &&
          positionFilters[index].indexOf(character) > -1) ||
        (positionLetter && positionLetter !== character)
      ) {
        // word fails
        score = 0;
        break;
      } else if (!letterMap[character]) {
        // score the word, but only once per letter
        // this does make solving "cooks" a bit trickier
        // but "cooks" is still recommended because nothing else
        // will happen to match
        letterMap[character] = character;
        score += letterPointMap[character];
      }
      // Still playing around with this bit.
      // Creates a bitmap that, when fully populated,
      // detects the required letters are all used.
      // Say you have three required letters, this code will ensure
      // that the word is scored the higher than a two letter match with super
      // popular letters.
      const indexRequiredLetter = requiredLetters.indexOf(character);
      if (indexRequiredLetter > -1) {
        requiredLetterCounter |= 1 << indexRequiredLetter;
      }
    }

    if (highMatch > 0 && score > 0 && requiredLetterCounter >= highMatch) {
      // if the requiredLetterCounter is higher or equal than the highMatch
      // then it has all the required letters and they are positioned correctly.
      // console.log(word, requiredLetterCounter, highMatch);
    } else if (requiredLetters.length > 0) {
      // doesn't have all the required letters so toss it.
      score = 0;
    }

    return {
      word,
      score,
      requiredLetterCounter,
      highMatch,
      requiredLetters
    };
  });

  return wordPointsMap;
}

function getVowels(string) {
  return [...string]
    .filter((character) => VOWELS.indexOf(character) > -1)
    .join("");
}

/**
 * A work in progress
 * @param {} filters
 * @param {*} positionFilters
 * @param {*} positionLock
 */
function findEliminatorWord(
  filters,
  positionFilters,
  positionLock,
  possibleMatches
) {
  // Get letters that are in the word
  const requiredLetters = getRequiredLetters(positionFilters, positionLock);

  // Examine the list of possible matches and find all
  // the letters that are unique, and then score them.
  const eliminatorLetterMap = possibleMatches
    .filter(({ word, score }) => {
      return score > 0;
    })
    .reduce((letterMap, { word }) => {
      [...word].reduce((lm, character) => {
        if (requiredLetters.indexOf(character) < 0) {
          lm[character] = (lm[character] ?? 0) + 1;
        }
        return lm;
      }, letterMap);
      return letterMap;
    }, {});

  // Iterate over the full word list to find words that
  // use the unique letters and give them a score. Words
  // with the most popular unique letters will score higher.
  // Give a lower score to words with duplicate letters since
  // the point here is to eliminate as many letters as possible.
  const wordPointsMap = words.map((word) => {
    const dedupMap = {};
    const score = [...word].reduce((score, character) => {
      let points = eliminatorLetterMap[character] ?? 0;
      if (dedupMap[character]) {
        points = 0;
      }
      dedupMap[character] = true;
      return score + points;
    }, 0);

    return {
      word,
      score
    };
  });

  return wordPointsMap;
}

/**
 * Finds the guess that has the highest overall score
 * @param {*} filters
 * @param {*} positionFilters
 * @param {*} positionLock
 */
function getGuess(filters, positionFilters, positionLock, notAWordMap = {}) {
  const wordPointsMap = findWord(filters, positionFilters, positionLock);
  const sortedList = wordPointsMap.sort((a, b) => {
    let result = 0;
    if (a.score < b.score) {
      result = 1;
    } else if (a.score > b.score) {
      result = -1;
    }
    return result;
  });
  for (let index = 0; index < sortedList.length; index++) {
    const { word: highestValueWord } = sortedList[index];
    if (typeof notAWordMap[highestValueWord] === "undefined") {
      return { highestValueWord, sortedList };
    }
  }
}

/**
 * Finds the guess that has the highest overall score
 * @param {*} filters
 * @param {*} positionFilters
 * @param {*} positionLock
 */
function getEliminators(
  filters,
  positionFilters,
  positionLock,
  possibleMatches
) {
  const usuableMatches = possibleMatches.filter(({ score }) => score > 0);

  const wordPointsMap = findEliminatorWord(
    filters,
    positionFilters,
    positionLock,
    usuableMatches
  );
  const sortedList = wordPointsMap
    .sort((a, b) => {
      let result = 0;
      if (a.score < b.score) {
        result = 1;
      } else if (a.score > b.score) {
        result = -1;
      }
      return result;
    })
    .slice(0, usuableMatches.length);
  return { sortedList };
}

export { getGuess, getRequiredLetters, getEliminators };
