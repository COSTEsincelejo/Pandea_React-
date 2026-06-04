/**
 * @fileoverview Panel de Gastos del Admin
 * Permite registrar y ver gastos del negocio.
 */

import { useState, useEffect } from "react";
import { gastoService } from "../../services/gastoService";

export default function AdminGastos() {
  const [gastos,   setGastos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [concepto, setConcepto] = useState("");
  const [monto,    setMonto]    = useState("");
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    gastoService.getAll().then(setGastos).finally(() => setLoading(false));
  }, []);

  async function handleCrear(e) {
    e.preventDefault();
    if (!concepto || !monto) return;
    setSaving(true);
    await gastoService.crear({ concepto, monto: Number(monto) });
    const data = await gastoService.getAll();
    setGastos(data);
    setConcepto("");
    setMonto("");
    setSaving(false);
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    await gastoService.eliminar(id);
    setGastos(prev => prev.filter(g => g.id !== id));
  }

  const total = gastos.reduce((s, g) => s + Number(g.monto), 0);

  return (
    <div id="admin-gastos">
      <div className="admin-section-header">
        <h3>Gestión de Gastos</h3>
        <span className="badge red">Total: ${total.toLocaleString()}</span>
      </div>

      {/* Formulario nuevo gasto */}
      <form className="gasto-form" onSubmit={handleCrear}>
        <input type="text" placeholder="Concepto del gasto"
          value={concepto} onChange={e => setConcepto(e.target.value)} required />
        <input type="number" placeholder="Monto (COP)"
          value={monto} onChange={e => setMonto(e.target.value)} required />
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : <><i className="fas fa-plus" /> Agregar</>}
        </button>
      </form>

      {/* Lista de gastos */}
      {loading ? <p style={{ textAlign: "center", padding: 40 }}>Cargando...</p> : (
        <div className="gastos-list">
          {gastos.length === 0 ? (
            <div className="admin-empty">
              <i className="fas fa-receipt" />
              <p>No hay gastos registrados</p>
            </div>
          ) : (
            gastos.map(g => (
              <div className="gasto-item" key={g.id}>
                <div className="gasto-info">
                  <i className="fas fa-receipt" />
                  <div>
                    <p>{g.concepto}</p>
                    <small>{new Date(g.fecha).toLocaleDateString("es-CO")}</small>
                  </div>
                </div>
                <div className="gasto-monto">
                  <strong>${Number(g.monto).toLocaleString()}</strong>
                  <button onClick={() => handleEliminar(g.id)}>
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
