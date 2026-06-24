import { useState, useEffect } from "react";
import { Send, CheckCircle, AlertTriangle } from "lucide-react";
import { supabase } from "../supabase";

export default function Transferencias() {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState({
    banco: "",
    cuenta: "",
    monto: "",
    descripcion: "",
  });
  const [cargando, setCargando] = useState(false);
  const [tarjetaBloqueada, setTarjetaBloqueada] = useState(false);

  useEffect(() => {
    const verificarBloqueo = async () => {
      const usuarioId = localStorage.getItem("usuario_id");
      if (!usuarioId) return;

      const { data } = await supabase
        .from("tarjetas")
        .select("id, bloqueada")
        .eq("usuario_id", usuarioId)
        .eq("tipo", "Débito")
        .single();

      if (data) {
        const bloqueosGuardados = JSON.parse(
          localStorage.getItem("tarjetas_bloqueadas") || "{}"
        );
        const estaBloqueada =
          bloqueosGuardados[data.id] ?? data.bloqueada ?? false;
        setTarjetaBloqueada(estaBloqueada);
      }
    };
    verificarBloqueo();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEnviar = async () => {
    setCargando(true);

    const cuentaId = localStorage.getItem("cuenta_id");

    const { data: cuenta } = await supabase
      .from("cuentas")
      .select("*")
      .eq("id", cuentaId)
      .single();

    if (cuenta) {
      await supabase.from("movimientos").insert({
        cuenta_id: cuenta.id,
        descripcion: `Transferencia a cuenta ${form.cuenta} - ${form.banco}`,
        monto: -parseFloat(form.monto),
        tipo: "salida",
        categoria: "Transferencia",
      });

      await supabase
        .from("cuentas")
        .update({ saldo: cuenta.saldo - parseFloat(form.monto) })
        .eq("id", cuenta.id);
    }

    setCargando(false);
    setPaso(3);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Transferencias</h1>

      {tarjetaBloqueada && (
        <div className="max-w-xl mb-6 bg-red-50 border border-red-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">Tarjeta bloqueada</p>
            <p className="text-sm text-red-600">
              Tu tarjeta de débito está bloqueada. No puedes realizar
              transferencias. Desbloquéala desde{" "}
              <strong>Mis Tarjetas</strong> para continuar.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          {["Datos", "Confirmar", "Listo"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  paso > i
                    ? "bg-red-600 text-white"
                    : paso === i + 1
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {paso > i + 1 ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm ${
                  paso === i + 1
                    ? "font-semibold text-gray-800"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>
              {i < 2 && <div className="w-12 h-px bg-gray-200 ml-1" />}
            </div>
          ))}
        </div>

        {paso === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Banco destino
              </label>
              <select
                name="banco"
                value={form.banco}
                onChange={handleChange}
                disabled={tarjetaBloqueada}
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Selecciona un banco</option>
                <option>Caja Cusco</option>
                <option>BCP</option>
                <option>Interbank</option>
                <option>BBVA</option>
                <option>Scotiabank</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Número de cuenta
              </label>
              <input
                name="cuenta"
                value={form.cuenta}
                onChange={handleChange}
                disabled={tarjetaBloqueada}
                type="text"
                placeholder="Ej: 1234567890"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Monto (S/)
              </label>
              <input
                name="monto"
                value={form.monto}
                onChange={handleChange}
                disabled={tarjetaBloqueada}
                type="number"
                placeholder="0.00"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Descripción (opcional)
              </label>
              <input
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                disabled={tarjetaBloqueada}
                type="text"
                placeholder="Ej: Pago alquiler"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={() => setPaso(2)}
              disabled={tarjetaBloqueada}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
          </div>
        )}

        {paso === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              Confirmar transferencia
            </h2>
            <div className="space-y-3 mb-6">
              {[
                { label: "Banco destino", value: form.banco },
                { label: "Cuenta destino", value: form.cuenta },
                {
                  label: "Monto",
                  value: `S/ ${parseFloat(form.monto || 0).toFixed(2)}`,
                },
                { label: "Descripción", value: form.descripcion || "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between py-2 border-b border-gray-100"
                >
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPaso(1)}
                className="flex-1 border border-gray-300 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                onClick={handleEnviar}
                disabled={cargando}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <Send size={16} /> {cargando ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              ¡Transferencia exitosa!
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Se transfirió S/ {parseFloat(form.monto || 0).toFixed(2)} a la
              cuenta {form.cuenta}
            </p>
            <button
              onClick={() => {
                setPaso(1);
                setForm({ banco: "", cuenta: "", monto: "", descripcion: "" });
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition"
            >
              Nueva transferencia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}