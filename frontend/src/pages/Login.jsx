import { Lock, CreditCard, Phone, Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const generarCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

export default function Login() {
  const navigate = useNavigate();
  const [tarjeta, setTarjeta] = useState("");
  const [tipoDoc, setTipoDoc] = useState("DNI");
  const [documento, setDocumento] = useState("");
  const [clave, setClave] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState(generarCaptcha());
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const refrescarCaptcha = () => {
    setCaptcha(generarCaptcha());
    setCaptchaInput("");
  };

  const handleLogin = async () => {
    setError("");

    if (captchaInput !== captcha) {
      setError("El captcha es incorrecto");
      refrescarCaptcha();
      return;
    }

    setCargando(true);

    const { data: cuenta } = await supabase
      .from("cuentas")
      .select("*")
      .eq("numero", tarjeta)
      .single();

    if (!cuenta) {
      setError("Número de tarjeta no encontrado");
      setCargando(false);
      refrescarCaptcha();
      return;
    }

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", cuenta.usuario_id)
      .single();

    if (!usuario || usuario.dni !== documento) {
      setError("Documento de identidad incorrecto");
      setCargando(false);
      refrescarCaptcha();
      return;
    }

    if (usuario.clave !== clave) {
      setError("Clave incorrecta");
      setCargando(false);
      refrescarCaptcha();
      return;
    }

    // Guardar sesión del usuario logueado
    localStorage.setItem("usuario_id", usuario.id);
    localStorage.setItem("cuenta_id", cuenta.id);
    localStorage.setItem("usuario_nombre", usuario.nombre);

    setCargando(false);
    navigate("/app/dashboard");
  };

  return (
    <div className="w-full h-screen flex bg-gray-100 overflow-hidden">
      <div
        className="w-1/2 relative bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute top-10 left-10 bg-red-600 text-white p-6 rounded-2xl shadow-2xl w-[300px]">
          <h1 className="text-3xl font-bold mb-3">Caja Cusco</h1>
          <h2 className="text-lg font-semibold leading-snug mb-4">
            Bienvenido a<br />Banca por Internet
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Phone size={16} /><span>084-606100</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} /><span>atencionalcliente@cmac-cusco.com.pe</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 flex items-center justify-center bg-red-600">
        <div className="bg-white w-[480px] rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-6">Iniciar Sesión</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="font-semibold text-sm block mb-2">Número de tarjeta</label>
            <div className="flex items-center border rounded-xl px-3 py-3 focus-within:border-red-500">
              <CreditCard size={18} className="text-red-600 mr-2" />
              <input type="text" value={tarjeta} onChange={(e) => setTarjeta(e.target.value)}
                className="w-full outline-none text-sm" placeholder="**** **** **** ****" />
            </div>
          </div>

          <div className="mb-4">
            <label className="font-semibold text-sm block mb-2">Documento</label>
            <div className="flex gap-3">
              <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)}
                className="border rounded-xl px-3 py-3 text-sm outline-none">
                <option>DNI</option>
                <option>CE</option>
              </select>
              <input type="text" value={documento} onChange={(e) => setDocumento(e.target.value)}
                placeholder="Número de documento"
                className="border rounded-xl px-3 py-3 flex-1 text-sm outline-none focus:border-red-500" />
            </div>
          </div>

          <div className="mb-4">
            <label className="font-semibold text-sm block mb-2">Clave de 6 dígitos</label>
            <div className="flex items-center border rounded-xl px-3 py-3 focus-within:border-red-500">
              <Lock size={18} className="text-red-600 mr-2" />
              <input type="password" value={clave} onChange={(e) => setClave(e.target.value)}
                className="w-full outline-none text-sm" placeholder="••••••" maxLength={6} />
            </div>
          </div>

          <div className="flex gap-3 mb-5">
            <div className="bg-gray-100 border rounded-xl px-5 py-3 text-xl font-mono tracking-widest select-none">
              {captcha}
            </div>
            <button onClick={refrescarCaptcha} className="p-3 border rounded-xl hover:bg-gray-50 transition">
              <RefreshCw size={16} className="text-gray-500" />
            </button>
            <input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Escribe los caracteres"
              className="border rounded-xl px-3 py-3 flex-1 text-sm outline-none focus:border-red-500" />
          </div>

          <button onClick={handleLogin} disabled={cargando}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-base font-bold transition">
            {cargando ? "Verificando..." : "Ingresar"}
          </button>

          <div className="text-center mt-5 text-sm text-red-600">
            <a href="#" className="hover:underline">¿Olvidaste tu Clave?</a>
          </div>
        </div>
      </div>
    </div>
  );
}