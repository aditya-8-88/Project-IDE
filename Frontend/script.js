document.getElementById("run-btn").addEventListener("click", async () => {
    const code = document.getElementById("editor").value;
    const language = document.getElementById("language").value;
    const outputEl = document.getElementById("output");
  
    outputEl.textContent = "Running...";
  
    try {
      const response = await fetch("http://localhost:3000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const result = await response.json();
      outputEl.textContent = result.output || "No output";
    } catch (err) {
      outputEl.textContent = `Error: ${err.message}`;
    }
  });
  