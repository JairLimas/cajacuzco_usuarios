import { useState, useEffect } from "react";
import { Landmark, CheckCircle } from "lucide-react";
import { supabase } from "../supabase";

export default function Prestamos() {
  const [monto, setMonto] = useState("");
  const [plazo, setPlazo] = useState("12");
  const [resultado, setResultado] = useState(null);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);

  const [solicitud, setSolicitud] = useState({
    nombre: "",
    dni: "",
    motivo: "",
    monto_sol: "",
    plazo_sol: "12",
  });

  useEffect(() => {
    const obtenerUsuario = async () => {
      const uid = localStorage.getItem("usuario_id");
      if (!uid) return;

      const { data } = await supabase
        .from("usuarios")
        .select("id, nombre, dni")
        .eq("id", uid)
        .single();

      if (data) {
        setUsuarioId(data.id);
        setSolicitud(prev => ({ ...prev, nombre: data.nombre, dni: data.dni }));
      }
    };
    obtenerUsuario();
  }, []);

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
    if (!solicitud.nombre || !solicitud.dni || !solicitud.monto_sol) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    setCargando(true);
    setError("");

    const { error: err } = await supabase.from("prestamos").insert({
      usuario_id: usuarioId,
      nombre: solicitud.nombre,
      dni: solicitud.dni,
      monto: parseFloat(solicitud.monto_sol),
      plazo: parseInt(solicitud.plazo_sol),
      motivo: solicitud.motivo,
      estado: "pendiente",
    });

    setCargando(false);

    if (err) {
      setError("Error al enviar la solicitud. Intenta de nuevo.");
    } else {
      setEnviado(true);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Préstamos</h1>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Landmark size={18} className="text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Simulador de Préstamo</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Monto a solicitar (S/)</label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Ej: 5000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Plazo</label>
              <select
                value={plazo}
                onChange={(e) => setPlazo(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
                <option value="48">48 meses</option>
              </select>
            </div>
            <button
              onClick={calcular}
              className="w-full bg-purple-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-purple-700 transition"
            >
              Calcular cuota
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Resumen</h2>
          {resultado ? (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-sm text-purple-500 mb-1">Cuota mensual</p>
                <p className="text-3xl font-bold text-purple-700">S/ {resultado.cuota}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Total a pagar</p>
                  <p className="text-lg font-bold text-gray-800">S/ {resultado.total}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-1">Total intereses</p>
                  <p className="text-lg font-bold text-red-600">S/ {resultado.interes}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">Tasa referencial: 1.8% mensual</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <Landmark size={40} />
              <p className="text-sm mt-3">Ingresa un monto para simular</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Landmark size={18} className="text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">Solicitar Préstamo</h2>
        </div>

        {enviado ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-green-600">
            <CheckCircle size={48} />
            <p className="text-lg font-bold">¡Solicitud enviada!</p>
            <p className="text-sm text-gray-400">Nos comunicaremos contigo en las próximas 24 horas.</p>
            <button
              onClick={() => {
                setEnviado(false);
                setSolicitud({ nombre: "", dni: "", motivo: "", monto_sol: "", plazo_sol: "12" });
              }}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Nueva solicitud
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Nombre completo</label>
              <input
                type="text"
                value={solicitud.nombre}
                onChange={(e) => setSolicitud({ ...solicitud, nombre: e.target.value })}
                placeholder="Ej: Jair Limas"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">DNI</label>
              <input
                type="text"
                value={solicitud.dni}
                onChange={(e) => setSolicitud({ ...solicitud, dni: e.target.value })}
                placeholder="Ej: 12345678"
                maxLength={8}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Monto a solicitar (S/)</label>
              <input
                type="number"
                value={solicitud.monto_sol}
                onChange={(e) => setSolicitud({ ...solicitud, monto_sol: e.target.value })}
                placeholder="Ej: 3000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">Plazo</label>
              <select
                value={solicitud.plazo_sol}
                onChange={(e) => setSolicitud({ ...solicitud, plazo_sol: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="36">36 meses</option>
                <option value="48">48 meses</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-500 mb-1 block">Motivo del préstamo</label>
              <textarea
                value={solicitud.motivo}
                onChange={(e) => setSolicitud({ ...solicitud, motivo: e.target.value })}
                placeholder="Ej: Compra de equipos, negocio, estudios..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
            {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
            <div className="col-span-2">
              <button
                onClick={enviarSolicitud}
                disabled={cargando}
                className="w-full bg-red-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60"
              >
                {cargando ? "Enviando..." : "Enviar solicitud"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}