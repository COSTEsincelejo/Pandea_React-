/**
 * @fileoverview Página de Checkout
 * Resume el carrito y lanza el pago con Wompi.
 * Cuando el pago es aprobado, crea la venta en Supabase y limpia el carrito.
 */

import { useState, useEffect } from "react";
import { useNavigate }     from "react-router-dom";
import { useCart }         from "../../context/CartContext";
import { useAuth }         from "../../context/AuthContext";
import { ventaService }    from "../../services/ventaService";
import { usuarioService }  from "../../services/usuarioService";
import WompiButton         from "../components/WompiButton";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user }                         = useAuth();
  const navigate                         = useNavigate();
  const [pagado,    setPagado]    = useState(false);
  const [error,     setError]     = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Guarda el pedido en sessionStorage apenas se carga el checkout.
  // Así está disponible en PagoResultado.jsx sin importar cómo
  // Wompi maneje la redirección (nueva pestaña, mismo tab, etc.)
  useEffect(() => {
    if (items && items.length > 0) {
      sessionStorage.setItem("pandea_pending_order", JSON.stringify({
        items,
        totalPrice,
        uid: user?.uid || null,
      }));
      console.log("💾 Pedido guardado en sessionStorage como respaldo");
    }
  }, [items, totalPrice, user]);

  // Carrito vacío
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <p style={{ color: "#888", marginBottom: 16 }}>Tu carrito está vacío.</p>
        <button className="btn-hero" onClick={() => navigate("/shop")}>
          Ver tienda
        </button>
      </div>
    );
  }

  async function handlePagoExitoso(transaction) {
    setGuardando(true);
    try {
      // Obtener ID real del usuario en Supabase
      const usuarios = await usuarioService.getAll();
      const usuario  = usuarios.find(u => u.uid === user?.uid);

      await ventaService.crear({
        id_cliente:      usuario?.id || null,
        total:           totalPrice,
        metodo_contacto: "wompi",
        items,
      });

      sessionStorage.removeItem("pandea_pending_order");
      clearCart();
      setPagado(true);
    } catch (err) {
      console.error("Error guardando venta:", err);
      setError("El pago fue exitoso pero no pudimos guardar tu pedido. Contáctanos.");
    } finally {
      setGuardando(false);
    }
  }

  function handlePagoError(transaction) {
    const status = transaction?.status;
    if (status === "VOIDED" || status === "ERROR") {
      setError("El pago fue rechazado o cancelado. Inténtalo de nuevo.");
    }
  }

  // Pago exitoso
  if (pagado) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: "#088178", marginBottom: 8 }}>¡Pago exitoso!</h2>
        <p style={{ color: "#666", marginBottom: 24 }}>
          Gracias por tu compra. Pronto nos pondremos en contacto contigo.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-hero" onClick={() => navigate("/")}>
            Volver al inicio
          </button>
          <button className="btn-back" onClick={() => navigate("/mis-compras")}>
            Ver mis compras
          </button>
        </div>
      </div>
    );
  }

  return (
    <section id="checkout-page" className="section-p1">
      <div className="checkout-container">

        {/* Encabezado */}
        <div className="checkout-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left" /> Volver
          </button>
          <h2>Resumen del pedido</h2>
        </div>

        <div className="checkout-grid">

          {/* ── Lista de productos ── */}
          <div className="checkout-items">
            <h3>Productos ({items.length})</h3>
            {items.map((item, i) => (
              <div className="checkout-item" key={i}>
                <img src={item.img} alt={item.name} />
                <div className="checkout-item-info">
                  <p>{item.name}</p>
                  {item.size && (
                    <span>
                      Talla: {item.size}
                      {item.color && (
                        <span style={{
                          display: "inline-block", width: 12, height: 12,
                          background: item.color, borderRadius: "50%",
                          marginLeft: 6, verticalAlign: "middle", border: "1px solid #ddd"
                        }} />
                      )}
                    </span>
                  )}
                  <span>Cantidad: {item.quantity}</span>
                </div>
                <div className="checkout-item-price">
                  <strong>${(item.price * item.quantity).toLocaleString("es-CO")}</strong>
                  <small>${item.price.toLocaleString("es-CO")} c/u</small>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="checkout-total">
              <span>Total a pagar</span>
              <strong>${totalPrice.toLocaleString("es-CO")} COP</strong>
            </div>
          </div>

          {/* ── Panel de pago ── */}
          <div className="checkout-payment">
            <h3>Datos de pago</h3>

            {/* Info usuario */}
            {user && (
              <div className="checkout-user-info">
                <i className="fas fa-user-circle" />
                <div>
                  <p>{user.displayName}</p>
                  <small>{user.email}</small>
                </div>
              </div>
            )}

            {/* Métodos de pago aceptados */}
            <div className="checkout-metodos">
              <span>Métodos aceptados:</span>
              <div className="checkout-metodos-icons">
                <span className="metodo-tag"><i className="fas fa-credit-card" /> Tarjeta</span>
                <span className="metodo-tag">PSE</span>
                <span className="metodo-tag">Nequi</span>
                <span className="metodo-tag">Daviplata</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="checkout-error">
                <i className="fas fa-exclamation-circle" /> {error}
              </div>
            )}

            {/* Botón Wompi */}
            {guardando ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <span className="spinner" /> Guardando tu pedido...
              </div>
            ) : (
              <div className="checkout-wompi-wrap">
                <WompiButton
                  total={totalPrice}
                  usuario={user}
                  onExito={handlePagoExitoso}
                  onError={handlePagoError}
                />
              </div>
            )}

            <p className="checkout-seguro">
              <i className="fas fa-shield-alt" /> Pago 100% seguro con Wompi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
