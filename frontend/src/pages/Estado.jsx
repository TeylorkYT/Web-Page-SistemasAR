import { useEffect, useState } from "react";
import { API_URL } from "../services/api";

export default function Estado() {
  const [backend, setBackend] = useState("Consultando...");
  const [baseDatos, setBaseDatos] = useState("Consultando...");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setBackend(data.status))
      .catch(() => setBackend("sin conexión"));

    fetch(`${API_URL}/db-check`)
      .then((res) => res.json())
      .then((data) => setBaseDatos(data.database))
      .catch(() => setBaseDatos("sin conexión"));
  }, []);

  return (
    <div>
      <p>Backend: {backend}</p>
      <p>Base de datos: {baseDatos}</p>
    </div>
  );
}