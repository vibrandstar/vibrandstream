"use client";

import { useEffect, useState, useMemo } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  tipo: string;
  suscripcion: string;
  disponible: boolean;
  imagenUrl: string;
  perfiles?: number;
  dispositivos?: number;
}

export default function PaginaProducto() {
  const params = useParams();
  const router = useRouter();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [todosLosProductos, setTodosLosProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);

  const { carrito, setCarritoAbierto, agregarAlCarrito } = useCart();
  const numeroWhatsApp = "529141384914";

  useEffect(() => {
    const cargarDatos = async () => {
      if (!params.id) return;
      setCargando(true);
      try {
        // 1. Cargar el producto actual
        const docRef = doc(db, "productos", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProducto({ id: docSnap.id, ...docSnap.data() } as Producto);
        } else {
          setProducto(null);
        }

        // 2. Cargar todo el catálogo para las sugerencias aleatorias
        const querySnapshot = await getDocs(collection(db, "productos"));
        const lista: Producto[] = [];
        querySnapshot.forEach((d) => {
          lista.push({ id: d.id, ...d.data() } as Producto);
        });
        setTodosLosProductos(lista);
      } catch (error) {
        console.error("Error al obtener producto y sugerencias:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [params.id]);

  // Obtener 4 sugerencias al azar (excluyendo el producto actual)
  const sugerenciasAleatorias = useMemo(() => {
    if (!producto) return [];
    const otros = todosLosProductos.filter((p) => p.id !== producto.id);
    // Algoritmo de mezcla aleatoria (Fisher-Yates / sort random)
    const mezclados = [...otros].sort(() => 0.5 - Math.random());
    return mezclados.slice(0, 4);
  }, [todosLosProductos, producto]);

  const comprarProductoDirecto = (prod: Producto) => {
    const mensaje = `👋 ¡Hola! Me interesa adquirir de inmediato el siguiente servicio:

📺 *Plataforma:* ${prod.nombre}
🏷️ *Modalidad:* ${prod.tipo}
⏱️ *Duración:* ${prod.suscripcion}
💰 *Total a pagar:* $${prod.precio} MXN

💳 ¿Me podrías compartir los datos bancarios (SPEI) para realizar la transferencia, por favor? ¡Gracias!`;

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
        Cargando servicio...
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-xl font-bold mb-3">Producto no disponible</h2>
        <button onClick={() => router.push("/")} className="text-blue-400 hover:underline text-xs">
          ← Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30 overflow-x-hidden antialiased">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050505]/85 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-7 w-auto flex items-center">
              <img 
                src="/logo.png" 
                alt="Logo VibrandStream" 
                className="h-full w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <span className="text-base font-black text-white tracking-widest uppercase">
              VIBRAND<span className="text-blue-500">STREAM</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">
              ← Catálogo
            </Link>
            <button 
              onClick={() => setCarritoAbierto(true)}
              className="relative p-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white hover:text-blue-400 transition-all active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {carrito.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-blue-500/50">
                  {carrito.reduce((acc, i) => acc + i.cantidad, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor principal de Detalle */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-start">
          
          {/* Imagen Cuadrada con badge */}
          <div className="relative aspect-square w-full bg-[#101010] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            {!producto.disponible && (
              <div className="absolute inset-0 bg-black/75 z-10 flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-red-600 text-white text-xs font-black px-4 py-1.5 uppercase tracking-widest rounded-lg">
                  Agotado
                </span>
              </div>
            )}
            <img
              src={producto.imagenUrl}
              alt={producto.nombre}
              className={`w-full h-full object-cover ${!producto.disponible ? "grayscale opacity-40" : ""}`}
            />
          </div>

          {/* Información y Compra */}
          <div className="flex flex-col space-y-6">
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-widest font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md">
                  {producto.tipo}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 bg-white/[0.03] px-2.5 py-1 rounded-md border border-white/5">
                  {producto.suscripcion}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                {producto.nombre}
              </h1>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  ${producto.precio}
                </span>
                <span className="text-xs text-gray-500 font-mono">MXN / Pago único</span>
              </div>
            </div>

            {/* Ficha técnica rápida */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white/[0.02] border border-white/10 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Perfiles</span>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {producto.perfiles ? `${producto.perfiles} perfil(es)` : (producto.tipo.toLowerCase().includes("perfil") ? "1 perfil" : "Cuenta completa")}
                </span>
              </div>
              <div className="bg-white/[0.02] border border-white/10 p-3 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Dispositivos</span>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {producto.dispositivos ? `${producto.dispositivos} simultáneo(s)` : (producto.tipo.toLowerCase().includes("perfil") ? "1 dispositivo" : "Multidispositivo")}
                </span>
              </div>
            </div>

            {/* Botones de compra */}
            <div className="space-y-2.5">
              <button
                onClick={() => comprarProductoDirecto(producto)}
                disabled={!producto.disponible}
                className={`w-full py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg ${
                  producto.disponible
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-95"
                    : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
                }`}
              >
                Comprar Ahora (WhatsApp)
              </button>

              <button
                onClick={() => agregarAlCarrito(producto)}
                disabled={!producto.disponible}
                className={`w-full py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                  producto.disponible
                    ? "bg-white/[0.03] border-white/10 text-white hover:bg-white/[0.08] active:scale-95"
                    : "bg-transparent text-gray-700 cursor-not-allowed border-white/5"
                }`}
              >
                + Agregar al Carrito
              </button>
            </div>

            {/* Reglas y Garantías */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                Términos, Uso y Garantía
              </span>
              <div className="bg-[#0b0b0b] border border-white/5 p-4 rounded-2xl text-xs sm:text-sm text-gray-300 whitespace-pre-line leading-relaxed font-sans">
                {producto.descripcion}
              </div>
            </div>

          </div>

        </div>

        {/* 🎲 SECCIÓN DE SUGERENCIAS AL AZAR (OTRAS PLATAFORMAS) */}
        {sugerenciasAleatorias.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/[0.08]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-blue-400 uppercase block mb-1">
                  Descubre Más Entretenimiento
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                  Otras plataformas que te podrían interesar
                </h2>
              </div>
              <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors hidden sm:block">
                Ver todo el catálogo →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
              {sugerenciasAleatorias.map((sug) => (
                <div
                  key={sug.id}
                  className="group relative flex flex-col bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/10"
                >
                  <Link
                    href={`/producto/${sug.id}`}
                    className="block relative aspect-square w-full bg-[#121212] overflow-hidden"
                  >
                    {!sug.disponible && (
                      <div className="absolute inset-0 bg-black/75 z-10 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded">
                          Agotado
                        </span>
                      </div>
                    )}
                    <img
                      src={sug.imagenUrl}
                      alt={sug.nombre}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        !sug.disponible ? "grayscale opacity-40" : ""
                      }`}
                      loading="lazy"
                    />
                    <span className="absolute bottom-1.5 left-1.5 z-10 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md text-blue-400 px-1.5 py-0.5 rounded border border-white/10">
                      {sug.tipo}
                    </span>
                  </Link>

                  <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
                    <div>
                      <span className="text-[9px] text-gray-500 block mb-0.5 font-medium">
                        {sug.suscripcion}
                      </span>
                      <Link href={`/producto/${sug.id}`}>
                        <h3 className="text-white font-bold text-xs leading-snug line-clamp-2 h-8 group-hover:text-blue-400 transition-colors">
                          {sug.nombre}
                        </h3>
                      </Link>
                    </div>

                    <div className="space-y-2 pt-1 border-t border-white/[0.05]">
                      <div className="text-xs sm:text-sm font-black text-white">
                        ${sug.precio} <span className="text-[9px] text-gray-500 font-normal">MXN</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <button
                          onClick={() => agregarAlCarrito(sug)}
                          disabled={!sug.disponible}
                          className={`w-full py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                            sug.disponible
                              ? "bg-white/[0.04] hover:bg-white/[0.1] text-white border border-white/10 active:scale-95"
                              : "bg-transparent text-gray-700 cursor-not-allowed border border-white/5"
                          }`}
                        >
                          + Carrito
                        </button>
                        <button
                          onClick={() => comprarProductoDirecto(sug)}
                          disabled={!sug.disponible}
                          className={`w-full py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                            sug.disponible
                              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 active:scale-95"
                              : "bg-white/5 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          Comprar
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

    </div>
  );
}