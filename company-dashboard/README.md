# Operations Workspace Frontend

This directory contains the React and TypeScript frontend for the configurable Operations Workspace.

The full project documentation is in the repository root:

```text
../README.md
```

## Frontend commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

The development server uses `http://localhost:5173` by default. Set `VITE_API_URL` to point the frontend at a different API; `/api` is appended automatically when needed.

Page content labels are configured through `VITE_*` environment variables at build time. Sidebar navigation uses fixed common names, and its heading uses the registered workspace's name. See the root README's **Domain configuration** section for the supported variables.
