/**
 * @fileoverview Servicio CRUD de Productos — Supabase
 * Usado por el panel de administrador para crear, editar y eliminar productos.
 * El "eliminar" es un soft-delete: marca activo=false en lugar de borrar la fila.
 */

import { supabase } from "../config/supabase";

export const firestoreProductService = {

  /**
   * Obtiene todos los productos ACTIVOS para el panel admin.
   * @returns {Promise<Array>}
   */
  async getAll() {
    const { data, error } = await supabase
      .from("productos")
      .select(`*, categorias(nombre)`)
      .eq("activo", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data.map(p => ({
      id:       p.id,
      name:     p.nombre,
      price:    Number(p.precio),
      img:      p.img,
      category: p.categorias?.nombre || "",
      brand:    p.brand || "Pandea",
      sizes:    p.sizes || [],
      colors:   p.colors || [],
      stock:    p.stock || 0,
      activo:   p.activo,
      getFormattedPrice() {
        return `$${Number(p.precio).toLocaleString()}`;
      }
    }));
  },

  /**
   * Crea un nuevo producto en Supabase.
   * @param {Object} productData
   * @returns {Promise<string>} ID del producto creado
   */
  async create(productData) {
    const { data: cat } = await supabase
      .from("categorias")
      .select("id")
      .eq("nombre", productData.category)
      .single();

    const { data, error } = await supabase
      .from("productos")
      .insert({
        nombre:       productData.name,
        precio:       productData.price,
        img:          productData.img,
        id_categoria: cat?.id,
        brand:        productData.brand,
        sizes:        productData.sizes,
        colors:       productData.colors,
        stock:        productData.stock || 0,
        descripcion:  productData.descripcion || "",
        activo:       true,
      })
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  /**
   * Actualiza un producto existente.
   * @param {string} id
   * @param {Object} productData
   */
  async update(id, productData) {
    const { data: cat } = await supabase
      .from("categorias")
      .select("id")
      .eq("nombre", productData.category)
      .single();

    const { error } = await supabase
      .from("productos")
      .update({
        nombre:       productData.name,
        precio:       productData.price,
        img:          productData.img,
        id_categoria: cat?.id,
        brand:        productData.brand,
        sizes:        productData.sizes,
        colors:       productData.colors,
        stock:        productData.stock || 0,
        descripcion:  productData.descripcion || "",
      })
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Elimina (desactiva) un producto — soft delete.
   * @param {string} id
   */
  async delete(id) {
    const { error } = await supabase
      .from("productos")
      .update({ activo: false })
      .eq("id", id);

    if (error) throw error;
  }
};
