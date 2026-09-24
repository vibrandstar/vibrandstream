"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ProductoCarrito {
  id: string;
  nombre: string;
  precio: number;
  tipo: string;
  suscripcion: string;
  imagenUrl: string;
  cantidad: number;
}

interface CartContextType {
  carrito: ProductoCarrito[];
  carritoAbierto: boolean;
  setCarritoAbierto: (abierto: boolean) => void;
  agregarAlCarrito: (producto: any) => void;
  eliminarDelCarrito: (id: string) => void;
  actualizarCantidad: (id: string, delta: number) => void;
  vaciarCarrito: () => void;
  totalPagar: number;
  finalizarPedidoWhatsApp: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const numeroWhatsApp = "529141384914";

  // Cargar carrito persistente si existe en localStorage
  useEffect(() => {
    try {
      const guardado = localStorage.getItem("vibrandstream_cart");
      if (guardado) {
        setCarrito(JSON.parse(guardado));
      }
    } catch (e) {
      console.error("Error al leer carrito local", e);
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("vibrandstream_cart", JSON.stringify(carrito));
    } catch (e) {
      console.error("Error al guardar carrito local", e);
    }
  }, [carrito]);

  const agregarAlCarrito = (producto: any) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          tipo: producto.tipo,
          suscripcion: producto.suscripcion,
          imagenUrl: producto.imagenUrl,
          cantidad: 1,
        },
      ];
    });
    setCarritoAbierto(true);
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  const actualizarCantidad = (id: string, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nueva = item.cantidad + delta;
            return nueva > 0 ? { ...item, cantidad: nueva } : null;
          }
          return item;
        })
        .filter(Boolean) as ProductoCarrito[]
    );
  };

  const vaciarCarrito = () => setCarrito([]);

  const totalPagar = carrito.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  const finalizarPedidoWhatsApp = () => {
    if (carrito.length === 0) return;

    const listaProductos = carrito
      .map((item) => {
        const subtotal = item.precio * item.cantidad;
        return `• ${item.nombre} (${item.tipo} - ${item.suscripcion}) x${item.cantidad} = $${subtotal} MXN`;
      })
      .join("\n");

    const mensaje = `👋 ¡Hola! Quiero realizar el pedido de los productos en mi carrito:

📋 *DETALLE DEL PEDIDO:*
${listaProductos}

━━━━━━━━━━━━━━━━━━━
💰 *TOTAL A PAGAR:* $${totalPagar} MXN
━━━━━━━━━━━━━━━━━━━

💳 ¿Me podrías compartir los datos bancarios para realizar el pago por transferencia (SPEI)? Quedo atento a la confirmación. ¡Muchas gracias!`;

    window.open(
      `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  return (
    <CartContext.Provider
      value={{
        carrito,
        carritoAbierto,
        setCarritoAbierto,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        totalPagar,
        finalizarPedidoWhatsApp,
      }}
    >
      {children}
      <DrawerCarrito />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}

// Componente visual del panel lateral
function DrawerCarrito() {
  const {
    carrito,
    carritoAbierto,
    setCarritoAbierto,
    eliminarDelCarrito,
    actualizarCantidad,
    totalPagar,
    finalizarPedidoWhatsApp,
  } = useCart();

  if (!carritoAbierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        onClick={() => setCarritoAbierto(false)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="relative w-full max-w-md bg-[#0a0a0a] border-l border-white/10 text-gray-200 h-full flex flex-col z-10 shadow-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Tu Carrito
            </h3>
            <span className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
              {carrito.reduce((acc, i) => acc + i.cantidad, 0)}
            </span>
          </div>
          <button
            onClick={() => setCarritoAbierto(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-3">
              <span className="text-3xl">🛒</span>
              <p className="text-sm">Tu carrito está vacío.</p>
              <button
                onClick={() => setCarritoAbierto(false)}
                className="text-xs text-blue-400 hover:underline"
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            carrito.map((item) => (
              <div
                key={item.id}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex gap-3 items-center"
              >
                <img
                  src={item.imagenUrl}
                  alt={item.nombre}
                  className="w-14 h-14 object-cover rounded-lg bg-gray-900 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">
                    {item.nombre}
                  </h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {item.tipo} • {item.suscripcion}
                  </p>
                  <p className="text-xs font-bold text-white mt-1">
                    ${item.precio * item.cantidad}{" "}
                    <span className="text-[10px] text-gray-500 font-normal">
                      MXN
                    </span>
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => actualizarCantidad(item.id, -1)}
                      className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs hover:bg-white/10 text-gray-300"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold px-1">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => actualizarCantidad(item.id, 1)}
                      className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs hover:bg-white/10 text-gray-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => eliminarDelCarrito(item.id)}
                  className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  title="Eliminar producto"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {carrito.length > 0 && (
          <div className="p-5 border-t border-white/10 bg-[#050505] space-y-4">
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Método de pago:</span>
                <span className="text-white font-medium">Transferencia (SPEI)</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                <span className="text-sm font-semibold text-white">Total:</span>
                <span className="text-xl font-bold text-white">
                  ${totalPagar} <span className="text-xs text-gray-500 font-normal">MXN</span>
                </span>
              </div>
            </div>

            <button
              onClick={finalizarPedidoWhatsApp}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-colors shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
            >
              <span>Continuar al Pago por WhatsApp</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}