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

    // Replace <link> with actual <style>
    html = html.replace(
      /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']\s*\/?>/gi,
      `<style>${css}</style>`
    );

    // Replace <script src=""> with inline <script>
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

  // Tab switching logic
  document.querySelectorAll(".tabs button").forEach((button) => {
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
});
