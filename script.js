require.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
  },
});

require(["vs/editor/editor.main"], function () {
  // Inisialisasi editor
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

  // Fungsi update preview
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

  // Blokir keyboard muncul saat editor disentuh
  [htmlEditor, cssEditor, jsEditor].forEach((editor) => {
    const domNode = editor.getDomNode();
    if (domNode) {
      // Blokir semua interaksi touch
      domNode.addEventListener(
        "touchstart",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        { passive: false }
      );

      // Blokir juga pada scrollbar
      const scrollbar = domNode.querySelector(".monaco-scrollable-element");
      if (scrollbar) {
        scrollbar.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
          },
          { passive: false }
        );
      }
    }

    // Pastikan scrolling tidak memunculkan keyboard
    editor.onDidScrollChange(() => {
      const textarea = editor.getDomNode()?.querySelector("textarea");
      if (textarea && document.activeElement === textarea) {
        textarea.blur();
      }
    });
  });

  // Fungsi untuk tombol keyboard
  const showKeyboardBtn = document.getElementById("showKeyboard");
  if (showKeyboardBtn) {
    showKeyboardBtn.addEventListener("click", () => {
      const activeTab = document
        .querySelector(".tabs button.active")
        ?.getAttribute("data-tab");
      let editorInstance;

      if (activeTab === "html") editorInstance = htmlEditor;
      if (activeTab === "css") editorInstance = cssEditor;
      if (activeTab === "js") editorInstance = jsEditor;

      if (editorInstance) {
        // Teknik untuk memunculkan keyboard
        const tempTextarea = document.createElement("textarea");
        tempTextarea.style.position = "fixed";
        tempTextarea.style.top = "0";
        tempTextarea.style.left = "0";
        tempTextarea.style.opacity = "0";
        document.body.appendChild(tempTextarea);
        tempTextarea.focus();

        setTimeout(() => {
          editorInstance.focus();
          const position = editorInstance.getPosition();
          editorInstance.revealPositionInCenter(position);
          document.body.removeChild(tempTextarea);
        }, 100);
      }
    });
  }

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

  // Responsive dragging
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
