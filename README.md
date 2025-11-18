# Sistema de Gestión de Prácticas Profesionales

Sistema web completo para la gestión de prácticas profesionales universitarias con tres roles: Estudiante, Tutor y Administrador.

## 🎯 Características Principales

### Para Estudiantes
- ✅ Registro y gestión de planes de prácticas
- 📊 Bitácora de horas con validación
- 📁 Sistema de carga de evidencias
- 📈 Visualización de evaluaciones y progreso
- 🔔 Notificaciones en tiempo real

### Para Tutores
- 👥 Gestión de estudiantes asignados
- ✔️ Validación de planes de prácticas
- ⏰ Aprobación/rechazo de horas registradas
- 📝 Sistema de evaluación de desempeño
- 📋 Panel de seguimiento

### Para Administradores
- 👨‍🎓 Gestión de estudiantes y asignación de tutores
- 🏢 CRUD de empresas y convenios
- 📅 Gestión de periodos académicos
- 📊 Reportes y estadísticas avanzadas con gráficos
- 🔍 Monitoreo general del sistema

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast
- **STOMP.js + SockJS** - WebSocket para notificaciones en tiempo real
- **date-fns** - Manejo de fechas

### Backend (Recomendado)
- **Java 17+**
- **Spring Boot 3.x**
- **Spring Security + JWT** - Autenticación y autorización
- **Jakarta Persistence (JPA)** - ORM
- **MySQL 8.0+** - Base de datos
- **MapStruct** - Mapeo de entidades
- **Lombok** - Reducción de código boilerplate
- **Spring WebSocket** - Notificaciones en tiempo real
- **SpringDoc OpenAPI** - Documentación API

## 📁 Estructura del Proyecto

```
/
├── components/
│   ├── dashboards/          # Dashboards por rol
│   │   ├── StudentDashboard.tsx
│   │   ├── TutorDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── student/             # Componentes de estudiante
│   │   ├── PlanForm.tsx
│   │   ├── TimeLogTable.tsx
│   │   ├── EvidenceList.tsx
│   │   └── EvaluationView.tsx
│   ├── tutor/               # Componentes de tutor
│   │   ├── StudentList.tsx
│   │   └── StudentDetail.tsx
│   ├── admin/               # Componentes de admin
│   │   ├── StudentManagement.tsx
│   │   ├── CompanyManagement.tsx
│   │   ├── PeriodManagement.tsx
│   │   └── Reports.tsx
│   ├── ui/                  # Componentes UI reutilizables
│   ├── Layout.tsx           # Layout principal con sidebar
│   ├── Login.tsx            # Pantalla de login
│   └── NotificationCenter.tsx  # Centro de notificaciones
├── hooks/
│   └── useNotifications.ts  # Hook de notificaciones
├── lib/
│   └── websocket.ts         # Servicio WebSocket
├── types/
│   └── api.ts               # Tipos TypeScript de la API
├── styles/
│   └── globals.css          # Estilos globales
├── App.tsx                  # Componente principal
├── API_DOCUMENTATION.md     # Documentación completa de APIs REST
├── DATABASE_SCHEMA.md       # Esquema de base de datos MySQL
├── BACKEND_IMPLEMENTATION_GUIDE.md  # Guía de implementación backend
└── FRONTEND_DEPENDENCIES.md # Dependencias del frontend
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación

1. **Instala las dependencias**
```bash
npm install
```

2. **Instala las dependencias adicionales para notificaciones**
```bash
npm install @stomp/stompjs sockjs-client date-fns
```

3. **Configura las variables de entorno**

Crea un archivo `.env` en la raíz:
```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
```

4. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

5. **Abre tu navegador**
```
http://localhost:5173
```

### Credenciales de Demo

El sistema incluye credenciales de prueba:

- **Estudiante**: `estudiante@universidad.edu` / `123456`
- **Tutor**: `tutor@universidad.edu` / `123456`
- **Administrador**: `admin@universidad.edu` / `123456`

## 🗄️ Backend Setup

### Base de Datos

1. **Crea la base de datos MySQL**
```sql
CREATE DATABASE practicas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Ejecuta el script de creación de tablas**

Consulta `DATABASE_SCHEMA.md` para el esquema completo con triggers y stored procedures.

### Implementación del Backend

Consulta `BACKEND_IMPLEMENTATION_GUIDE.md` para:
- Estructura de proyecto recomendada
- Configuración de Spring Boot
- Ejemplos de entidades JPA
- DTOs y MapStruct
- Configuración de WebSocket
- Servicios con notificaciones
- Seguridad JWT
- Y más...

## 📡 API REST

El sistema consume APIs REST documentadas en `API_DOCUMENTATION.md` que incluye:

