/**
 * @fileoverview Panel de Administrador — Layout Principal
 * Contiene la navegación entre las secciones del panel:
 * Dashboard, Productos, Ventas, Gastos, Stock, Usuarios
 */

import { useState } from "react";
import { useAdminController } from "../../controllers/useAdminController";
import { useAuth } from "../../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import AdminVentas    from "./AdminVentas";
import AdminGastos    from "./AdminGastos";
import AdminStock     from "./AdminStock";
import AdminProductos from "./AdminProductos";

const TABS = [
  { id: "dashboard", label: "Dashboard",  icon: "fa-chart-pie"      },
  { id: "productos", label: "Productos",  icon: "fa-tags"           },
  { id: "ventas",    label: "Ventas",     icon: "fa-shopping-cart"  },
  { id: "gastos",    label: "Gastos",     icon: "fa-receipt"        },
  { id: "stock",     label: "Stock",      icon: "fa-boxes"          },
];

export default function Admin() {
  const { user }              = useAuth();
  const { isAdmin, loading }  = useAdminController();
  const [tab, setTab]         = useState("dashboard");

  if (loading) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p>Verificando permisos...</p>
    </div>
  );

  if (!user) return (
    <div className="admin-denied">
      <i className="fas fa-lock" />
      <h2>Acceso restringido</h2>
      <p>Debes iniciar sesión para ver esta página.</p>
    </div>
  );

  if (!isAdmin) return (
    <div className="admin-denied">
      <i className="fas fa-ban" />
      <h2>Sin permisos</h2>
      <p>No tienes permisos de administrador.</p>
    </div>
  );

  return (
    <section id="admin-panel" className="section-p1">
      <div className="admin-header">
        <div>
          <h2>Panel de Administrador</h2>
          <p>Bienvenido, {user.getFirstName()} 👋</p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="admin-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <i className={`fas ${t.icon}`} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Contenido de la tab activa */}
      <div className="admin-content">
        {tab === "dashboard" && <AdminDashboard />}
        {tab === "productos" && <AdminProductos />}
        {tab === "ventas"    && <AdminVentas />}
        {tab === "gastos"    && <AdminGastos />}
        {tab === "stock"     && <AdminStock />}
      </div>
    </section>
  );
}
