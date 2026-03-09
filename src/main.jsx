import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Dismiss splash screen once React app is mounted
const splash = document.getElementById("splash");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Fade out and remove splash after a brief delay for smooth transition
if (splash) {
  setTimeout(() => {
    splash.classList.add("hidden");
    splash.addEventListener("transitionend", () => splash.remove());
  }, 800);
}
