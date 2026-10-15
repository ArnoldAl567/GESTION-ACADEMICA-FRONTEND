# Estructura del frontend

El frontend usa Angular con componentes independientes. La regla principal es que cada archivo tenga una sola responsabilidad.

```text
src/app/
├── componentes/
│   ├── navegacion/          # Barra lateral y cabecera
│   ├── panel/               # Vista del dashboard
│   └── interfaz/            # Estados vacíos, filtros y notificaciones reutilizables
├── configuracion/           # Menús, rutas, roles y constantes visuales
├── modelos/                 # Tipos e interfaces de la aplicación
├── modulos/                 # Pantallas independientes por área funcional
│   ├── estudiantes/
│   ├── matriculas/
│   ├── asistencia/
│   ├── evaluaciones/
│   └── seguimiento/
├── servicios/
│   ├── dominios/            # Consultas y operaciones de cada módulo
│   ├── api-academica.servicio.ts
│   └── tema.servicio.ts
├── app.ts                   # Orquestación global, navegación y modales compartidos
├── app.html                 # Composición de las pantallas del sistema
└── app.routes.ts            # Rutas visibles del sistema
```

## Dónde realizar cada cambio

- Para añadir o modificar un tipo de dato: `modelos/academicos.modelos.ts`.
- Para cambiar una operación de estudiantes, matrículas, asistencia, evaluaciones o seguimiento: `servicios/dominios/`.
- Para cambiar la configuración HTTP, sesión, CSRF o descargas: `servicios/api-academica.servicio.ts`.
- Para cambiar la persistencia del tema claro/oscuro: `servicios/tema.servicio.ts`.
- Para modificar el menú, nombres de roles o rutas: `configuracion/aplicacion.configuracion.ts`.
- Para modificar el dashboard: `componentes/panel/`.
- Para modificar la navegación: `componentes/navegacion/`.
- Para cambiar estados vacíos, filtros activos o notificaciones: `componentes/interfaz/`.
- Para modificar una pantalla principal: su carpeta dentro de `modulos/`.
- Para cambiar navegación, diálogos compartidos o coordinación entre módulos: `app.ts`.

## Convenciones

- Carpetas y archivos propios del negocio se nombran en español.
- Los campos enviados a Laravel conservan sus nombres originales (`student_id`, `classroom_id`, etc.) porque forman parte del contrato de la API.
- Los componentes reciben datos mediante entradas y comunican acciones mediante eventos; no realizan peticiones por su cuenta.
- El servicio de API es el único lugar que conoce `/api/v1`, CSRF y el formato general de errores.

## Flujo de datos

```text
Componente visual → evento → app.ts → ApiAcademicaServicio → Laravel
Laravel → respuesta tipada → app.ts → entradas del componente visual
```

Antes de entregar un cambio, ejecuta `npm run build`.