- Autenticación (login, logout, forgot password)
- Gestión de perfil de usuario
- Planes de prácticas (CRUD completo)
- Bitácora de horas con validación
- Sistema de evidencias con upload de archivos
- Evaluaciones de desempeño
- Gestión administrativa (estudiantes, empresas, periodos)
- Reportes y estadísticas
- Sistema de notificaciones
- WebSocket para tiempo real

## 🔔 Sistema de Notificaciones en Tiempo Real

El sistema incluye un robusto sistema de notificaciones que:

- ✅ Conecta automáticamente al WebSocket al iniciar sesión
- 🔄 Reconexión automática si se pierde la conexión
- 🔊 Reproducción de sonido (opcional)
- 📱 Badge visual con contador de no leídas
- 🎨 Colores según el tipo (info, success, warning, error)
- ⏱️ Timestamps relativos ("hace 5 minutos")
- 🔗 Enlaces directos a las secciones relevantes
- 💾 Notificaciones mock para desarrollo sin backend

### Eventos que Generan Notificaciones

- Plan de prácticas aprobado/rechazado
- Horas validadas/rechazadas
- Evidencias aprobadas/rechazadas
- Nueva evaluación disponible
- Asignación de tutor
- Recordatorios de fechas límite

## 📊 Reportes y Estadísticas

El panel de administrador incluye gráficos interactivos:

- 📈 Planes aprobados vs rechazados por mes (gráfico de barras)
- ⏰ Horas registradas vs aprobadas (gráfico de líneas)
- 🏢 Distribución de estudiantes por empresa (gráfico de barras horizontal)
- 📉 Tarjetas con métricas clave (tasa de aprobación, promedios, etc.)

## 🎨 Diseño

- **Diseño moderno y minimalista** con Tailwind CSS
- **Totalmente responsivo** (mobile-first)
- **Paleta de colores institucionales**:
  - Primary: Azul universitario (#1e40af)
  - Success: Verde académico (#059669)
  - Accent: Amber (#f59e0b)
- **Componentes reutilizables** de shadcn/ui
- **Sidebar colapsable** en móvil
- **Dark mode ready** (fácil de implementar)

## 🧪 Testing

Para probar el sistema completo:

1. **Inicia sesión como estudiante**
2. **Crea y envía un plan** de prácticas
3. **Cambia a sesión de tutor** (otra ventana/navegador)
4. **Aprueba el plan**
5. **Verifica la notificación** en tiempo real en la sesión del estudiante
6. **Registra horas** como estudiante
7. **Valida las horas** como tutor
8. **Explora los reportes** como administrador

## 📝 Notas Importantes

### Mock Data
El frontend incluye datos mock para desarrollo sin backend. Una vez que conectes el backend real:
1. Reemplaza las URLs mock en los componentes
2. Implementa los fetch calls a tu API REST
3. Configura el token JWT en los headers

### Archivos de Upload
Para el upload de evidencias, necesitarás implementar:
- Servicio de storage en el backend (local o cloud como AWS S3)
- Endpoint multipart/form-data
- Validación de tipos de archivo
- Límites de tamaño

### WebSocket en Producción
Para producción, considera:
- HTTPS/WSS en lugar de HTTP/WS
- Rate limiting para prevenir abuso
- Autenticación del WebSocket con JWT
- Heartbeats para mantener conexión activa
- Load balancing con sticky sessions

## 🔒 Seguridad

Implementaciones de seguridad recomendadas:

- ✅ JWT con refresh tokens
- ✅ Hashing de contraseñas con BCrypt
- ✅ Rate limiting en endpoints sensibles
- ✅ Validación de entrada en backend
- ✅ CORS configurado correctamente
- ✅ HTTPS en producción
- ✅ Sanitización de datos
- ✅ Prevención de SQL Injection (usando JPA)
- ✅ Protección CSRF

## 📦 Build para Producción

```bash
npm run build
```

El build optimizado estará en `/dist`

Para preview del build:
```bash
npm run preview
```

## 🤝 Contribución

Este es un proyecto educativo. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.

## 👥 Autores

- Sistema desarrollado para gestión de prácticas profesionales universitarias
- Frontend: React + TypeScript + Tailwind CSS
- Backend recomendado: Java Spring Boot

## 🙏 Agradecimientos

- shadcn/ui por los componentes base
- Lucide por los iconos
- Recharts por los gráficos
- La comunidad de React y Spring Boot

## 📞 Soporte

Para dudas sobre la implementación, consulta:
- `API_DOCUMENTATION.md` - Especificación completa de APIs
- `DATABASE_SCHEMA.md` - Esquema de base de datos
- `BACKEND_IMPLEMENTATION_GUIDE.md` - Guía detallada del backend
- `FRONTEND_DEPENDENCIES.md` - Configuración del frontend

---

**Nota**: Este es un sistema completo y funcional listo para conectarse con un backend real. Incluye todas las funcionalidades solicitadas más un sistema de notificaciones en tiempo real como bonus.
