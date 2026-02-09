import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./utils/sw-register"; // Initialize service worker update handling

createRoot(document.getElementById("root")!).render(<App />);

