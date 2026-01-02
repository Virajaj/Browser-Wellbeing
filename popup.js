const output = document.getElementById("output");

chrome.storage.local.get(null, (data) => {
  console.log("Popup storage:", data);

  if (!data.usage || Object.keys(data.usage).length === 0) {
    output.textContent = "No data yet";
    return;
  }

  let text = "";

  for (const site in data.usage) {
    const minutes = (data.usage[site] / 60000).toFixed(1);
    text += `${site}: ${minutes} min\n`;
  }

  output.textContent = text;
});
