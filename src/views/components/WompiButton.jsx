/**
 * @fileoverview Botón de pago Wompi
 * 
 * ¿CÓMO FUNCIONA WOMPI?
 * Wompi NO te deja crear el botón de pago con JavaScript normal.
 * En su lugar, exige que insertes una etiqueta <script> en el DOM
 * con atributos especiales (data-xxx) que le dicen a Wompi:
 * cuánto cobrar, en qué moneda, a quién, y qué hacer cuando termine.
 * 
 * Cuando ese script se carga, Wompi AUTOMÁTICAMENTE dibuja un botón
 * de pago dentro del <div> donde insertamos el script.
 * 
 * FLUJO COMPLETO DE UN PAGO:
 * 1. Se genera una "referencia" única para identificar este pago
 * 2. Se genera una "firma de integridad" (hash) que prueba que el
 *    monto no fue alterado por el usuario (seguridad anti-fraude)
 * 3. Se inserta el script de Wompi con esos datos
 * 4. Wompi dibuja su botón de pago
 * 5. El usuario hace clic, se abre el widget de pago de Wompi
 * 6. El usuario paga con tarjeta/PSE/Nequi
 * 7. Wompi llama a NUESTRA función callback con el resultado
 */

import { useEffect, useRef, useState } from "react";
import {
  WOMPI_PUBLIC_KEY,
  generarFirma,
  generarReferencia,
  toCentavos,
} from "../../services/wompiService";

export default function WompiButton({ total, usuario, onExito, onError, disabled = false }) {
  // Referencia al <div> donde Wompi va a dibujar su botón
  const containerRef = useRef(null);

  // Referencia única de ESTE pago (ej: "PANDEA-1234567-AB12CD")
  // useRef en vez de useState porque no necesitamos que cambie
  // visualmente, solo necesitamos "recordarla" entre renders
  const referenciaRef = useRef(generarReferencia());

  const [firma,    setFirma]    = useState("");   // Hash de seguridad
  const [listo,    setListo]    = useState(false); // Si el script de Wompi ya cargó
  const [cargando, setCargando] = useState(true);  // Si está calculando la firma

  /**
   * PASO 1: Generar la firma de seguridad
   * Esto se ejecuta cada vez que cambia el "total" a pagar.
   * 
   * La firma es un hash SHA-256 de: referencia + monto + "COP" + secreto.
   * Wompi recalcula este mismo hash de su lado, y si no coincide,
   * RECHAZA el pago — esto evita que alguien manipule el precio
   * desde las herramientas de desarrollador del navegador.
   */
  useEffect(() => {
    async function calcularFirma() {
      setCargando(true);
      try {
        const montoEnCentavos = toCentavos(total); // Wompi trabaja en centavos, no pesos
        const hash = await generarFirma(referenciaRef.current, montoEnCentavos);
        setFirma(hash);
      } catch (err) {
        console.error("Error generando firma Wompi:", err);
        onError?.(err);
      } finally {
        setCargando(false);
      }
    }
    if (total > 0) calcularFirma();
  }, [total]);

  /**
   * PASO 2: Insertar el script de Wompi (solo cuando ya tenemos la firma)
   */
  useEffect(() => {
    if (!firma || !containerRef.current) return;

    // Si ya había un script anterior (de un render previo), lo quitamos
    const anterior = containerRef.current.querySelector("script");
    if (anterior) containerRef.current.removeChild(anterior);

    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";

    // Atributos OBLIGATORIOS que Wompi necesita para procesar el pago
    script.setAttribute("data-render",              "button");
    script.setAttribute("data-public-key",          WOMPI_PUBLIC_KEY);
    script.setAttribute("data-currency",            "COP");
    script.setAttribute("data-amount-in-cents",     String(toCentavos(total)));
    script.setAttribute("data-reference",           referenciaRef.current);
    script.setAttribute("data-signature:integrity", firma);

    // A dónde redirigir si el usuario cierra el widget o termina el pago
    script.setAttribute("data-redirect-url", `${window.location.origin}/pago-resultado`);

    // Datos opcionales del cliente (precargan el formulario de pago)
    if (usuario?.email) {
      script.setAttribute("data-customer-data:email",     usuario.email);
      script.setAttribute("data-customer-data:full-name", usuario.displayName || "");
    }

    /**
     * PASO 3: Registrar el callback
     * Wompi necesita el NOMBRE de una función global de window,
     * no puede recibir una función de React directamente.
     * Por eso creamos un nombre único y lo guardamos en window.
     */
    const callbackName = `wompiCallback_${Date.now()}`;
    window[callbackName] = (result) => {
      const tx = result?.transaction;
      if (tx?.status === "APPROVED") {
        onExito?.(tx); // Pago exitoso: avisa al componente padre (Checkout.jsx)
      } else if (tx) {
        onError?.(tx); // Pago rechazado o cancelado
      }
      // Genera una nueva referencia para un posible próximo intento
      referenciaRef.current = generarReferencia();
    };
    script.setAttribute("data-on-approved", callbackName);

    script.onload  = () => setListo(true);
    script.onerror = () => setListo(false);

    // Inserta el script dentro del div — esto hace que Wompi dibuje el botón
    containerRef.current.appendChild(script);

    // Limpieza: si el componente se desmonta, borra la función global
    return () => { delete window[callbackName]; };
  }, [firma]);

  return (
    <div>
      {/* Wompi inserta su botón AQUÍ automáticamente */}
      <div ref={containerRef} />

      {/* Mientras se prepara todo, mostramos un botón deshabilitado */}
      {(cargando || !listo) && (
        <button disabled style={{
          width: "100%", padding: "14px",
          background: "#ccc", color: "#fff",
          border: "none", borderRadius: "8px",
          fontSize: "16px", fontWeight: "600",
          cursor: "not-allowed",
        }}>
          {cargando ? "Preparando pago..." : "Cargando pasarela..."}
        </button>
      )}
    </div>
  );
}
