import { Router } from "express";
import { lectores, prestamos } from "../data/memory.js";

const router = Router();

function validarLector(body) {
  const { nombre, apellido, ci, correo, telefono } = body;

  if (!nombre?.trim() || !apellido?.trim() || !ci?.trim() || !correo?.trim() || !telefono?.trim()) {
    return "Todos los campos del lector son obligatorios";
  }

  if (!correo.includes("@")) {
    return "El correo electrónico no es válido";
  }

  return null;
}

router.get("/", (req, res) => {
  res.json(lectores);
});

router.post("/", (req, res) => {
  const error = validarLector(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  if (lectores.some((lector) => lector.ci === req.body.ci.trim())) {
    return res.status(409).json({ message: "Ya existe un lector con ese CI" });
  }

  const nuevoLector = {
    id: lectores.length ? Math.max(...lectores.map((lector) => lector.id)) + 1 : 1,
    nombre: req.body.nombre.trim(),
    apellido: req.body.apellido.trim(),
    ci: req.body.ci.trim(),
    correo: req.body.correo.trim(),
    telefono: req.body.telefono.trim()
  };

  lectores.push(nuevoLector);
  res.status(201).json(nuevoLector);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const lector = lectores.find((item) => item.id === id);

  if (!lector) {
    return res.status(404).json({ message: "Lector no encontrado" });
  }

  const error = validarLector(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const ciDuplicado = lectores.some(
    (item) => item.ci === req.body.ci.trim() && item.id !== id
  );

  if (ciDuplicado) {
    return res.status(409).json({ message: "Ya existe otro lector con ese CI" });
  }

  lector.nombre = req.body.nombre.trim();
  lector.apellido = req.body.apellido.trim();
  lector.ci = req.body.ci.trim();
  lector.correo = req.body.correo.trim();
  lector.telefono = req.body.telefono.trim();

  res.json(lector);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const tienePrestamoActivo = prestamos.some(
    (prestamo) => prestamo.lectorId === id && prestamo.estado === "Activo"
  );

  if (tienePrestamoActivo) {
    return res.status(409).json({
      message: "No se puede eliminar un lector con un préstamo activo"
    });
  }

  const index = lectores.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Lector no encontrado" });
  }

  const eliminado = lectores.splice(index, 1)[0];
  res.json(eliminado);
});

export default router;
