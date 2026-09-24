"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";

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

interface Reporte {
  id: string;
  plataforma: string;
  tipo: string;
  duracion: string;
  correo: string;
  password: string;
  fechaCompra: string;
  descripcion: string;
  estado: string;
  fechaRegistro?: any;
}

export default function AdminPage() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [authCargando, setAuthCargando] = useState(true);

  // Tabs de navegación interna del Admin
  const [pestanaActiva, setPestanaActiva] = useState<"catalogo" | "reportes" | "entregas">("catalogo");

  // Login
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [loginProcesando, setLoginProcesando] = useState(false);

  // Catálogo
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [busquedaAdmin, setBusquedaAdmin] = useState("");

  // Modo Edición In-situ
  const [productoEditandoId, setProductoEditandoId] = useState<string | null>(null);

  // Campos Formulario Producto
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [tipo, setTipo] = useState("Perfil");
  const [suscripcion, setSuscripcion] = useState("1 mes");
  const [perfiles, setPerfiles] = useState(1);
  const [dispositivos, setDispositivos] = useState(1);
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");

  // Reportes
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargandoReportes, setCargandoReportes] = useState(false);

  // Generador de Entregas
  const [entregaServicio, setEntregaServicio] = useState("");
  const [entregaCorreo, setEntregaCorreo] = useState("");
  const [entregaPass, setEntregaPass] = useState("");
  const [entregaPerfil, setEntregaPerfil] = useState("Perfil 1");
  const [entregaPin, setEntregaPin] = useState("Sin PIN");
  const [entregaTelefono, setEntregaTelefono] = useState("");
  const [mensajeEntregaCopiado, setMensajeEntregaCopiado] = useState(false);

  // Cloudinary
  const CLOUD_NAME = "tu_cloud_name";
  const UPLOAD_PRESET = "tu_upload_preset";

  const plataformasSugeridas = [
    "Netflix Premium",
    "Disney+ Premium",
    "Paramount+ Premium",
    "HBO Max Platino",
    "Prime Video C/A",
    "Universal+ Premium",
    "ViX Premium",
    "Crunchyroll Mega Fan",
    "Spotify Premium",
    "Viki Rakuten Pass Plus",
    "Apple TV+",
    "CapCut Pro",
    "Canva Pro",
  ];

  // Escuchar estado de sesión de Firebase de forma segura
  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setAuthCargando(false);
      // Únicamente si el usuario está autenticado por Firebase se descargan los datos
      if (user) {
        cargarProductos();
        cargarReportes();
      } else {
        // Limpiar datos en memoria si la sesión no es válida
        setProductos([]);
        setReportes([]);
      }
    });
    return () => desuscribir();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin("");
    setLoginProcesando(true);
    try {
      await signInWithEmailAndPassword(auth, emailLogin.trim(), passwordLogin);
    } catch (err: any) {
      console.error(err);
      setErrorLogin("Acceso denegado: Correo o contraseña no válidos.");
    } finally {
      setLoginProcesando(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const querySnapshot = await getDocs(collection(db, "productos"));
      const lista: Producto[] = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() } as Producto);
      });
      setProductos(lista);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const cargarReportes = async () => {
    setCargandoReportes(true);
    try {
      const querySnapshot = await getDocs(collection(db, "reportes"));
      const lista: Reporte[] = [];
      querySnapshot.forEach((docSnap) => {
        lista.push({ id: docSnap.id, ...docSnap.data() } as Reporte);
      });
      setReportes(lista);
    } catch (error) {
      console.error(error);
    } finally {
      setCargandoReportes(false);
    }
  };

  const iniciarEdicion = (prod: Producto) => {
    setProductoEditandoId(prod.id);
    setNombre(prod.nombre);
    setPrecio(String(prod.precio));
    setTipo(prod.tipo);
    setSuscripcion(prod.suscripcion);
    setPerfiles(prod.perfiles || 1);
    setDispositivos(prod.dispositivos || 1);
    setDescripcion(prod.descripcion);
    setImagenUrl(prod.imagenUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setProductoEditandoId(null);
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setImagenUrl("");
  };

  const handleCambioTipo = (nuevoTipo: string) => {
    setTipo(nuevoTipo);
    if (nuevoTipo.toLowerCase().includes("perfil")) {
      setPerfiles(1);
      setDispositivos(1);
    } else if (nuevoTipo.toLowerCase().includes("completa")) {
      setPerfiles(5);
      setDispositivos(4);
    }
  };

  const generarPlantillaDescripcion = () => {
    if (tipo.toLowerCase().includes("perfil")) {
      const texto = `📱 ${dispositivos} dispositivo(s)
⚠️ No modificar datos
🚫 No compartir la cuenta
🚫 No cambiar de perfil
🔒 No activar PIN
🛡️ Garantía de 25 días

La garantía no aplica si modificas los datos de la cuenta.

⚡ Acceso en 10-15 minutos después de confirmar el pago.
💳 Método de pago disponible: Transferencia bancaria (SPEI).`;
      setDescripcion(texto);
    } else {
      const texto = `👥 ${perfiles} perfiles asignados
📱 ${dispositivos} dispositivos simultáneos
🔒 Cuenta completa y privada
🛡️ Garantía durante el periodo contratado (${suscripcion})

⚡ Acceso en 10-15 minutos después de confirmar el pago.
💳 Método de pago disponible: Transferencia bancaria (SPEI).`;
      setDescripcion(texto);
    }
  };

  const handleSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (CLOUD_NAME === "tu_cloud_name" || UPLOAD_PRESET === "tu_upload_preset") {
      alert("Por favor coloca tu CLOUD_NAME y UPLOAD_PRESET de Cloudinary.");
      return;
    }

    setSubiendoImagen(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setImagenUrl(data.secure_url);
      } else {
        alert("Error al subir a Cloudinary. Verifica que el preset sea Unsigned.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al contactar Cloudinary.");
    } finally {
      setSubiendoImagen(false);
    }
  };

  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    if (!nombre || !precio || !imagenUrl) {
      alert("Por favor completa los campos principales (Nombre, Precio, Imagen).");
      return;
    }

    setGuardando(true);
    try {
      if (productoEditandoId) {
        const docRef = doc(db, "productos", productoEditandoId);
        await updateDoc(docRef, {
          nombre: nombre.trim(),
          precio: Number(precio),
          tipo,
          suscripcion,
          perfiles: Number(perfiles),
          dispositivos: Number(dispositivos),
          descripcion,
          imagenUrl: imagenUrl.trim(),
        });
        alert("¡Producto actualizado exitosamente!");
        cancelarEdicion();
      } else {
        await addDoc(collection(db, "productos"), {
          nombre: nombre.trim(),
          precio: Number(precio),
          tipo,
          suscripcion,
          perfiles: Number(perfiles),
          dispositivos: Number(dispositivos),
          descripcion,
          imagenUrl: imagenUrl.trim(),
          disponible: true,
          fechaCreacion: new Date(),
        });
        alert("¡Producto publicado en el catálogo!");
        cancelarEdicion();
      }
      await cargarProductos();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto.");
    } finally {
      setGuardando(false);
    }
  };

  const alternarDisponibilidad = async (producto: Producto) => {
    if (!usuario) return;
    try {
      const docRef = doc(db, "productos", producto.id);
      await updateDoc(docRef, { disponible: !producto.disponible });
      setProductos((prev) =>
        prev.map((p) => (p.id === producto.id ? { ...p, disponible: !p.disponible } : p))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const eliminarProducto = async (id: string) => {
    if (!usuario) return;
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    try {
      await deleteDoc(doc(db, "productos", id));
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const cambiarEstadoReporte = async (reporteId: string, nuevoEstado: string) => {
    if (!usuario) return;
    try {
      const docRef = doc(db, "reportes", reporteId);
      await updateDoc(docRef, { estado: nuevoEstado });
      setReportes((prev) =>
        prev.map((r) => (r.id === reporteId ? { ...r, estado: nuevoEstado } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarReporte = async (id: string) => {
    if (!usuario) return;
    if (!confirm("¿Eliminar este ticket de reporte?")) return;
    try {
      await deleteDoc(doc(db, "reportes", id));
      setReportes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const textoPlantillaEntrega = useMemo(() => {
    return `🎉 *¡GRACIAS POR TU COMPRA EN VIBRANDSTREAM!*
Aquí tienes los datos de acceso para tu cuenta:

📺 *Servicio:* ${entregaServicio || "Servicio Streaming"}
📧 *Correo:* ${entregaCorreo}
🔑 *Contraseña:* ${entregaPass}
👤 *Perfil asignado:* ${entregaPerfil}
🔒 *PIN de perfil:* ${entregaPin}

⚠️ *REGLAS Y GARANTÍA:*
• No cambiar contraseña ni correo.
• No crear ni modificar otros perfiles.
• Usar únicamente en 1 dispositivo a la vez.
• Tu garantía está respaldada durante el periodo contratado.

Cualquier duda o soporte, cuentas con nosotros. ¡Disfruta tu entretenimiento! 🍿`;
  }, [entregaServicio, entregaCorreo, entregaPass, entregaPerfil, entregaPin]);

  const copiarEntrega = () => {
    navigator.clipboard.writeText(textoPlantillaEntrega);
    setMensajeEntregaCopiado(true);
    setTimeout(() => setMensajeEntregaCopiado(false), 2000);
  };

  const enviarEntregaWhatsApp = () => {
    const tel = entregaTelefono.replace(/\D/g, "");
    if (!tel) {
      alert("Por favor ingresa el número de WhatsApp del cliente (10 dígitos).");
      return;
    }
    const numFinal = tel.startsWith("52") ? tel : `52${tel}`;
    window.open(`https://wa.me/${numFinal}?text=${encodeURIComponent(textoPlantillaEntrega)}`, "_blank");
  };

  const productosFiltradosAdmin = useMemo(() => {
    if (!busquedaAdmin.trim()) return productos;
    return productos.filter((p) =>
      p.nombre.toLowerCase().includes(busquedaAdmin.toLowerCase()) ||
      p.tipo.toLowerCase().includes(busquedaAdmin.toLowerCase())
    );
  }, [productos, busquedaAdmin]);

  // PANTALLA CARGANDO ESTADO DE SESIÓN
  if (authCargando) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
        Verificando credenciales de seguridad...
      </div>
    );
  }

  // 🔒 BLOQUEO TOTAL: SI NO HAY SESIÓN ACTIVA, MOSTRAR EXCLUSIVAMENTE EL LOGIN
  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <span className="text-[10px] tracking-[0.25em] font-extrabold text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 inline-block mb-3">
              Panel Protegido
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase">
              Acceso Restringido
            </h1>
            <p className="text-gray-500 text-xs mt-2">
              Se requiere autenticación administrativa para gestionar la base de datos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={passwordLogin}
                onChange={(e) => setPasswordLogin(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {errorLogin && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl">
                ⚠️ {errorLogin}
              </div>
            )}

            <button
              type="submit"
              disabled={loginProcesando}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              {loginProcesando ? "Verificando..." : "Ingresar"}
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              ← Volver a la Tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ USUARIO AUTENTICADO: ACCESO COMPLETO AL PANEL
  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans pb-24">
      <header className="sticky top-0 z-30 bg-[#050505]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-white tracking-widest text-sm uppercase">
              VibrandStream <span className="text-blue-400 text-xs font-normal">Panel</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg border border-white/10 transition-colors"
            >
              Ver Tienda
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg border border-red-500/20 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Pestañas de Navegación */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
          <button
            onClick={() => setPestanaActiva("catalogo")}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shrink-0 ${
              pestanaActiva === "catalogo"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white"
            }`}
          >
            📦 Catálogo ({productos.length})
          </button>
          <button
            onClick={() => { setPestanaActiva("reportes"); cargarReportes(); }}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-2 ${
              pestanaActiva === "reportes"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white"
            }`}
          >
            <span>🛠️ Historial Reportes</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {reportes.filter((r) => r.estado === "Pendiente").length}
            </span>
          </button>
          <button
            onClick={() => setPestanaActiva("entregas")}
            className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shrink-0 ${
              pestanaActiva === "entregas"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                : "bg-white/[0.03] text-gray-400 hover:text-white"
            }`}
          >
            ⚡ Plantilla de Entrega
          </button>
        </div>

        {/* PESTAÑA 1: CATÁLOGO */}
        {pestanaActiva === "catalogo" && (
          <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl">
              <div className="border-b border-white/10 pb-4 mb-6 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>{productoEditandoId ? "✏️" : "⚡"}</span>
                  <span>{productoEditandoId ? "Modificar Producto Existente" : "Agregar Nuevo Servicio"}</span>
                </h2>
                {productoEditandoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>

              <form onSubmit={handleGuardarProducto} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Plataforma / Nombre *
                    </label>
                    <input
                      type="text"
                      list="plataformas-list"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Netflix Premium"
                      required
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <datalist id="plataformas-list">
                      {plataformasSugeridas.map((item) => (
                        <option key={item} value={item} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Precio (MXN) *
                    </label>
                    <input
                      type="number"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      placeholder="Ej. 100"
                      required
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Modalidad / Tipo *
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => handleCambioTipo(e.target.value)}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Perfil">Perfil</option>
                      <option value="Perfil individual">Perfil individual</option>
                      <option value="Completa">Completa</option>
                      <option value="Cuenta completa">Cuenta completa</option>
                      <option value="Cuenta individual">Cuenta individual</option>
                      <option value="Invitación a equipo">Invitación a equipo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Duración *
                    </label>
                    <input
                      type="text"
                      value={suscripcion}
                      onChange={(e) => setSuscripcion(e.target.value)}
                      placeholder="1 mes, 2 meses..."
                      required
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Cantidad de Perfiles
                    </label>
                    <input
                      type="number"
                      value={perfiles}
                      onChange={(e) => setPerfiles(Number(e.target.value))}
                      min={1}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Dispositivos Permitidos
                    </label>
                    <input
                      type="number"
                      value={dispositivos}
                      onChange={(e) => setDispositivos(Number(e.target.value))}
                      min={1}
                      className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
                  <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                    Imagen del Producto *
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div>
                      <span className="block text-[10px] uppercase text-gray-500 mb-1">
                        Opción A: Subir desde Celular o PC
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSubirArchivo}
                        disabled={subiendoImagen}
                        className="block w-full text-xs text-gray-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer cursor-pointer bg-[#181818] p-1.5 rounded-xl border border-white/10"
                      />
                      {subiendoImagen && (
                        <span className="text-xs text-blue-400 block mt-1 animate-pulse">
                          Subiendo a Cloudinary...
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase text-gray-500 mb-1">
                        Opción B: Pegar Enlace Directo
                      </span>
                      <input
                        type="url"
                        value={imagenUrl}
                        onChange={(e) => setImagenUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {imagenUrl && (
                    <div className="flex items-center gap-3 pt-2">
                      <img
                        src={imagenUrl}
                        alt="Preview"
                        className="w-12 h-12 rounded-xl object-cover border border-white/20"
                      />
                      <span className="text-xs text-emerald-400 font-semibold">
                        ✓ Imagen asignada correctamente
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                      Reglas de Garantía y Descripción
                    </label>
                    <button
                      type="button"
                      onClick={generarPlantillaDescripcion}
                      className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-xl font-bold transition-colors w-fit"
                    >
                      ✨ Autocompletar Plantilla
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Reglas, dispositivos, garantías..."
                    className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={guardando || subiendoImagen}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold uppercase tracking-widest text-xs rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                  >
                    {guardando
                      ? "Guardando cambios..."
                      : productoEditandoId
                      ? "✓ Guardar Modificaciones"
                      : "+ Publicar Producto"}
                  </button>
                  {productoEditandoId && (
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      className="px-6 py-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold uppercase tracking-wider text-xs rounded-xl border border-white/10"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Inventario en Catálogo ({productosFiltradosAdmin.length})
                </h3>
                <input
                  type="text"
                  placeholder="Buscar en inventario..."
                  value={busquedaAdmin}
                  onChange={(e) => setBusquedaAdmin(e.target.value)}
                  className="bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-full sm:w-64"
                />
              </div>

              {cargando ? (
                <div className="py-12 text-center text-gray-500 text-xs">Cargando inventario...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {productosFiltradosAdmin.map((prod) => (
                    <div
                      key={prod.id}
                      className={`bg-[#0a0a0a] border rounded-2xl p-4 flex gap-4 items-center justify-between transition-colors ${
                        productoEditandoId === prod.id ? "border-blue-500 bg-blue-950/20" : "border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.imagenUrl}
                          alt={prod.nombre}
                          className="w-16 h-16 rounded-xl object-cover bg-gray-900 border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-white font-bold text-sm truncate">{prod.nombre}</h4>
                          <p className="text-[11px] text-gray-400">
                            {prod.tipo} • {prod.suscripcion}
                          </p>
                          <p className="text-xs font-black text-blue-400 mt-0.5">
                            ${prod.precio} MXN
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => iniciarEdicion(prod)}
                          className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => alternarDisponibilidad(prod)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${
                            prod.disponible
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {prod.disponible ? "Activo" : "Agotado"}
                        </button>
                        <button
                          onClick={() => eliminarProducto(prod.id)}
                          className="text-[10px] font-bold uppercase tracking-wider bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: REPORTES */}
        {pestanaActiva === "reportes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                  Tickets de Soporte Registrados
                </h2>
                <p className="text-xs text-gray-500">
                  Reportes enviados por clientes desde /reportar-problema
                </p>
              </div>
              <button
                onClick={cargarReportes}
                className="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-xl border border-white/10"
              >
                ↻ Actualizar
              </button>
            </div>

            {cargandoReportes ? (
              <div className="text-center py-16 text-gray-500 text-xs animate-pulse font-mono">
                Cargando historial de reportes...
              </div>
            ) : reportes.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                <span className="text-3xl block mb-2">🎉</span>
                <p className="text-gray-400 text-sm font-semibold">No hay tickets de reporte pendientes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reportes.map((rep) => (
                  <div
                    key={rep.id}
                    className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                      <div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                          {rep.plataforma} ({rep.tipo} - {rep.duracion})
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Comprado el: {rep.fechaCompra}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={rep.estado || "Pendiente"}
                          onChange={(e) => cambiarEstadoReporte(rep.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
                            rep.estado === "Resuelto"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : rep.estado === "En Proceso"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Resuelto">Resuelto</option>
                        </select>
                        <button
                          onClick={() => eliminarReporte(rep.id)}
                          className="text-xs text-gray-500 hover:text-red-400 p-1"
                          title="Eliminar ticket"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#121212] p-3 rounded-xl text-xs font-mono">
                      <div>
                        <span className="text-gray-500 block text-[10px]">Correo:</span>
                        <span className="text-white select-all">{rep.correo}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[10px]">Contraseña:</span>
                        <span className="text-white select-all">{rep.password}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                        Falla descrita por el cliente:
                      </span>
                      <p className="text-xs text-gray-300 bg-white/[0.02] p-3 rounded-xl border border-white/5 leading-relaxed">
                        {rep.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: GENERADOR DE ENTREGAS */}
        {pestanaActiva === "entregas" && (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                ⚡ Generador y Copiador Rápido de Entregas
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Escribe los accesos que le vas a dar al cliente y genera el mensaje oficial formateado en 5 segundos.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Servicio / Plataforma
                </label>
                <input
                  type="text"
                  placeholder="Ej. Netflix Premium Perfil 1 Mes"
                  value={entregaServicio}
                  onChange={(e) => setEntregaServicio(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                  WhatsApp del Cliente (10 dígitos)
                </label>
                <input
                  type="text"
                  placeholder="Ej. 9931234567"
                  value={entregaTelefono}
                  onChange={(e) => setEntregaTelefono(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Correo de la cuenta
                </label>
                <input
                  type="email"
                  placeholder="cuenta@correo.com"
                  value={entregaCorreo}
                  onChange={(e) => setEntregaCorreo(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Contraseña de la cuenta
                </label>
                <input
                  type="text"
                  placeholder="Clave123*"
                  value={entregaPass}
                  onChange={(e) => setEntregaPass(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Perfil Asignado
                </label>
                <input
                  type="text"
                  placeholder="Perfil 1, Perfil 2..."
                  value={entregaPerfil}
                  onChange={(e) => setEntregaPerfil(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
                  PIN de Perfil (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="1234 o Sin PIN"
                  value={entregaPin}
                  onChange={(e) => setEntregaPin(e.target.value)}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Vista Previa del Mensaje para el Cliente:
              </span>
              <pre className="bg-[#121212] border border-white/10 rounded-2xl p-4 text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                {textoPlantillaEntrega}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={copiarEntrega}
                className="w-full py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wider text-xs rounded-xl border border-white/10 transition-colors"
              >
                {mensajeEntregaCopiado ? "✓ Mensaje Copiado al Portapapeles" : "📋 Copiar Texto Completo"}
              </button>
              <button
                type="button"
                onClick={enviarEntregaWhatsApp}
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg shadow-green-600/20"
              >
                📲 Enviar Directo al WhatsApp del Cliente
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}