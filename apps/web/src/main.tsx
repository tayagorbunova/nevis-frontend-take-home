import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/inter/opsz.css";
import "./styles/tokens.css";
import "./styles/global.css";

import { App } from "./app/App";
import { createQueryClient } from "./app/queryClient";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("index.html has no #root element");

const queryClient = createQueryClient();

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
