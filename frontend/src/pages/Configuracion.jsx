import { User, Lock, Bell, Shield, ChevronRight, Pencil, Check, X, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Configuracion() {
  const [notif, setNotif] = useState({ transferencias: true, pagos: true, promociones: false });
  const [datos, setDatos] = useState({ nombre: "", dni: "", email: "", telefono: "" });
  const [editando, setEditando] = useState(null);
  const [valorTemp, setValorTemp] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);

  const [modalClave, setModalClave] = useState(false);
  const [claveActual, setClaveActual] = useState("");
  const [claveNueva, setClaveNueva] = useState("");
  const [claveConfirmar, setClaveConfirmar] = useState("");
  const [verClaveActual, setVerClaveActual] = useState(false);
  const [verClaveNueva, setVerClaveNueva] = useState(false);
  const [verClaveConfirmar, setVerClaveConfirmar] = useState(false);
  const [errorClave, setErrorClave] = useState("");
  const [exitoClave, setExitoClave] = useState(false);
  const [guardandoClave, setGuardandoClave] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      const uid = localStorage.getItem("usuario_id");
      if (!uid) return;

      const { data, error } = await supabase
        .from("usuarios")
        .select("id, nombre, dni, email, telefono")
        .eq("id", uid)
        .single();

      if (error) { console.error("Error:", error); return; }

      if (data) {
        setUsuarioId(data.id);
        setDatos({
          nombre:   data.nombre   ?? "",
          dni:      data.dni      ?? "",
          email:    data.email    ?? "",
          telefono: data.telefono ?? "",
        });
      }
    };
    cargarUsuario();
  }, []);

  const iniciarEdicion = (campo, valorActual) => {
    setEditando(campo);
    setValorTemp(valorActual);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setValorTemp("");
  };

  const guardarCambio = async (campo) => {
    if (!valorTemp.trim()) return;
    setGuardando(true);

    const { error } = await supabase
      .from("usuarios")
      .update({ [campo]: valorTemp.trim() })
      .eq("id", usuarioId);

    if (!error) {
      setDatos((prev) => ({ ...prev, [campo]: valorTemp.trim() }));
      if (campo === "nombre") {
        localStorage.setItem("usuario_nombre", valorTemp.trim());
      }
      setEditando(null);
      setValorTemp("");
    } else {
      console.error("Error guardando:", error);
      alert("Error al guardar el cambio. Intenta nuevamente.");
    }
    setGuardando(false);
  };

  const abrirModalClave = () => {
    setClaveActual("");
    setClaveNueva("");
    setClaveConfirmar("");
    setErrorClave("");
    setExitoClave(false);
    setModalClave(true);
  };

  const cerrarModalClave = () => {
    setModalClave(false);
    setErrorClave("");
    setExitoClave(false);
  };

  const handleCambiarClave = async () => {
    setErrorClave("");

    if (!claveActual || !claveNueva || !claveConfirmar) {
      setErrorClave("Completa todos los campos.");
      return;
    }
    if (claveNueva.length !== 6 || !/^\d{6}$/.test(claveNueva)) {
      setErrorClave("La nueva clave debe tener exactamente 6 dígitos.");
      return;
    }
    if (claveNueva !== claveConfirmar) {
      setErrorClave("La nueva clave y la confirmación no coinciden.");
      return;
    }
    if (claveNueva === claveActual) {
      setErrorClave("La nueva clave no puede ser igual a la actual.");
      return;
    }

    setGuardandoClave(true);

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("clave")
      .eq("id", usuarioId)
      .single();

    if (error || !usuario) {
      setErrorClave("Error al verificar la clave. Intenta nuevamente.");
      setGuardandoClave(false);
      return;
    }

    if (usuario.clave !== claveActual) {
      setErrorClave("La clave actual es incorrecta.");
      setGuardandoClave(false);
      return;
    }

    const { error: errorUpdate } = await supabase
      .from("usuarios")
      .update({ clave: claveNueva })
      .eq("id", usuarioId);

    if (errorUpdate) {
      setErrorClave("Error al actualizar la clave. Intenta nuevamente.");
      setGuardandoClave(false);
      return;
    }

    setGuardandoClave(false);
    setExitoClave(true);

    setTimeout(() => {
      cerrarModalClave();
    }, 2000);
  };

  const campos = [
    { key: "nombre",   label: "Nombre completo",   tipo: "text"  },
    { key: "dni",      label: "DNI",                tipo: "text"  },
    { key: "email",    label: "Correo electrónico", tipo: "email" },
    { key: "telefono", label: "Teléfono",            tipo: "tel"   },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h1>

      <div className="max-w-2xl space-y-5">

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <User size={20} className="text-red-600" />
            <h2 className="text-lg font-bold text-gray-800">Datos personales</h2>
          </div>
          <div className="space-y-4">
            {campos.map(({ key, label, tipo }) => (
              <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1 mr-4">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  {editando === key ? (
                    <input
                      type={tipo}
                      value={valorTemp}
                      onChange={(e) => setValorTemp(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") guardarCambio(key);
                        if (e.key === "Escape") cancelarEdicion();
                      }}
                      autoFocus
                      className="border border-red-400 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-red-200 w-full"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">{datos[key] || "—"}</p>
                  )}
                </div>

                {editando === key ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => guardarCambio(key)}
                      disabled={guardando}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      <Check size={13} />
                      {guardando ? "..." : "Guardar"}
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    >
                      <X size={13} /> Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => iniciarEdicion(key, datos[key])}
                    className="flex items-center gap-1 text-red-600 text-xs font-semibold hover:underline"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Lock size={20} className="text-red-600" />
            <h2 className="text-lg font-bold text-gray-800">Seguridad</h2>
          </div>
          <div className="space-y-2">
            <button
              onClick={abrirModalClave}
              className="w-full flex justify-between items-center py-3 border-b border-gray-100 hover:text-red-600 transition"
            >
              <span className="text-sm text-gray-700">Cambiar clave de acceso</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Bell size={20} className="text-red-600" />
            <h2 className="text-lg font-bold text-gray-800">Notificaciones</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: "transferencias", label: "Transferencias realizadas" },
              { key: "pagos",          label: "Pagos de servicios"        },
              { key: "promociones",    label: "Promociones y ofertas"     },
            ].map(({ key, label }) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  onClick={() => setNotif((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${notif[key] ? "bg-red-600" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${notif[key] ? "left-6" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={20} className="text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">Sesión segura</h2>
          </div>
          <p className="text-sm text-gray-500">Tu conexión está protegida con cifrado SSL de 256 bits.</p>
        </div>

      </div>

      {modalClave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock size={18} className="text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Cambiar clave de acceso</h2>
              </div>
              <button onClick={cerrarModalClave} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            {exitoClave ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <p className="text-lg font-bold text-gray-800 mb-1">¡Clave actualizada!</p>
                <p className="text-sm text-gray-500">Tu clave de acceso fue cambiada correctamente.</p>
              </div>
            ) : (
              <>
                {errorClave && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                    {errorClave}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Clave actual
                    </label>
                    <div className="flex items-center border rounded-xl px-3 py-3 focus-within:border-red-500">
                      <Lock size={16} className="text-gray-400 mr-2 shrink-0" />
                      <input
                        type={verClaveActual ? "text" : "password"}
                        value={claveActual}
                        onChange={(e) => setClaveActual(e.target.value)}
                        placeholder="••••••"
                        maxLength={6}
                        className="w-full outline-none text-sm"
                      />
                      <button onClick={() => setVerClaveActual(!verClaveActual)} className="text-gray-400 hover:text-gray-600 ml-2">
                        {verClaveActual ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Nueva clave <span className="text-gray-400 font-normal">(6 dígitos)</span>
                    </label>
                    <div className="flex items-center border rounded-xl px-3 py-3 focus-within:border-red-500">
                      <Lock size={16} className="text-gray-400 mr-2 shrink-0" />
                      <input
                        type={verClaveNueva ? "text" : "password"}
                        value={claveNueva}
                        onChange={(e) => setClaveNueva(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        maxLength={6}
                        className="w-full outline-none text-sm"
                      />
                      <button onClick={() => setVerClaveNueva(!verClaveNueva)} className="text-gray-400 hover:text-gray-600 ml-2">
                        {verClaveNueva ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                      Confirmar nueva clave
                    </label>
                    <div className="flex items-center border rounded-xl px-3 py-3 focus-within:border-red-500">
                      <Lock size={16} className="text-gray-400 mr-2 shrink-0" />
                      <input
                        type={verClaveConfirmar ? "text" : "password"}
                        value={claveConfirmar}
                        onChange={(e) => setClaveConfirmar(e.target.value.replace(/\D/g, ""))}
                        placeholder="••••••"
                        maxLength={6}
                        className="w-full outline-none text-sm"
                      />
                      <button onClick={() => setVerClaveConfirmar(!verClaveConfirmar)} className="text-gray-400 hover:text-gray-600 ml-2">
                        {verClaveConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cerrarModalClave}
                    className="flex-1 border border-gray-300 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCambiarClave}
                    disabled={guardandoClave}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold transition disabled:opacity-50"
                  >
                    {guardandoClave ? "Guardando..." : "Cambiar clave"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}