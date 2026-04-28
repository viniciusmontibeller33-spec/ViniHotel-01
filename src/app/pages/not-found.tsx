import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Página no encontrada
      </h2>
      <p className="text-gray-600 mb-8">
        Lo sentimos, la página que buscas no existe.
      </p>
      <Button onClick={() => navigate("/")}>
        <Home className="w-4 h-4 mr-2" />
        Volver al Inicio
      </Button>
    </div>
  );
}
