new window.DocsAPI.DocEditor("editor", {
    height: "100%",
    width: "100%",
    type: "desktop",
    documentType: "word",
    document: config.document,
 
    editorConfig: {
        ...config.editorConfig,
        callbackUrl: "http://host.docker.internal:5001/api/editor/callback",
        plugins: {
            autostart: ["visual-editor"],
            url: "http://localhost:8081/web-apps/apps/plugins/"
        }
    },
 
    token: config.token
});