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
}

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");

  // Modal de pago bancario
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false);
  const [copiadoClabe, setCopiadoClabe] = useState(false);

  const { carrito, setCarritoAbierto, agregarAlCarrito } = useCart();
  const numeroWhatsApp = "529141384914";

  // DATOS BANCARIOS OFICIALES
  const DATOS_PAGO = {
    banco: "Nu México (Nubank)",
    titular: "Gerardo Custodio",
    clabe: "638180010168068525"
  };

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const listaProductos: Producto[] = [];
        querySnapshot.forEach((docSnap) => {
          listaProductos.push({ id: docSnap.id, ...docSnap.data() } as Producto);
        });
        setProductos(listaProductos);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      } finally {
        setCargando(false);
      }
    };
    obtenerProductos();
  }, []);

  const categorias = ["Todos", "Perfil", "Completa"];

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      const coincideTexto =
        p.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        p.tipo.toLowerCase().includes(filtroTexto.toLowerCase());

      const coincideCat =
        filtroCategoria === "Todos"
          ? true
          : p.tipo.toLowerCase().includes(filtroCategoria.toLowerCase());

      return coincideTexto && coincideCat;
    });
  }, [productos, filtroTexto, filtroCategoria]);

  const comprarAhora = (producto: Producto) => {
    const mensaje = `👋 ¡Hola! Me interesa adquirir de inmediato el siguiente servicio:

📺 *Plataforma:* ${producto.nombre}
🏷️ *Modalidad:* ${producto.tipo}
⏱️ *Duración:* ${producto.suscripcion}
💰 *Total a pagar:* $${producto.precio} MXN

💳 ¿Me podrías compartir los datos bancarios (SPEI) para realizar la transferencia, por favor? ¡Gracias!`;

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
  };

  const abrirChatGeneralWhatsApp = () => {
    const msj = "¡Hola VibrandStream! Tengo una duda sobre las cuentas y disponibilidad antes de comprar.";
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(msj)}`, "_blank");
  };

  const copiarClabe = () => {
    navigator.clipboard.writeText(DATOS_PAGO.clabe);
    setCopiadoClabe(true);
    setTimeout(() => setCopiadoClabe(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30 overflow-x-hidden antialiased">
      
      {/* HEADER CON LOGO LIMPIO */}
      <header className="sticky top-0 w-full z-40 bg-[#050505]/85 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative h-8 sm:h-10 w-auto flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="VibrandStream Logo" 
                className="h-full w-auto max-w-[120px] object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              />
            </div>
            <span className="text-base sm:text-xl font-black text-white tracking-widest uppercase group-hover:text-blue-400 transition-colors">
              VIBRAND<span className="text-blue-500">STREAM</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setModalPagoAbierto(true)}
              className="text-[11px] sm:text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>💳</span>
              <span className="hidden sm:inline">Cuenta SPEI</span>
              <span className="sm:hidden">Pagar</span>
            </button>

            <Link 
              href="/reportar-problema" 
              className="text-[11px] sm:text-xs font-semibold text-gray-300 hover:text-white transition-all bg-white/[0.04] hover:bg-white/[0.08] px-3 sm:px-4 py-2 rounded-xl border border-white/10 flex items-center gap-1.5 shrink-0"
            >
              <span>🛠️</span>
              <span className="hidden sm:inline">Reportar Problema</span>
              <span className="sm:hidden">Soporte</span>
            </Link>

            <button 
              onClick={() => setCarritoAbierto(true)}
              className="relative p-2.5 sm:p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-white hover:text-blue-400 transition-all active:scale-95"
              aria-label="Carrito"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {carrito.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                  {carrito.reduce((acc, i) => acc + i.cantidad, 0)}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full pt-10 pb-12 sm:pt-20 sm:pb-20 overflow-hidden border-b border-white/[0.06]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[600px] h-[280px] sm:h-[400px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10">
          
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full mb-5 inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Entrega Digital Inmediata
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] mb-4 max-w-3xl">
            Tus plataformas de streaming, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-500">
              al mejor precio del mercado.
            </span>
          </h1>

          <p className="text-gray-400 text-xs sm:text-base max-w-xl mb-8 leading-relaxed font-normal">
            Perfiles privados y cuentas completas 100% originales con garantía y soporte directo vía WhatsApp.
          </p>

          <div className="w-full max-w-md space-y-3 mb-8">
            <div className="relative">
              <input
                type="text"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
                placeholder="Buscar servicio (ej. Netflix, Disney, Spotify)..."
                className="w-full bg-[#101010] border border-white/10 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                🔍
              </span>
              {filtroTexto && (
                <button
                  onClick={() => setFiltroTexto("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                    filtroCategoria === cat
                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30"
                      : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {cat === "Todos" ? "Todas las cuentas" : `Modo ${cat}`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-2xl pt-6 border-t border-white/[0.08]">
            <div className="flex flex-col items-center p-2 sm:p-3">
              <span className="text-base sm:text-xl mb-1">⚡</span>
              <span className="text-[11px] sm:text-xs font-bold text-white uppercase">Acceso Rápido</span>
              <span className="text-[10px] text-gray-500">10 a 15 min</span>
            </div>
            <div className="flex flex-col items-center p-2 sm:p-3">
              <span className="text-base sm:text-xl mb-1">🛡️</span>
              <span className="text-[11px] sm:text-xs font-bold text-white uppercase">Garantía Total</span>
              <span className="text-[10px] text-gray-500">Reemplazo directo</span>
            </div>
            <div className="flex flex-col items-center p-2 sm:p-3">
              <span className="text-base sm:text-xl mb-1">💬</span>
              <span className="text-[11px] sm:text-xs font-bold text-white uppercase">Soporte Directo</span>
              <span className="text-[10px] text-gray-500">Atención WhatsApp</span>
            </div>
          </div>

        </div>
      </section>

      {/* CATÁLOGO ALINEADO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-6 sm:mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-wider">
              Plataformas Disponibles
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
              Haz clic en el producto para ver especificaciones y dispositivos.
            </p>
          </div>
          <span className="text-[11px] font-mono text-gray-500 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5 shrink-0">
            {productosFiltrados.length} disponibles
          </span>
        </div>

        {cargando ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">
              Cargando catálogo...
            </span>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-20 text-center bg-[#090909] border border-white/5 rounded-3xl p-6">
            <span className="text-3xl block mb-2">🔎</span>
            <p className="text-gray-400 text-sm font-semibold">No encontramos servicios con ese criterio.</p>
            <button
              onClick={() => { setFiltroTexto(""); setFiltroCategoria("Todos"); }}
              className="mt-3 text-xs text-blue-400 hover:underline"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="group relative flex flex-col bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/10"
              >
                <Link
                  href={`/producto/${producto.id}`}
                  className="block relative aspect-square w-full bg-[#121212] overflow-hidden"
                >
                  {!producto.disponible && (
                    <div className="absolute inset-0 bg-black/75 z-10 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="bg-red-600/90 text-white text-[9px] sm:text-[11px] font-black px-2.5 py-1 uppercase tracking-widest rounded-md shadow-lg">
                        Agotado
                      </span>
                    </div>
                  )}
                  <img
                    src={producto.imagenUrl}
                    alt={producto.nombre}
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      !producto.disponible ? "grayscale opacity-40" : ""
                    }`}
                    loading="lazy"
                  />
                  <span className="absolute bottom-2 left-2 z-10 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-black/80 backdrop-blur-md text-blue-400 px-2 py-0.5 rounded border border-white/10">
                    {producto.tipo}
                  </span>
                </Link>

                <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-gray-500 font-medium block mb-1">
                      {producto.suscripcion}
                    </span>

                    <Link href={`/producto/${producto.id}`}>
                      <h3 className="text-white font-bold text-xs sm:text-sm leading-snug line-clamp-2 h-8 sm:h-10 group-hover:text-blue-400 transition-colors">
                        {producto.nombre}
                      </h3>
                    </Link>
                  </div>

                  <div className="space-y-2.5 pt-1 border-t border-white/[0.05]">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs sm:text-sm text-gray-400 font-normal">Precio:</span>
                      <span className="text-sm sm:text-lg font-black text-white">
                        ${producto.precio}{" "}
                        <span className="text-[10px] text-gray-500 font-normal">MXN</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <button
                        onClick={() => agregarAlCarrito(producto)}
                        disabled={!producto.disponible}
                        className={`w-full py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                          producto.disponible
                            ? "bg-white/[0.04] hover:bg-white/[0.1] text-white active:scale-95 border border-white/10"
                            : "bg-transparent text-gray-700 cursor-not-allowed border border-white/5"
                        }`}
                      >
                        + Carrito
                      </button>
                      <button
                        onClick={() => comprarAhora(producto)}
                        disabled={!producto.disponible}
                        className={`w-full py-2 sm:py-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-xl transition-all ${
                          producto.disponible
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
      </main>

      {/* FOOTER (SIN ENLACES AL ADMIN) */}
      <footer className="border-t border-white/[0.08] bg-[#030303] pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-6 w-auto flex items-center">
                <img 
                  src="/logo.png" 
                  alt="VibrandStream" 
                  className="h-full w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-base font-black text-white tracking-widest uppercase">
                VibrandStream
              </span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs">
              Entretenimiento y suscripciones digitales garantizadas con activación prioritaria vía WhatsApp.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Garantía y Ayuda
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>
                <Link href="/reportar-problema" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>🛠️</span> Formulario de Reportes
                </Link>
              </li>
              <li>
                <button
                  onClick={() => setModalPagoAbierto(true)}
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                >
                  <span>💳</span> Datos de Transferencia (SPEI)
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Método de Pago
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              Transferencia interbancaria (SPEI). <br />
              <span className="text-gray-300 font-medium">Transfiere desde cualquier banco o billetera digital</span> (BBVA, Banorte, Santander, Mercado Pago, Spin, etc.) hacia nuestra cuenta Nu México.
            </p>
            <div className="flex items-center gap-3 bg-white/[0.03] p-3 rounded-2xl w-fit border border-white/10">
              <div className="h-6 w-auto flex items-center bg-white px-2 py-1 rounded">
                <img 
                  src="https://nubank.com.mx/images/seo/nu-icon.png?v=2" 
                  alt="SPEI" 
                  className="h-full object-contain" 
                />
              </div>
              <div className="text-[11px] leading-tight">
                <span className="text-white font-bold block">SPEI 24/7</span>
                <span className="text-purple-400 font-medium text-[10px]">Banco destino: Nu México</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs text-gray-600">
          <p>&copy; {new Date().getFullYear()} VibrandStream. Todos los derechos reservados.</p>
          <p className="text-[10px] text-gray-700">Diseñado con interfaz Mobile-First optimizada.</p>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE PERSISTENTE DE WHATSAPP */}
      <button
        onClick={abrirChatGeneralWhatsApp}
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-5 right-5 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 sm:p-4 rounded-full shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
          ¿Dudas? Escríbenos
        </span>
      </button>

      {/* MODAL CON DATOS SPEI */}
      {modalPagoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setModalPagoAbierto(false)} 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
          />

          <div className="relative w-full max-w-md bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 sm:p-8 text-gray-200 z-10 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                  Transferencia SPEI Oficial
                </h3>
              </div>
              <button
                onClick={() => setModalPagoAbierto(false)}
                className="text-gray-500 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Transfiere desde cualquier banco o billetera digital vía SPEI. Tras hacer tu transferencia, envía tu comprobante por WhatsApp para recibir tu acceso de inmediato.
            </p>

            <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                  Transferencia Interbancaria (SPEI)
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded font-bold border border-purple-500/30">
                  Banco destino: {DATOS_PAGO.banco}
                </span>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-[11px] text-gray-300">
                💡 <strong className="text-white">Aceptamos transferencias desde cualquier banco:</strong> BBVA, Santander, Citibanamex, Banorte, Banco Azteca, Hey Banco, Mercado Pago, Spin OXXO, etc.
              </div>
              
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Titular de la cuenta:</span>
                <span className="text-sm font-bold text-white block">{DATOS_PAGO.titular}</span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 block mb-1.5">CLABE Interbancaria (18 dígitos):</span>
                <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white">
                  <span className="tracking-wider">{DATOS_PAGO.clabe}</span>
                  <button
                    onClick={copiarClabe}
                    className="ml-2 text-[10px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors shadow"
                  >
                    {copiadoClabe ? "✓ Copiado" : "Copiar CLABE"}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setModalPagoAbierto(false);
                window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent("Hola Gerardo, acabo de realizar mi transferencia SPEI a tu cuenta Nu. Aquí te adjunto mi comprobante:")}`, "_blank");
              }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-blue-600/30"
            >
              Ya transferí, enviar comprobante a WhatsApp
            </button>

          </div>
        </div>
      )}

    </div>
  );
}