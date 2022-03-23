import { LetterStates } from "../letterstates";
import { Component } from "../component";
import { RowActions } from "./rowactions";
import { WordRow } from "./wordrow";

class WordGrid extends Component {
  constructor(options) {
    super(options);
    this.wordRows = [];
    this.currentWordIndex = 0;
    this.letterChangeCB = this.options.letterChangeHandler;
    this.notAWordCB = this.options.notAWordHandler;
    this.nextWordCB = this.options.nextWordHandler;
    this.rowActions = null;
    this.isWordChangable = true;
  }

  isWordEditable() {
    return this.isWordChangable;
  }

  initWordGrid() {
    this.wordGridContainer = document.createElement("div");
    this.wordGridContainer.id = `wordgrid`;

    for (let wordRowIndex = 0; wordRowIndex < 6; wordRowIndex++) {
      const wordRow = new WordRow({
        filterChangeCB: (states) => {
          this.handleLetterChange(states);
        },
        editFinishedCB: () => {
          this.rowActions.enableActionButtons();
        }
      });
      const wordRowContainer = wordRow.initWordRow(wordRowIndex);
      this.wordGridContainer.appendChild(wordRowContainer);
      this.wordRows[wordRowIndex] = wordRow;
    }

    this.rowActions = new RowActions({
      nextWordCB: () => {
        this.moveToNextRow();
      },
      editWordCB: () => {
        this.rowActions.disableActionButtons();
        this.wordRows[this.currentWordIndex].edit();
      },
      notAWordCB: () => {
        if (this.notAWordCB) {
          const word = this.wordRows[this.currentWordIndex].getWord();
          this.notAWordCB(word);
        }
      }
    });
    this.rowActions.init();
    this.wordGridContainer.appendChild(this.rowActions.el);
    this.el = this.wordGridContainer;
    return this.wordGridContainer;
  }

  /**
   * Merges all the word rows letter states into a single combined object
   * that can be used to get the next possible word.
   * Any word change or letter change should call this function.
   */
  mergeRowStates() {
    // required letters are the letters that are position Locked
    // or position filtered
    let requiredLetters = "";
    const letterStates = this.wordRows.reduce((states, row) => {
      const rowLetterStates = row.letterStates;
      states.filters += rowLetterStates.filters;
      states.positionFilters = states.positionFilters.map((filters, index) => {
        const positionFilters = rowLetterStates.positionFilters[index];
        requiredLetters += positionFilters;
        return filters + positionFilters;
      });
      states.positionLocks = states.positionLocks.map((lock, index) => {
        if (!lock) {
          const positionLock = rowLetterStates.positionLocks[index];
          requiredLetters += positionLock;
          return positionLock;
        }
        requiredLetters += lock;
        return lock;
      });
      return states;
    }, new LetterStates());

    // remove requiredLetters from the filters
    letterStates.filters = letterStates.filters.replaceAll(
      new RegExp(`[${requiredLetters}]`, "g"),
      ""
    );
    return letterStates;
  }

  areAllStatesClear(states) {
    if (states.filters === this.wordRows[this.currentWordIndex].getWord()) {
      const arePositionLocksEmtpy = states.positionLocks.every(
        (string) => string.length === 0
      );
      const arePositionFiltersEmpty = states.positionFilters.every(
        (string) => string.length === 0
      );
      return arePositionLocksEmtpy && arePositionFiltersEmpty;
    }
    return false;
  }

  handleLetterChange(states) {
    const allLetterStates = this.mergeRowStates();

    if (this.letterChangeCB) {
      this.letterChangeCB(allLetterStates);
    }
    if (this.areAllStatesClear(states)) {
      this.rowActions.enableActionButtons(false);
    } else {
      this.rowActions.disableActionButtons(false);
    }
  }

  setCurrentWord(word) {
    const allLetterStates = this.mergeRowStates();
    this.wordRows[this.currentWordIndex].setWord(
      word,
      allLetterStates.positionLocks
    );
    this.letterChangeCB(allLetterStates);
  }

  setNextWord(word) {
    if (this.currentWordIndex + 1 < this.wordRows.length) {
      const allLetterStates = this.mergeRowStates();
      this.wordRows[this.currentWordIndex + 1].setWord(
        word,
        allLetterStates.positionLocks
      );
    }
  }

  resetSelectorLocation() {
    this.rowActions.setLocation(this.currentWordIndex);
    this.wordRows[this.currentWordIndex].enableRow();
  }

  moveToNextRow() {
    this.currentWordIndex++;
    if (this.currentWordIndex >= 5) {
      this.currentWordIndex = 5;
    }

    this.resetSelectorLocation();
    if (this.nextWordCB) {
      const allLetterStates = this.mergeRowStates();
      this.nextWordCB(allLetterStates);
    }
    this.rowActions.enableActionButtons();
  }
}

module.exports = { WordGrid };
