/**
 * @fileoverview Página de resultado de pago
 * Wompi redirige aquí después del pago con ?id=<transaction_id>
 * Como la redirección recarga la página, el CartContext se reinicia,
 * por eso leemos el pedido pendiente desde sessionStorage en su lugar.
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ventaService }   from "../../services/ventaService";
import { usuarioService } from "../../services/usuarioService";

const STORAGE_KEY = "pandea_pending_order";

export default function PagoResultado() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const [estado, setEstado] = useState("verificando");
  const yaProcesado = useRef(false);

  useEffect(() => {
    const id = params.get("id");
    if (!id) { setEstado("sin-id"); return; }
    if (yaProcesado.current) return;
    yaProcesado.current = true; // bloquea inmediatamente, antes del fetch

    console.log("🔍 Verificando transacción Wompi:", id);

    fetch(`https://sandbox.wompi.co/v1/transactions/${id}`)
      .then(r => r.json())
      .then(async (data) => {
        const status = data?.data?.status;
        console.log("🔍 Estado de la transacción:", status);

        if (status !== "APPROVED") {
          setEstado("rechazado");
          return;
        }

        setEstado("aprobado");

        // Recuperar el pedido pendiente guardado antes de ir a Wompi
        const pendingRaw = sessionStorage.getItem(STORAGE_KEY);
        if (!pendingRaw) {
          console.warn("⚠️ No hay pedido pendiente en sessionStorage (¿ya se procesó?)");
          return;
        }

        const pending = JSON.parse(pendingRaw);
        console.log("📦 Pedido pendiente recuperado:", pending);

        try {
          let idCliente = null;
          if (pending.uid) {
            const usuarios = await usuarioService.getAll();
            const usuario  = usuarios.find(u => u.uid === pending.uid);
            idCliente = usuario?.id || null;
          }

          await ventaService.crear({
            id_cliente:      idCliente,
            total:           pending.totalPrice,
            metodo_contacto: "wompi",
            items:           pending.items,
          });

          // Limpiar el pedido pendiente para que no se duplique
          sessionStorage.removeItem(STORAGE_KEY);
          console.log("✅ Venta registrada exitosamente en Supabase");

        } catch (err) {
          console.error("❌ Error guardando venta:", err);
        }
      })
      .catch((err) => {
        console.error("❌ Error consultando Wompi:", err);
        setEstado("error");
      });
  }, [params]);

  const mensajes = {
    verificando: { icon: "⏳", titulo: "Verificando pago...", color: "#6b7280" },
    aprobado:    { icon: "✅", titulo: "¡Pago aprobado!",    color: "#059669" },
    rechazado:   { icon: "❌", titulo: "Pago rechazado",     color: "#dc2626" },
    "sin-id":    { icon: "⚠️", titulo: "Sin información",    color: "#d97706" },
    error:       { icon: "⚠️", titulo: "Error verificando",  color: "#d97706" },
  };

  const { icon, titulo, color } = mensajes[estado] || mensajes.error;

  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <div style={{ fontSize: "3rem" }}>{icon}</div>
      <h2 style={{ color, marginTop: 12 }}>{titulo}</h2>
      <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="btn-hero" onClick={() => navigate("/")}>
          Inicio
        </button>
        <button className="btn-back" onClick={() => navigate("/mis-compras")}>
          Mis compras
        </button>
      </div>
    </div>
  );
}
