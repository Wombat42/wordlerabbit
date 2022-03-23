import { createLetterButton } from "../guessButtons";
import { Component } from "../component";
import { LetterStates } from "../letterstates";
import { createIconButton } from "../util";

class WordRow extends Component {
  constructor(options) {
    super(options);
    this.letterButtons = [];
    this.wordRowContainer = null;
    this.letterStates = new LetterStates();
    this.filterChangeCB = options.filterChangeCB;
    this.editFinishedCB = options.editFinishedCB;
  }

  setWord(word, positionLocks) {
    this.letterStates = new LetterStates();
    this.letterStates.positionLocks = positionLocks;
    if (word.length > 0) {
      if (this.options.word !== word) {
        this.updateLetterButtons(word, positionLocks);
      }
      this.options.word = word;
    }
  }

  getWord() {
    return this.options.word;
  }

  getLetterStates() {}

  handleWordButtonClick(button, index) {
    this.letterStates = this.letterButtons.reduce((states, button, index) => {
      const letter = button.getLetter();
      if (button.isPositionLocked()) {
        states.addLock(letter, index);
      } else if (button.isPossible()) {
        states.addPositionFilter(letter, index);
      } else {
        states.addFilter(letter);
      }

      return states;
    }, new LetterStates());
    if (this.filterChangeCB) {
      this.filterChangeCB(this.letterStates);
    }
  }

  updateLetterButtons(string, positionLocks) {
    this.letterStates.addFilter(string);
    if (string) {
      [...string].forEach((character, index) => {
        const button = this.letterButtons[index];
        let locked = false;
        if (positionLocks) {
          locked = character === positionLocks[index];
        }
        button.setLetter(character, locked);
        button.setEnabled(true);
      });
    }
  }

  enableRow() {
    this.letterButtons.forEach((button) => {
      button.setEnabled(true);
    });
  }

  disableRow() {
    this.letterButtons.forEach((button) => {
      button.setEnabled(false);
    });
  }

  edit() {
    this.disableRow();
    this.showInputContainer();
  }

  hideInputContainer() {
    this.inputContainer.setAttribute("style", "display:none");
    this.buttonContainer.removeAttribute("style");
  }

  showInputContainer() {
    this.inputContainer.removeAttribute("style");
    this.buttonContainer.setAttribute("style", "display:none");
    this.textInput.focus();
  }

  finishEditButtonHandler() {
    this.hideInputContainer();
    this.setWord(
      this.textInput.value.toLowerCase(),
      this.letterStates.positionLocks
    );
    this.enableRow();
    this.editFinishedCB();
  }

  initInputArea() {
    this.inputContainer = document.createElement("div");
    this.inputContainer.className = "input-container";

    this.textInput = document.createElement("input");
    this.textInput.setAttribute("maxlength", "5");
    this.textInput.setAttribute("type", "text");
    this.textInput.addEventListener("keyup", (event) => {
      if (this.textInput.value.length >= 5) {
        const { code } = event;
        this.finishEditButton.removeAttribute("disabled");
        if (code === "Enter") {
          this.finishEditButtonHandler();
        }
      }
    });
    this.inputContainer.appendChild(this.textInput);

    this.cancelEditButton = createIconButton("cancel", () => {
      this.hideInputContainer();
      this.enableRow();
      this.editFinishedCB();
    }, true);
    this.inputContainer.appendChild(this.cancelEditButton);

    this.finishEditButton = createIconButton("done", () => {
      this.finishEditButtonHandler();
    });

    this.finishEditButton.setAttribute("disabled", true);
    this.inputContainer.appendChild(this.finishEditButton);
    this.inputContainer.setAttribute("style", "display:none");
    this.wordRowContainer.appendChild(this.inputContainer);
  }

  initWordRow(index) {
    this.wordRow = document.createElement("div");
    this.wordRowContainer = document.createElement("div");
    this.buttonContainer = document.createElement("div");
    this.buttonContainer.className = "button-container";
    this.wordRowContainer.className = "wordrow";
    this.wordRowContainer.id = `row-${index}`;

    for (let buttonIndex = 0; buttonIndex < 5; buttonIndex++) {
      const letterButton = createLetterButton(
        "",
        (button) => {
          this.handleWordButtonClick(button, index);
        },
        buttonIndex
      );

      this.letterButtons[buttonIndex] = letterButton;
      this.buttonContainer.appendChild(letterButton.el);
    }
    this.wordRowContainer.appendChild(this.buttonContainer);
    this.wordRow.appendChild(this.wordRowContainer);
    this.initInputArea();
    this.el = this.wordRow;
    return this.wordRow;
  }
}

module.exports = { WordRow };
