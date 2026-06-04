/**
 * @fileoverview Dashboard del Administrador
 * Panel principal con estadísticas, gráficas y accesos rápidos.
 * Ruta: /admin/dashboard
 */

import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { reporteService } from "../../services/reporteService";
import { stockService }   from "../../services/stockService";

const COLORS = ["#3c52e3", "#088178", "#f36d38", "#e8b04b", "#8b5cf6"];

export default function AdminDashboard() {
  const [resumen,       setResumen]       = useState(null);
  const [ventasMes,     setVentasMes]     = useState([]);
  const [topProductos,  setTopProductos]  = useState([]);
  const [ventasGastos,  setVentasGastos]  = useState([]);
  const [stockBajo,     setStockBajo]     = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function cargar() {
      const [res, vm, tp, vg, sb] = await Promise.all([
        reporteService.getResumen(),
        reporteService.getVentasPorMes(),
        reporteService.getTopProductos(),
        reporteService.getVentasVsGastos(),
        stockService.getStockBajo(),
      ]);
      setResumen(res);
      setVentasMes(vm);
      setTopProductos(tp);
      setVentasGastos(vg);
      setStockBajo(sb);
      setLoading(false);
    }
    cargar();
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p>Cargando dashboard...</p>
    </div>
  );

  return (
    <div id="dashboard">

      {/* ── TARJETAS RESUMEN ── */}
      <div className="dashboard-cards">
        <div className="dash-card green">
          <i className="fas fa-dollar-sign" />
          <div>
            <span>Total Ventas</span>
            <h3>${resumen?.totalVentas.toLocaleString()}</h3>
          </div>
        </div>
        <div className="dash-card blue">
          <i className="fas fa-chart-line" />
          <div>
            <span>Ganancia Neta</span>
            <h3>${resumen?.ganancia.toLocaleString()}</h3>
          </div>
        </div>
        <div className="dash-card orange">
          <i className="fas fa-shopping-bag" />
          <div>
            <span>Total Pedidos</span>
            <h3>{resumen?.totalPedidos}</h3>
          </div>
        </div>
        <div className="dash-card purple">
          <i className="fas fa-users" />
          <div>
            <span>Clientes</span>
            <h3>{resumen?.totalClientes}</h3>
          </div>
        </div>
        <div className="dash-card red">
          <i className="fas fa-boxes" />
          <div>
            <span>Stock Bajo</span>
            <h3>{resumen?.stockBajo} productos</h3>
          </div>
        </div>
        <div className="dash-card teal">
          <i className="fas fa-tags" />
          <div>
            <span>Productos</span>
            <h3>{resumen?.totalProductos}</h3>
          </div>
        </div>
      </div>

      {/* ── GRÁFICAS ── */}
      <div className="dashboard-charts">

        {/* Ventas por mes */}
        <div className="chart-card wide">
          <h4>Ventas por mes</h4>
          {ventasMes.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ventasMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, "Ventas"]} />
                <Line type="monotone" dataKey="total" stroke="#3c52e3"
                  strokeWidth={3} dot={{ fill: "#3c52e3", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No hay datos de ventas aún</div>
          )}
        </div>

        {/* Ventas vs Gastos */}
        <div className="chart-card wide">
          <h4>Ventas vs Gastos</h4>
          {ventasGastos.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ventasGastos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => `$${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="ventas" fill="#088178" radius={[4,4,0,0]} name="Ventas" />
                <Bar dataKey="gastos" fill="#f36d38" radius={[4,4,0,0]} name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No hay datos aún</div>
          )}
        </div>

        {/* Top productos */}
        <div className="chart-card">
          <h4>Productos más vendidos</h4>
          {topProductos.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={topProductos} dataKey="cantidad"
                  nameKey="nombre" cx="50%" cy="50%" outerRadius={80} label>
                  {topProductos.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No hay ventas registradas</div>
          )}
        </div>

        {/* Stock bajo */}
        <div className="chart-card">
          <h4>⚠️ Stock bajo</h4>
          {stockBajo.length === 0 ? (
            <div className="chart-empty">✅ Todo el stock está bien</div>
          ) : (
            <div className="stock-list">
              {stockBajo.map(p => (
                <div className="stock-item" key={p.id}>
                  <img src={p.img} alt={p.nombre} />
                  <div>
                    <p>{p.nombre}</p>
                    <span className={p.stock === 0 ? "sin-stock" : "poco-stock"}>
                      {p.stock === 0 ? "Sin stock" : `${p.stock} unidades`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
