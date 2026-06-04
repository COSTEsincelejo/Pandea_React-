/**
 * @fileoverview Servicio de Usuarios — Supabase
 * Sincroniza los usuarios de Firebase Auth con la tabla usuarios de Supabase.
 */

import { supabase } from "../config/supabase";

export const usuarioService = {

  /**
   * Crea o actualiza un usuario en Supabase al hacer login/registro.
   * @param {Object} firebaseUser - Usuario de Firebase Auth
   * @returns {Promise<void>}
   */
  async sincronizar(firebaseUser) {
    const { error } = await supabase
      .from("usuarios")
      .upsert({
        uid:    firebaseUser.uid,
        nombre: firebaseUser.displayName || "Usuario",
        email:  firebaseUser.email,
        rol:    "cliente",
      }, { onConflict: "uid" });

    if (error) console.error("Error sincronizando usuario:", error);
  },

  /**
   * Obtiene todos los usuarios para el panel admin.
   * @returns {Promise<Array>}
   */
  async getAll() {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .order("fecha_registro", { ascending: false });

    if (error) throw error;
    return data;
  }
};
