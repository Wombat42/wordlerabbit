function createButton(name, clickHandler, cancel = false) {
  const button = document.createElement("button");
  if (name) {
    button.innerText = name;
  }
  button.className = `btn-icon ${cancel ? "btn-icon--cancel" : ""}`;
  button.addEventListener("click", clickHandler);
  return button;
}

function createIconButton(name, clickHandler, cancel = false) {
  const button = createButton(null, clickHandler, cancel);
  const element = document.createElement("span");
  element.className = "material-icons";
  element.innerHTML = name;
  button.appendChild(element);
  return button;
}

module.exports = { createButton, createIconButton };
