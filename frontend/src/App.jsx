import { useState } from "react";
import Libros from "./components/Libros";
import Lectores from "./components/Lectores";
import Prestamos from "./components/Prestamos";

export default function App() {
  const [activeTab, setActiveTab] = useState("libros");

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Biblioteca IA</h1>
          <p>Sistema de gestión de información</p>
        </div>
      </header>

      <nav className="nav">
        <button className={activeTab === "libros" ? "active" : ""} onClick={() => setActiveTab("libros")}>
          Libros
        </button>
        <button className={activeTab === "lectores" ? "active" : ""} onClick={() => setActiveTab("lectores")}>
          Lectores
        </button>
        <button className={activeTab === "prestamos" ? "active" : ""} onClick={() => setActiveTab("prestamos")}>
          Préstamos
        </button>
      </nav>

      <main className="main">
        {activeTab === "libros" && <Libros />}
        {activeTab === "lectores" && <Lectores />}
        {activeTab === "prestamos" && <Prestamos />}
      </main>

      <footer className="footer">
        Proyecto académico — IA generativa y revisión automatizada de código
      </footer>
    </div>
  );
}
