import { useEffect, useState } from "react";
import Modal from "./Modal";
import { api } from "../services/api";

const initialForm = {
  nombre: "",
  apellido: "",
  ci: "",
  correo: "",
  telefono: ""
};

export default function Lectores() {
  const [lectores, setLectores] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const cargar = async () => {
    try {
      setLectores(await api.get("/lectores"));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const editar = (lector) => {
    setForm(lector);
    setEditingId(lector.id);
    setError("");
    setModalOpen(true);
  };

  const guardar = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/lectores/${editingId}`, form);
      } else {
        await api.post("/lectores", form);
      }
      setModalOpen(false);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este lector?")) return;

    try {
      await api.delete(`/lectores/${id}`);
      await cargar();
    } catch (err) {
      setError(err.message);
    }
  };

  const abrirNuevo = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setModalOpen(true);
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <h2>Lectores</h2>
          <p>Administra las personas registradas en la biblioteca.</p>
        </div>
        <button className="primary" onClick={abrirNuevo}>+ Nuevo lector</button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>CI</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lectores.map((lector) => (
              <tr key={lector.id}>
                <td>{lector.id}</td>
                <td>{lector.nombre} {lector.apellido}</td>
                <td>{lector.ci}</td>
                <td>{lector.correo}</td>
                <td>{lector.telefono}</td>
                <td>
                  <button className="small" onClick={() => editar(lector)}>Editar</button>
                  <button className="small danger" onClick={() => eliminar(lector.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? "Editar lector" : "Nuevo lector"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={guardar}>
            <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
            <label>Apellido<input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} /></label>
            <label>CI<input value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} /></label>
            <label>Correo<input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></label>
            <label>Teléfono<input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></label>
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
