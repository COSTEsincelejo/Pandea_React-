/**
 * @fileoverview Panel de Ventas del Admin
 * Lista todas las ventas con opción de cambiar estado.
 */

import { useState, useEffect } from "react";
import { ventaService } from "../../services/ventaService";
import { supabase }     from "../../config/supabase";

export default function AdminVentas() {
  const [ventas,  setVentas]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ventaService.getAll().then(setVentas).finally(() => setLoading(false));
  }, []);

  async function cambiarEstado(id, estado) {
    await supabase.from("ventas").update({ estado }).eq("id", id);
    setVentas(prev => prev.map(v => v.id === id ? { ...v, estado } : v));
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Cargando ventas...</div>;

  return (
    <div id="admin-ventas">
      <div className="admin-section-header">
        <h3>Gestión de Ventas</h3>
        <span className="badge">{ventas.length} pedidos</span>
      </div>

      {ventas.length === 0 ? (
        <div className="admin-empty">
          <i className="fas fa-shopping-cart" />
          <p>No hay ventas registradas aún</p>
        </div>
      ) : (
        <div className="ventas-table">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id}>
                  <td><code>#{v.id.slice(0,8).toUpperCase()}</code></td>
                  <td>
                    <div className="cliente-info">
                      <span>{v.usuarios?.nombre || "—"}</span>
                      <small>{v.usuarios?.email}</small>
                    </div>
                  </td>
                  <td>
                    <div className="venta-productos">
                      {v.detalle_venta?.slice(0,2).map((d,i) => (
                        <span key={i} className="producto-tag">
                          {d.productos?.nombre} x{d.cantidad}
                        </span>
                      ))}
                      {v.detalle_venta?.length > 2 && (
                        <span className="producto-tag">+{v.detalle_venta.length - 2} más</span>
                      )}
                    </div>
                  </td>
                  <td><strong style={{ color: "#088178" }}>${Number(v.total).toLocaleString()}</strong></td>
                  <td><small>{new Date(v.created_at).toLocaleDateString("es-CO")}</small></td>
                  <td>
                    <select
                      className={`estado-select ${v.estado}`}
                      value={v.estado}
                      onChange={e => cambiarEstado(v.id, e.target.value)}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
