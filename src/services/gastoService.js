/**
 * @fileoverview Servicio de Gastos — Supabase
 * Maneja el CRUD de gastos del negocio.
 */

import { supabase } from "../config/supabase";

export const gastoService = {

  /**
   * Obtiene todos los gastos ordenados por fecha.
   * @returns {Promise<Array>}
   */
  async getAll() {
    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false });
    if (error) throw error;
    return data;
  },

  /**
   * Crea un nuevo gasto.
   * @param {Object} gasto
   * @param {string} gasto.concepto
   * @param {number} gasto.monto
   * @param {string} gasto.fecha
   * @returns {Promise<void>}
   */
  async crear(gasto) {
    const { error } = await supabase
      .from("gastos")
      .insert(gasto);
    if (error) throw error;
  },

  /**
   * Elimina un gasto por ID.
   * @param {number} id
   */
  async eliminar(id) {
    const { error } = await supabase
      .from("gastos")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
};
