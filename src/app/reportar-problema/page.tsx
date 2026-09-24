"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Producto {
  id: string;
  nombre: string;
  tipo: string;
  suscripcion: string;
}

export default function ReportarProblemaPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Campos
  const [plataformaSeleccionada, setPlataformaSeleccionada] = useState("");
  const [tipoSeleccionado, setTipoSeleccionado] = useState("");
  const [duracionSeleccionada, setDuracionSeleccionada] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errorValidacion, setErrorValidacion] = useState("");

  const numeroWhatsApp = "529141384914";

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productos"));
        const lista: Producto[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          lista.push({
            id: docSnap.id,
            nombre: data.nombre || "",
            tipo: data.tipo || "",
            suscripcion: data.suscripcion || "",
          });
        });
        setProductos(lista);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      } finally {
        setCargando(false);
      }
    };
    cargarProductos();
  }, []);

  const plataformasUnicas = useMemo(() => {
    const nombres = productos.map((p) => p.nombre.trim());
    return Array.from(new Set(nombres)).sort();
  }, [productos]);

  const tiposDisponibles = useMemo(() => {
    if (!plataformaSeleccionada) return [];
    const tipos = productos
      .filter((p) => p.nombre.trim() === plataformaSeleccionada)
      .map((p) => p.tipo.trim());
    return Array.from(new Set(tipos)).sort();
  }, [productos, plataformaSeleccionada]);

  const duracionesDisponibles = useMemo(() => {
    if (!plataformaSeleccionada || !tipoSeleccionado) return [];
    const duraciones = productos
      .filter(
        (p) =>
          p.nombre.trim() === plataformaSeleccionada &&
          p.tipo.trim() === tipoSeleccionado
      )
      .map((p) => p.suscripcion.trim());
    return Array.from(new Set(duraciones)).sort();
  }, [productos, plataformaSeleccionada, tipoSeleccionado]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion("");

    if (descripcion.trim().length < 15) {
      setErrorValidacion("La descripción debe tener al menos 15 caracteres.");
      return;
    }

    if (!plataformaSeleccionada || !tipoSeleccionado || !duracionSeleccionada || !correo || !password || !fechaCompra) {
      setErrorValidacion("Por favor completa todos los campos requeridos.");
      return;
    }

    setEnviando(true);
    try {
      // 1. Guardar en Firestore para historial del Admin
      await addDoc(collection(db, "reportes"), {
        plataforma: plataformaSeleccionada,
        tipo: tipoSeleccionado,
        duracion: duracionSeleccionada,
        correo: correo.trim(),
        password: password.trim(),
        fechaCompra,
        descripcion: descripcion.trim(),
        estado: "Pendiente",
        fechaRegistro: new Date()
      });

      // 2. Armar mensaje de WhatsApp
      const mensaje = `🛠️ *REPORTE DE SOPORTE TÉCNICO*
━━━━━━━━━━━━━━━━━━━
📺 *Servicio:* ${plataformaSeleccionada}
🏷️ *Tipo:* ${tipoSeleccionado}
⏱️ *Duración:* ${duracionSeleccionada}
📅 *Fecha de compra:* ${fechaCompra}

🔐 *DATOS DE LA CUENTA:*
📧 *Correo:* ${correo}
🔑 *Contraseña:* ${password}

📝 *DETALLE DEL PROBLEMA:*
${descripcion}
━━━━━━━━━━━━━━━━━━━
⚠️ _Reporte registrado en sistema para validación de garantía (Tiempo estimado de solución: 1 a 3 días hábiles)._`;

      window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");

      // Reset
      setCorreo("");
      setPassword("");
      setDescripcion("");
      alert("Tu reporte ha sido registrado en el sistema y se abrirá WhatsApp para que envíes el folio a soporte.");
    } catch (err) {
      console.error(err);
      alert("Hubo un error al registrar el reporte en la base de datos.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-blue-500/30">
      <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white tracking-widest uppercase hover:text-blue-400 transition-colors">
            VibrandStream
          </Link>
          <Link href="/" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">
            ← Volver a la Tienda
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="text-center mb-8">
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-blue-400 uppercase mb-2 block">
            Atención al Cliente
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Reportar un Problema
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
            ¿Tu cuenta presenta alguna falla o corte de servicio? Completa este formulario para registrar tu ticket y validar tu garantía.
          </p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mb-8 backdrop-blur-sm">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>🛡️</span> Términos y Proceso de Solución
          </h2>
          <ul className="space-y-1.5 text-xs text-gray-400 list-disc list-inside">
            <li><strong className="text-gray-200">Tiempo de solución estimado:</strong> 1 a 3 días hábiles.</li>
            <li>Ingresa los datos exactos que se te proporcionaron en la compra.</li>
            <li>El reporte queda registrado formalmente en nuestro panel administrativo.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 sm:p-8 space-y-5">
          {cargando ? (
            <div className="py-12 text-center text-gray-500 animate-pulse text-xs">
              Cargando plataformas registradas...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    1. Plataforma *
                  </label>
                  <select
                    value={plataformaSeleccionada}
                    onChange={(e) => {
                      setPlataformaSeleccionada(e.target.value);
                      setTipoSeleccionado("");
                      setDuracionSeleccionada("");
                    }}
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecciona plataforma...</option>
                    {plataformasUnicas.map((nom) => (
                      <option key={nom} value={nom}>
                        {nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    2. Tipo de Cuenta *
                  </label>
                  <select
                    value={tipoSeleccionado}
                    onChange={(e) => {
                      setTipoSeleccionado(e.target.value);
                      setDuracionSeleccionada("");
                    }}
                    disabled={!plataformaSeleccionada}
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
                  >
                    <option value="">Selecciona tipo...</option>
                    {tiposDisponibles.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    3. Duración *
                  </label>
                  <select
                    value={duracionSeleccionada}
                    onChange={(e) => setDuracionSeleccionada(e.target.value)}
                    disabled={!tipoSeleccionado}
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-40"
                  >
                    <option value="">Selecciona duración...</option>
                    {duracionesDisponibles.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-3 border-t border-white/5">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Correo de la cuenta *
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Contraseña de la cuenta *
                  </label>
                  <input
                    type="text"
                    placeholder="Contraseña proporcionada"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Fecha de compra *
                </label>
                <input
                  type="date"
                  value={fechaCompra}
                  onChange={(e) => setFechaCompra(e.target.value)}
                  required
                  className="w-full md:w-1/2 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>

              <div className="pt-3 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                    Descripción del problema *
                  </label>
                  <span className={`text-[10px] ${descripcion.length >= 15 ? "text-green-400" : "text-gray-500"}`}>
                    {descripcion.length}/15 caracteres mín.
                  </span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Explica qué sucede con la cuenta (ej. La cuenta dice contraseña incorrecta)..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full bg-[#121212] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {errorValidacion && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                  ⚠️ {errorValidacion}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {enviando ? "Registrando en Sistema..." : "Registrar Reporte y Notificar por WhatsApp"}
              </button>
            </>
          )}
        </form>
      </main>
    </div>
  );
}