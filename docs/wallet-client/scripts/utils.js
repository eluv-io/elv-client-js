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
    const methodContainer = classLink.parentElement.nextSibling;

    classLink.tabIndex = "0";

    classLink.onclick = classLink.onkeypress = () => {
      if(methodContainer.style.display !== "block") {
        methodContainer.style.display = "block";
        classLink.className = classLink.className + " visible-class";
      } else {
        methodContainer.style.display = "none";
        classLink.className = classLink.className.replace("visible-class", "");
      }
    };

    const pageName = window.location.toString()
      .split("/").pop()
      .split(".")[0]
      .replace("module-", "")
      .replace("_", "/");

    if(pageName === classLink.innerText) {
      classLink.click();
      classContainer.className = classContainer.className + " active";
    }
  });

  Array.from(document.getElementsByClassName("example-toggle-button")).map(toggleButton => {
    toggleButton.onclick = (event) => {
      let exampleContainer = Array.from(event.target.parentNode.childNodes)
        .find(node => node.className && node.className.includes("example-container"));

      if(exampleContainer.style.display === "block") {
        exampleContainer.style.display = "none";
        event.target.innerHTML = "Show Examples";
      } else {
        exampleContainer.style.display = "block";
        event.target.innerHTML = "Hide Examples";
      }
    };
  });
});
