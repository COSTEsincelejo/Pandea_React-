/**
 * @fileoverview Página de Historial de Compras
 * Muestra el historial de compras del cliente logueado.
 * Ruta: /mis-compras
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ventaService } from "../../services/ventaService";

export default function MisCompras() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ventas,   setVentas]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    ventaService.getHistorial(user.uid)
      .then(setVentas)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p>Cargando historial...</p>
    </div>
  );

  return (
    <section id="mis-compras" className="section-p1">
      <div className="compras-header">
        <h2>Mis Compras</h2>
        <p>Historial de todos tus pedidos</p>
      </div>

      {ventas.length === 0 ? (
        <div className="compras-empty">
          <div style={{ fontSize: 64 }}>🛍️</div>
          <h3>Aún no tienes compras</h3>
          <p>Explora nuestra tienda y encuentra algo que te guste</p>
          <button className="btn-hero" onClick={() => navigate("/shop")}>
            Ir a la tienda
          </button>
        </div>
      ) : (
        <div className="compras-list">
          {ventas.map(venta => (
            <div className="compra-card" key={venta.id}>

              {/* Encabezado de la venta */}
              <div className="compra-card-header">
                <div>
                  <span className="compra-id">Pedido #{venta.id.slice(0,8).toUpperCase()}</span>
                  <span className={`compra-estado ${venta.estado}`}>{venta.estado}</span>
                </div>
                <div className="compra-meta">
                  <span>{new Date(venta.created_at).toLocaleDateString("es-CO", {
                    year: "numeric", month: "long", day: "numeric"
                  })}</span>
                  <strong>${Number(venta.total).toLocaleString()}</strong>
                </div>
              </div>

              {/* Productos de la venta */}
              <div className="compra-items">
                {venta.detalle_venta?.map((detalle, i) => (
                  <div className="compra-item" key={i}>
                    <img
                      src={detalle.productos?.img || "/img/placeholder.jpg"}
                      alt={detalle.productos?.nombre}
                    />
                    <div className="compra-item-info">
                      <p>{detalle.productos?.nombre}</p>
                      <span>
                        Cant: {detalle.cantidad}
                        {detalle.talla && ` · Talla: ${detalle.talla}`}
                      </span>
                      <strong>${Number(detalle.precio_unitario).toLocaleString()}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
