import { CreditCard, Lock, Unlock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const colores = {
  "Débito": "from-red-600 to-red-800",
  "Crédito": "from-gray-700 to-gray-900",
};

const limitesIniciales = [
  { label: "Compras en línea", usado: 320, limite: 2000 },
  { label: "Retiros cajero", usado: 400, limite: 1000 },
  { label: "Transferencias diarias", usado: 1500, limite: 5000 },
];

export default function Tarjetas() {
  const [tarjetas, setTarjetas] = useState([]);
  const [verNumero, setVerNumero] = useState({});
  const [cargandoBloqueo, setCargandoBloqueo] = useState({});
  const [limites, setLimites] = useState(limitesIniciales);

  useEffect(() => {
    const cargarTarjetas = async () => {
      const usuarioId = localStorage.getItem("usuario_id");
      const cuentaId = localStorage.getItem("cuenta_id");
      if (!usuarioId) return;

      const { data, error } = await supabase
        .from("tarjetas")
        .select("*")
        .eq("usuario_id", usuarioId)
        .eq("tipo", "Débito");

      if (error) {
        console.error("Error cargando tarjetas:", error);
        return;
      }

      const { data: cuenta } = await supabase
        .from("cuentas")
        .select("saldo")
        .eq("id", cuentaId)
        .single();

      const bloqueosGuardados = JSON.parse(
        localStorage.getItem("tarjetas_bloqueadas") || "{}"
      );

      const tarjetasConSaldo = data.map((t) => ({
        ...t,
        bloqueada: bloqueosGuardados[t.id] ?? t.bloqueada ?? false,
        saldoMostrar: cuenta?.saldo ?? 0,
      }));

      setTarjetas(tarjetasConSaldo);
    };
    cargarTarjetas();
  }, []);

  const toggle = (id) =>
    setVerNumero((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleBloqueo = async (id, estadoActual) => {
    const nuevoEstado = !estadoActual;
    setCargandoBloqueo((prev) => ({ ...prev, [id]: true }));

    const bloqueosGuardados = JSON.parse(
      localStorage.getItem("tarjetas_bloqueadas") || "{}"
    );
    bloqueosGuardados[id] = nuevoEstado;
    localStorage.setItem(
      "tarjetas_bloqueadas",
      JSON.stringify(bloqueosGuardados)
    );

    await supabase
      .from("tarjetas")
      .update({ bloqueada: nuevoEstado })
      .eq("id", id);

    setTarjetas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, bloqueada: nuevoEstado } : t))
    );

    setCargandoBloqueo((prev) => ({ ...prev, [id]: false }));
  };

  const handleLimite = (index, nuevoLimite) => {
    const nuevos = [...limites];
    nuevos[index] = { ...nuevos[index], limite: Number(nuevoLimite) };
    setLimites(nuevos);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mis Tarjetas</h1>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {tarjetas.map((t) => {
          const estaBloqueada = t.bloqueada ?? false;
          const cargando = cargandoBloqueo[t.id] ?? false;
          const color = colores[t.tipo] ?? "from-gray-600 to-gray-800";
          const numeroVisible = verNumero[t.id]
            ? t.numero_completo ?? t.numero
            : t.numero;

          return (
            <div key={t.id}>
              <div className="relative">
                <div
                  className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white mb-4 relative overflow-hidden transition-all duration-300 ${
                    estaBloqueada ? "opacity-60 grayscale" : ""
                  }`}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-xs opacity-70 mb-1">Caja Cusco</p>
                      <p className="text-sm font-semibold">{t.tipo}</p>
                    </div>
                    <CreditCard size={28} className="opacity-80" />
                  </div>
                  <p className="text-lg font-mono tracking-widest mb-4">
                    {numeroVisible}
                  </p>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs opacity-60">Titular</p>
                      <p className="text-sm font-semibold">{t.titular}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-60">Vence</p>
                      <p className="text-sm font-semibold">{t.vencimiento}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-60">Saldo</p>
                      <p className="text-sm font-semibold">
                        S/ {Number(t.saldoMostrar ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {estaBloqueada && (
                  <div className="absolute inset-0 flex items-center justify-center mb-4">
                    <span className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Lock size={12} /> TARJETA BLOQUEADA
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-3">
                <button
                  onClick={() => toggle(t.id)}
                  disabled={estaBloqueada}
                  className="flex-1 flex items-center justify-center gap-2 border rounded-xl py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {verNumero[t.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                  {verNumero[t.id] ? "Ocultar" : "Ver número"}
                </button>

                <button
                  onClick={() => toggleBloqueo(t.id, estaBloqueada)}
                  disabled={cargando}
                  className={`flex-1 flex items-center justify-center gap-2 border rounded-xl py-2 text-sm font-medium transition-colors
                    ${
                      estaBloqueada
                        ? "bg-green-50 border-green-400 text-green-700 hover:bg-green-100"
                        : "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {cargando ? (
                    <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : estaBloqueada ? (
                    <><Unlock size={15} /> Desbloquear</>
                  ) : (
                    <><Lock size={15} /> Bloquear</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-5">
          Límites y consumo
        </h2>
        <div className="space-y-6 select-none">
          {limites.map((item, index) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">{item.label}</span>
                <span className="font-semibold text-gray-800">
                  S/ {item.limite}
                </span>
              </div>
              <input
                type="range"
                min={item.usado}
                max={10000}
                value={item.limite}
                onChange={(e) => handleLimite(index, e.target.value)}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}