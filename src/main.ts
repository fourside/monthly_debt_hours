import "./style.css";

chrome.runtime.onMessage.addListener((message) => {
  console.log(message);
});

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
    </p>
  </div>
`;
