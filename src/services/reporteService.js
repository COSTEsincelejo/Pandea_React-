/**
 * @fileoverview Servicio de Reportes — Supabase
 * Genera estadísticas y reportes para el dashboard del admin.
 */

import { supabase } from "../config/supabase";

export const reporteService = {

  /**
   * Obtiene las estadísticas generales del negocio.
   * @returns {Promise<Object>}
   */
  async getResumen() {
    const [ventas, productos, usuarios, gastos] = await Promise.all([
      supabase.from("ventas").select("total, estado, created_at"),
      supabase.from("productos").select("id, stock").eq("activo", true),
      supabase.from("usuarios").select("id").eq("rol", "cliente"),
      supabase.from("gastos").select("monto"),
    ]);

    const totalVentas    = ventas.data?.filter(v => v.estado !== "cancelada")
                            .reduce((s, v) => s + Number(v.total), 0) || 0;
    const totalGastos    = gastos.data?.reduce((s, g) => s + Number(g.monto), 0) || 0;
    const totalProductos = productos.data?.length || 0;
    const totalClientes  = usuarios.data?.length || 0;
    const stockBajo      = productos.data?.filter(p => p.stock < 5).length || 0;

    return {
      totalVentas,
      totalGastos,
      ganancia: totalVentas - totalGastos,
      totalProductos,
      totalClientes,
      stockBajo,
      totalPedidos: ventas.data?.length || 0,
    };
  },

  /**
   * Obtiene ventas agrupadas por mes para la gráfica.
   * @returns {Promise<Array>}
   */
  async getVentasPorMes() {
    const { data, error } = await supabase
      .from("ventas")
      .select("total, created_at, estado")
      .eq("estado", "completada")
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Agrupar por mes
    const meses = {};
    const nombresMes = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

    data.forEach(v => {
      const fecha = new Date(v.created_at);
      const key   = `${nombresMes[fecha.getMonth()]} ${fecha.getFullYear()}`;
      meses[key]  = (meses[key] || 0) + Number(v.total);
    });

    return Object.entries(meses).map(([mes, total]) => ({ mes, total }));
  },

  /**
   * Obtiene los productos más vendidos.
   * @returns {Promise<Array>}
   */
  async getTopProductos() {
    const { data, error } = await supabase
      .from("detalle_venta")
      .select("cantidad, productos(nombre, img)")
      .limit(50);

    if (error) throw error;

    const agrupado = {};
    data.forEach(d => {
      const nombre = d.productos?.nombre || "Desconocido";
      agrupado[nombre] = (agrupado[nombre] || 0) + d.cantidad;
    });

    return Object.entries(agrupado)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  },

  /**
   * Obtiene ventas vs gastos por mes para comparativa.
   * @returns {Promise<Array>}
   */
  async getVentasVsGastos() {
    const [ventas, gastos] = await Promise.all([
      supabase.from("ventas").select("total, created_at").eq("estado", "completada"),
      supabase.from("gastos").select("monto, fecha"),
    ]);

    const nombresMes = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const datos = {};

    ventas.data?.forEach(v => {
      const fecha = new Date(v.created_at);
      const key   = `${nombresMes[fecha.getMonth()]}`;
      if (!datos[key]) datos[key] = { mes: key, ventas: 0, gastos: 0 };
      datos[key].ventas += Number(v.total);
    });

    gastos.data?.forEach(g => {
      const fecha = new Date(g.fecha);
      const key   = `${nombresMes[fecha.getMonth()]}`;
      if (!datos[key]) datos[key] = { mes: key, ventas: 0, gastos: 0 };
      datos[key].gastos += Number(g.monto);
    });

    return Object.values(datos);
  }
};
