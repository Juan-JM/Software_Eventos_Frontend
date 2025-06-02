import React, { useState, useEffect } from "react";
import axios from "axios";

const BackupList = () => {
  const [backups, setBackups] = useState([]);
  const baseURL = "http://localhost:8000/api";

  const fetchBackups = async () => {
    try {
      const token = localStorage.getItem("access_token"); 
      const response = await axios.get(`${baseURL}/backup/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBackups(response.data);
    } catch (error) {
      console.error("Error al obtener backups", error);
    }
  };

  const generateBackup = async () => {
    if (!window.confirm("¿Deseas generar un nuevo backup?")) return;

    try {
      const token = localStorage.getItem("access_token"); 
      await axios.post(`${baseURL}/backup/generate/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Backup generado correctamente");
      fetchBackups();
    } catch (error) {
      alert("Error al generar el backup");
      console.error(error);
    }
  };

  const downloadBackup = (fileName) => {
    const baseUrl = "http://localhost:8000/"; //No agregar 'api', esto es para que acceda a la carpeta donde se guardan los backups generados 
    const url = `${baseUrl}/backups/${fileName}`
    window.open(url, "_blank");
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto", padding: "10px" }}>
      <h2 style={{ borderBottom: "2px solid #ccc", paddingBottom: "10px" }}>
        Lista de Backups
      </h2>

      <button
        onClick={generateBackup}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          border: "1px solid #333",
          borderRadius: "4px",
          cursor: "pointer",
          backgroundColor: "#f5f5f5",
        }}
      >
        + Generar Backup
      </button>

      <div style={{ borderTop: "1px solid #ccc" }}>
        {backups.map((backup) => (
          <div
            key={backup.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #eee",
              padding: "10px 0",
            }}
          >
            <span>{backup.file_name}</span>
            <button
              onClick={() => downloadBackup(backup.file_name)}
              style={{
                padding: "5px 10px",
                border: "1px solid #333",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: "#eaeaea",
              }}
            >
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackupList;