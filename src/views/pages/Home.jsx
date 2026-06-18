/**
 * @fileoverview Página de Inicio (Home)
 * Muestra productos destacados desde Firestore.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartController } from "../../controllers/useCartController";
import { productService } from "../../services/productService";
import ProductCard from "../components/ProductCard";
import ProductCarousel from "../components/ProductCarousel";

export default function Home() {
  const { handleAddToCart } = useCartController();
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      const all = await productService.getAll();
      setFeatured(all.slice(0, 8));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      {/* HERO — imagen de fondo con overlay y texto superpuesto */}
      <section id="hero">
        <div className="hero-bg">
          <img src="/img/hero4.png" alt="Modelo Pandea" />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <p className="hero-tag">Nueva colección</p>
          <h1>Grandes ofertas</h1>
          <h1 className="hero-highlight">en toda la tienda</h1>
          <p>¡Hasta 70% de descuento en productos seleccionados!</p>
          <Link to="/shop" className="btn-hero">Explorar ahora</Link>
        </div>
      </section>

      {/* CARRUSEL */}
      <ProductCarousel />

      {/* PRODUCTOS DESTACADOS */}
      <section id="producto1" className="section-p1">
        <h2>Productos Destacados</h2>
        <p>Descubre nuestra selección especial</p>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <p>Cargando productos...</p>
          </div>
        ) : (
          <div className="pro-container">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Link to="/shop" className="btn-hero">Ver todos los productos</Link>
        </div>
      </section>

      {/* BENEFICIOS DE CONFIANZA */}
      <section id="beneficios" className="section-p1">
        <div className="beneficios-grid">
          <div className="beneficio-item">
            <i className="fas fa-truck" />
            <div>
              <h5>Envíos nacionales</h5>
              <p>A toda Colombia</p>
            </div>
          </div>
          <div className="beneficio-item">
            <i className="fas fa-sync-alt" />
            <div>
              <h5>Cambios fáciles</h5>
              <p>30 días para cambiar</p>
            </div>
          </div>
          <div className="beneficio-item">
            <i className="fas fa-shield-alt" />
            <div>
              <h5>Pago seguro</h5>
              <p>100% protegido</p>
            </div>
          </div>
          <div className="beneficio-item">
            <i className="fas fa-headset" />
            <div>
              <h5>Atención personalizada</h5>
              <p>Estamos para ayudarte</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="section-p1">
        <div className="newstext">
          <h4>Suscríbete a nuestro Newsletter</h4>
          <p>Recibe las últimas ofertas y novedades</p>
        </div>
        <div className="form">
          <input type="email" placeholder="Tu correo electrónico" />
          <button className="normal">Suscribirse</button>
        </div>
      </section>
    </>
  );
}
