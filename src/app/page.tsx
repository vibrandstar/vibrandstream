"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
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

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [modalSpeiAbierto, setModalSpeiAbierto] = useState(false);
  const [clabeCopiada, setClabeCopiada] = useState(false);

  const {
    carrito,
    carritoAbierto,
    setCarritoAbierto,
    agregarAlCarrito,
    eliminarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
  } = useCart();

  // Cálculo seguro del total directamente desde los items del carrito
  const totalCalculado = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }, [carrito]);

  const numeroWhatsApp = "529141384914";
  const clabeNu = "638180000123456789"; // Tu CLABE de Nu México
  const titularNu = "VIBRANDSTREAM / GERARDO CUSTODIO";

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const lista: Producto[] = [];
        querySnapshot.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() } as Producto);
        });
        setProductos(lista);
      } catch (error) {
        console.error("Error al cargar productos desde Firestore:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerProductos();
  }, []);

  const categorias = ["Todos", "Perfil", "Completa", "Música", "Herramientas"];

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !q ||
        producto.nombre.toLowerCase().includes(q) ||
        producto.tipo.toLowerCase().includes(q) ||
        producto.suscripcion.toLowerCase().includes(q);

      const coincideCategoria =
        categoriaSeleccionada === "Todos" ||
        (categoriaSeleccionada === "Perfil" && producto.tipo.toLowerCase().includes("perfil")) ||
        (categoriaSeleccionada === "Completa" && producto.tipo.toLowerCase().includes("completa")) ||
        (categoriaSeleccionada === "Música" &&
          (producto.nombre.toLowerCase().includes("spotify") ||
            producto.nombre.toLowerCase().includes("apple") ||
            producto.nombre.toLowerCase().includes("youtube"))) ||
        (categoriaSeleccionada === "Herramientas" &&
          (producto.nombre.toLowerCase().includes("canva") ||
            producto.nombre.toLowerCase().includes("capcut") ||
            producto.tipo.toLowerCase().includes("equipo")));

      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  const copiarClabe = () => {
    navigator.clipboard.writeText(clabeNu);
    setClabeCopiada(true);
    setTimeout(() => setClabeCopiada(false), 2000);
  };

  const enviarComprobanteWhatsApp = () => {
    const mensaje = `👋 ¡Hola VibrandStream! Acabo de realizar una transferencia bancaria vía SPEI a tu cuenta Nu México.
    
Adjunto mi comprobante para que por favor me entreguen el acceso a mi cuenta. ¡Muchas gracias!`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const comprarProductoDirecto = (prod: Producto) => {
    const mensaje = `👋 ¡Hola! Me interesa adquirir de inmediato el siguiente servicio:

📺 *Plataforma:* ${prod.nombre}
🏷️ *Modalidad:* ${prod.tipo}
⏱️ *Duración:* ${prod.suscripcion}
💰 *Total a pagar:* $${prod.precio} MXN

💳 ¿Me podrías confirmar los datos para transferir por SPEI, por favor?`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const enviarPedidoCompletoWhatsApp = () => {
    if (carrito.length === 0) return;
    let mensaje = `👋 ¡Hola VibrandStream! Quiero realizar el pedido de los siguientes servicios:\n\n`;
    carrito.forEach((item, index) => {
      mensaje += `${index + 1}. *${item.nombre}* (${item.tipo} - ${item.suscripcion})\n`;
      mensaje += `   Cantidad: ${item.cantidad} | Subtotal: $${item.precio * item.cantidad} MXN\n\n`;
    });
    mensaje += `━━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `💰 *TOTAL A PAGAR: $${totalCalculado} MXN*\n`;
    mensaje += `💳 *Método de pago:* Transferencia SPEI (Nu México)\n\n`;
    mensaje += `¿Me confirmas disponibilidad para realizar la transferencia ahora mismo?`;

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30 w-full overflow-x-hidden relative flex flex-col justify-between antialiased">
      
      {/* HEADER COMPACTO MOBILE-FIRST */}
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-white/[0.08] w-full">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="relative h-6 sm:h-7 w-auto flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="VibrandStream"
                className="h-full w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <span className="text-xs sm:text-base font-black text-white tracking-wider uppercase truncate">
              VIBRAND<span className="text-blue-500">STREAM</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setModalSpeiAbierto(true)}
              className="text-[10px] sm:text-xs font-bold bg-white/[0.05] hover:bg-white/[0.1] text-gray-200 px-2 sm:px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1"
            >
              <span>💳</span>
              <span>SPEI</span>
            </button>

            <Link
              href="/reportar-problema"
              className="text-[10px] sm:text-xs font-bold bg-white/[0.05] hover:bg-white/[0.1] text-gray-200 px-2 sm:px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1"
              title="Garantías"
            >
              <span>🛠️</span>
              <span className="hidden sm:inline">Garantía</span>
            </Link>

            <button
              onClick={() => setCarritoAbierto(true)}
              className="relative p-1.5 sm:p-2 bg-blue-600/15 border border-blue-500/30 rounded-lg text-blue-400 hover:text-white transition-all active:scale-95 flex items-center justify-center shrink-0"
              aria-label="Carrito de compras"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {carrito.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {carrito.reduce((acc, i) => acc + i.cantidad, 0)}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-14 flex-1 space-y-5">
        
        {/* HERO Y BUSCADOR */}
        <section className="text-center space-y-2.5 max-w-lg mx-auto w-full px-1">
          <span className="inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
            Entrega express 10-15 min
          </span>

          <h1 className="text-lg sm:text-3xl font-black text-white uppercase tracking-tight leading-snug">
            Streaming Premium Original
          </h1>

          <p className="text-[11px] sm:text-xs text-gray-400 leading-normal">
            Perfiles privados y cuentas completas con garantía y soporte directo por WhatsApp.
          </p>

          <div className="pt-1 w-full">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar Netflix, Spotify, Disney+..."
                className="w-full bg-[#101010] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <span className="absolute left-3 text-gray-500 text-xs">🔍</span>
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 text-gray-500 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* SELECTOR DE CATEGORÍAS */}
        <section className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center justify-start sm:justify-center gap-1.5 min-w-max px-0.5">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  categoriaSeleccionada === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white/[0.04] text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* GRILLA DE PRODUCTOS (2 Columnas en móvil / 4 en PC) */}
        <section className="w-full">
          {cargando ? (
            <div className="py-16 text-center text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
              Cargando catálogo oficial...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-12 text-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 max-w-xs mx-auto">
              <span className="text-2xl block mb-1">🔍</span>
              <p className="text-gray-300 text-xs font-bold">No se encontraron productos</p>
              <p className="text-gray-500 text-[10px] mt-0.5">Prueba con otra palabra clave.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 w-full">
              {productosFiltrados.map((prod) => (
                <div
                  key={prod.id}
                  className="group relative flex flex-col bg-[#0a0a0a] rounded-xl overflow-hidden border border-white/[0.08] hover:border-white/20 transition-all w-full"
                >
                  <Link
                    href={`/producto/${prod.id}`}
                    className="block relative aspect-square w-full bg-[#121212] overflow-hidden"
                  >
                    {!prod.disponible && (
                      <div className="absolute inset-0 bg-black/75 z-10 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-widest rounded">
                          Agotado
                        </span>
                      </div>
                    )}
                    <img
                      src={prod.imagenUrl}
                      alt={prod.nombre}
                      className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        !prod.disponible ? "grayscale opacity-40" : ""
                      }`}
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 left-1 z-10 text-[8px] font-black uppercase tracking-wider bg-black/80 text-blue-400 px-1.5 py-0.5 rounded border border-white/10">
                      {prod.tipo}
                    </span>
                  </Link>

                  <div className="p-2 sm:p-3 flex flex-col flex-1 justify-between gap-1.5">
                    <div>
                      <span className="text-[8px] sm:text-[9px] text-gray-500 block truncate font-medium">
                        {prod.suscripcion}
                      </span>
                      <Link href={`/producto/${prod.id}`}>
                        <h3 className="text-white font-bold text-[11px] sm:text-xs leading-tight line-clamp-2 h-7 group-hover:text-blue-400 transition-colors">
                          {prod.nombre}
                        </h3>
                      </Link>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-white/[0.05]">
                      <div className="text-xs sm:text-sm font-black text-white">
                        ${prod.precio} <span className="text-[8px] sm:text-[9px] text-gray-500 font-normal">MXN</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                        <button
                          onClick={() => agregarAlCarrito(prod)}
                          disabled={!prod.disponible}
                          className={`w-full py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all ${
                            prod.disponible
                              ? "bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 active:scale-95"
                              : "bg-transparent text-gray-700 cursor-not-allowed border border-white/5"
                          }`}
                        >
                          + Carro
                        </button>
                        <button
                          onClick={() => comprarProductoDirecto(prod)}
                          disabled={!prod.disponible}
                          className={`w-full py-1 text-[9px] font-black uppercase tracking-wider rounded transition-all ${
                            prod.disponible
                              ? "bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
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
          )}
        </section>

      </main>

      {/* FOOTER EN BLOQUES RESPONSIVE */}
      <footer className="border-t border-white/10 bg-[#080808] py-6 w-full text-gray-400">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-white/[0.06] text-left">
            <div className="space-y-1">
              <span className="font-black text-white text-xs sm:text-sm tracking-wider uppercase">
                VIBRAND<span className="text-blue-500">STREAM</span>
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Cuentas de streaming originales y garantizadas con soporte vía WhatsApp.
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white block">
                Ayuda y Soporte
              </span>
              <div className="flex flex-col space-y-1">
                <Link href="/reportar-problema" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span>🛠️</span> Formulario de Reportes
                </Link>
                <button
                  onClick={() => setModalSpeiAbierto(true)}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <span>💳</span> Datos de Pago SPEI
                </button>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl space-y-0.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 block">
                Pago SPEI Oficial
              </span>
              <p className="text-xs text-white font-semibold">
                Nu México Financiera
              </p>
              <p className="text-[10px] text-gray-500">
                Acreditación inmediata desde cualquier banco mexicano.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-gray-500 text-center sm:text-left">
            <p>© 2026 VibrandStream. Todos los derechos reservados.</p>
            <Link href="/admin" className="text-gray-500 hover:text-gray-300 transition-colors">
              Panel Administrativo
            </Link>
          </div>

        </div>
      </footer>

      {/* MODAL SPEI */}
      {modalSpeiAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs sm:max-w-sm bg-[#0e0e0e] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl relative">
            <button
              onClick={() => setModalSpeiAbierto(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white p-1 text-xs"
            >
              ✕
            </button>

            <div className="text-center mb-3">
              <span className="text-[8px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 inline-block mb-1">
                Pago Seguro
              </span>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                Transferencia SPEI
              </h3>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-xl p-3 space-y-2 font-mono text-[11px]">
              <div>
                <span className="text-[8px] text-gray-500 block uppercase font-sans font-bold">Banco:</span>
                <span className="text-white font-bold">Nu México</span>
              </div>

              <div>
                <span className="text-[8px] text-gray-500 block uppercase font-sans font-bold">Titular:</span>
                <span className="text-gray-300 text-[10px]">{titularNu}</span>
              </div>

              <div>
                <span className="text-[8px] text-gray-500 block uppercase font-sans font-bold">CLABE:</span>
                <div className="flex items-center justify-between gap-1.5 mt-0.5 bg-black/40 p-2 rounded-lg border border-white/10">
                  <span className="text-blue-400 font-bold select-all tracking-wider text-[10px] sm:text-xs">{clabeNu}</span>
                  <button
                    onClick={copiarClabe}
                    className="text-[8px] font-sans font-bold bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors shrink-0"
                  >
                    {clabeCopiada ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <button
                onClick={enviarComprobanteWhatsApp}
                className="w-full py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase tracking-wider text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span>📲</span> Enviar Comprobante
              </button>
              <button
                onClick={() => setModalSpeiAbierto(false)}
                className="w-full py-1.5 bg-white/5 text-gray-400 hover:text-white text-[10px] font-bold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER DEL CARRITO */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs sm:max-w-sm bg-[#0a0a0a] border-l border-white/10 h-full flex flex-col justify-between p-4 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <span>🛒</span>
                  <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider">Tu Carrito</h3>
                </div>
                <button
                  onClick={() => setCarritoAbierto(false)}
                  className="text-gray-500 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              </div>

              {carrito.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">
                  Tu carrito está vacío.
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {carrito.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#121212] border border-white/5 rounded-lg p-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="text-white font-bold text-[11px] truncate">{item.nombre}</h4>
                        <span className="text-[9px] text-gray-400 block">{item.tipo}</span>
                        <span className="text-[10px] text-blue-400 font-bold mt-0.5 block">
                          ${item.precio * item.cantidad} MXN
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center border border-white/10 rounded overflow-hidden bg-black/40">
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            className="px-1.5 py-0.5 text-xs text-gray-400"
                          >
                            -
                          </button>
                          <span className="px-1.5 text-xs font-bold text-white">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            className="px-1.5 py-0.5 text-xs text-gray-400"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="text-gray-500 hover:text-red-400 p-0.5 text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div className="border-t border-white/10 pt-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-bold uppercase">Total:</span>
                  <span className="text-base font-black text-white">${totalCalculado} MXN</span>
                </div>

                <button
                  onClick={enviarPedidoCompletoWhatsApp}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-[11px] rounded-lg transition-all shadow-md active:scale-95"
                >
                  Finalizar Pedido vía WhatsApp
                </button>
                <button
                  onClick={vaciarCarrito}
                  className="w-full py-1 text-[9px] text-gray-500 hover:text-gray-300 text-center"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}