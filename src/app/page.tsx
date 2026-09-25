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
  categoria?: string;
  destacado?: boolean;
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

  const totalCalculado = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }, [carrito]);

  const numeroWhatsApp = "529141384914";
  const clabeNu = "638180000123456789";
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
        console.error("Error al cargar productos:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerProductos();
  }, []);

  // ÚNICAS CATEGORÍAS VÁLIDAS
  const categorias = ["Todos", "Perfil", "Completa", "Música", "Herramientas"];

  // 3 Productos destacados
  const productosDestacados = useMemo(() => {
    return productos.filter((p) => p.destacado).slice(0, 3);
  }, [productos]);

  // Filtro estricto por categoría seleccionada o Todos
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const q = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !q ||
        producto.nombre.toLowerCase().includes(q) ||
        producto.tipo.toLowerCase().includes(q) ||
        (producto.categoria && producto.categoria.toLowerCase().includes(q)) ||
        producto.suscripcion.toLowerCase().includes(q);

      const coincideCategoria =
        categoriaSeleccionada === "Todos" ||
        (producto.categoria && producto.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase()) ||
        // Soporte de compatibilidad para productos que aún no se hayan editado
        (categoriaSeleccionada === "Perfil" && producto.tipo?.toLowerCase().includes("perfil")) ||
        (categoriaSeleccionada === "Completa" && producto.tipo?.toLowerCase().includes("completa"));

      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  const copiarClabe = () => {
    navigator.clipboard.writeText(clabeNu);
    setClabeCopiada(true);
    setTimeout(() => setClabeCopiada(false), 2000);
  };

  const enviarComprobanteWhatsApp = () => {
    const mensaje = `👋 ¡Hola VibrandStream! Acabo de realizar una transferencia vía SPEI a tu cuenta Nu México.\nAdjunto comprobante de pago para mi entrega.`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const comprarProductoDirecto = (prod: Producto) => {
    const mensaje = `👋 ¡Hola! Me interesa adquirir de inmediato:\n\n📺 *Plataforma:* ${prod.nombre}\n🏷️ *Modalidad:* ${prod.tipo}\n⏱️ *Duración:* ${prod.suscripcion}\n💰 *Precio:* $${prod.precio} MXN\n\n¿Me confirmas datos para transferir por SPEI?`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const enviarPedidoCompletoWhatsApp = () => {
    if (carrito.length === 0) return;
    let mensaje = `👋 ¡Hola VibrandStream! Quiero realizar el pedido de los siguientes servicios:\n\n`;
    carrito.forEach((item, i) => {
      mensaje += `${i + 1}. *${item.nombre}* (${item.tipo} - ${item.suscripcion})\n   Cant: ${item.cantidad} | Subtotal: $${item.precio * item.cantidad} MXN\n`;
    });
    mensaje += `\n━━━━━━━━━━━━━━━━━━━━━\n💰 *TOTAL A PAGAR: $${totalCalculado} MXN*\n💳 Pago por SPEI Nu México.\n\n¿Me confirmas disponibilidad?`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-blue-500/30 w-full overflow-x-hidden relative flex flex-col justify-between antialiased">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-white/[0.08] w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/logo.png"
              alt="VibrandStream"
              className="h-8 w-8 object-contain rounded"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <span className="text-sm sm:text-base font-black text-white tracking-wider uppercase">
              VIBRAND<span className="text-blue-500">STREAM</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setModalSpeiAbierto(true)}
              className="text-xs font-bold bg-[#141414] hover:bg-[#202020] text-gray-200 px-3 py-2 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <span className="text-sm">💳</span>
              <span>SPEI</span>
            </button>

            <Link
              href="/reportar-problema"
              className="text-xs font-bold bg-[#141414] hover:bg-[#202020] text-gray-200 px-3 py-2 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <span className="text-sm">🛠️</span>
              <span className="hidden sm:inline">Garantía</span>
            </Link>

            <button
              onClick={() => setCarritoAbierto(true)}
              className="relative p-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-xl text-blue-400 hover:text-white transition-all active:scale-95 flex items-center justify-center shrink-0"
              aria-label="Abrir carrito"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {carrito.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
                  {carrito.reduce((acc, i) => acc + i.cantidad, 0)}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-5 pb-14 flex-1 space-y-6 sm:space-y-8">
        
        {/* HERO Y BUSCADOR */}
        <section className="text-center space-y-2.5 pt-1 max-w-lg mx-auto w-full">
          <span className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-widest bg-blue-500/15 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full">
            Entrega Express 10-15 Min
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
            CATÁLOGO STREAMING
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Perfiles privados y cuentas completas con garantía y soporte directo vía WhatsApp.
          </p>

          <div className="pt-1.5 w-full relative flex items-center">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar Netflix, Spotify, Disney+..."
              className="w-full bg-[#101010] border border-white/10 rounded-xl pl-10 pr-9 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute left-3.5 text-sm text-gray-500">🔍</span>
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3.5 text-gray-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* 3 PRODUCTOS DESTACADOS */}
        {productosDestacados.length > 0 && !busqueda && categoriaSeleccionada === "Todos" && (
          <section className="space-y-3 bg-[#0c0c0c] border border-blue-500/20 p-4 sm:p-5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg">⭐</span>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                Plataformas Más Populares
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {productosDestacados.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#141414] border border-white/10 hover:border-blue-500/40 rounded-xl p-3 flex sm:flex-col items-center gap-3 transition-colors"
                >
                  <img
                    src={prod.imagenUrl}
                    alt={prod.nombre}
                    className="w-16 h-16 sm:w-full sm:h-28 object-cover rounded-lg shrink-0 bg-black"
                  />
                  <div className="flex-1 min-w-0 sm:text-center w-full">
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">
                      {prod.tipo}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-white truncate mt-0.5">
                      {prod.nombre}
                    </h3>
                    <div className="text-xs sm:text-sm font-black text-white mt-1">
                      ${prod.precio} MXN
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      <button
                        onClick={() => agregarAlCarrito(prod)}
                        className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold py-1.5 rounded-lg border border-white/10"
                      >
                        + Carro
                      </button>
                      <button
                        onClick={() => comprarProductoDirecto(prod)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-1.5 rounded-lg"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SELECTOR DE CATEGORÍAS (TODOS + 4 CATEGORÍAS) */}
        <section className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max px-0.5">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shrink-0 ${
                  categoriaSeleccionada === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-[#121212] text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* CATÁLOGO GENERAL */}
        <section className="w-full">
          {cargando ? (
            <div className="py-16 text-center text-gray-500 font-mono text-xs sm:text-sm uppercase tracking-widest animate-pulse">
              Cargando catálogo...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-12 text-center bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 max-w-xs mx-auto space-y-1.5">
              <span className="text-3xl block">🔍</span>
              <p className="text-gray-300 text-sm font-bold">No hay plataformas disponibles</p>
              <p className="text-gray-500 text-xs">Prueba con otra categoría o término.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {productosFiltrados.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#0e0e0e] border border-white/[0.08] hover:border-white/20 rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-lg shadow-black/40"
                >
                  <Link
                    href={`/producto/${prod.id}`}
                    className="block relative aspect-square w-full bg-[#161616] overflow-hidden"
                  >
                    {!prod.disponible && (
                      <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 uppercase tracking-widest rounded">
                          Agotado
                        </span>
                      </div>
                    )}
                    <img
                      src={prod.imagenUrl}
                      alt={prod.nombre}
                      className={`w-full h-full object-cover transition-transform duration-300 ${
                        !prod.disponible ? "grayscale opacity-35" : ""
                      }`}
                      loading="lazy"
                    />
                    <span className="absolute bottom-2 left-2 z-10 text-[10px] font-black uppercase tracking-wider bg-black/85 text-blue-400 px-2 py-0.5 rounded-md border border-white/10">
                      {prod.tipo}
                    </span>
                  </Link>

                  <div className="p-3 flex flex-col justify-between flex-1 gap-2.5">
                    <div>
                      <span className="text-[11px] text-gray-500 block truncate font-medium">
                        {prod.suscripcion}
                      </span>
                      <Link href={`/producto/${prod.id}`}>
                        <h3 className="text-white font-bold text-xs sm:text-sm leading-snug line-clamp-2 h-9 hover:text-blue-400 transition-colors">
                          {prod.nombre}
                        </h3>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] space-y-2.5">
                      <div className="text-sm sm:text-base font-black text-white">
                        ${prod.precio} <span className="text-[10px] sm:text-xs text-gray-500 font-normal">MXN</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => agregarAlCarrito(prod)}
                          disabled={!prod.disponible}
                          className="bg-[#181818] hover:bg-[#222222] text-gray-200 border border-white/10 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          + Carro
                        </button>
                        <button
                          onClick={() => comprarProductoDirecto(prod)}
                          disabled={!prod.disponible}
                          className="bg-blue-600 hover:bg-blue-500 text-white py-2 text-xs font-black rounded-xl transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm shadow-blue-600/30"
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

      {/* FOOTER TOTALMENTE CENTRADO */}
      <footer className="border-t border-white/[0.08] bg-[#070707] py-9 px-4 text-gray-400 w-full">
        <div className="max-w-xl mx-auto space-y-6 text-center flex flex-col items-center justify-center">
          
          <div className="space-y-2 flex flex-col items-center">
            <span className="font-black text-white text-base sm:text-lg uppercase tracking-widest">
              VIBRAND<span className="text-blue-500">STREAM</span>
            </span>
            <p className="text-xs sm:text-sm text-gray-400 max-w-sm leading-relaxed text-center">
              Suscripciones digitales y streaming garantizado con soporte y entrega vía WhatsApp.
            </p>
          </div>

          <div className="space-y-3 flex flex-col items-center w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Atención al Cliente
            </span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 text-xs sm:text-sm w-full">
              <Link
                href="/reportar-problema"
                className="text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 py-1"
              >
                <span>🛠️</span> Centro de Garantías y Reportes
              </Link>
              <button
                onClick={() => setModalSpeiAbierto(true)}
                className="text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 py-1"
              >
                <span>💳</span> Información de Cuenta SPEI
              </button>
            </div>
          </div>

          <div className="bg-[#101010] border border-white/5 p-4.5 rounded-2xl space-y-1.5 text-center max-w-sm w-full">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
              Método de Pago
            </span>
            <p className="text-sm text-white font-semibold">
              Transferencia SPEI (Nu México)
            </p>
            <p className="text-xs text-gray-500 leading-normal">
              Aceptamos transferencias desde cualquier banco.
            </p>
          </div>

          <div className="text-xs text-gray-600 pt-2 border-t border-white/[0.04] w-full text-center">
            © 2026 VibrandStream. Todos los derechos reservados.
          </div>

        </div>
      </footer>

      {/* MODAL SPEI */}
      {modalSpeiAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs sm:max-w-sm bg-[#101010] border border-white/10 rounded-2xl p-5 space-y-3.5 relative shadow-2xl">
            <button
              onClick={() => setModalSpeiAbierto(false)}
              className="absolute top-3.5 right-3.5 text-gray-500 hover:text-white text-sm p-1"
            >
              ✕
            </button>
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 inline-block">
                Pago Seguro
              </span>
              <h3 className="text-base font-black text-white uppercase">Datos de Transferencia</h3>
            </div>

            <div className="bg-[#161616] border border-white/5 p-3.5 rounded-xl space-y-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-gray-500 block font-sans font-bold uppercase">Banco:</span>
                <span className="text-white font-bold">Nu México</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block font-sans font-bold uppercase">Beneficiario:</span>
                <span className="text-gray-300 text-xs">{titularNu}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block font-sans font-bold uppercase">CLABE Interbancaria:</span>
                <div className="flex items-center justify-between gap-1.5 mt-1 bg-black/40 p-2.5 rounded-lg border border-white/10">
                  <span className="text-blue-400 font-bold select-all tracking-wider text-xs sm:text-sm">{clabeNu}</span>
                  <button
                    onClick={copiarClabe}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] px-2.5 py-1 rounded-md font-sans font-bold transition-colors"
                  >
                    {clabeCopiada ? "Listo" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={enviarComprobanteWhatsApp}
              className="w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase text-xs rounded-xl tracking-wider transition-colors shadow-md shadow-green-600/20"
            >
              📲 Enviar Comprobante por WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* DRAWER CARRITO */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs sm:max-w-sm bg-[#0d0d0d] border-l border-white/10 h-full flex flex-col justify-between p-4.5 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-3.5">
                <h3 className="font-black text-white text-sm sm:text-base uppercase flex items-center gap-2">
                  <span>🛒</span> Tu Carrito
                </h3>
                <button
                  onClick={() => setCarritoAbierto(false)}
                  className="text-gray-500 hover:text-white text-sm p-1"
                >
                  ✕
                </button>
              </div>

              {carrito.length === 0 ? (
                <div className="py-14 text-center text-gray-500 text-sm">El carrito está vacío.</div>
              ) : (
                <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
                  {carrito.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#141414] border border-white/5 p-2.5 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="text-white font-bold text-xs sm:text-sm truncate">{item.nombre}</h4>
                        <span className="text-[11px] text-gray-400 block">{item.tipo}</span>
                        <span className="text-xs sm:text-sm text-blue-400 font-black mt-0.5 block">
                          ${item.precio * item.cantidad} MXN
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-black/40">
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-1.5 text-xs font-bold text-white">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="text-gray-500 hover:text-red-400 p-1 text-sm"
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
              <div className="border-t border-white/10 pt-3.5 space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 uppercase font-bold">Total:</span>
                  <span className="text-lg font-black text-white">${totalCalculado} MXN</span>
                </div>
                <button
                  onClick={enviarPedidoCompletoWhatsApp}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs sm:text-sm rounded-xl tracking-wider transition-colors shadow-md shadow-blue-600/30 active:scale-95"
                >
                  Finalizar Pedido vía WhatsApp
                </button>
                <button
                  onClick={vaciarCarrito}
                  className="w-full py-1 text-xs text-gray-500 hover:text-gray-300 text-center transition-colors"
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