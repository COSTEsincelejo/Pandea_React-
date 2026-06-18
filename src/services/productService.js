/**
 * @fileoverview Servicio de Productos — Supabase
 * 
 * ¿QUÉ ES UN "SERVICE" EN ESTA ARQUITECTURA?
 * Es la ÚNICA capa que sabe que existe Supabase. Ningún componente
 * de React (views/) ni controller hace consultas directas a la base
 * de datos — todos pasan por aquí. Esto significa que si algún día
 * cambias de base de datos, solo modificas este archivo.
 */

import { supabase } from "../config/supabase";
import { ProductModel } from "../models/Product";

export const productService = {

  /**
   * Trae TODOS los productos activos.
   * 
   * EXPLICACIÓN DE LA CONSULTA:
   * .from("productos")              → de la tabla "productos"
   * .select(`*, categorias(nombre)`) → trae todas las columnas (*)
   *                                     Y también el nombre de la categoría
   *                                     relacionada (esto es un JOIN automático
   *                                     gracias a la relación que configuramos
   *                                     con id_categoria en Supabase)
   * .eq("activo", true)              → solo donde la columna activo = true
   *                                     (filtra los productos "eliminados",
   *                                     que en realidad solo se desactivan)
   * .order("created_at", {...})      → ordena del más nuevo al más viejo
   * 
   * @returns {Promise<ProductModel[]>} Lista de productos
   */
  async getAll() {
    const { data, error } = await supabase
      .from("productos")
      .select(`*, categorias(nombre)`)
      .eq("activo", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Supabase devuelve los datos en formato "crudo" (snake_case,
    // nombres en español). Aquí los convertimos a nuestro ProductModel
    // (camelCase, nombres en inglés) para que el resto de la app
    // trabaje con un formato consistente sin importar de dónde vinieron los datos
    return data.map(p => new ProductModel({
      id:       p.id,
      name:     p.nombre,
      price:    Number(p.precio),
      img:      p.img,
      category: p.categorias?.nombre || p.id_categoria,
      brand:    p.brand,
      sizes:    p.sizes,
      colors:   p.colors,
    }));
  },

  /**
   * Filtra productos por categoría.
   * Si category es "all", simplemente devuelve todos (reutiliza getAll).
   */
  async getByCategory(category) {
    if (category === "all") return this.getAll();

    const { data, error } = await supabase
      .from("productos")
      .select(`*, categorias(nombre)`)
      .eq("activo", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Filtramos en JavaScript en vez de en la query porque la relación
    // categorias(nombre) no siempre permite filtrar directo con .eq()
    return data
      .filter(p => p.categorias?.nombre === category)
      .map(p => new ProductModel({
        id: p.id, name: p.nombre, price: Number(p.precio), img: p.img,
        category: p.categorias?.nombre, brand: p.brand,
        sizes: p.sizes, colors: p.colors,
      }));
  },

  /**
   * Busca productos por nombre.
   * .ilike() es una búsqueda "case insensitive" (no distingue mayúsculas)
   * y %query% significa "que contenga esto en cualquier parte del texto"
   */
  async search(query) {
    const { data, error } = await supabase
      .from("productos")
      .select(`*, categorias(nombre)`)
      .eq("activo", true)
      .ilike("nombre", `%${query}%`);

    if (error) throw error;
    return data.map(p => new ProductModel({
      id: p.id, name: p.nombre, price: Number(p.precio), img: p.img,
      category: p.categorias?.nombre, brand: p.brand,
      sizes: p.sizes, colors: p.colors,
    }));
  },

  /**
   * Trae UN solo producto por su ID (para la página de detalle).
   * .single() le dice a Supabase "espero exactamente UN resultado,
   * no un array" — si no encuentra nada, lanza un error.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from("productos")
      .select(`*, categorias(nombre)`)
      .eq("id", id)
      .single();

    if (error) return null; // Si no existe el producto, devuelve null
    return new ProductModel({
      id: data.id, name: data.nombre, price: Number(data.precio), img: data.img,
      category: data.categorias?.nombre, brand: data.brand,
      sizes: data.sizes, colors: data.colors,
    });
  }
};
