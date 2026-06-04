/**
 * @fileoverview Configuración de Supabase
 * Inicializa el cliente de Supabase para conectarse a la base de datos.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://xxznopbbcaikzndwaesw.supabase.co";
const SUPABASE_KEY  = "sb_publishable_l5bcfMbKfieDRFUGVdaa7Q_PAHGzITC";

/**
 * Cliente de Supabase — usar en todos los servicios.
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
