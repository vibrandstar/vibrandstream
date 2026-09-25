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
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30 w-full overflow-x-hidden relative flex flex-col justify-between antialiased">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-md border-b border-white/[0.08] w-full">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 h-14 flex items-center justify-between gap-2">
          
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logo.png"
              alt="VibrandStream"
              className="h-6 w-6 object-contain rounded"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <span className="text-xs sm:text-sm font-black text-white tracking-wider uppercase">
              VIBRAND<span className="text-blue-500">STREAM</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setModalSpeiAbierto(true)}
              className="text-[11px] font-bold bg-[#141414] hover:bg-[#202020] text-gray-200 px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1"
            >
              <span>💳</span>
              <span>SPEI</span>
            </button>

            <Link
              href="/reportar-problema"
              className="text-[11px] font-bold bg-[#141414] hover:bg-[#202020] text-gray-200 px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-1"
            >
              <span>🛠️</span>
              <span className="hidden sm:inline">Garantía</span>
            </Link>

            <button
              onClick={() => setCarritoAbierto(true)}
              className="relative p-1.5 sm:p-2 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 rounded-lg text-blue-400 hover:text-white transition-all active:scale-95 flex items-center justify-center shrink-0"
              aria-label="Abrir carrito"
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
      <main className="max-w-5xl mx-auto w-full px-3.5 sm:px-6 pt-4 pb-12 flex-1 space-y-4 sm:space-y-6">
        
        {/* BANNER Y BUSCADOR */}
        <section className="text-center space-y-2 pt-1 max-w-lg mx-auto w-full">
          <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
            Entrega Express 10-15 Min
          </span>

          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Streaming Premium Original
          </h1>

          <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
            Perfiles privados y cuentas completas con garantía y soporte directo vía WhatsApp.
          </p>

          <div className="pt-1 w-full relative flex items-center">
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
        </section>

        {/* SELECTOR DE CATEGORÍAS */}
        <section className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center justify-start sm:justify-center gap-1.5 min-w-max px-0.5">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
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

        {/* CATÁLOGO DE PRODUCTOS (2 Columnas en móvil / 4 en PC) */}
        <section className="w-full">
          {cargando ? (
            <div className="py-16 text-center text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
              Cargando plataformas...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-12 text-center bg-[#0e0e0e] border border-white/10 rounded-2xl p-5 max-w-xs mx-auto space-y-1">
              <span className="text-2xl block">🔍</span>
              <p className="text-gray-300 text-xs font-bold">No hay plataformas disponibles</p>
              <p className="text-gray-500 text-[10px]">Prueba buscando otro servicio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
              {productosFiltrados.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#0e0e0e] border border-white/[0.08] hover:border-white/20 rounded-xl overflow-hidden flex flex-col justify-between transition-all"
                >
                  {/* Imagen */}
                  <Link
                    href={`/producto/${prod.id}`}
                    className="block relative aspect-square w-full bg-[#161616] overflow-hidden"
                  >
                    {!prod.disponible && (
                      <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded">
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
                    <span className="absolute bottom-1.5 left-1.5 z-10 text-[9px] font-black uppercase tracking-wider bg-black/85 text-blue-400 px-1.5 py-0.5 rounded border border-white/10">
                      {prod.tipo}
                    </span>
                  </Link>

                  {/* Datos del producto */}
                  <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-500 block truncate font-medium">
                        {prod.suscripcion}
                      </span>
                      <Link href={`/producto/${prod.id}`}>
                        <h3 className="text-white font-bold text-xs leading-tight line-clamp-2 h-7 hover:text-blue-400 transition-colors">
                          {prod.nombre}
                        </h3>
                      </Link>
                    </div>

                    <div className="pt-1.5 border-t border-white/[0.06] space-y-2">
                      <div className="text-xs sm:text-sm font-black text-white">
                        ${prod.precio} <span className="text-[9px] text-gray-500 font-normal">MXN</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => agregarAlCarrito(prod)}
                          disabled={!prod.disponible}
                          className="bg-[#181818] hover:bg-[#222222] text-gray-200 border border-white/10 py-1.5 text-[10px] font-bold rounded-lg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          + Carro
                        </button>
                        <button
                          onClick={() => comprarProductoDirecto(prod)}
                          disabled={!prod.disponible}
                          className="bg-blue-600 hover:bg-blue-500 text-white py-1.5 text-[10px] font-black rounded-lg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm shadow-blue-600/30"
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

      {/* FOOTER LIMPIO SIN ACCESO DE ADMIN */}
      <footer className="border-t border-white/[0.08] bg-[#070707] py-6 px-3.5 text-gray-400">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-white/[0.05]">
            <div className="space-y-1">
              <span className="font-black text-white text-xs uppercase tracking-wider">
                VIBRAND<span className="text-blue-500">STREAM</span>
              </span>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Suscripciones digitales y streaming garantizado con soporte y entrega vía WhatsApp.
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white block">
                Atención al Cliente
              </span>
              <div className="flex flex-col space-y-1">
                <Link href="/reportar-problema" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>🛠️</span> Centro de Garantías y Reportes
                </Link>
                <button
                  onClick={() => setModalSpeiAbierto(true)}
                  className="text-gray-400 hover:text-white text-left transition-colors flex items-center gap-1.5"
                >
                  <span>💳</span> Información de Cuenta SPEI
                </button>
              </div>
            </div>

            <div className="bg-[#101010] border border-white/5 p-2.5 rounded-xl space-y-0.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Método de Pago
              </span>
              <p className="text-white font-semibold">Transferencia SPEI (Nu México)</p>
              <p className="text-[10px] text-gray-500">Aceptamos transferencias desde cualquier banco.</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-600">
            © 2026 VibrandStream. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* MODAL SPEI */}
      {modalSpeiAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-[#101010] border border-white/10 rounded-2xl p-4 space-y-3 relative shadow-2xl">
            <button
              onClick={() => setModalSpeiAbierto(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white text-xs p-1"
            >
              ✕
            </button>
            <div className="text-center space-y-0.5">
              <span className="text-[9px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 inline-block">
                Pago Seguro
              </span>
              <h3 className="text-sm font-black text-white uppercase">Datos de Transferencia</h3>
            </div>

            <div className="bg-[#161616] border border-white/5 p-3 rounded-xl space-y-1.5 text-[11px] font-mono">
              <div>
                <span className="text-[9px] text-gray-500 block font-sans font-bold uppercase">Banco:</span>
                <span className="text-white font-bold">Nu México</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block font-sans font-bold uppercase">Beneficiario:</span>
                <span className="text-gray-300 text-[10px]">{titularNu}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block font-sans font-bold uppercase">CLABE Interbancaria:</span>
                <div className="flex items-center justify-between gap-1 mt-1 bg-black/40 p-2 rounded-lg border border-white/10">
                  <span className="text-blue-400 font-bold select-all tracking-wider text-[10px]">{clabeNu}</span>
                  <button
                    onClick={copiarClabe}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded font-sans font-bold transition-colors"
                  >
                    {clabeCopiada ? "Listo" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={enviarComprobanteWhatsApp}
              className="w-full py-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase text-[10px] rounded-lg tracking-wider transition-colors shadow-md shadow-green-600/20"
            >
              📲 Enviar Comprobante por WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* DRAWER CARRITO */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs sm:max-w-sm bg-[#0d0d0d] border-l border-white/10 h-full flex flex-col justify-between p-4 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <h3 className="font-black text-white text-xs uppercase flex items-center gap-1.5">
                  <span>🛒</span> Tu Carrito
                </h3>
                <button
                  onClick={() => setCarritoAbierto(false)}
                  className="text-gray-500 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              </div>

              {carrito.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">El carrito está vacío.</div>
              ) : (
                <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                  {carrito.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#141414] border border-white/5 p-2 rounded-lg flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="text-white font-bold text-xs truncate">{item.nombre}</h4>
                        <span className="text-[10px] text-gray-400 block">{item.tipo}</span>
                        <span className="text-[11px] text-blue-400 font-black mt-0.5 block">
                          ${item.precio * item.cantidad} MXN
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center border border-white/10 rounded overflow-hidden bg-black/40">
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                            className="px-1.5 py-0.5 text-xs text-gray-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-1 text-xs font-bold text-white">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            className="px-1.5 py-0.5 text-xs text-gray-400 hover:text-white"
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
                  <span className="text-gray-400 uppercase font-bold">Total:</span>
                  <span className="text-base font-black text-white">${totalCalculado} MXN</span>
                </div>
                <button
                  onClick={enviarPedidoCompletoWhatsApp}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[11px] rounded-lg tracking-wider transition-colors shadow-md shadow-blue-600/30 active:scale-95"
                >
                  Finalizar Pedido vía WhatsApp
                </button>
                <button
                  onClick={vaciarCarrito}
                  className="w-full py-1 text-[9px] text-gray-500 hover:text-gray-300 text-center transition-colors"
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