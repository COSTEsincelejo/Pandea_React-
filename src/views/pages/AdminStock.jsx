/**
 * @fileoverview Panel de Stock del Admin
 * Gestiona entradas de inventario y muestra movimientos.
 */

import { useState, useEffect } from "react";
import { stockService }            from "../../services/stockService";
import { firestoreProductService } from "../../services/firestoreProductService";

export default function AdminStock() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos,   setProductos]   = useState([]);
  const [stockBajo,   setStockBajo]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [form, setForm] = useState({ id_producto: "", cantidad: "", motivo: "compra" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function cargar() {
      const [mov, prod, bajo] = await Promise.all([
        stockService.getMovimientos(),
        firestoreProductService.getAll(),
        stockService.getStockBajo(),
      ]);
      setMovimientos(mov);
      setProductos(prod);
      setStockBajo(bajo);
      setLoading(false);
    }
    cargar();
  }, []);

  async function handleEntrada(e) {
    e.preventDefault();
    if (!form.id_producto || !form.cantidad) return;
    setSaving(true);
    await stockService.entrada(form.id_producto, Number(form.cantidad), form.motivo);
    const [mov, bajo] = await Promise.all([
      stockService.getMovimientos(),
      stockService.getStockBajo(),
    ]);
    setMovimientos(mov);
    setStockBajo(bajo);
    setForm({ id_producto: "", cantidad: "", motivo: "compra" });
    setSaving(false);
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Cargando stock...</div>;

  return (
    <div id="admin-stock">
      <div className="admin-section-header">
        <h3>Gestión de Inventario</h3>
      </div>

      <div className="stock-grid">

        {/* Formulario entrada */}
        <div className="stock-form-card">
          <h4><i className="fas fa-plus-circle" /> Registrar Entrada</h4>
          <form onSubmit={handleEntrada}>
            <select value={form.id_producto}
              onChange={e => setForm(p => ({ ...p, id_producto: e.target.value }))} required>
              <option value="">Selecciona un producto</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.stock})
                </option>
              ))}
            </select>
            <input type="number" placeholder="Cantidad" min="1"
              value={form.cantidad}
              onChange={e => setForm(p => ({ ...p, cantidad: e.target.value }))} required />
            <input type="text" placeholder="Motivo (ej: compra, donación)"
              value={form.motivo}
              onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))} />
            <button type="submit" className="btn-add-cart" disabled={saving}>
              {saving ? "Guardando..." : <><i className="fas fa-save" /> Registrar entrada</>}
            </button>
          </form>
        </div>

        {/* Stock bajo */}
        <div className="stock-form-card">
          <h4><i className="fas fa-exclamation-triangle" style={{ color: "#f36d38" }} /> Stock Bajo</h4>
          {stockBajo.length === 0 ? (
            <p style={{ color: "#088178", textAlign: "center", padding: 20 }}>
              ✅ Todo el inventario está bien
            </p>
          ) : (
            stockBajo.map(p => (
              <div className="stock-item" key={p.id}>
                <img src={p.img} alt={p.nombre} />
                <div>
                  <p>{p.nombre}</p>
                  <span className={p.stock === 0 ? "sin-stock" : "poco-stock"}>
                    {p.stock === 0 ? "Sin stock" : `${p.stock} unidades`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Movimientos */}
      <div className="admin-section-header" style={{ marginTop: 32 }}>
        <h4>Historial de Movimientos</h4>
      </div>
      <div className="movimientos-list">
        {movimientos.length === 0 ? (
          <p style={{ textAlign: "center", color: "#aaa", padding: 40 }}>
            No hay movimientos registrados
          </p>
        ) : (
          movimientos.map(m => (
            <div className="movimiento-item" key={m.id}>
              <span className={`mov-tipo ${m.tipo}`}>
                {m.tipo === "entrada" ? "↑ Entrada" : "↓ Salida"}
              </span>
              <div className="mov-info">
                <p>{m.productos?.nombre}</p>
                <small>{m.motivo} · {new Date(m.fecha).toLocaleDateString("es-CO")}</small>
              </div>
              <strong>{m.cantidad} unidades</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
