import { useEffect, useState } from "react";
import Modal from "./Modal";
import { api } from "../services/api";

const initialForm = {
  lectorId: "",
  libroId: "",
  fechaPrestamo: new Date().toISOString().slice(0, 10),
  fechaDevolucion: "",
  estado: "Activo"
};

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [lectores, setLectores] = useState([]);
  const [libros, setLibros] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      const [prestamosData, lectoresData, librosData] = await Promise.all([
        api.get("/prestamos"),
        api.get("/lectores"),
        api.get("/libros")
      ]);

      setPrestamos(prestamosData);
      setLectores(lectoresData);
      setLibros(librosData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirNuevo = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setModalOpen(true);
  };

  const editar = (prestamo) => {
    setForm({
      lectorId: prestamo.lectorId,
      libroId: prestamo.libroId,
      fechaPrestamo: prestamo.fechaPrestamo,
      fechaDevolucion: prestamo.fechaDevolucion,
      estado: prestamo.estado
    });
    setEditingId(prestamo.id);
    setError("");
    setModalOpen(true);
  };

  const guardar = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/prestamos/${editingId}`, form);
      } else {
        await api.post("/prestamos", form);
      }

      setModalOpen(false);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este préstamo?")) return;

    try {
      await api.delete(`/prestamos/${id}`);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <h2>Préstamos</h2>
          <p>Registra y controla los préstamos de libros.</p>
        </div>
        <button className="primary" onClick={abrirNuevo}>+ Nuevo préstamo</button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Lector</th>
              <th>Libro</th>
              <th>Préstamo</th>
              <th>Devolución</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {prestamos.map((prestamo) => (
              <tr key={prestamo.id}>
                <td>{prestamo.id}</td>
                <td>{prestamo.lector ? `${prestamo.lector.nombre} ${prestamo.lector.apellido}` : "N/A"}</td>
                <td>{prestamo.libro?.titulo || "N/A"}</td>
                <td>{prestamo.fechaPrestamo}</td>
                <td>{prestamo.fechaDevolucion || "-"}</td>
                <td>
                  <span className={`badge ${prestamo.estado === "Activo" ? "unavailable" : "available"}`}>
                    {prestamo.estado}
                  </span>
                </td>
                <td>
                  <button className="small" onClick={() => editar(prestamo)}>Editar</button>
                  <button className="small danger" onClick={() => eliminar(prestamo.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? "Editar préstamo" : "Nuevo préstamo"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={guardar}>
            <label>
              Lector
              <select value={form.lectorId} onChange={(e) => setForm({ ...form, lectorId: e.target.value })}>
                <option value="">Seleccionar lector</option>
                {lectores.map((lector) => (
                  <option key={lector.id} value={lector.id}>
                    {lector.nombre} {lector.apellido}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Libro
              <select value={form.libroId} onChange={(e) => setForm({ ...form, libroId: e.target.value })}>
                <option value="">Seleccionar libro</option>
                {libros
                  .filter((libro) => libro.disponible || libro.id === Number(form.libroId))
                  .map((libro) => (
                    <option key={libro.id} value={libro.id}>
                      {libro.titulo}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Fecha de préstamo
              <input type="date" value={form.fechaPrestamo} onChange={(e) => setForm({ ...form, fechaPrestamo: e.target.value })} />
            </label>

            <label>
              Fecha de devolución
              <input type="date" value={form.fechaDevolucion} onChange={(e) => setForm({ ...form, fechaDevolucion: e.target.value })} />
            </label>

            <label>
              Estado
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                <option value="Activo">Activo</option>
                <option value="Devuelto">Devuelto</option>
              </select>
            </label>

            <div className="form-actions">
              <button type="button" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className="primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
