import "./styles.scss";
import { getGuess, getEliminators } from "./wordleguesser";
import { WordGrid } from "./wordgrid";
import { WordMatches } from "./wordmatches";
import { LetterStates } from "./letterstates";
/*
This is largely just a toy. I am not putting time into doing a UI. I'm
happy just editing the variables below.

When playing wordle, put the gray letters in the filters variable
Put the orange/yellow letters in the position filters. You can have more 
than one letter in each position. The search will skip any words with a letter 
in that position. Example: if A is in the first position, then it will not match
works like armor. However, it will match words like groan.

The position lock is when you have a green letter. This will only return a word
if it has a letter in that position. So say you had r in the secod position, 
then words like armor and trade will be returned.

Warning: The dictionary is not great. It has a ton of words that may be invalid.
I delete them as I find them.

The app works by scanning the number of occurances of each letter. 
Letters are given a score for their frequency in the list of words. There
are two algorithms, one that does not counts a letter only once and 
another that counts every occurance. This uses the deduplicated version by default.

The words are then scanned a second time and each word is given a score. The word
with the highest score is the one that matches first. The highest scoreing word
is "arose" because it has the highest number of commonly used letters.

There is a rather poorly working eliminator method. This tries to give words that 
don't match any of the previously selected letters. This can future guesses
narrow the to the winning word. It is a little too strict right now so
it quickly runs out of letters and fails to find a word.

If the guess word looks totally wrong, such as it is using filtered letters, 
then it gave up because nothing matched. Again, the dictionary is not great.

I've won dozens of games but it can't solve everything. Like when there are many words
with the same ending. An example of this is Hatch, where the first letter can be replaced 
with many others and all are reasonable guesses.
Examples:
hatch
match
watch
catch
patch
latch
batch

The new eliminator word guesses seem to help with it.

Have fun!!
*/
// not a word
let notWord = {};
let letterStates = new LetterStates();

let wordGrid;
let wordMatches;
let eliminatorMatches;

function emptyElement(el) {
  while (el.firstChild) {
    el.removeChild(el.lastChild);
  }
}

function handleLetterButtonClick(updatedLetterStates) {
  letterStates = updatedLetterStates;
  renderGuess(true);
}

function handleNotAWordButtonClick(word) {
  notWord[word] = true;
  renderGuess();
}

function handleNextButtonClick(updatedLetterStates) {
  letterStates = updatedLetterStates;
  renderGuess();
}

function handleWordSelect(word) {
  if (wordGrid.isWordEditable()) {
    wordGrid.setCurrentWord(word);
  }
}

function initWordGrid() {
  const guessEl = getGuessEl();
  emptyElement(guessEl);
  guessEl.appendChild(wordGrid.initWordGrid());
}

function getGuessEl() {
  const guessEl = document.getElementById("guess");
  return guessEl;
}

function renderGuess(skipWordUpdate = false) {
  const { highestValueWord, sortedList } = getGuess(
    letterStates.filters,
    letterStates.positionFilters,
    letterStates.positionLocks,
    notWord
  );
  if (skipWordUpdate !== true) {
    wordGrid.setCurrentWord(highestValueWord);
  }
  wordMatches.reset(sortedList, notWord);

  const { sortedList: sortedEliminatorList } = getEliminators(
    letterStates.filters,
    letterStates.positionFilters,
    letterStates.positionLocks,
    sortedList
  );
  eliminatorMatches.reset(sortedEliminatorList, notWord);
}

function initResetButton() {
  const resetButton = document.getElementById("resetButton");
  resetButton.addEventListener("click", () => {
    wordGrid.remove();
    wordMatches.remove();
    eliminatorMatches.remove();
    main();
  });
  resetButton.removeAttribute("style");
}

function showSection(id) {
  const section = document.getElementById(id);
  if (section) {
    section.style.removeProperty("display");
  }
}

function showSections() {
  showSection("matches-container");
  showSection("eliminators-container");
  showSection("doc-container");
}

function main() {
  notWord = {};
  wordGrid = new WordGrid({
    letterChangeHandler: handleLetterButtonClick,
    notAWordHandler: handleNotAWordButtonClick,
    nextWordHandler: handleNextButtonClick
  });
  wordMatches = new WordMatches({
    wordSelectHandler: handleWordSelect,
    el: document.getElementById("sortedWordList")
  });
  wordMatches.init();

  eliminatorMatches = new WordMatches({
    wordSelectHandler: handleWordSelect,
    el: document.getElementById("eliminatorWordList"),
    sort: "score"
  });
  eliminatorMatches.init();
  letterStates = new LetterStates();
  initWordGrid();
  renderGuess();
  initResetButton();
  showSections();
}

window.initRuiner = main;

main();
