/* Go to page number */
window.addEventListener("load", () => {
  const anchor = window.location.hash.substr(1);
  if(!anchor) { return; }

  if(!anchor.startsWith("line")){ return; }

  const lineNumber = parseInt(anchor.split("line")[1]);
  if(!lineNumber) { return; }

  const sourceContainer = document.getElementsByClassName("source")[0].children[0];
  const sourceLines = sourceContainer.children;

  // Find opening comment to scroll to instead of directly to the line

  for(let i = lineNumber; i >= 0; i--) {
    const line = sourceLines[i];
    const comment = line.getElementsByClassName("com")[0];
    if(comment && comment.textContent.startsWith("/**")) {
      comment.scrollIntoView();
      return;
    }
  }
});

/* Show / Hide class method controls */
window.addEventListener("load", () => {
  Array.from(document.getElementsByClassName("class-link")).map(classLink => {
    const classContainer = classLink.parentElement;
    const methodContainer = classLink.nextSibling;

    const toggleButton = document.createElement("div");
    toggleButton.className = "class-toggle-button";
    toggleButton.innerText = "▼";

    toggleButton.onclick = () => {
      if(methodContainer.style.display !== "block") {
        methodContainer.style.display = "block";
        classLink.className = classLink.className + " visible-class";
        toggleButton.innerText = "▲";
      } else {
        methodContainer.style.display = "none";
        classLink.className = classLink.className.replace("visible-class", "");
        toggleButton.innerText = "▼";
      }

      classLink.scrollIntoView();
    };

    classContainer.insertBefore(toggleButton, methodContainer);

    if(window.location.toString().includes(classLink.innerText)) {
      toggleButton.click();
    }
  });

  document.getElementsByClassName("nav-container")[0].scrollTo(0, 0);
});
