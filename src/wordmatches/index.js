import { Component } from "../component";
class WordMatches extends Component {
  constructor(options) {
    super(options);
    this.el = this.options.el;
    this.wordSelectCB = this.options.wordSelectHandler;
  }

  createPanel(className) {
    const panel = document.createElement("div");
    panel.className = className;
    return panel;
  }

  init() {
    this.messageDiv = this.createPanel("message");
    this.messageArea = document.createElement("em");
    this.messageArea.textContent = "No matches found";
    this.messageDiv.appendChild(this.messageArea);
    this.el.appendChild(this.messageDiv);

    this.messageDiv.style.setProperty("display", "none");
    this.wordDiv = this.createPanel("wordList");
    this.el.appendChild(this.wordDiv);
  }

  handleWordClick(word) {
    if (this.wordSelectCB) {
      this.wordSelectCB(word);
    }
  }

  createWord(word) {
    const wordEl = document.createElement("div");
    wordEl.className = "word";
    wordEl.innerText = word;
    wordEl.addEventListener("click", (event) => {
      return this.handleWordClick(word);
    });
    return wordEl;
  }

  empty(el) {
    if (!el) {
      el = this.el;
    }
    while (el.firstChild) {
      el.removeChild(el.lastChild);
    }
  }

  showMessage() {
    this.messageDiv.style.removeProperty("display");
  }

  hideMessage() {
    this.messageDiv.style.setProperty("display", "none");
  }

  showWords() {
    this.wordDiv.style.removeProperty("display");
  }

  hideWords() {
    this.wordDiv.style.setProperty("display", "none");
  }

  reset(wordArray, filters) {
    this.hideMessage();
    this.empty(this.wordDiv);
    const words = wordArray
      .filter(({ word, score }) => {
        return typeof filters[word] === "undefined" && score > 0;
      })
      .sort((a, b) => {
        if (this.options.sort !== "score") {
          return a.word.localeCompare(b.word);
        } else {
          return a.score > b.score ? -1 : 1;
        }
      })
      .map((word) => {
        return word.word;
      });

    if (words.length > 0) {
      words.forEach((word) => {
        const wordEl = this.createWord(word);
        this.wordDiv.appendChild(wordEl);
      });
      this.showWords();
    } else {
      this.hideWords();
      this.showMessage();
    }
  }
}

module.exports = { WordMatches };
