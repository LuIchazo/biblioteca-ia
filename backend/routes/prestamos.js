import { Router } from "express";
import { libros, lectores, prestamos } from "../data/memory.js";

const router = Router();

function validarPrestamo(body) {
  if (!body.lectorId || !body.libroId || !body.fechaPrestamo) {
    return "Lector, libro y fecha de préstamo son obligatorios";
  }

  if (body.fechaDevolucion && body.fechaDevolucion < body.fechaPrestamo) {
    return "La fecha de devolución no puede ser anterior a la fecha de préstamo";
  }

  return null;
}

router.get("/", (req, res) => {
  const resultado = prestamos.map((prestamo) => ({
    ...prestamo,
    lector: lectores.find((lector) => lector.id === prestamo.lectorId),
    libro: libros.find((libro) => libro.id === prestamo.libroId)
  }));

  res.json(resultado);
});

router.post("/", (req, res) => {
  const error = validarPrestamo(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const lectorId = Number(req.body.lectorId);
  const libroId = Number(req.body.libroId);

  const lector = lectores.find((item) => item.id === lectorId);
  const libro = libros.find((item) => item.id === libroId);

  if (!lector) {
    return res.status(404).json({ message: "El lector no existe" });
  }

  if (!libro) {
    return res.status(404).json({ message: "El libro no existe" });
  }

  if (!libro.disponible) {
    return res.status(409).json({ message: "El libro no está disponible" });
  }

  const nuevoPrestamo = {
    id: prestamos.length ? Math.max(...prestamos.map((item) => item.id)) + 1 : 1,
    lectorId,
    libroId,
    fechaPrestamo: req.body.fechaPrestamo,
    fechaDevolucion: req.body.fechaDevolucion || "",
    estado: "Activo"
  };

  prestamos.push(nuevoPrestamo);
  libro.disponible = false;

  res.status(201).json(nuevoPrestamo);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const prestamo = prestamos.find((item) => item.id === id);

  if (!prestamo) {
    return res.status(404).json({ message: "Préstamo no encontrado" });
  }

  const error = validarPrestamo(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const libroAnterior = libros.find((item) => item.id === prestamo.libroId);
  const nuevoLibroId = Number(req.body.libroId);
  const nuevoLibro = libros.find((item) => item.id === nuevoLibroId);

  if (!nuevoLibro) {
    return res.status(404).json({ message: "El nuevo libro no existe" });
  }

  if (nuevoLibroId !== prestamo.libroId && !nuevoLibro.disponible) {
    return res.status(409).json({ message: "El nuevo libro no está disponible" });
  }

  const lector = lectores.find((item) => item.id === Number(req.body.lectorId));
  if (!lector) {
    return res.status(404).json({ message: "El lector no existe" });
  }

  prestamo.lectorId = Number(req.body.lectorId);
  prestamo.libroId = nuevoLibroId;
  prestamo.fechaPrestamo = req.body.fechaPrestamo;
  prestamo.fechaDevolucion = req.body.fechaDevolucion || "";
  prestamo.estado = req.body.estado || prestamo.estado;

  if (libroAnterior && nuevoLibroId !== libroAnterior.id) {
    libroAnterior.disponible = true;
    nuevoLibro.disponible = false;
  }

  if (prestamo.estado === "Devuelto") {
    nuevoLibro.disponible = true;
  } else {
    nuevoLibro.disponible = false;
  }

  res.json(prestamo);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = prestamos.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Préstamo no encontrado" });
  }

  const eliminado = prestamos.splice(index, 1)[0];
  const libro = libros.find((item) => item.id === eliminado.libroId);

  if (libro) {
    libro.disponible = true;
  }

  res.json(eliminado);
});

export default router;
