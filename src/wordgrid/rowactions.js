import { Component } from "../component";
import { createIconButton } from "../util";

class RowActions extends Component {
  constructor(options) {
    super(options);
    this.nextWordCB = options.nextWordCB;
    this.editWordCB = options.editWordCB;
    this.notAWordCB = options.notAWordCB;
  }
  init() {
    this.el = document.createElement("div");
    this.el.id = "selector";
    this.notAWordButton = createIconButton(
      "cancel",
      () => {
        this.notAWordCB();
      },
      true
    );

    this.editWordButton = createIconButton("edit", () => {
      this.disableActionButtons();
      this.editWordCB();
    });

    this.nextWordButton = createIconButton("done", () => {
      this.nextWordCB();
    });

    this.el.appendChild(this.notAWordButton);
    this.el.appendChild(this.editWordButton);
    this.el.appendChild(this.nextWordButton);
    this.setLocation();
    return this.el;
  }

  setLocation(location = 0) {
    const root = document.documentElement;
    root.style.setProperty("--selector-x", location);
  }

  disableActionButtons(nextWord = true) {
    this.notAWordButton.setAttribute("disabled", true);
    this.editWordButton.setAttribute("disabled", true);
    if (nextWord === true) {
      this.nextWordButton.setAttribute("disabled", true);
    }
    this.isWordChangable = false;
  }

  enableActionButtons(nextWord = true) {
    this.notAWordButton.removeAttribute("disabled");
    this.editWordButton.removeAttribute("disabled");
    if (nextWord === true) {
      this.nextWordButton.removeAttribute("disabled");
    }
    this.isWordChangable = true;
  }
}

module.exports = { RowActions };
