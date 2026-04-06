---
name: "Organizar Documentación"
description: "Mueve archivos de documentación a la carpeta docs/ manteniendo solo archivos esenciales en la raíz"
trigger: "manual"
---

# Hook: Organizar Documentación

Este hook reorganiza la estructura de documentación del proyecto moviendo archivos específicos a una carpeta `docs/` centralizada.

## Archivos que se mantienen en la raíz:

- `README.md` - Documentación principal del proyecto
- `CHANGELOG.md` - Historial de cambios
- `CLAUDE.md` - Guía para Claude AI
- `GEMINI.md` - Guía para Gemini AI

## Archivos que se mueven a `docs/`:

- `PROJECT_STATUS_FINAL.md`
- `GODADDY_DEPLOYMENT.md`
- `ERRORS_REFERENCE.md`
- `TEST_STATUS.md`
- Cualquier otro archivo `.md` de documentación técnica

## Estructura resultante:

```
/
├── README.md
├── CHANGELOG.md
├── CLAUDE.md
├── GEMINI.md
└── docs/
    ├── PROJECT_STATUS_FINAL.md
    ├── GODADDY_DEPLOYMENT.md
    ├── ERRORS_REFERENCE.md
    └── TEST_STATUS.md
```
