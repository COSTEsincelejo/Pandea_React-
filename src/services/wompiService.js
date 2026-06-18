/**
 * @fileoverview Servicio de Wompi — Sandbox (modo pruebas)
 * 
 * ⚠️ IMPORTANTE PARA LA EXPOSICIÓN:
 * El "secreto de integridad" NO debería vivir en el frontend en
 * un proyecto de producción real — cualquiera podría verlo abriendo
 * las herramientas de desarrollador. En producción se movería a una
 * función de servidor (Edge Function de Supabase, por ejemplo).
 * Para este proyecto académico, vive aquí porque estamos en modo
 * SANDBOX (pruebas), no con dinero real.
 */

// Llave pública: identifica TU cuenta de comercio ante Wompi
export const WOMPI_PUBLIC_KEY = "pub_test_ki2Os3pZh5rOCiDUTrN7xHYRve4TTDd3";

// Secreto usado SOLO para calcular el hash de seguridad (no se envía directo)
const WOMPI_INTEGRITY_SECRET = "test_integrity_oINfy0QexQVGpr6TN0Bh7hn3nROxAsCC";

/**
 * Genera el hash de integridad que Wompi exige para validar
 * que el monto del pago no fue manipulado por el usuario.
 * 
 * CÓMO FUNCIONA SHA-256:
 * Toma un texto de entrada y genera una "huella digital" única
 * de 64 caracteres. Es IMPOSIBLE reconstruir el texto original
 * a partir del hash, y CUALQUIER cambio mínimo en el texto
 * (aunque sea un solo carácter) genera un hash COMPLETAMENTE diferente.
 * 
 * Esto significa: si alguien intenta cambiar el precio desde la consola
 * del navegador, el hash ya no coincidirá con lo que Wompi calcula
 * de su lado, y el pago será rechazado automáticamente.
 * 
 * @param {string} referencia - Identificador único de este pago
 * @param {number} montoEnCentavos - El precio a cobrar, en centavos
 * @returns {Promise<string>} Hash SHA-256 en formato hexadecimal
 */
export async function generarFirma(referencia, montoEnCentavos) {
  // Concatena los datos en el ORDEN EXACTO que Wompi espera
  const cadena = `${referencia}${montoEnCentavos}COP${WOMPI_INTEGRITY_SECRET}`;

  // Convierte el texto a un formato que el navegador puede "hashear"
  const encoded = new TextEncoder().encode(cadena);

  // crypto.subtle.digest es una API nativa del navegador para criptografía
  const buffer = await crypto.subtle.digest("SHA-256", encoded);

  // Convierte el resultado binario a texto hexadecimal legible
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Genera una referencia única para cada intento de pago.
 * Formato: PANDEA-<timestamp>-<código aleatorio>
 * Ejemplo: PANDEA-1718721934857-X7K2P9
 * 
 * Esto evita que dos pagos distintos tengan la misma referencia,
 * lo cual Wompi rechazaría.
 */
export function generarReferencia() {
  const ts  = Date.now(); // milisegundos desde 1970 — siempre distinto
  const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PANDEA-${ts}-${rnd}`;
}

/**
 * Wompi exige los montos en CENTAVOS, no en pesos.
 * Ejemplo: $50.000 pesos → 5000000 centavos
 * (multiplicar por 100 porque 1 peso = 100 centavos)
 */
export function toCentavos(pesos) {
  return Math.round(pesos * 100);
}
