import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ArrowLeftRight, FileText,
  CreditCard, Settings, LogOut, Landmark, BadgeDollarSign
} from "lucide-react";

const links = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/transferencias", icon: ArrowLeftRight, label: "Transferencias" },
  { to: "/app/estado-cuenta", icon: FileText, label: "Estado de Cuenta" },
  { to: "/app/tarjetas", icon: CreditCard, label: "Mis Tarjetas" },
  { to: "/app/prestamos", icon: Landmark, label: "Préstamos" },
  { to: "/app/creditos", icon: BadgeDollarSign, label: "Créditos" },
  { to: "/app/configuracion", icon: Settings, label: "Configuración" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const nombreUsuario = localStorage.getItem("usuario_nombre") || "Usuario";
  const iniciales = nombreUsuario
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const cerrarSesion = () => {
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("cuenta_id");
    localStorage.removeItem("usuario_nombre");
    navigate("/");
  };

  return (
    <div className="w-64 min-h-screen bg-red-700 flex flex-col">
      <div className="px-6 py-6 border-b border-red-600">
        <h1 className="text-white text-2xl font-bold">Caja Cusco</h1>
        <p className="text-red-200 text-xs mt-1">Banca por Internet</p>
      </div>

      <div className="px-6 py-4 border-b border-red-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
            {iniciales}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{nombreUsuario}</p>
            <p className="text-red-200 text-xs">Cuenta Ahorro</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-white text-red-700"
                  : "text-red-100 hover:bg-red-600"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-red-600">
        <button
          onClick={cerrarSesion}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-100 hover:bg-red-600 w-full transition"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}