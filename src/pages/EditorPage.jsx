// frontend/src/pages/EditorPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Helmet } from 'react-helmet';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

const EditorPage = () => {
  const { id } = useParams();
  const [editorConfig, setEditorConfig] = useState(null);
  const [dsScriptEl, setDsScriptEl] = useState(null);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("EditorPage: no login token found");
      return;
    }

    fetch(`${API_BASE_URL}/api/editor/${id}/config`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw { response: { data: errorData }, message: res.statusText };
        }
        return res.json();
      })
      .then((data) => {
        setEditorConfig(data);
      })
      .catch((err) => {
        console.error("CONFIG LOAD ERROR:", err?.response?.data || err.message || err);
      });
  }, [id]);

  useEffect(() => {
    if (!editorConfig) return;

    // remove previous script if exists
    if (dsScriptEl) {
      dsScriptEl.remove();
      setDsScriptEl(null);
    }

    const script = document.createElement("script");
    script.src = editorConfig.documentServerApiUrl;
    script.async = true;
    script.onload = () => {
      try {
        // config object and token from backend
        const cfg = editorConfig.config;
        const token = editorConfig.token;

        new window.DocsAPI.DocEditor("editor", {
          height: "100%",
          width: "100%",
          type: cfg.type,
          documentType: cfg.documentType,
          document: cfg.document,
          editorConfig: cfg.editorConfig,
          token: token
        });
      } catch (err) {
        console.error("Failed to initialize DocsAPI.DocEditor:", err);
      }
    };
    script.onerror = (e) => {
      console.error("Failed to load DS api.js from", editorConfig.documentServerApiUrl, e);
    };

    document.body.appendChild(script);
    setDsScriptEl(script);

    // cleanup on unmount
    return () => {
      if (script) script.remove();
    };
  }, [editorConfig]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Helmet>
        <title>Editor - Paplixo</title>
        <meta
          name="description"
          content="Edit text, images, colors, and layouts effortlessly using Paplixo's fast and intuitive template editor."
        />

      </Helmet>

      {/* small overlay brand */}
      <div
        style={{
          position: "absolute",
          top: "6px",
          left: "10px",
          backgroundColor: "#1F1F1F",
          color: "#F5F5F5",
          fontSize: "13px",
          padding: "5px 12px",
          borderRadius: "6px",
          fontWeight: 600,
          fontFamily: "Segoe UI, sans-serif",
          zIndex: 9999,
          pointerEvents: "none",
          borderRight: "2px solid #555",
        }}
      >
        Paplixo
      </div>

      <div id="editor" style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default EditorPage;
