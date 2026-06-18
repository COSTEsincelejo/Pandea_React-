/**
 * @fileoverview Configuración de Supabase
 * 
 * ¿QUÉ HACE ESTE ARCHIVO?
 * Crea UNA SOLA conexión (cliente) hacia la base de datos de Supabase,
 * y la exporta para que todos los demás archivos del proyecto la reutilicen.
 * 
 * ¿POR QUÉ NO CREAR LA CONEXIÓN EN CADA ARCHIVO?
 * Porque crear conexiones repetidas gasta recursos y puede causar errores
 * de autenticación duplicada. Por eso se crea UNA VEZ aquí y se importa
 * en cualquier service que la necesite, ej: import { supabase } from "../config/supabase"
 */

import { createClient } from "@supabase/supabase-js";

// URL única de tu proyecto en Supabase 
const SUPABASE_URL = "https://xxznopbbcaikzndwaesw.supabase.co";

// Llave PÚBLICA (no es secreta, está pensada para usarse en el frontend)
// Esta llave por sí sola NO permite hacer cualquier cosa en la base de datos:
// las políticas RLS (Row Level Security) que configuramos en Supabase
// son las que realmente deciden qué puede hacer cada usuario
const SUPABASE_KEY = "sb_publishable_l5bcfMbKfieDRFUGVdaa7Q_PAHGzITC";

/**
 * Cliente de Supabase — el objeto que se usa en TODOS los services
 * para hacer consultas: supabase.from("tabla").select(), .insert(), etc.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
