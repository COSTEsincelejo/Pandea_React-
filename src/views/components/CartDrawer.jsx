/**
 * @fileoverview Carrito lateral con checkout
 * Muestra los productos del carrito y permite finalizar la compra.
 * Al confirmar, registra la venta en Supabase.
 */

import { useState } from "react";
import { useCartController } from "../../controllers/useCartController";
import { useAuth } from "../../context/AuthContext";
import { ventaService } from "../../services/ventaService";
import { usuarioService } from "../../services/usuarioService";

export default function CartDrawer() {
  const { items, total, count, isOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCartController();
  const { user } = useAuth();
  const [checking, setChecking] = useState(false);
  const [success,  setSuccess]  = useState(false);

  if (!isOpen) return null;

  async function handleCheckout() {
    if (!user) return alert("Debes iniciar sesión para comprar.");
    if (items.length === 0) return;

    setChecking(true);
    try {
      // Obtener ID del usuario en Supabase
      const usuarios = await usuarioService.getAll();
      const usuario  = usuarios.find(u => u.uid === user.uid);

      await ventaService.crear({
        id_cliente:      usuario?.id,
        total,
        metodo_contacto: "web",
        items,
      });

      setSuccess(true);
      clearCart();
      setTimeout(() => { setSuccess(false); closeCart(); }, 3000);
    } catch (err) {
      console.error("Error al procesar compra:", err);
      alert("Error al procesar la compra. Inténtalo de nuevo.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <>
      <div onClick={closeCart} style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 9998
      }} />

      <div style={{
        position: "fixed", top: 0, right: 0,
        width: 380, height: "100vh",
        background: "#fff",
        boxShadow: "-4px 0 30px rgba(0,0,0,0.15)",
        zIndex: 9999,
        display: "flex", flexDirection: "column",
        animation: "slideIn 0.3s ease"
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", padding: "20px 24px",
          borderBottom: "1px solid #eee"
        }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>🛒 Carrito ({count})</h3>
          <button onClick={closeCart} style={{
            background: "none", border: "none",
            fontSize: 22, cursor: "pointer", color: "#666"
          }}>✕</button>
        </div>

        {/* Pantalla de éxito */}
        {success ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h3 style={{ color: "#088178", marginBottom: 8 }}>¡Compra realizada!</h3>
            <p style={{ color: "#666" }}>Tu pedido ha sido registrado exitosamente.</p>
          </div>
        ) : (
          <>
            {/* Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
                  <p>Tu carrito está vacío</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} style={{
                    display: "flex", gap: 12, alignItems: "center",
                    padding: "12px 0", borderBottom: "1px solid #f0f0f0"
                  }}>
                    <img src={item.img} alt={item.name} style={{
                      width: 70, height: 70, objectFit: "cover", borderRadius: 8
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#222" }}>
                        {item.name}
                      </p>
                      {item.size && (
                        <p style={{ margin: "2px 0", fontSize: 12, color: "#888" }}>
                          Talla: {item.size}
                          {item.color && (
                            <span style={{
                              display: "inline-block", width: 12, height: 12,
                              background: item.color, borderRadius: "50%",
                              marginLeft: 6, verticalAlign: "middle", border: "1px solid #ddd"
                            }} />
                          )}
                        </p>
                      )}
                      <p style={{ margin: "4px 0", color: "#088178", fontWeight: 700 }}>
                        ${item.price.toLocaleString()}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{
                          width: 26, height: 26, borderRadius: "50%",
                          border: "1px solid #ddd", background: "#f5f5f5",
                          cursor: "pointer", fontWeight: 700
                        }}>−</button>
                        <span style={{ fontWeight: 600 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{
                          width: 26, height: 26, borderRadius: "50%",
                          border: "1px solid #ddd", background: "#f5f5f5",
                          cursor: "pointer", fontWeight: 700
                        }}>+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{
                      background: "none", border: "none",
                      color: "#e74c3c", cursor: "pointer", fontSize: 18
                    }}>🗑️</button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: "20px 24px", borderTop: "1px solid #eee" }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  marginBottom: 16, fontSize: 18, fontWeight: 700
                }}>
                  <span>Total</span>
                  <span style={{ color: "#088178" }}>${total.toLocaleString()}</span>
                </div>
                <button onClick={handleCheckout} disabled={checking} style={{
                  width: "100%", padding: "14px",
                  background: checking ? "#aaa" : "#088178",
                  color: "#fff", border: "none", borderRadius: 30,
                  fontSize: 15, fontWeight: 700, cursor: checking ? "not-allowed" : "pointer",
                  marginBottom: 8
                }}>
                  {checking ? "Procesando..." : "Confirmar compra"}
                </button>
                <button onClick={clearCart} style={{
                  width: "100%", padding: "10px",
                  background: "none", color: "#e74c3c",
                  border: "1px solid #e74c3c", borderRadius: 30,
                  fontSize: 13, cursor: "pointer"
                }}>
                  Vaciar carrito
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
