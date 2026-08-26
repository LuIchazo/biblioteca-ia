import { useEffect, useState } from "react";
import Modal from "./Modal";
import { api } from "../services/api";

const initialForm = {
  titulo: "",
  autor: "",
  genero: "",
  anio: ""
};

export default function Libros() {
  const [libros, setLibros] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const cargarLibros = async () => {
    try {
      setLibros(await api.get("/libros"));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarLibros();
  }, []);

  const abrirNuevo = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setModalOpen(true);
  };

  const editar = (libro) => {
    setForm({
      titulo: libro.titulo,
      autor: libro.autor,
      genero: libro.genero,
      anio: libro.anio
    });
    setEditingId(libro.id);
    setError("");
    setModalOpen(true);
  };

  const guardar = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await api.put(`/libros/${editingId}`, form);
      } else {
        await api.post("/libros", form);
      }

      setModalOpen(false);
      await cargarLibros();
    } catch (err) {
      setError(err.message);
    }
  };

  const eliminar = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este libro?")) return;

    try {
      await api.delete(`/libros/${id}`);
      await cargarLibros();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <h2>Libros</h2>
          <p>Administra el catálogo de libros de la biblioteca.</p>
        </div>
        <button className="primary" onClick={abrirNuevo}>+ Nuevo libro</button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Género</th>
              <th>Año</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {libros.map((libro) => (
              <tr key={libro.id}>
                <td>{libro.id}</td>
                <td>{libro.titulo}</td>
                <td>{libro.autor}</td>
                <td>{libro.genero}</td>
                <td>{libro.anio}</td>
                <td>
                  <span className={`badge ${libro.disponible ? "available" : "unavailable"}`}>
                    {libro.disponible ? "Disponible" : "Prestado"}
                  </span>
                </td>
                <td>
                  <button className="small" onClick={() => editar(libro)}>Editar</button>
                  <button className="small danger" onClick={() => eliminar(libro.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <Modal
          title={editingId ? "Editar libro" : "Nuevo libro"}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={guardar}>
            <label>Título<input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></label>
            <label>Autor<input value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} /></label>
            <label>Género<input value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value })} /></label>
            <label>Año<input type="number" value={form.anio} onChange={(e) => setForm({ ...form, anio: e.target.value })} /></label>
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
