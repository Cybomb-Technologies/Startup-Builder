// Visual Editor Configuration
window.visualEditorConfig = {
    version: '1.0.0',
    enabled: true,
    api: {
      baseUrl: '/api/editor',
      endpoints: {
        save: '/save',
        load: '/load',
        preview: '/preview'
      }
    },
    features: {
      dragDrop: true,
      templates: true,
      realTimePreview: true,
      autoSave: true
    },
    ui: {
      theme: 'light',
      language: 'en'
    }
  };
  export const POPUP_STYLES = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
    minWidth: '300px',
    maxWidth: '90vw'
  };
  
  // Also add it to window object for backward compatibility
  window.POPUP_STYLES = POPUP_STYLES;
  
  console.log('Visual Editor Config loaded successfully');