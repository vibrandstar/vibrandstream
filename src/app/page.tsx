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
    totalCarrito,
    vaciarCarrito,
  } = useCart();

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
      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.tipo.toLowerCase().includes(busqueda.toLowerCase()) ||
        producto.suscripcion.toLowerCase().includes(busqueda.toLowerCase());

      const coincideCategoria =
        categoriaSeleccionada === "Todos" ||
        (categoriaSeleccionada === "Perfil" && producto.tipo.toLowerCase().includes("perfil")) ||
        (categoriaSeleccionada === "Completa" && producto.tipo.toLowerCase().includes("completa")) ||
        (categoriaSeleccionada === "Música" &&
          (producto.nombre.toLowerCase().includes("spotify") ||
            producto.nombre.toLowerCase().includes("apple music") ||
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
    mensaje += `💰 *TOTAL A PAGAR: $${totalCarrito} MXN*\n`;
    mensaje += `💳 *Método de pago:* Transferencia SPEI (Nu México)\n\n`;
    mensaje += `¿Me confirmas disponibilidad para realizar la transferencia ahora mismo?`;

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30 overflow-x-hidden w-full max-w-full relative antialiased">
      
      {/* Orbes de iluminación sutiles de fondo blindados contra desborde */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] sm:h-[450px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[280px] sm:w-[600px] h-[280px] sm:h-[350px] bg-blue-600/10 rounded-full blur-[100px] sm:blur-[140px]" />
      </div>

      {/* HEADER / BARRA DE NAVEGACIÓN */}
      <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.08] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          <Link href="/" className="flex items-center gap-2 shrink-0">
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
            <span className="text-sm sm:text-base font-black text-white tracking-widest uppercase">
              VIBRAND<span className="text-blue-500">STREAM</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setModalSpeiAbierto(true)}
              className="text-[11px] sm:text-xs font-bold bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white px-2.5 sm:px-3 py-2 rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <span>💳</span>
              <span className="hidden xs:inline sm:inline">Cuenta</span>
              <span>SPEI</span>
            </button>

            <button
              onClick={() => setCarritoAbierto(true)}
              className="relative p-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white hover:text-blue-400 transition-all active:scale-95"
              aria-label="Abrir carrito"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20 w-full relative z-10 space-y-8">
        
        {/* HERO Y BUSCADOR */}
        <section className="text-center space-y-4 max-w-2xl mx-auto w-full">
          <span className="inline-block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">
            Entrega Express en 10-15 Minutos
          </span>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight uppercase">
            Entretenimiento Premium al Mejor Precio
          </h1>

          <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
            Perfiles individuales y cuentas completas con garantía total y soporte directo por WhatsApp.
          </p>

          {/* Barra de búsqueda adaptada */}
          <div className="pt-2 w-full max-w-md mx-auto">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar Netflix, Disney+, Spotify..."
                className="w-full bg-[#101010] border border-white/10 rounded-2xl pl-11 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
              <span className="absolute left-4 text-gray-500 text-sm">🔍</span>
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3.5 text-gray-500 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </section>

        {/* FILTROS DE CATEGORÍAS (Horizontal con scroll limpio para móvil) */}
        <section className="w-full overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max px-1 mx-auto">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  categoriaSeleccionada === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* GRILLA DE PRODUCTOS RESPONSIVE (2 columnas en móvil, 3 en tablet, 4 en desktop) */}
        <section className="w-full">
          {cargando ? (
            <div className="py-20 text-center text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
              Cargando catálogo oficial...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="py-16 text-center bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 max-w-md mx-auto">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-gray-300 text-sm font-bold">No se encontraron plataformas</p>
              <p className="text-gray-500 text-xs mt-1">Prueba con otra búsqueda o selecciona "Todos".</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 w-full">
              {productosFiltrados.map((prod) => (
                <div
                  key={prod.id}
                  className="group relative flex flex-col bg-[#0a0a0a] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10 w-full"
                >
                  {/* Imagen y enlace a detalle */}
                  <Link
                    href={`/producto/${prod.id}`}
                    className="block relative aspect-square w-full bg-[#121212] overflow-hidden"
                  >
                    {!prod.disponible && (
                      <div className="absolute inset-0 bg-black/75 z-10 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 uppercase tracking-widest rounded-md">
                          Agotado
                        </span>
                      </div>
                    )}
                    <img
                      src={prod.imagenUrl}
                      alt={prod.nombre}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        !prod.disponible ? "grayscale opacity-40" : ""
                      }`}
                      loading="lazy"
                    />
                    <span className="absolute bottom-2 left-2 z-10 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-blue-400 px-2 py-0.5 rounded-lg border border-white/10">
                      {prod.tipo}
                    </span>
                  </Link>

                  {/* Información */}
                  <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-gray-500 block mb-1 font-medium">
                        {prod.suscripcion}
                      </span>
                      <Link href={`/producto/${prod.id}`}>
                        <h3 className="text-white font-extrabold text-xs sm:text-sm leading-snug line-clamp-2 h-9 group-hover:text-blue-400 transition-colors">
                          {prod.nombre}
                        </h3>
                      </Link>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-white/[0.05]">
                      <div className="text-sm sm:text-base font-black text-white">
                        ${prod.precio} <span className="text-[10px] text-gray-500 font-normal">MXN</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        <button
                          onClick={() => agregarAlCarrito(prod)}
                          disabled={!prod.disponible}
                          className={`w-full py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                            prod.disponible
                              ? "bg-white/[0.04] hover:bg-white/[0.1] text-white border border-white/10 active:scale-95"
                              : "bg-transparent text-gray-700 cursor-not-allowed border border-white/5"
                          }`}
                        >
                          + Carrito
                        </button>
                        <button
                          onClick={() => comprarProductoDirecto(prod)}
                          disabled={!prod.disponible}
                          className={`w-full py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                            prod.disponible
                              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 active:scale-95"
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

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#070707] py-8 w-full relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-black text-white text-xs sm:text-sm tracking-widest uppercase">
              VIBRAND<span className="text-blue-500">STREAM</span>
            </span>
            <p className="text-[11px] text-gray-500 mt-1">
              Todos los derechos reservados. Pagos protegidos vía transferencia bancaria SPEI.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/reportar-problema" className="text-gray-400 hover:text-white transition-colors">
              🛠️ Garantías y Reportes
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-400 transition-colors text-[11px]">
              🔒 Acceso Admin
            </Link>
          </div>
        </div>
      </footer>

      {/* MODAL SPEI DE NU MÉXICO (100% Responsive) */}
      {modalSpeiAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setModalSpeiAbierto(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 text-sm"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 inline-block mb-2">
                Pago Único y Seguro
              </span>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Transferencia SPEI
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Realiza tu pago desde la app de cualquier banco mexicano
              </p>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">Banco Destino:</span>
                <span className="text-white font-bold">Nu México Financiera</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">Beneficiario / Titular:</span>
                <span className="text-gray-300 text-[11px]">{titularNu}</span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 block uppercase font-sans font-bold">CLABE Interbancaria (18 dígitos):</span>
                <div className="flex items-center justify-between gap-2 mt-1 bg-black/40 p-2.5 rounded-xl border border-white/10">
                  <span className="text-blue-400 font-bold select-all tracking-wider">{clabeNu}</span>
                  <button
                    onClick={copiarClabe}
                    className="text-[10px] font-sans font-bold bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded-md transition-colors shrink-0"
                  >
                    {clabeCopiada ? "✓ Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={enviarComprobanteWhatsApp}
                className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
              >
                <span>📲</span> Enviar Comprobante por WhatsApp
              </button>
              <button
                onClick={() => setModalSpeiAbierto(false)}
                className="w-full py-2.5 bg-white/5 text-gray-400 hover:text-white text-xs font-bold rounded-xl transition-colors"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER DEL CARRITO DE COMPRAS */}
      {carritoAbierto && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full flex flex-col justify-between p-5 sm:p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛒</span>
                  <h3 className="font-black text-white text-base uppercase tracking-wider">Tu Carrito</h3>
                </div>
                <button
                  onClick={() => setCarritoAbierto(false)}
                  className="text-gray-500 hover:text-white text-sm p-1"
                >
                  ✕
                </button>
              </div>

              {carrito.length === 0 ? (
                <div className="py-16 text-center text-gray-500 text-xs">
                  Tu carrito está vacío. Agrega tus servicios preferidos.
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {carrito.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#121212] border border-white/5 rounded-2xl p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h4 className="text-white font-bold text-xs truncate">{item.nombre}</h4>
                        <span className="text-[10px] text-gray-400 block">{item.tipo} • {item.suscripcion}</span>
                        <span className="text-xs text-blue-400 font-black mt-1 block">
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
                          <span className="px-2 text-xs font-bold text-white">{item.cantidad}</span>
                          <button
                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                            className="px-2 py-1 text-xs text-gray-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="text-gray-500 hover:text-red-400 p-1 text-xs"
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
              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Total:</span>
                  <span className="text-xl font-black text-white">${totalCarrito} MXN</span>
                </div>

                <button
                  onClick={enviarPedidoCompletoWhatsApp}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95"
                >
                  Finalizar Pedido vía WhatsApp
                </button>
                <button
                  onClick={vaciarCarrito}
                  className="w-full py-1 text-[11px] text-gray-500 hover:text-gray-300 text-center transition-colors"
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