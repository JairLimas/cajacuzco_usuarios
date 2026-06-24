import { useState, useEffect } from "react";
import { BadgeDollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "../supabase";

export default function Creditos() {
  const [tab, setTab] = useState("solicitar");
  const [monto, setMonto] = useState("");
  const [plazo, setPlazo] = useState("12");
  const [resultado, setResultado] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [misCreditos, setMisCreditos] = useState([]);

  const [solicitud, setSolicitud] = useState({
    nombre: "",
    dni: "",
    tipo_credito: "Personal",
    monto_sol: "",
    plazo_sol: "12",
    motivo: "",
    ingresos: "",
    gastos: "",
    garantia: "",
  });

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = async () => {
    const uid = localStorage.getItem("usuario_id");
    if (!uid) return;

    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", uid)
      .single();

    if (data) {
      setUsuarioId(data.id);
      setSolicitud(prev => ({ ...prev, nombre: data.nombre, dni: data.dni }));
      cargarCreditos(data.id);
    }
  };

  const cargarCreditos = async (uid) => {
    const { data } = await supabase
      .from("creditos")
      .select("*")
      .eq("usuario_id", uid)
      .order("created_at", { ascending: false });
    setMisCreditos(data || []);
  };

  const calcular = () => {
    const capital = parseFloat(monto);
    if (!capital || capital <= 0) return;
    const tasa = 0.018;
    const n = parseInt(plazo);
    const cuota = (capital * tasa * Math.pow(1 + tasa, n)) / (Math.pow(1 + tasa, n) - 1);
    setResultado({
      cuota: cuota.toFixed(2),
      total: (cuota * n).toFixed(2),
      interes: (cuota * n - capital).toFixed(2),
    });
  };

  const enviarSolicitud = async () => {
    if (!solicitud.nombre || !solicitud.dni || !solicitud.monto_sol || !solicitud.ingresos) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    setCargando(true);
    setError("");

    const { error: err } = await supabase.from("creditos").insert({
      usuario_id: usuarioId,
      nombre: solicitud.nombre,
      dni: solicitud.dni,
      tipo_credito: solicitud.tipo_credito,
      monto: parseFloat(solicitud.monto_sol),
      plazo: parseInt(solicitud.plazo_sol),
      motivo: solicitud.motivo,
      ingresos: parseFloat(solicitud.ingresos),
      gastos: parseFloat(solicitud.gastos || 0),
      garantia: solicitud.garantia,
      estado: "pendiente",
    });

    setCargando(false);
    if (err) {
      setError("Error al enviar la solicitud.");
    } else {
      setEnviado(true);
      cargarCreditos(usuarioId);
    }
  };

  const colorEstado = (estado) => {
    if (estado === "aprobado" || estado === "desembolsado") return "bg-green-100 text-green-700";
    if (estado === "rechazado") return "bg-red-100 text-red-700";
    if (estado === "en_evaluacion" || estado === "en_comite") return "bg-orange-100 text-orange-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const iconoEstado = (estado) => {
    if (estado === "aprobado" || estado === "desembolsado") return <CheckCircle size={16} className="text-green-600" />;
    if (estado === "rechazado") return <XCircle size={16} className="text-red-600" />;
    return <Clock size={16} className="text-yellow-600" />;
  };

  const cuotaCredito = (c) => {
    const tasa = 0.018;
    const n = c.plazo;
    return ((c.monto * tasa * Math.pow(1 + tasa, n)) / (Math.pow(1 + tasa, n) - 1)).toFixed(2);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Créditos</h1>

      <div className="flex gap-2 mb-6">
        {[
          { key: "solicitar", label: "Solicitar Crédito" },
          { key: "simular", label: "Simulador" },
          { key: "miscreditos", label: "Mis Créditos" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.key
                ? "bg-red-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "simular" && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <BadgeDollarSign size={18} className="text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Simulador de Crédito</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tipo de crédito</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                  <option>Personal</option>
                  <option>Vehicular</option>
                  <option>Hipotecario</option>
                  <option>Empresarial</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Monto (S/)</label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="Ej: 10000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Plazo</label>
                <select
                  value={plazo}
                  onChange={(e) => setPlazo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                  <option value="48">48 meses</option>
                  <option value="60">60 meses</option>
                </select>
              </div>
              <button
                onClick={calcular}
                className="w-full bg-red-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-700 transition"
              >
                Simular
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Resultado</h2>
            {resultado ? (
              <div className="space-y-4">
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-red-500 mb-1">Cuota mensual</p>
                  <p className="text-4xl font-bold text-red-700">S/ {resultado.cuota}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Total a pagar</p>
                    <p className="text-lg font-bold text-gray-800">S/ {resultado.total}</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Total intereses</p>
                    <p className="text-lg font-bold text-orange-600">S/ {resultado.interes}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">Tasa referencial: 1.8% mensual</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-300">
                <BadgeDollarSign size={40} />
                <p className="text-sm mt-3">Ingresa un monto para simular</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "solicitar" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <BadgeDollarSign size={18} className="text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Nueva Solicitud de Crédito</h2>
          </div>

          {enviado ? (
            <div className="flex flex-col items-center py-10 gap-3 text-green-600">
              <CheckCircle size={48} />
              <p className="text-lg font-bold">¡Solicitud enviada!</p>
              <p className="text-sm text-gray-400">Tu solicitud está en evaluación. Te notificaremos pronto.</p>
              <button
                onClick={() => { setEnviado(false); setSolicitud(prev => ({ ...prev, monto_sol: "", motivo: "", ingresos: "", gastos: "", garantia: "" })); }}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Nueva solicitud
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre completo</label>
                <input type="text" value={solicitud.nombre}
                  onChange={(e) => setSolicitud({ ...solicitud, nombre: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">DNI</label>
                <input type="text" value={solicitud.dni}
                  onChange={(e) => setSolicitud({ ...solicitud, dni: e.target.value })}
                  maxLength={9}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tipo de crédito</label>
                <select value={solicitud.tipo_credito}
                  onChange={(e) => setSolicitud({ ...solicitud, tipo_credito: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                  <option>Personal</option>
                  <option>Vehicular</option>
                  <option>Hipotecario</option>
                  <option>Empresarial</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Monto a solicitar (S/)</label>
                <input type="number" value={solicitud.monto_sol}
                  onChange={(e) => setSolicitud({ ...solicitud, monto_sol: e.target.value })}
                  placeholder="Ej: 5000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Plazo</label>
                <select value={solicitud.plazo_sol}
                  onChange={(e) => setSolicitud({ ...solicitud, plazo_sol: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400">
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                  <option value="48">48 meses</option>
                  <option value="60">60 meses</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ingresos mensuales (S/)</label>
                <input type="number" value={solicitud.ingresos}
                  onChange={(e) => setSolicitud({ ...solicitud, ingresos: e.target.value })}
                  placeholder="Ej: 3000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Gastos mensuales (S/)</label>
                <input type="number" value={solicitud.gastos}
                  onChange={(e) => setSolicitud({ ...solicitud, gastos: e.target.value })}
                  placeholder="Ej: 1000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Garantía (opcional)</label>
                <input type="text" value={solicitud.garantia}
                  onChange={(e) => setSolicitud({ ...solicitud, garantia: e.target.value })}
                  placeholder="Ej: Inmueble, vehículo..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Motivo del crédito</label>
                <textarea value={solicitud.motivo}
                  onChange={(e) => setSolicitud({ ...solicitud, motivo: e.target.value })}
                  placeholder="Describe el motivo de tu solicitud..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
              </div>
              {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
              <div className="col-span-2">
                <button onClick={enviarSolicitud} disabled={cargando}
                  className="w-full bg-red-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50">
                  {cargando ? "Enviando..." : "Enviar solicitud"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "miscreditos" && (
        <div className="space-y-4">
          {misCreditos.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 shadow-sm flex flex-col items-center text-gray-300">
              <BadgeDollarSign size={40} />
              <p className="text-sm mt-3">No tienes créditos solicitados aún.</p>
            </div>
          ) : (
            misCreditos.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {iconoEstado(c.estado)}
                      <h3 className="font-bold text-gray-800">Crédito {c.tipo_credito}</h3>
                    </div>
                    <p className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString("es-PE")}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorEstado(c.estado)}`}>
                    {c.estado}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Monto</p>
                    <p className="font-bold text-gray-800">S/ {Number(c.monto).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Plazo</p>
                    <p className="font-bold text-gray-800">{c.plazo} meses</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Cuota mensual</p>
                    <p className="font-bold text-gray-800">S/ {cuotaCredito(c)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Total a pagar</p>
                    <p className="font-bold text-gray-800">S/ {(cuotaCredito(c) * c.plazo).toFixed(2)}</p>
                  </div>
                </div>
                {c.motivo && <p className="text-xs text-gray-400 mt-3">Motivo: {c.motivo}</p>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}