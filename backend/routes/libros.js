import { Router } from "express";
import { libros } from "../data/memory.js";

const router = Router();

function validarLibro(body) {
  const { titulo, autor, genero, anio } = body;

  if (!titulo?.trim() || !autor?.trim() || !genero?.trim()) {
    return "Título, autor y género son obligatorios";
  }

  const anioNumero = Number(anio);
  if (!Number.isInteger(anioNumero) || anioNumero < 0 || anioNumero > new Date().getFullYear()) {
    return "El año debe ser un número válido";
  }

  return null;
}

router.get("/", (req, res) => {
  res.json(libros);
});

router.post("/", (req, res) => {
  const error = validarLibro(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const nuevoLibro = {
    id: libros.length ? Math.max(...libros.map((libro) => libro.id)) + 1 : 1,
    titulo: req.body.titulo.trim(),
    autor: req.body.autor.trim(),
    genero: req.body.genero.trim(),
    anio: Number(req.body.anio),
    disponible: true
  };

  libros.push(nuevoLibro);
  res.status(201).json(nuevoLibro);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const libro = libros.find((item) => item.id === id);

  if (!libro) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  const error = validarLibro(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  libro.titulo = req.body.titulo.trim();
  libro.autor = req.body.autor.trim();
  libro.genero = req.body.genero.trim();
  libro.anio = Number(req.body.anio);

  res.json(libro);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = libros.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  if (!libros[index].disponible) {
    return res.status(409).json({
      message: "No se puede eliminar un libro que tiene un préstamo activo"
    });
  }

  const eliminado = libros.splice(index, 1)[0];
  res.json(eliminado);
});

export default router;
