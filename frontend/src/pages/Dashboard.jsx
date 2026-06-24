import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Dashboard() {
  const [verSaldo, setVerSaldo] = useState(true);
  const [cuenta, setCuenta] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const cuentaId = localStorage.getItem("cuenta_id");

    if (!cuentaId) {
      navigate("/");
      return;
    }

    const { data: cuentaData } = await supabase
      .from("cuentas")
      .select("*")
      .eq("id", cuentaId)
      .single();
    setCuenta(cuentaData);

    const { data: todosData } = await supabase
      .from("movimientos")
      .select("*")
      .eq("cuenta_id", cuentaId);
    setTodos(todosData || []);

    const { data: movData } = await supabase
      .from("movimientos")
      .select("*")
      .eq("cuenta_id", cuentaId)
      .order("fecha", { ascending: false })
      .limit(5);
    setMovimientos(movData || []);
  };

  const totalEntradas = todos.filter(m => m.tipo === "entrada").reduce((a, m) => a + Number(m.monto), 0);
  const totalSalidas = todos.filter(m => m.tipo === "salida").reduce((a, m) => a + Math.abs(Number(m.monto)), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-red-600 text-white rounded-2xl p-6">
          <div className="flex justify-between items-start mb-4">
            <p className="text-red-200 text-sm">Saldo disponible</p>
            <button onClick={() => setVerSaldo(!verSaldo)}>
              {verSaldo ? <EyeOff size={18} className="text-red-200" /> : <Eye size={18} className="text-red-200" />}
            </button>
          </div>
          <p className="text-3xl font-bold mb-1">
            {verSaldo ? `S/ ${Number(cuenta?.saldo || 0).toLocaleString()}` : "S/ ••••••"}
          </p>
          <p className="text-red-200 text-xs">Cuenta {cuenta?.tipo} • **** {cuenta?.numero?.slice(-4)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ArrowDownLeft size={18} className="text-green-600" />
            </div>
            <p className="text-gray-500 text-sm">Ingresos totales</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">S/ {totalEntradas.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight size={18} className="text-red-600" />
            </div>
            <p className="text-gray-500 text-sm">Gastos totales</p>
          </div>
          <p className="text-2xl font-bold text-gray-800">S/ {totalSalidas.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Transferir", icon: "💸", color: "bg-blue-50 text-blue-600", ruta: "/app/transferencias" },
            { label: "Préstamos", icon: "🏦", color: "bg-purple-50 text-purple-600", ruta: "/app/prestamos" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.ruta)}
              className={`${item.color} rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-80 transition`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-800">Movimientos Recientes</h2>
        </div>
        <div className="space-y-4">
          {movimientos.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.tipo === "entrada" ? "bg-green-100" : "bg-red-100"}`}>
                  {m.tipo === "entrada" ? <ArrowDownLeft size={18} className="text-green-600" /> : <ArrowUpRight size={18} className="text-red-600" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.descripcion}</p>
                  <p className="text-xs text-gray-400">{new Date(m.fecha).toLocaleDateString()} • {m.categoria}</p>
                </div>
              </div>
              <p className={`font-bold text-sm ${m.tipo === "entrada" ? "text-green-600" : "text-red-600"}`}>
                {m.tipo === "entrada" ? "+" : ""}S/ {Math.abs(Number(m.monto)).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}