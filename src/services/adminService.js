/**
 * @fileoverview Servicio de Administrador — Supabase
 * Verifica si el usuario es admin consultando la tabla admins en Supabase.
 */

import { supabase } from "../config/supabase";

export const adminService = {

  /**
   * Verifica si un UID es administrador.
   * @param {string} uid - Firebase UID
   * @returns {Promise<boolean>}
   */
  async isAdmin(uid) {
    if (!uid) return false;
    const { data } = await supabase
      .from("admins")
      .select("uid")
      .eq("uid", uid)
      .single();
    return !!data;
  }
};
