import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

const EditorPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get("user");
    const [config, setConfig] = useState(null);

    useEffect(() => {
        if (!id) return;

        const token = localStorage.getItem("token");
        console.log("Token Sent to Backend:", token ? token.substring(0, 10) + '...' : 'MISSING');
        axios
            .get(`http://localhost:5001/api/editor/${id}/config`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                console.log("✅ CONFIG LOADED:", res.data);
                setConfig(res.data);
            })
            .catch((err) => console.error("❌ CONFIG LOAD ERROR:", err));
    }, [id]);

    useEffect(() => {
        if (!config) return;

        const script = document.createElement("script");
        // ⚠️ MODIFIED: Point directly to the NGINX proxy port (8081)
        script.src = "http://localhost:8081/web-apps/apps/api/documents/api.js";

        script.onload = () => {
            console.log("✅ ONLYOFFICE API Loaded");
            new window.DocsAPI.DocEditor("editor", {
                height: "100%",
                width: "100%",
                type: "desktop",
                documentType: "word",

                document: config.document,
                editorConfig: config.editorConfig,
                token: config.token,
            });
        };

        document.body.appendChild(script);
    }, [config]);

    return (
        <div style={{ width: "100vw", height: "100vh" }}>
            <div id="editor" style={{ width: "100%", height: "100%" }}></div>
        </div>
    );
};

export default EditorPage;