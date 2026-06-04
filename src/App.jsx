/**
 * @fileoverview Componente Raíz de la Aplicación
 * Configura el enrutamiento, los proveedores de contexto y el layout principal.
 *
 * Estructura de proveedores (de afuera hacia adentro):
 * BrowserRouter → AuthProvider → CartProvider → MainLayout → Rutas
 *
 * Rutas disponibles:
 * - /             → Home
 * - /shop         → Shop
 * - /about        → About
 * - /product/:id  → ProductDetail
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import { CartProvider }  from "./context/CartContext";
import MainLayout        from "./views/layouts/MainLayout";
import Home              from "./views/pages/Home";
import Shop              from "./views/pages/Shop";
import About             from "./views/pages/About";
import ProductDetail     from "./views/pages/ProductDetail";
import Admin             from "./views/pages/Admin";
import MisCompras        from "./views/pages/MisCompras";

/**
 * Componente principal de la aplicación.
 * Envuelve toda la app con los proveedores necesarios.
 *
 * @returns {JSX.Element} Aplicación completa con rutas y contextos
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider — provee el usuario logueado a toda la app */}
      <AuthProvider>
        {/* CartProvider — provee el carrito a toda la app */}
        <CartProvider>
          {/* MainLayout — Navbar + CartDrawer + contenido + Footer */}
          <MainLayout>
            <Routes>
              <Route path="/"            element={<Home />}          />
              <Route path="/shop"        element={<Shop />}          />
              <Route path="/about"       element={<About />}         />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/admin"        element={<Admin />}         />
              <Route path="/mis-compras"  element={<MisCompras />}    />
            </Routes>
          </MainLayout>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
