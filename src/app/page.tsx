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
    const mensaje = `👋 ¡Hola VibrandStream! Acabo de realizar una transferencia vía SPEI a tu cuenta Nu México.\nAdjunto comprobante de pago.`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const comprarProductoDirecto = (prod: Producto) => {
    const mensaje = `👋 ¡Hola! Me interesa adquirir:\n📺 *Plataforma:* ${prod.nombre}\n🏷️ *Modalidad:* ${prod.tipo}\n⏱️ *Duración:* ${prod.suscripcion}\n💰 *Precio:* $${prod.precio} MXN\n\n¿Me confirmas datos para pagar por SPEI?`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const enviarPedidoCompletoWhatsApp = () => {
    if (carrito.length === 0) return;
    let mensaje = `👋 ¡Hola VibrandStream! Quiero realizar este pedido:\n\n`;
    carrito.forEach((item, i) => {
      mensaje += `${i + 1}. *${item.nombre}* (${item.tipo} - ${item.suscripcion})\n   Cant: ${item.cantidad} | Subtotal: $${item.precio * item.cantidad} MXN\n`;
    });
    mensaje += `\n💰 *TOTAL: $${totalCalculado} MXN*\n💳 Pago por SPEI Nu México.`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between w-full overflow-x-hidden">
      
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#080808]/95 border-b border-[#222] px-3 py-2.5 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-6 w-6 object-contain rounded"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <span className="font-black text-sm tracking-wider uppercase text-white">
              VIBRAND<span className="text-blue-500">STREAM</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setModalSpeiAbierto(true)}
              className="bg-[#181818] hover:bg-[#252525] text-gray-200 border border-[#333] px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <span>💳</span>
              <span>SPEI</span>
            </button>

            <Link
              href="/reportar-problema"
              className="bg-[#181818] hover:bg-[#252525] text-gray-200 border border-[#333] px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <span>🛠️</span>
              <span className="hidden sm:inline">Soporte</span>
            </Link>

            <button
              onClick={() => setCarritoAbierto(true)}
              className="relative bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 p-1.5 rounded-lg transition-colors flex items-center justify-center shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {carrito.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {carrito.reduce((acc, i) => acc + i.cantidad, 0)}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto w-full px-3 py-4 flex-1 space-y-4">
        
        {/* TITULAR Y BUSCADOR */}
        <section className="text-center space-y-2 pt-2">
          <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest bg-blue-950 text-blue-400 border border-blue-800/60 px-2.5 py-0.5 rounded-full">
            Entrega express 10-15 min
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Streaming Premium Original
          </h1>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Perfiles privados y cuentas completas garantizadas con atención por WhatsApp.
          </p>

          <div className="pt-1 max-w-md mx-auto relative flex items-center">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar Netflix, Spotify, Disney+..."
              className="w-full bg-[#111] border border-[#2a2a2a] text-white text-xs rounded-xl pl-8 pr-8 py-2.5 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute left-2.5 text-xs text-gray-500">🔍</span>
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-2.5 text-gray-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* BOTONES DE CATEGORÍAS */}
        <section className="overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 min-w-max px-0.5">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  categoriaSeleccionada === cat
                    ? "bg-blue-600 text-white"
                    : "bg-[#141414] text-gray-400 border border-[#222] hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* GRILLA DE PRODUCTOS */}
        <section>
          {cargando ? (
            <div className="py-16 text-center text-gray-500 text-xs font-mono animate-pulse">
              Cargando plataformas...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-10 text-center bg-[#101010] border border-[#222] rounded-xl p-4 max-w-xs mx-auto">
              <span className="text-xl block mb-1">🔍</span>
              <p className="text-gray-300 text-xs font-bold">No hay plataformas disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {productosFiltrados.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#0f0f0f] border border-[#222] rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <Link href={`/producto/${prod.id}`} className="block relative aspect-square w-full bg-[#181818] overflow-hidden">
                    {!prod.disponible && (
                      <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wider rounded">
                          Agotado
                        </span>
                      </div>
                    )}
                    <img
                      src={prod.imagenUrl}
                      alt={prod.nombre}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1.5 left-1.5 z-10 text-[9px] font-black uppercase tracking-wider bg-black/80 text-blue-400 px-1.5 py-0.5 rounded border border-[#333]">
                      {prod.tipo}
                    </span>
                  </Link>

                  <div className="p-2.5 flex flex-col justify-between flex-1 gap-2">
                    <div>
                      <span className="text-[10px] text-gray-500 block truncate font-medium">
                        {prod.suscripcion}
                      </span>
                      <Link href={`/producto/${prod.id}`}>
                        <h3 className="text-white font-bold text-xs line-clamp-1 hover:text-blue-400 transition-colors">
                          {prod.nombre}
                        </h3>
                      </Link>
                    </div>

                    <div className="pt-1.5 border-t border-[#1c1c1c] space-y-2">
                      <div className="text-sm font-black text-white">
                        ${prod.precio} <span className="text-[9px] text-gray-500 font-normal">MXN</span>
                      </div>

                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => agregarAlCarrito(prod)}
                          disabled={!prod.disponible}
                          className="bg-[#181818] hover:bg-[#252525] text-gray-200 border border-[#333] py-1 text-[10px] font-bold rounded transition-colors disabled:opacity-30"
                        >
                          + Carro
                        </button>
                        <button
                          onClick={() => comprarProductoDirecto(prod)}
                          disabled={!prod.disponible}
                          className="bg-blue-600 hover:bg-blue-500 text-white py-1 text-[10px] font-black rounded transition-colors disabled:opacity-30"
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

      {/* FOOTER */}
      <footer className="border-t border-[#1f1f1f] bg-[#0a0a0a] py-6 px-3 text-gray-400 mt-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-[#1c1c1c]">
            <div className="space-y-1">
              <span className="font-black text-white text-xs uppercase tracking-wider">
                VIBRAND<span className="text-blue-500">STREAM</span>
              </span>
              <p className="text-[11px] text-gray-500">
                Cuentas de streaming originales y garantizadas con soporte vía WhatsApp.
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <span className="text-[10px] font-bold uppercase text-white block">
                Enlaces Rápidos
              </span>
              <div className="flex flex-col space-y-1">
                <Link href="/reportar-problema" className="text-gray-400 hover:text-white transition-colors">
                  🛠️ Garantías y Reportes
                </Link>
                <button onClick={() => setModalSpeiAbierto(true)} className="text-gray-400 hover:text-white text-left transition-colors">
                  💳 Cuenta de Transferencia SPEI
                </button>
              </div>
            </div>

            <div className="bg-[#121212] border border-[#222] p-2.5 rounded-xl space-y-0.5 text-xs">
              <span className="text-[10px] font-bold uppercase text-blue-400 block">
                Pago SPEI Oficial
              </span>
              <p className="text-white font-semibold">Nu México</p>
              <p className="text-[10px] text-gray-500">Acreditación directa desde cualquier banco.</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-600">
            <span>© 2026 VibrandStream. Todos los derechos reservados.</span>
            <Link href="/admin" className="hover:text-gray-400 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* MODAL SPEI */}
      {modalSpeiAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-[#111] border border-[#2a2a2a] rounded-2xl p-4 space-y-3 relative shadow-2xl">
            <button onClick={() => setModalSpeiAbierto(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white text-xs">
              ✕
            </button>
            <div className="text-center">
              <h3 className="text-sm font-black text-white uppercase">Datos de Transferencia</h3>
              <p className="text-[11px] text-gray-400">Paga desde la app de tu banco</p>
            </div>

            <div className="bg-[#181818] border border-[#222] p-3 rounded-xl space-y-1.5 text-[11px] font-mono">
              <div>
                <span className="text-[9px] text-gray-500 block font-sans">Banco:</span>
                <span className="text-white font-bold">Nu México</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block font-sans">Beneficiario:</span>
                <span className="text-gray-300">{titularNu}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block font-sans">CLABE Interbancaria:</span>
                <div className="flex items-center justify-between gap-1 mt-1 bg-black/40 p-2 rounded border border-[#333]">
                  <span className="text-blue-400 font-bold select-all">{clabeNu}</span>
                  <button onClick={copiarClabe} className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded font-sans font-bold">
                    {clabeCopiada ? "Listo" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={enviarComprobanteWhatsApp}
              className="w-full py-2 bg-[#25D366] text-white font-black uppercase text-[10px] rounded-lg tracking-wider"
            >
              📲 Enviar Comprobante por WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* DRAWER CARRITO */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-[#0d0d0d] border-l border-[#222] h-full flex flex-col justify-between p-4 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-[#222] pb-3 mb-3">
                <h3 className="font-black text-white text-xs uppercase">🛒 Tu Carrito</h3>
                <button onClick={() => setCarritoAbierto(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
              </div>

              {carrito.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">El carrito está vacío.</div>
              ) : (
                <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                  {carrito.map((item) => (
                    <div key={item.id} className="bg-[#141414] border border-[#222] p-2 rounded-lg flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-white font-bold text-xs truncate">{item.nombre}</h4>
                        <span className="text-[10px] text-gray-400 block">{item.tipo}</span>
                        <span className="text-[11px] text-blue-400 font-black mt-0.5 block">${item.precio * item.cantidad} MXN</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center border border-[#333] rounded bg-black/40">
                          <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} className="px-1.5 py-0.5 text-xs text-gray-400">-</button>
                          <span className="px-1 text-xs font-bold text-white">{item.cantidad}</span>
                          <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} className="px-1.5 py-0.5 text-xs text-gray-400">+</button>
                        </div>
                        <button onClick={() => eliminarDelCarrito(item.id)} className="text-gray-500 hover:text-red-400 p-0.5 text-xs">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div className="border-t border-[#222] pt-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 uppercase font-bold">Total:</span>
                  <span className="text-base font-black text-white">${totalCalculado} MXN</span>
                </div>
                <button
                  onClick={enviarPedidoCompletoWhatsApp}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[11px] rounded-lg tracking-wider"
                >
                  Finalizar Pedido vía WhatsApp
                </button>
                <button onClick={vaciarCarrito} className="w-full py-1 text-[9px] text-gray-500 text-center">
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