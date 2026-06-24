import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function EstadoCuenta() {
  const [filtro, setFiltro] = useState("todos");
  const [movimientos, setMovimientos] = useState([]);
  const [saldo, setSaldo] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const cuentaId = localStorage.getItem("cuenta_id");
    if (!cuentaId) return;

    const { data: cuenta } = await supabase
      .from("cuentas")
      .select("*")
      .eq("id", cuentaId)
      .single();
    setSaldo(cuenta?.saldo || 0);

    const { data: movData } = await supabase
      .from("movimientos")
      .select("*")
      .eq("cuenta_id", cuentaId)
      .order("fecha", { ascending: false });
    setMovimientos(movData || []);
  };

  const filtrados = movimientos.filter((m) => {
    if (filtro === "entrada") return m.tipo === "entrada";
    if (filtro === "salida") return m.tipo === "salida";
    return true;
  });

  const totalEntradas = movimientos.filter(m => m.tipo === "entrada").reduce((a, m) => a + m.monto, 0);
  const totalSalidas = movimientos.filter(m => m.tipo === "salida").reduce((a, m) => a + Math.abs(m.monto), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estado de Cuenta</h1>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Saldo actual</p>
          <p className="text-2xl font-bold text-gray-800">S/ {saldo.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Total ingresos</p>
          <p className="text-2xl font-bold text-green-600">+S/ {totalEntradas.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-gray-500 text-sm mb-1">Total egresos</p>
          <p className="text-2xl font-bold text-red-600">-S/ {totalSalidas.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex gap-3 mb-5">
          {["todos", "entrada", "salida"].map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filtro === f ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f === "todos" ? "Todos" : f === "entrada" ? "Ingresos" : "Egresos"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtrados.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.tipo === "entrada" ? "bg-green-100" : "bg-red-100"}`}>
                  {m.tipo === "entrada" ? <ArrowDownLeft size={18} className="text-green-600" /> : <ArrowUpRight size={18} className="text-red-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.descripcion}</p>
                  <p className="text-xs text-gray-400">{new Date(m.fecha).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })} • {m.categoria}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${m.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
                {m.tipo === "entrada" ? "+" : ""}S/ {Math.abs(m.monto).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}