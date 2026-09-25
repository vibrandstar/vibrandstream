"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  tipo: string;
  suscripcion: string;
  imagenUrl: string;
  cantidad: number;
}

interface CartContextType {
  carrito: ItemCarrito[];
  carritoAbierto: boolean;
  setCarritoAbierto: (abierto: boolean) => void;
  agregarAlCarrito: (producto: any) => void;
  eliminarDelCarrito: (id: string) => void;
  actualizarCantidad: (id: string, cantidad: number) => void;
  vaciarCarrito: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  // El carrito inicia en vacío [] y no guarda nada en localStorage.
  // Al recargar la página, cerrar pestaña o salir, vuelve automáticamente a [].
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

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

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    setCarrito((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cantidad } : item))
    );
  };

  const vaciarCarrito = () => {
    setCarrito([]);
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
      }}
    >
      {children}
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