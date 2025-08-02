require.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
  },
});

require(["vs/editor/editor.main"], function () {
  // Initialize editors
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

  // Update preview function
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
      `<script>${js}</script>`
    );

    const iframe = document.getElementById("preview");
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  }

  // Set up editor change listeners
  [htmlEditor, cssEditor, jsEditor].forEach((editor) => {
    editor.onDidChangeModelContent(updatePreview);
  });

  // Initial preview update
  updatePreview();

  // Tab switching functionality
  document.querySelectorAll(".tabs button[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tabs button").forEach((btn) => {
        btn.classList.remove("active");
      });
      button.classList.add("active");

      const tab = button.getAttribute("data-tab");
      document.querySelectorAll(".editor").forEach((ed) => {
        ed.classList.add("hidden");
      });

      if (tab === "html") {
        document.getElementById("htmlEditor").classList.remove("hidden");
      } else if (tab === "css") {
        document.getElementById("cssEditor").classList.remove("hidden");
      } else if (tab === "js") {
        document.getElementById("jsEditor").classList.remove("hidden");
      }

      updateEditModeForActiveEditor();
    });
  });

  // Edit mode toggle functionality
  const toggleEditBtn = document.getElementById("toggleEditMode");
  let editMode = true;

  function applyReadModeStyles(editor, apply) {
    if (!editor) return;

    const domNode = editor.getDomNode();
    if (!domNode) return;

    const overlayId = "editorOverlay";
    let overlay = domNode.querySelector(`#${overlayId}`);
    const linesContent = domNode.querySelector(".lines-content");
    const margin = domNode.querySelector(".margin");

    if (apply) {
      // Add overlay
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = overlayId;
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.zIndex = "10";
        overlay.style.cursor = "default";
        domNode.appendChild(overlay);
      }

      // Apply margin left
      if (linesContent) {
        linesContent.style.marginLeft = "20px";
        linesContent.style.paddingLeft = "10px";
      }
      if (margin) {
        margin.style.backgroundColor = "#252526";
      }
    } else {
      // Remove overlay
      if (overlay) {
        overlay.remove();
      }

      // Reset margin
      if (linesContent) {
        linesContent.style.marginLeft = "";
        linesContent.style.paddingLeft = "";
      }
      if (margin) {
        margin.style.backgroundColor = "";
      }
    }
  }

  function updateEditModeForActiveEditor() {
    const activeTab = document
      .querySelector(".tabs button.active")
      ?.getAttribute("data-tab");
    let editorInstance;

    if (activeTab === "html") {
      editorInstance = htmlEditor;
    } else if (activeTab === "css") {
      editorInstance = cssEditor;
    } else if (activeTab === "js") {
      editorInstance = jsEditor;
    }

    if (editorInstance) {
      // Full read-only configuration
      editorInstance.updateOptions({
        readOnly: !editMode,
        domReadOnly: !editMode,
        cursorStyle: "none",
        hideCursorInOverviewRuler: true,
        renderLineHighlight: "none",
        minimap: { enabled: editMode },
        scrollBeyondLastLine: false,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
          handleMouseWheel: true,
        },
        mouseWheelZoom: editMode,
        contextmenu: editMode,
        folding: editMode,
        glyphMargin: editMode,
        lineNumbers: editMode ? "on" : "off",
        selectOnLineNumbers: editMode,
        selectionHighlight: editMode,
        renderWhitespace: "none",
        overviewRulerLanes: editMode ? 3 : 0,
        renderIndentGuides: editMode,
        renderValidationDecorations: "off",
        // Disable all editor contributions
        contributions: editMode ? undefined : [],
      });

      // Apply or remove read mode styles
      applyReadModeStyles(editorInstance, !editMode);

      // Force remove cursor and selections
      if (!editMode) {
        editorInstance.setSelections([]);
        editorInstance.setPosition({ lineNumber: 1, column: 1 });
      }
    }
  }

  if (toggleEditBtn) {
    toggleEditBtn.addEventListener("click", () => {
      editMode = !editMode;
      toggleEditBtn.textContent = editMode ? "Read Mode" : "Edit Mode";
      updateEditModeForActiveEditor();
    });
  }

  // Apply to all editors initially
  updateEditModeForActiveEditor();

  // Responsive layout and resizing
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

  // Mobile preview toggle
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      container.classList.toggle("preview-mode");
      toggleBtn.textContent = container.classList.contains("preview-mode")
        ? "Editor"
        : "Preview";
    });
  }
});
