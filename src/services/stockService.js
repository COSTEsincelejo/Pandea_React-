/**
 * @fileoverview Servicio de Stock — Supabase
 * Maneja entradas y salidas de inventario.
 */

import { supabase } from "../config/supabase";

export const stockService = {

  /**
   * Obtiene todos los movimientos de stock.
   * @returns {Promise<Array>}
   */
  async getMovimientos() {
    const { data, error } = await supabase
      .from("movimiento_stock")
      .select("*, productos(nombre, img)")
      .order("fecha", { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Registra una entrada de stock (compra de inventario).
   * @param {string} idProducto
   * @param {number} cantidad
   * @param {string} motivo
   */
  async entrada(idProducto, cantidad, motivo = "compra") {
    // Actualizar stock del producto
    const { data: prod } = await supabase
      .from("productos")
      .select("stock")
      .eq("id", idProducto)
      .single();

    await supabase
      .from("productos")
      .update({ stock: (prod?.stock || 0) + cantidad })
      .eq("id", idProducto);

    // Registrar movimiento
    const { error } = await supabase
      .from("movimiento_stock")
      .insert({ id_producto: idProducto, cantidad, tipo: "entrada", motivo });

    if (error) throw error;
  },

  /**
   * Obtiene productos con stock bajo (menos de 5 unidades).
   * @returns {Promise<Array>}
   */
  async getStockBajo() {
    const { data, error } = await supabase
      .from("productos")
      .select("id, nombre, stock, img")
      .eq("activo", true)
      .lt("stock", 5)
      .order("stock", { ascending: true });
    if (error) throw error;
    return data;
  }
};
