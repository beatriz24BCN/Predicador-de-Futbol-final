import { useState } from "react";
import "../index.css";

import madrid from "../assets/camisetas/madrid.jpg";
import barcelona from "../assets/camisetas/barcelona.jpg";
import city from "../assets/camisetas/city.jpg";
import liverpool from "../assets/camisetas/liverpool.jpg";
import bayern from "../assets/camisetas/bayern.jpg";
import psg from "../assets/camisetas/psg.jpg";

export const Tienda = () => {
  const products = [
    { id: 1, name: "Camiseta Real Madrid 2024", price: 79.99, img: madrid },
    { id: 2, name: "Camiseta Barcelona 2024", price: 79.99, img: barcelona },
    { id: 3, name: "Camiseta Manchester City 2024", price: 74.99, img: city },
    { id: 4, name: "Camiseta Liverpool 2024", price: 74.99, img: liverpool },
    { id: 5, name: "Camiseta Bayern Munich 2024", price: 74.99, img: bayern },
    { id: 6, name: "Camiseta PSG 2024", price: 74.99, img: psg },
  ];

  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [paid, setPaid] = useState(false);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  // ✅ VALIDACIÓN EMAIL
  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // 🟢 COMPRA NORMAL
  const pay = () => {
    const email = prompt("Introduce tu correo:");

    if (!email || !isValidEmail(email)) {
      alert("❌ Correo no válido");
      return;
    }

    setPaid(true);

    alert(`✅ Compra realizada\nTotal: ${total.toFixed(2)}€\nCorreo: ${email}`);

    setCart([]);
    setTimeout(() => setPaid(false), 3000);
  };

  // 🔵 PAYPAL
  const handlePaypal = () => {
    const email = prompt("Correo para PayPal:");

    if (!email || !isValidEmail(email)) {
      alert("❌ Correo no válido");
      return;
    }

    alert("🔵 Redirigiendo a PayPal...");

    setTimeout(() => {
      alert(`✅ Pago con PayPal completado\nTotal: ${total.toFixed(2)}€`);
      setCart([]);
    }, 1500);
  };

  return (
    <div className="tienda-container">
      <h1>Tienda</h1>

      {/* BOTÓN CARRITO */}
      <div className="cart-button" onClick={() => setOpen(!open)}>
        🛒 <span className="cart-count">{cart.length}</span>
      </div>

      {/* GRID */}
      <div className="tienda-grid">
        {products.map((p) => (
          <div className="product-card" key={p.id}>
            <img src={p.img} className="product-img" />
            <h3>{p.name}</h3>
            <p className="price">{p.price}€</p>
            <button onClick={() => addToCart(p)}>Añadir</button>
          </div>
        ))}
      </div>

      {/* SIDEBAR */}
      <div className={`cart-sidebar ${open ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Carrito</h2>
          <button onClick={() => setOpen(false)}>X</button>
        </div>

        {cart.length === 0 ? (
          <p>Vacío</p>
        ) : (
          <>
            {cart.map((item, i) => (
              <div className="cart-item" key={i}>
                <img src={item.img} />
                <div>
                  <p>{item.name}</p>
                  <span>{item.price}€</span>
                </div>
                <button onClick={() => removeItem(i)}>❌</button>
              </div>
            ))}

            <h3>Total: {total.toFixed(2)}€</h3>

            <button className="pay-button" onClick={pay}>
              Finalizar compra
            </button>

            <button className="paypal-btn" onClick={handlePaypal}>
              Pagar con PayPal
            </button>
          </>
        )}

        {paid && <p className="success">✅ Pago realizado</p>}
      </div>
    </div>
  );
};