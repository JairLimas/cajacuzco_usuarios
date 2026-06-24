import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transferencias from "./pages/Transferencias";
import EstadoCuenta from "./pages/EstadoCuenta";
import Tarjetas from "./pages/Tarjetas";
import Configuracion from "./pages/Configuracion";
import Prestamos from "./pages/Prestamos";
import Creditos from "./pages/Creditos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transferencias" element={<Transferencias />} />
          <Route path="estado-cuenta" element={<EstadoCuenta />} />
          <Route path="tarjetas" element={<Tarjetas />} />
          <Route path="prestamos" element={<Prestamos />} />
          <Route path="creditos" element={<Creditos />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}