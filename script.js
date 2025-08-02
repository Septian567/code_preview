require.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
  },
});

require(["vs/editor/editor.main"], function () {
  const htmlEditor = monaco.editor.create(
    document.getElementById("htmlEditor"),
    {
      value: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Responsive Preview</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Hello, Responsive World!</h1>
  <script src="script.js"></script>
</body>
</html>`,
      language: "html",
      theme: "vs-dark",
      automaticLayout: true,
    }
  );

  const cssEditor = monaco.editor.create(document.getElementById("cssEditor"), {
    value: `h1 {
  color: dodgerblue;
  text-align: center;
}`,
    language: "css",
    theme: "vs-dark",
    automaticLayout: true,
  });

  const jsEditor = monaco.editor.create(document.getElementById("jsEditor"), {
    value: `console.log("Responsive script loaded");`,
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true,
  });

  function updatePreview() {
    let html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();

    html = html.replace(
      /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']\s*\/?>/gi,
      `<style>${css}</style>`
    );

    html = html.replace(
      /<script\s+src=["']script\.js["']\s*><\/script>/gi,
      `<script>${js}<\/script>`
    );

    const iframe = document.getElementById("preview");
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  }

  [htmlEditor, cssEditor, jsEditor].forEach((editor) => {
    editor.onDidChangeModelContent(updatePreview);
  });

  updatePreview();

  // Tab switching
  document.querySelectorAll(".tabs button[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".tabs button")
        .forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const tab = button.getAttribute("data-tab");
      document
        .querySelectorAll(".editor")
        .forEach((ed) => ed.classList.add("hidden"));

      if (tab === "html")
        document.getElementById("htmlEditor").classList.remove("hidden");
      if (tab === "css")
        document.getElementById("cssEditor").classList.remove("hidden");
      if (tab === "js")
        document.getElementById("jsEditor").classList.remove("hidden");
    });
  });

  // Keyboard control for mobile
  const showKeyboardBtn = document.getElementById("showKeyboard");
  let isKeyboardActive = false;

  function setupEditorTouchBehavior(editor, editorElement) {
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener(
        "touchstart",
        (e) => {
          if (!isKeyboardActive) {
            e.preventDefault();
          }
        },
        { passive: false }
      );
    }

    // Blur editor when clicking outside
    document.addEventListener("touchstart", (e) => {
      if (isKeyboardActive && !editorElement.contains(e.target)) {
        editor.blur();
        editorElement.classList.remove("focus-mode");
        isKeyboardActive = false;
      }
    });
  }

  // Setup touch behavior for all editors
  setupEditorTouchBehavior(htmlEditor, document.getElementById("htmlEditor"));
  setupEditorTouchBehavior(cssEditor, document.getElementById("cssEditor"));
  setupEditorTouchBehavior(jsEditor, document.getElementById("jsEditor"));

  if (showKeyboardBtn) {
    showKeyboardBtn.addEventListener("click", () => {
      let activeTab = document
        .querySelector(".tabs button.active")
        ?.getAttribute("data-tab");
      let editorInstance, editorElement;

      if (activeTab === "html") {
        editorInstance = htmlEditor;
        editorElement = document.getElementById("htmlEditor");
      }
      if (activeTab === "css") {
        editorInstance = cssEditor;
        editorElement = document.getElementById("cssEditor");
      }
      if (activeTab === "js") {
        editorInstance = jsEditor;
        editorElement = document.getElementById("jsEditor");
      }

      if (editorInstance && editorElement) {
        isKeyboardActive = !isKeyboardActive;

        if (isKeyboardActive) {
          editorElement.classList.add("focus-mode");
          editorInstance.focus();
          const position = editorInstance.getPosition();
          editorInstance.revealPositionInCenter(position);
          showKeyboardBtn.textContent = "Hide Keyboard";
        } else {
          editorElement.classList.remove("focus-mode");
          editorInstance.blur();
          showKeyboardBtn.textContent = "Keyboard";
        }
      }
    });
  }

  // Responsive Dragging
  const resizer = document.getElementById("resizer");
  const container = document.getElementById("container");
  const editors = document.getElementById("editors");
  const preview = document.getElementById("preview");
  const toggleBtn = document.getElementById("togglePreview");

  let isResizing = false;
  let vertical = false;

  function updateLayoutDirection() {
    vertical = window.innerWidth <= 768;
    container.classList.toggle("vertical", vertical);

    if (!vertical) {
      container.classList.remove("preview-mode");
      if (toggleBtn) toggleBtn.textContent = "Preview";
    }
  }

  updateLayoutDirection();
  window.addEventListener("resize", updateLayoutDirection);

  resizer.addEventListener("mousedown", function () {
    isResizing = true;
    document.body.style.cursor = vertical ? "row-resize" : "col-resize";
  });

  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return;

    const rect = container.getBoundingClientRect();

    if (vertical) {
      const offsetY = e.clientY - rect.top;
      const minHeight = 100;
      const maxHeight = rect.height - 100;

      const editorHeight = Math.min(Math.max(offsetY, minHeight), maxHeight);
      const previewHeight = rect.height - editorHeight - resizer.offsetHeight;

      editors.style.height = `${editorHeight}px`;
      preview.style.height = `${previewHeight}px`;
    } else {
      const offsetX = e.clientX - rect.left;
      const minWidth = 200;
      const maxWidth = rect.width - 200;

      const editorWidth = Math.min(Math.max(offsetX, minWidth), maxWidth);
      const previewWidth = rect.width - editorWidth - resizer.offsetWidth;

      editors.style.width = `${editorWidth}px`;
      preview.style.width = `${previewWidth}px`;
    }
  });

  document.addEventListener("mouseup", function () {
    isResizing = false;
    document.body.style.cursor = "default";
  });

  // Mobile-only toggle preview button
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      container.classList.toggle("preview-mode");
      toggleBtn.textContent = container.classList.contains("preview-mode")
        ? "Editor"
        : "Preview";
    });
  }
});
