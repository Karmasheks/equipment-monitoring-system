import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Providers } from "@/components/providers";
import { Helmet } from "react-helmet";

createRoot(document.getElementById("root")!).render(
  <Providers>
    <Helmet>
      <title>МаркетМетрикс - Панель эффективности команды</title>
      <meta name="description" content="Комплексная панель мониторинга показателей эффективности маркетинговой команды с ролевым контролем доступа." />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    </Helmet>
    <App />
  </Providers>
);
