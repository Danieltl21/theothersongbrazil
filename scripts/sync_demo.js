const fs = require('fs');
const path = require('path');

const workspaceDir = path.resolve(__dirname, '..');
const clientDir = path.join(workspaceDir, "client");
const cssPath = path.join(clientDir, "src", "index.css");
const appPath = path.join(clientDir, "src", "App.jsx");
const demoPath = path.join(workspaceDir, "demo.html");

try {
    console.log(`Reading CSS from ${cssPath}...`);
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    console.log(`Reading React code from ${appPath}...`);
    const appContent = fs.readFileSync(appPath, 'utf8');

    // Process React code for inline Babel usage:
    // 1. Remove the React import at the top
    let processedApp = appContent.replace(
        "import React, { useState, useEffect, useRef } from 'react';",
        "const { useState, useEffect, useRef } = React;"
    );
    // 2. Remove export default
    processedApp = processedApp.replace(
        "export default function App() {",
        "function App() {"
    );

    // Construct the demo.html content
    const demoHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulação LMS Homeopatia - The Other Song Brasil</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌿</text></svg>" />
  
  <!-- Fontes Premium -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  
  <!-- React, ReactDOM, Babel Standalone da CDN -->
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- Lógica React Completa -->
  <script type="text/babel">
${processedApp}

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  </script>
</body>
</html>
`;

    console.log(`Writing updated demo.html to ${demoPath}...`);
    fs.writeFileSync(demoPath, demoHtml, 'utf8');
    console.log("Synchronization completed successfully!");
} catch (error) {
    console.error("Error during synchronization:", error);
    process.exit(1);
}
