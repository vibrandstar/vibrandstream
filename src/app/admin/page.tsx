"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

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

export default function AdminPage() {
  // Autenticación
  const [usuario, setUsuario] = useState<User | null>(null);
  const [authCargando, setAuthCargando] = useState(true);
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [procesandoLogin, setProcesandoLogin] = useState(false);

  // Catálogo
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState<number | "">("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("Perfil privado");
  const [categoria, setCategoria] = useState("Perfil");
  const [suscripcion, setSuscripcion] = useState("1 mes");
  const [imagenUrl, setImagenUrl] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [destacado, setDestacado] = useState(false);

  // Procesamiento de imagen
  const [procesandoImagen, setProcesandoImagen] = useState(false);

  const categoriasDisponibles = ["Perfil", "Completa", "Música", "Herramientas"];

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, (userActual) => {
      setUsuario(userActual);
      setAuthCargando(false);
      if (userActual) {
        cargarProductos();
      }
    });
    return () => desuscribir();
  }, []);

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLogin("");
    setProcesandoLogin(true);
    try {
      await signInWithEmailAndPassword(auth, emailLogin.trim(), passwordLogin);
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err);
      setErrorLogin("Correo o contraseña incorrectos.");
    } finally {
      setProcesandoLogin(false);
    }
  };

  const cerrarSesion = async () => {
    await signOut(auth);
    setProductos([]);
  };

  const cargarProductos = async () => {
    try {
      setCargando(true);
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

  // Procesa y comprime cualquier foto de la galería directamente
  const handleSeleccionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcesandoImagen(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Genera imagen optimizada y ligera
        const dataUrl = canvas.toDataURL("image/webp", 0.85);
        setImagenUrl(dataUrl);
        setProcesandoImagen(false);
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre("");
    setPrecio("");
    setDescripcion("");
    setTipo("Perfil privado");
    setCategoria("Perfil");
    setSuscripcion("1 mes");
    setImagenUrl("");
    setDisponible(true);
    setDestacado(false);
  };

  const prepararEdicion = (prod: Producto) => {
    setEditandoId(prod.id);
    setNombre(prod.nombre);
    setPrecio(prod.precio);
    setDescripcion(prod.descripcion || "");
    setTipo(prod.tipo || "Perfil privado");
    setCategoria(prod.categoria || "Perfil");
    setSuscripcion(prod.suscripcion || "1 mes");
    setImagenUrl(prod.imagenUrl || "");
    setDisponible(prod.disponible ?? true);
    setDestacado(prod.destacado ?? false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || precio === "" || !imagenUrl) {
      alert("Por favor completa nombre, precio y selecciona una imagen.");
      return;
    }

    try {
      setGuardando(true);
      const dataProducto = {
        nombre: nombre.trim(),
        precio: Number(precio),
        descripcion: descripcion.trim(),
        tipo: tipo.trim(),
        categoria,
        suscripcion: suscripcion.trim(),
        imagenUrl,
        disponible,
        destacado,
      };

      if (editandoId) {
        await updateDoc(doc(db, "productos", editandoId), dataProducto);
        alert("Producto actualizado con éxito");
      } else {
        await addDoc(collection(db, "productos"), dataProducto);
        alert("Producto registrado correctamente");
      }

      limpiarFormulario();
      cargarProductos();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert("Hubo un error al guardar el producto.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProducto = async (id: string, nombreProd: string) => {
    if (!confirm(`¿Seguro que deseas eliminar "${nombreProd}"?`)) return;
    try {
      await deleteDoc(doc(db, "productos", id));
      setProductos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar.");
    }
  };

  const toggleDestacadoRapido = async (prod: Producto) => {
    try {
      const nuevoEstado = !prod.destacado;
      await updateDoc(doc(db, "productos", prod.id), { destacado: nuevoEstado });
      setProductos((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, destacado: nuevoEstado } : p))
      );
    } catch (error) {
      console.error("Error actualizando destacado:", error);
    }
  };

  if (authCargando) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center p-4">
        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest animate-pulse">
          Verificando credenciales...
        </p>
      </div>
    );
  }

  // PANTALLA DE ACCESO RESTRINGIDO
  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#101010] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
          <div className="text-center space-y-1.5">
            <span className="text-3xl block">🔒</span>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              Acceso Administrativo
            </h1>
            <p className="text-xs text-gray-400">
              Ingresa tu correo y contraseña autorizados
            </p>
          </div>

          {errorLogin && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center">
              {errorLogin}
            </div>
          )}

          <form onSubmit={iniciarSesion} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="admin@vibrandstream.com"
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordLogin}
                onChange={(e) => setPasswordLogin(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={procesandoLogin}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs rounded-xl tracking-wider transition-all shadow-md shadow-blue-600/30 active:scale-95 disabled:opacity-50"
            >
              {procesandoLogin ? "Verificando..." : "Ingresar al Panel"}
            </button>
          </form>

          <div className="text-center pt-2">
            <a href="/" className="text-xs text-gray-500 hover:text-white transition-colors">
              ← Volver a la Tienda
            </a>
          </div>
        </div>
      </div>
    );
  }

  // PANEL PRINCIPAL
  return (
    <div className="min-h-screen bg-[#060606] text-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wider">
              Panel Administrativo
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Conectado como: <span className="text-blue-400 font-medium">{usuario.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              Tienda
            </a>
            <button
              onClick={cerrarSesion}
              className="text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-[#101010] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-xl">
          <h2 className="text-sm sm:text-base font-black uppercase text-blue-400 mb-4 tracking-wider flex items-center gap-2">
            <span>{editandoId ? "✏️ Editar Producto" : "➕ Registrar Nuevo Producto"}</span>
          </h2>

          <form onSubmit={guardarProducto} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Nombre de la Plataforma
                </label>
                <input
                  type="text"
                  placeholder="Ej: Spotify Individual, Netflix Premium..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Precio (MXN)
                </label>
                <input
                  type="number"
                  placeholder="Ej: 85"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {categoriasDisponibles.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Tipo / Modalidad
                </label>
                <input
                  type="text"
                  placeholder="Perfil privado, Cuenta completa..."
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Duración / Suscripción
                </label>
                <input
                  type="text"
                  placeholder="1 mes, 3 meses, 1 año..."
                  value={suscripcion}
                  onChange={(e) => setSuscripcion(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* FOTO DESDE GALERÍA O ENLACE */}
            <div className="bg-[#141414] border border-white/10 rounded-xl p-3.5 space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Imagen del Producto
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <span className="text-[10px] text-gray-300 block mb-1 font-semibold uppercase">
                    📷 Elegir de la Galería / Fotos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSeleccionarFoto}
                    className="w-full text-xs text-gray-300 file:mr-2.5 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer bg-[#1c1c1c] p-1.5 rounded-xl border border-white/10"
                  />
                  {procesandoImagen && (
                    <span className="text-[10px] text-blue-400 font-bold block mt-1 animate-pulse">
                      Optimizando imagen...
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 block mb-1 font-semibold uppercase">
                    O pegar URL externa (Opcional)
                  </span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imagenUrl.startsWith("data:") ? "" : imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    className="w-full bg-[#1c1c1c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Vista previa inmediata */}
              {imagenUrl && (
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <img
                    src={imagenUrl}
                    alt="Vista previa"
                    className="w-14 h-14 object-cover rounded-xl bg-black border border-blue-500/40"
                  />
                  <div>
                    <span className="text-xs text-green-400 font-bold block">
                      ✓ Foto cargada con éxito
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Lista para mostrarse en la tienda
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Descripción Adicional (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Detalles sobre garantía, renovación en tu mismo correo, etc."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* CASILLAS DISPONIBLE Y DESTACADO */}
            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={disponible}
                  onChange={(e) => setDisponible(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 bg-[#181818] border-white/20"
                />
                <span className="text-xs font-bold text-gray-200">Disponible para venta</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                <input
                  type="checkbox"
                  checked={destacado}
                  onChange={(e) => setDestacado(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 focus:ring-0 bg-[#181818] border-blue-500/30"
                />
                <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
                  ⭐ Mostrar en Destacados
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={guardando || procesandoImagen}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {guardando ? "Guardando..." : editandoId ? "Actualizar Producto" : "Registrar Producto"}
              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTA ACTUAL */}
        <div className="bg-[#101010] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm sm:text-base font-black uppercase text-white tracking-wider">
              Catálogo Registrado ({productos.length})
            </h2>
            <span className="text-xs text-gray-400">
              ⭐ {productos.filter((p) => p.destacado).length} Destacados
            </span>
          </div>

          {cargando ? (
            <p className="text-xs text-gray-500 animate-pulse py-6 text-center">
              Cargando catálogo...
            </p>
          ) : productos.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              No tienes productos registrados aún.
            </p>
          ) : (
            <div className="space-y-2.5">
              {productos.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-[#161616] border border-white/5 hover:border-white/15 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.imagenUrl}
                      alt={prod.nombre}
                      className="w-12 h-12 object-cover rounded-lg bg-black shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-white truncate">{prod.nombre}</h4>
                        {prod.destacado && (
                          <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-blue-500/30">
                            ⭐ Destacado
                          </span>
                        )}
                        {!prod.disponible && (
                          <span className="bg-red-500/20 text-red-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-red-500/30">
                            Agotado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Categoría: <span className="text-blue-400 font-bold">{prod.categoria || "Perfil"}</span> | {prod.tipo} | {prod.suscripcion}
                      </p>
                      <p className="text-xs font-black text-white mt-0.5">
                        ${prod.precio} MXN
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => toggleDestacadoRapido(prod)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-bold border transition-colors ${
                        prod.destacado
                          ? "bg-blue-600/20 text-blue-400 border-blue-500/40"
                          : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
                      }`}
                      title="Activar/Desactivar de destacados"
                    >
                      {prod.destacado ? "⭐ Quitar" : "☆ Destacar"}
                    </button>

                    <button
                      onClick={() => prepararEdicion(prod)}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => eliminarProducto(prod.id, prod.nombre)}
                      className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-500/30 transition-colors"
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
    </div>
  );
}