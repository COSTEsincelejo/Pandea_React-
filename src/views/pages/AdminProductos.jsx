/**
 * @fileoverview Gestión de Productos del Admin
 * CRUD completo de productos con Supabase y Cloudinary.
 */

import { useState } from "react";
import { useAdminController } from "../../controllers/useAdminController";

const ALL_SIZES  = ["XS", "S", "M", "L", "XL"];
const CATEGORIES = ["camisa", "sueter", "pantalon", "blusa", "accesorio"];
const EMPTY_FORM = {
  name: "", price: "", category: "camisa", brand: "Pandea",
  sizes: ["S","M","L"], colors: ["#000000"], img: "", stock: 0, descripcion: ""
};

export default function AdminProductos() {
  const { products, createProduct, updateProduct, deleteProduct, uploadImage, error, success } = useAdminController();
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [view,      setView]      = useState("list");

  function handleChange(field, value) { setForm(p => ({ ...p, [field]: value })); }
  function toggleSize(size) {
    setForm(p => ({
      ...p,
      sizes: p.sizes.includes(size) ? p.sizes.filter(s => s !== size) : [...p.sizes, size]
    }));
  }
  function addColor() { setForm(p => ({ ...p, colors: [...p.colors, "#ffffff"] })); }
  function updateColor(i, v) { setForm(p => ({ ...p, colors: p.colors.map((c, j) => j === i ? v : c) })); }
  function removeColor(i) { setForm(p => ({ ...p, colors: p.colors.filter((_, j) => j !== i) })); }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setForm(p => ({ ...p, img: url }));
    setUploading(false);
  }

  function handleEdit(product) {
    setForm({
      name: product.name, price: product.price, category: product.category,
      brand: product.brand, sizes: product.sizes, colors: product.colors,
      img: product.img, stock: product.stock || 0, descripcion: product.descripcion || ""
    });
    setEditingId(product.id);
    setView("form");
  }

  function handleCancel() { setForm(EMPTY_FORM); setEditingId(null); setView("list"); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.img)            return alert("Por favor sube una imagen.");
    if (!form.sizes.length)   return alert("Selecciona al menos una talla.");
    setSaving(true);
    const data = { ...form, price: Number(form.price), stock: Number(form.stock) };
    const ok   = editingId ? await updateProduct(editingId, data) : await createProduct(data);
    setSaving(false);
    if (ok) { setForm(EMPTY_FORM); setEditingId(null); setView("list"); }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    await deleteProduct(id);
  }

  return (
    <div>
      <div className="admin-section-header">
        <h3>Gestión de Productos</h3>
        {view === "list"
          ? <button className="btn-hero" onClick={() => setView("form")}>
              <i className="fas fa-plus" /> Nuevo Producto
            </button>
          : <button className="btn-back" onClick={handleCancel}>
              <i className="fas fa-arrow-left" /> Volver
            </button>
        }
      </div>

      {error   && <div className="admin-alert error">  <i className="fas fa-exclamation-circle" /> {error}   </div>}
      {success && <div className="admin-alert success"> <i className="fas fa-check-circle" />      {success} </div>}

      {view === "list" && (
        <div className="admin-grid">
          {products.length === 0 ? (
            <div className="admin-empty">
              <i className="fas fa-box-open" />
              <p>No hay productos. ¡Crea el primero!</p>
            </div>
          ) : products.map(p => (
            <div className="admin-card" key={p.id}>
              <img src={p.img} alt={p.name} />
              <div className="admin-card-info">
                <span className="admin-category">{p.category}</span>
                <h4>{p.name}</h4>
                <p className="admin-price">{p.getFormattedPrice()}</p>
                <p style={{ fontSize: 12, color: "#888", margin: "0 0 8px" }}>
                  Stock: {p.stock} unidades
                </p>
                <div className="admin-card-actions">
                  <button className="btn-edit"   onClick={() => handleEdit(p)}>
                    <i className="fas fa-edit" /> Editar
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(p.id, p.name)}>
                    <i className="fas fa-trash" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "form" && (
        <form className="admin-form" onSubmit={handleSubmit} noValidate>
          <h3>{editingId ? "Editar Producto" : "Nuevo Producto"}</h3>
          <div className="form-group">
            <label>Nombre *</label>
            <input type="text" value={form.name}
              onChange={e => handleChange("name", e.target.value)} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio (COP) *</label>
              <input type="number" value={form.price}
                onChange={e => handleChange("price", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Stock inicial</label>
              <input type="number" min="0" value={form.stock}
                onChange={e => handleChange("stock", e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Categoría *</label>
              <select value={form.category} onChange={e => handleChange("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Marca</label>
              <input type="text" value={form.brand}
                onChange={e => handleChange("brand", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input type="text" placeholder="Descripción breve del producto"
              value={form.descripcion} onChange={e => handleChange("descripcion", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Tallas *</label>
            <div className="size-options">
              {ALL_SIZES.map(size => (
                <button type="button" key={size}
                  className={`size-btn ${form.sizes.includes(size) ? "selected" : ""}`}
                  onClick={() => toggleSize(size)}>{size}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Colores</label>
            <div className="color-picker-row">
              {form.colors.map((color, i) => (
                <div key={i} className="color-picker-item">
                  <input type="color" value={color} onChange={e => updateColor(i, e.target.value)} />
                  {form.colors.length > 1 && (
                    <button type="button" className="remove-color" onClick={() => removeColor(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="add-color-btn" onClick={addColor}>
                <i className="fas fa-plus" /> Color
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Imagen *</label>
            <div className="image-upload-area">
              {form.img ? (
                <div className="image-preview">
                  <img src={form.img} alt="Preview" />
                  <button type="button" className="change-img"
                    onClick={() => document.getElementById("img-input").click()}>
                    <i className="fas fa-camera" /> Cambiar
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder"
                  onClick={() => document.getElementById("img-input").click()}>
                  {uploading
                    ? <><span className="spinner" /> Subiendo...</>
                    : <><i className="fas fa-cloud-upload-alt" /><p>Clic para subir imagen</p></>
                  }
                </div>
              )}
              <input id="img-input" type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleImageUpload} />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-add-cart" disabled={saving || uploading}>
              {saving ? <><span className="spinner" /> Guardando...</>
                      : <><i className="fas fa-save" /> {editingId ? "Actualizar" : "Crear"}</>}
            </button>
            <button type="button" className="btn-back" onClick={handleCancel}>Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
}
