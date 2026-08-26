import express from "express";
import cors from "cors";
import librosRouter from "./routes/libros.js";
import lectoresRouter from "./routes/lectores.js";
import prestamosRouter from "./routes/prestamos.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API de Biblioteca funcionando correctamente" });
});

app.use("/api/libros", librosRouter);
app.use("/api/lectores", lectoresRouter);
app.use("/api/prestamos", prestamosRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
