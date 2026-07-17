# App Architecture Map

## 1. Folder Blueprint
ELECTRICELITE-AI-INVENTORY/
├── docs/                     # Strategic docs (the "Brain")
├── public/                   # Static assets
└── src/
    ├── components/           # Reusable UI (Buttons, Cards, Modals, Tables)
    ├── pages/                # Screen-level views (Dashboard, Inventory, ContentAI)
    ├── hooks/                # Custom logic (useInventory.js, useTheme.js)
    ├── services/             # API interaction (geminiService.js)
    ├── utils/                # Helper functions (calculations, formatters)
    ├── App.jsx               # Main router
    └── main.jsx              # Entry point

## 2. Communication & State
*   State will be managed primarily via React Hooks and `localStorage` to ensure persistence without a complex backend for the demo.
*   Theme state is global, applied via CSS variables.