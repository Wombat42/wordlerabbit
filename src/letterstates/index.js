class LetterStates {
  constructor() {
    // letters to remove
    this.filters = "";
    //letters to keep but not in that position
    this.positionFilters = ["", "", "", "", ""];
    // letters to lock in a position
    this.positionLocks = ["", "", "", "", ""];
  }

  addFilter(letter) {
    this.filters += letter;
  }

  addLock(letter, index) {
    this.positionLocks[index] = letter;
  }

  addPositionFilter(letter, index) {
    this.positionFilters[index] = letter;
  }
}

module.exports = { LetterStates };
