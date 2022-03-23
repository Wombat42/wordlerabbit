const BUTTON_STATES = {
  /*
  Button state values
  */
  UNSELECTED: 0,
  POSSIBLE_LETTER: 1,
  POSITION_LOCKED_LETTER: 2,
  INVALID_LETTER: 3,

  /*
  Mapping of state to a class
  */
  CLASS_UNSELECTED: "", //"btn-secondary",
  CLASS_POSSIBLE_LETTER: "filter", //btn-warning",
  CLASS_POSITION_LOCKED_LETTER: "locked" //"btn-success",
  //CLASS_INVALID_LETTER: "btn-danger"
};

class BaseButton {
  constructor(letter = "&nbsp", allowedStates, cb) {
    this.allowedStates = allowedStates;
    this.state = 0;
    this.letter = letter;
    this.cb = cb;
    this.el = this.createButton();
  }

  createButton() {
    const button = document.createElement("button");
    button.className = this.getStyleClasses();
    button.innerText = this.letter;
    button.addEventListener("click", (event) => {
      return this.handleClick(event);
    });
    button.disabled = true;
    return button;
  }

  setLetter(letter, locked = false) {
    this.el.innerText = letter;
  }

  getLetter() {
    return this.el.innerText;
  }

  setEnabled(enabled = true) {
    this.el.disabled = !enabled;
  }

  getNextState() {
    this.state++;
    if (this.state >= this.allowedStates.length) {
      this.state = 0;
    }
    return this.state;
  }

  isLetterState(state) {
    return this.allowedStates[this.state] === state;
  }

  isPossible() {
    return this.isLetterState(BUTTON_STATES.POSSIBLE_LETTER);
  }

  isPositionLocked() {
    return this.isLetterState(BUTTON_STATES.POSITION_LOCKED_LETTER);
  }

  isUnselected() {
    return this.isLetterState(BUTTON_STATES.UNSELECTED);
  }

  isInvalid() {
    return this.isLetterState(BUTTON_STATES.INVALID_LETTER);
  }

  getStateClass() {
    let className = BUTTON_STATES.CLASS_UNSELECTED;
    switch (this.allowedStates[this.state]) {
      case BUTTON_STATES.POSSIBLE_LETTER:
        className = BUTTON_STATES.CLASS_POSSIBLE_LETTER;
        break;
      case BUTTON_STATES.POSITION_LOCKED_LETTER:
        className = BUTTON_STATES.CLASS_POSITION_LOCKED_LETTER;
        break;
      case BUTTON_STATES.INVALID_LETTER:
        className = BUTTON_STATES.CLASS_INVALID_LETTER;
        break;
      default:
        className = BUTTON_STATES.CLASS_UNSELECTED;
    }
    return className;
  }

  handleClick(event) {
    event.preventDefault();
    const nextButtonState = this.getNextState();
    this.state = nextButtonState;
    this.el.className = this.getStyleClasses();
    if (typeof this.cb === "function") {
      this.cb(this);
    }
  }

  getStyleClasses() {
    return `button ${this.getStateClass()} button-letter`;
  }
}

class WordButton extends BaseButton {
  constructor(letter, cb, position) {
    super(
      letter,
      [
        BUTTON_STATES.UNSELECTED,
        BUTTON_STATES.POSSIBLE_LETTER,
        BUTTON_STATES.POSITION_LOCKED_LETTER
      ],
      cb
    );
    this.position = position;
  }

  setLetter(letter, locked = false) {
    this.letter = letter;
    this.el.innerText = letter;
    this.state = 0;
    if (locked === true) {
      this.state = BUTTON_STATES.POSITION_LOCKED_LETTER;
      this.el.className = this.getStyleClasses();
    }
    this.el.className = this.getStyleClasses();
  }
}

function createLetterButton(letter, cb, position) {
  return new WordButton(letter, cb, position);
}

export { createLetterButton };
