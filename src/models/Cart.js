/**
 * @fileoverview Modelo de Carrito de Compras
 * 
 * CONCEPTO CLAVE: INMUTABILIDAD
 * Esta clase NUNCA modifica sus propios datos (this.items).
 * Cada método que "modifica" el carrito en realidad crea y devuelve
 * un CARRITO NUEVO con los cambios aplicados.
 * 
 * ¿POR QUÉ HACERLO ASÍ Y NO SIMPLEMENTE MODIFICAR this.items DIRECTAMENTE?
 * Porque React necesita detectar cuándo cambió el estado para volver
 * a dibujar la pantalla. Si modificas el mismo objeto en memoria,
 * React no se da cuenta del cambio (la referencia sigue siendo la misma).
 * Si creas un objeto NUEVO, React compara la referencia vieja vs la
 * nueva, ve que son diferentes, y actualiza la pantalla automáticamente.
 * 
 * Esto es lo que pasa técnicamente cuando agregas un producto:
 * 1. setCart(prev => cartService.addToCart(prev, product))
 * 2. addToCart() llama a cart.addItem(product)
 * 3. addItem() NO modifica this.items, crea un array nuevo con [...this.items, nuevoProducto]
 * 4. Devuelve "new CartModel(arrayNuevo)" — un objeto carrito COMPLETAMENTE NUEVO
 * 5. React ve que el carrito cambió de referencia y re-renderiza el contador, el drawer, etc.
 */

export class CartModel {
  /**
   * @param {Array} items - Lista de productos en el carrito.
   * Por defecto es un array vacío [] si no se pasa nada.
   */
  constructor(items = []) {
    this.items = items;
  }

  /**
   * Suma el total a pagar.
   * reduce() recorre cada item y va acumulando: precio × cantidad
   * Ejemplo: si tienes 2 camisas a $50.000 c/u → total = $100.000
   */
  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Cuenta cuántas UNIDADES hay en total (no cuántos productos distintos).
   * Si tienes 2 camisas y 3 pantalones → devuelve 5, no 2.
   * Este número es el que se muestra en el círculo rojo del carrito en el navbar.
   */
  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Agrega un producto al carrito.
   * 
   * LÓGICA:
   * 1. Busca si el producto YA está en el carrito (mismo id)
   * 2. Si existe: crea un carrito nuevo donde ESE producto tiene quantity+1
   * 3. Si no existe: crea un carrito nuevo agregando el producto con quantity=1
   * 
   * @param {Object} product - El producto a agregar (incluye talla/color seleccionados)
   * @returns {CartModel} Un carrito COMPLETAMENTE NUEVO (no modifica el actual)
   */
  addItem(product) {
    const existing = this.items.find(i => i.id === product.id);

    if (existing) {
      // .map() crea un ARRAY NUEVO recorriendo el viejo
      // Si el id coincide, devuelve una copia del item con quantity+1
      // Si no coincide, devuelve el item sin cambios
      return new CartModel(
        this.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      );
    }

    // [...this.items, nuevoItem] crea un array nuevo:
    // copia todo lo que ya había + agrega el producto nuevo al final
    return new CartModel([...this.items, { ...product, quantity: 1 }]);
  }

  /**
   * Elimina un producto del carrito por su ID.
   * filter() crea un array nuevo con TODOS los items EXCEPTO el que coincide
   * @param {string} productId
   * @returns {CartModel} Carrito nuevo sin ese producto
   */
  removeItem(productId) {
    return new CartModel(this.items.filter(i => i.id !== productId));
  }
}
