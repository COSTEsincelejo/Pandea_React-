/**
 * @fileoverview Servicio de Ventas — Supabase
 * Registra ventas y sus detalles en Supabase.
 * También consulta el historial de compras del cliente.
 */

import { supabase } from "../config/supabase";

export const ventaService = {

  /**
   * Registra una venta completa con sus detalles.
   * @param {Object} ventaData - Datos de la venta
   * @param {string} ventaData.id_cliente - UID del cliente
   * @param {number} ventaData.total - Total de la venta
   * @param {string} ventaData.metodo_contacto - Canal de venta
   * @param {Array}  ventaData.items - Productos del carrito
   * @returns {Promise<string>} ID de la venta creada
   */
  async crear(ventaData) {
    // 1. Crear la venta
    const { data: venta, error: ventaError } = await supabase
      .from("ventas")
      .insert({
        id_cliente:      ventaData.id_cliente,
        total:           ventaData.total,
        metodo_contacto: ventaData.metodo_contacto || "web",
        estado:          "pendiente",
      })
      .select()
      .single();

    if (ventaError) throw ventaError;

    // 2. Crear los detalles de la venta
    const detalles = ventaData.items.map(item => ({
      id_venta:        venta.id,
      id_producto:     item.id.split("-")[0], // quitar sufijo de talla/color
      cantidad:        item.quantity,
      precio_unitario: item.price,
      talla:           item.size  || null,
      color:           item.color || null,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_venta")
      .insert(detalles);

    if (detalleError) throw detalleError;

    return venta.id;
  },

  /**
   * Obtiene el historial de compras de un cliente.
   * @param {string} uid - Firebase UID del cliente
   * @returns {Promise<Array>}
   */
  async getHistorial(uid) {
    // Primero obtener el ID del usuario desde su UID
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("id")
      .eq("uid", uid)
      .single();

    if (!usuario) return [];

    const { data, error } = await supabase
      .from("ventas")
      .select(`
        *,
        detalle_venta (
          *,
          productos ( nombre, img )
        )
      `)
      .eq("id_cliente", usuario.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene todas las ventas para el panel admin.
   * @returns {Promise<Array>}
   */
  async getAll() {
    const { data, error } = await supabase
      .from("ventas")
      .select(`
        *,
        usuarios ( nombre, email ),
        detalle_venta (
          *,
          productos ( nombre, img )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
};
