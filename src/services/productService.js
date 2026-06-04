/**
 * @fileoverview Servicio de Productos — Supabase
 * Maneja el CRUD de productos conectado a Supabase (PostgreSQL).
 */

import { supabase } from "../config/supabase";
import { ProductModel } from "../models/Product";

export const productService = {

  /**
   * Obtiene todos los productos activos ordenados por fecha.
   * @returns {Promise<ProductModel[]>}
   */
  async getAll() {
    const { data, error } = await supabase
      .from("productos")
      .select(`*, categorias(nombre)`)
      .eq("activo", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(p => new ProductModel({
      id:       p.id,
      name:     p.nombre,
      price:    p.precio,
      img:      p.img,
      category: p.categorias?.nombre || p.id_categoria,
      brand:    p.brand,
      sizes:    p.sizes,
      colors:   p.colors,
    }));
  },

  /**
   * Filtra productos por categoría.
   * @param {string} category - "all" devuelve todos
   * @returns {Promise<ProductModel[]>}
   */
  async getByCategory(category) {
    if (category === "all") return this.getAll();

    const { data, error } = await supabase
      .from("productos")
      .select(`*, categorias(nombre)`)
      .eq("activo", true)
      .eq("categorias.nombre", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data
      .filter(p => p.categorias?.nombre === category)
      .map(p => new ProductModel({
        id:       p.id,
        name:     p.nombre,
        price:    Number(p.precio),
        img:      p.img,
        category: p.categorias?.nombre,
        brand:    p.brand,
        sizes:    p.sizes,
        colors:   p.colors,
      }));
  },

  /**
   * Busca productos por nombre.
   * @param {string} query - Texto a buscar
   * @returns {Promise<ProductModel[]>}
   */
  async search(query) {
    const { data, error } = await supabase
      .from("productos")
      .select(`*, categorias(nombre)`)
      .eq("activo", true)
      .ilike("nombre", `%${query}%`);

    if (error) throw error;
    return data.map(p => new ProductModel({
      id:       p.id,
      name:     p.nombre,
      price:    Number(p.precio),
      img:      p.img,
      category: p.categorias?.nombre,
      brand:    p.brand,
      sizes:    p.sizes,
      colors:   p.colors,
    }));
  },

  /**
   * Obtiene un producto por su ID.
   * @param {string} id
   * @returns {Promise<ProductModel|null>}
   */
  async getById(id) {
    const { data, error } = await supabase
      .from("productos")
      .select(`*, categorias(nombre)`)
      .eq("id", id)
      .single();

    if (error) return null;
    return new ProductModel({
      id:       data.id,
      name:     data.nombre,
      price:    Number(data.precio),
      img:      data.img,
      category: data.categorias?.nombre,
      brand:    data.brand,
      sizes:    data.sizes,
      colors:   data.colors,
    });
  }
};
