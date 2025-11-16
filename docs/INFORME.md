## API Proyecto NestJS – Informe técnico

### Alcance
- Descripción de funcionalidades y arquitectura.
- Endpoints disponibles con parámetros y respuestas.
- Autenticación y autorización (JWT, guards, roles).
- Persistencia de datos (TypeORM, entidades, cascadas).
- Ejecución de pruebas y cobertura.
- Guía rápida de seed y colección Postman.

---

## Arquitectura y módulos

- Auth: registro, login, emisión de JWT, guards y decoradores.
- Users: endpoints de consulta/gestión de usuarios.
- Projects: CRUD con control de propietario y permiso de superadmin.
- Tasks: CRUD y consulta por proyecto, con reglas de permiso.
- Seed: limpieza total y carga de datos semilla (usuarios, proyectos, tareas).
- Infraestructura: `main.ts` con prefijo global `api/v1`, `ValidationPipe` y Swagger en `/docs`.

---

## Estructura de carpetas

```text
proyecto-nest-js/
├─ src/
│  ├─ app.module.ts                  # Módulo raíz
│  ├─ main.ts                        # Bootstrap (prefix, pipes, Swagger)
│  ├─ auth/
│  │  ├─ auth.module.ts
│  │  ├─ controllers/
│  │  │  └─ auth.controller.ts
│  │  ├─ services/
│  │  │  └─ auth.service.ts
│  │  ├─ strategies/
│  │  │  └─ jwt.strategy.ts
│  │  ├─ guards/
│  │  │  ├─ jwt-auth.guard.ts
│  │  │  └─ roles-guard.ts
│  │  ├─ decorators/
│  │  │  ├─ auth.decorator.ts
│  │  │  ├─ get-user.decorator.ts
│  │  │  ├─ raw-header.decorator.ts
│  │  │  └─ roles.decorator.ts
│  │  ├─ dto/
│  │  │  ├─ create-user.dto.ts
│  │  │  └─ login.dto.ts
│  │  └─ interfaces/
│  │     └─ jwt.interface.ts
│  ├─ users/
│  │  ├─ users.module.ts
│  │  ├─ controllers/
│  │  │  └─ users.controller.ts
│  │  ├─ services/
│  │  │  └─ users.service.ts
│  │  ├─ entities/
│  │  │  └─ user.entity.ts
│  │  └─ dto/
│  │     └─ update-user.dto.ts
│  ├─ projects/
│  │  ├─ projects.module.ts
│  │  ├─ controllers/
│  │  │  └─ projects.controller.ts
│  │  ├─ services/
│  │  │  └─ projects.service.ts
│  │  ├─ entities/
│  │  │  └─ project.entity.ts
│  │  └─ dto/
│  │     ├─ create-project.dto.ts
│  │     └─ update-project.dto.ts
│  ├─ tasks/
│  │  ├─ tasks.module.ts
│  │  ├─ controllers/
│  │  │  └─ tasks.controller.ts
│  │  ├─ services/
│  │  │  └─ tasks.service.ts
│  │  ├─ entities/
│  │  │  └─ task.entity.ts
│  │  └─ dto/
│  │     ├─ create-task.dto.ts
│  │     └─ update-task.dto.ts
│  └─ seed/
│     ├─ seed.module.ts
│     ├─ seed.controller.ts
│     └─ seed.service.ts
├─ test/
│  ├─ app.e2e-spec.ts (si aplica)
│  ├─ auth/
│  │  ├─ decorators.spec.ts
│  │  ├─ guards/
│  │  │  └─ roles-guard.spec.ts
│  │  └─ strategies/
│  │     └─ jwt.strategy.spec.ts
│  ├─ controllers/
│  │  ├─ auth.controller.spec.ts
│  │  ├─ projects.controller.spec.ts
│  │  ├─ tasks.controller.spec.ts
│  │  └─ users.controller.spec.ts
│  ├─ services/
│  │  ├─ auth.service.spec.ts
│  │  ├─ projects.service.spec.ts
│  │  ├─ tasks.service.spec.ts
│  │  ├─ users.service.spec.ts
│  │  └─ seed.service.spec.ts
│  └─ utils/
│     └─ mocks.ts
├─ docs/
│  └─ INFORME.md
├─ postman.json                     # Colección de Postman 
├─ package.json
└─ README.md
```

---

## Autenticación y autorización

- Token: JWT firmado con `JwtService`. Payload: `{ id, email, role }`.
- Autenticación:
  - Login valida usuario (email normalizado y contraseña `bcrypt`) y estado `isActive`.
  - En `check` se reemite token para un usuario autenticado.
- Autorización:
  - `@Auth(...roles)` aplica `JwtAuthGuard` y `RolesGuard`.
  - Regla: usuario normal solo accede a sus propios recursos; `superadmin` accede a todos.
- Decoradores: `@GetUser()`, `@Roles(...)`, `@Auth(...)`, `@RawHeader()`.

---

## Funcionalidad de módulos y componentes

### Módulo Auth

Responsabilidad general: Gestionar autenticación (verificar identidad) y autorización (verificar permisos) mediante JWT.

#### Decoradores (`auth/decorators/`)

- **`@Auth(...roles)`** (`auth.decorator.ts`):
  - **Función**: Decorador compuesto que encapsula autenticación y autorización.
  - **Comportamiento**: Aplica `@Roles(...)` para guardar metadata de roles requeridos y activa `UseGuards(JwtAuthGuard, RolesGuard)`.
  - **Uso**: Se coloca en endpoints protegidos. Ej: `@Auth('superadmin')` o `@Auth()` para solo autenticación.
  - **Ventaja**: Evita repetir código en controladores; reutiliza lógica transversal.

- **`@Roles(...roles)`** (`roles.decorator.ts`):
  - **Función**: Guarda metadata con los roles permitidos usando `SetMetadata` y la clave `ROLES_KEY`.
  - **Comportamiento**: No ejecuta validación por sí mismo; solo almacena información que luego lee `RolesGuard`.
  - **Uso**: Normalmente se usa indirectamente a través de `@Auth(...roles)`, pero puede usarse de forma independiente.

- **`@GetUser()`** (`get-user.decorator.ts`):
  - **Función**: Extrae el usuario autenticado del `request` (puesto ahí por `JwtStrategy.validate`).
  - **Comportamiento**: Crea un parámetro personalizado que accede a `req.user`. Puede extraer un campo específico: `@GetUser('email')`.
  - **Uso**: En handlers protegidos para obtener el usuario sin manipular `req` manualmente.
  - **Ventaja**: Mantiene controladores limpios y facilita testing.

- **`@RawHeaders()`** (`raw-header.decorator.ts`):
  - **Función**: Extrae los headers HTTP "en crudo" como arreglo de strings para depuración o inspección.
  - **Comportamiento**: Accede a `req.rawHeaders`.
  - **Uso**: Depuración o cuando se necesita acceso directo a headers sin parseo.
  - **Nota**: Actualmente no se utiliza en el proyecto, pero está disponible para casos especiales.

#### Guards (`auth/guards/`)

- **`JwtAuthGuard`** (`jwt-auth.guard.ts`):
  - **Función**: Valida que la petición incluya un JWT válido antes de llegar al controlador.
  - **Comportamiento**: Extiende `AuthGuard('jwt')` de Passport, que busca la estrategia registrada con nombre `'jwt'` (tu `JwtStrategy`).
  - **Flujo**: Extrae el token del header `Authorization: Bearer <token>`, verifica la firma con `JWT_SECRET`, llama a `JwtStrategy.validate(payload)` y adjunta el `User` resultante a `req.user`.
  - **Si falla**: Retorna `401 Unauthorized` automáticamente.

- **`RolesGuard`** (`roles-guard.ts`):
  - **Función**: Verifica que el usuario autenticado tenga uno de los roles requeridos.
  - **Comportamiento**: 
    1. Lee la metadata de roles guardada por `@Roles(...)` o `@Auth(...roles)` usando `Reflector`.
    2. Compara `req.user.role` con los roles requeridos.
    3. Si no hay roles requeridos, permite el acceso.
    4. Si el usuario no tiene el rol requerido, lanza `403 Forbidden`.
  - **Dependencia**: Requiere que `JwtAuthGuard` haya ejecutado primero para que `req.user` exista.
  - **Ventaja**: Centraliza la lógica de autorización por roles.

#### Estrategias (`auth/strategies/`)

- **`JwtStrategy`** (`jwt.strategy.ts`):
  - **Función**: Define cómo Passport extrae y valida el JWT, y cómo se construye el objeto `User` en `req.user`.
  - **Configuración**: En el constructor, define el secreto (`JWT_SECRET`) y de dónde extraer el token (header `Authorization: Bearer`).
  - **Método `validate(payload)`**:
    - Recibe el payload decodificado del JWT (`{ id, email, role }`).
    - Busca el usuario en BD por `id`.
    - Valida que el usuario exista y esté activo (`isActive === true`).
    - Retorna el `User` completo (sin password) que Passport adjunta a `req.user`.
  - **Registro**: Se registra automáticamente como estrategia `'jwt'` al extender `PassportStrategy(Strategy)`.

#### Servicios (`auth/services/`)

- **`AuthService`** (`auth.service.ts`):
  - **Función**: Contiene la lógica de negocio para registro, login y generación de tokens.
  - **Métodos principales**:
    - `create(dto)`: Registra un nuevo usuario. Hashea la contraseña con `bcrypt`, crea la entidad, guarda en BD y retorna el usuario sin password.
    - `login(dto)`: Valida email (normalizado) y contraseña con `bcrypt`, verifica `isActive`, y retorna el usuario con un token JWT generado.
    - `check(user)`: Regenera un token para un usuario ya autenticado (útil para renovar tokens).
    - `encryptPassword(password)`: Hashea contraseñas usando `bcrypt` con rondas configurables.
  - **Inyección**: Utiliza `@InjectRepository(User)` para acceso a BD y `JwtService` para firmar tokens.

#### Interfaces (`auth/interfaces/`)

- **`Jwt`** (`jwt.interface.ts`):
  - **Función**: Define la estructura del payload del JWT (`{ id, email, role }`).
  - **Uso**: Tipo usado al firmar tokens y al validar en `JwtStrategy.validate`.

#### DTOs (`auth/dto/`)

- **`CreateUserDto`**: Define la estructura y validaciones para registro de usuarios.
- **`LoginDto`**: Define la estructura y validaciones para el endpoint de login.

### Módulo Users

Responsabilidad general: Gestionar consultas y operaciones sobre usuarios (CRUD limitado).

- **`UsersService`**: Lógica de negocio para buscar, actualizar y eliminar usuarios.
- **`UsersController`**: Expone endpoints protegidos (normalmente requiere `superadmin`).
- **`User` entity** (`users/entities/`): Entidad TypeORM con relaciones a `Project` y `Task`.

### Módulo Projects

Responsabilidad general: Gestionar proyectos con control de propietario y permisos.

- **`ProjectsService`**: CRUD con reglas: usuarios normales solo acceden a sus proyectos; `superadmin` accede a todos.
- **`ProjectsController`**: Endpoints protegidos que verifican propiedad antes de operaciones.
- **`Project` entity**: Relación `ManyToOne` con `User` (owner) y `OneToMany` con `Task`.

### Módulo Tasks

Responsabilidad general: Gestionar tareas asociadas a proyectos, con control de permisos.

- **`TasksService`**: CRUD con validación de que el proyecto pertenezca al usuario (o `superadmin`).
- **`TasksController`**: Endpoints protegidos y consulta por proyecto (`GET /tasks/project/:projectId`).
- **`Task` entity**: Relación `ManyToOne` con `Project` (con `onDelete: 'CASCADE'`) y opcionalmente con `User` asignado.

### Módulo Seed

Responsabilidad general: Limpiar y poblar la base de datos con datos semilla para desarrollo/testing.

- **`SeedService`**: Ejecuta `TRUNCATE ... CASCADE` en tablas y repuebla con usuarios, proyectos y tareas de ejemplo.
- **`SeedController`**: Expone endpoint `GET /seed` (solo para desarrollo).

### Infraestructura

- **`main.ts`**:
  - **Función**: Bootstrap de la aplicación NestJS.
  - **Configuraciones**:
    - Prefijo global `api/v1` para todos los endpoints.
    - `ValidationPipe` global con `whitelist`, `forbidNonWhitelisted` y `transform`.
    - Swagger en `/docs` con configuración Bearer JWT.
  
- **`app.module.ts`**:
  - **Función**: Módulo raíz que importa todos los módulos de funcionalidad.
  - **Configuraciones**:
    - `ConfigModule` global para variables de entorno.
    - `TypeOrmModule` con conexión a PostgreSQL y `autoLoadEntities: true`.

---

## Persistencia de datos (TypeORM)

- Entidades:
  - `User` (roles: `superadmin` | `usuario`, `isActive`, hooks para normalizar email).
  - `Project` (owner `userId`, relación con `User` y `Task`).
  - `Task` (relación con `Project` y opcionalmente con `User` asignado).
- Repositorios inyectados con `@InjectRepository`.
- Relaciones y cascadas:
  - `Task → Project` con `onDelete: 'CASCADE'`. Al eliminar un proyecto, sus tareas se eliminan automáticamente.
- Seed:
  - `TRUNCATE ... CASCADE` de `task`, `project`, `user` y repoblado con datos semilla.
- Cifrado: contraseñas con `bcrypt`; rondas en `BCRYPT_SALT_ROUNDS`.

---

## Endpoints

Base: `http://localhost:3000/api/v1`

### Auth

- POST `/auth/login`
  - Body: `{ email: string, password: string }`
  - 200/201: `{ id, email, role, fullname, isActive, token }`
  - 404 si email no existe; 401 si inactivo o contraseña incorrecta.

- GET `/auth/check` (protegido)
  - Header: `Authorization: Bearer <token>`
  - 200: `{ user, token }`

- POST `/auth/register` (si está expuesto)
  - Body: `{ email, password, fullname, role? }`
  - 201: `{ id, email, fullname, role, isActive }`

### Seed

- GET `/seed`
  - 200: `{ message: 'Seed ejecutado exitosamente', data: { users, projects } }`
  - Limpia y repuebla la base.

### Users

- GET `/users` (protegido; normalmente `superadmin`)
  - 200: `User[]`

- GET `/users/:id` (protegido)
  - 200: `User`; 404 si no existe.

- PATCH `/users/:id` (protegido)
  - Body: campos editables (p. ej., `{ fullname }`)
  - 200: `User` actualizado.

- DELETE `/users/:id` (protegido)
  - 200/204: sin cuerpo.

### Projects

- POST `/projects` (protegido)
  - Body: `{ title, description?, status? }`
  - 201: `Project` (asigna `userId` del autenticado).

- GET `/projects` (protegido)
  - 200: `superadmin` → todos; usuario → propios.

- GET `/projects/:id` (protegido)
  - 200: `Project` si permiso; 403/404 según corresponda.

- PATCH `/projects/:id` (protegido)
  - Body: `{ title?, description?, status? }`
  - 200: `Project` actualizado; 403 si no es dueño.

- DELETE `/projects/:id` (protegido)
  - 200/204: elimina el proyecto. Con `onDelete: 'CASCADE'` no falla por FK.

### Tasks

- POST `/tasks` (protegido)
  - Body: `{ title, description?, status?, priority?, dueDate?, projectId }`
  - 201: `Task` si `projectId` existe y es del usuario (o `superadmin`).

- GET `/tasks` (protegido)
  - 200: `superadmin` → todas; usuario → de sus proyectos.

- GET `/tasks/:id` (protegido)
  - 200: `Task` si permiso; 403/404 según corresponda.

- PATCH `/tasks/:id` (protegido)
  - Body: campos editables
  - 200: `Task` actualizada; 403 si no es dueño.

- DELETE `/tasks/:id` (protegido)
  - 200/204: elimina la tarea; 403 si no es dueño.

- GET `/tasks/project/:projectId` (protegido)
  - 200: tareas del proyecto si permiso; 403/404 según corresponda.

---

## Validación y documentación

- `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
- DTOs con `class-validator`.
- Swagger (`/docs`): `@ApiTags`, `@ApiBearerAuth`, `@ApiBody`, `@ApiResponse`, `@ApiParam`.

---

## Pruebas y cobertura

- Unitarias con Jest en `test/**`:
  - Servicios: `auth`, `users`, `projects`, `tasks`, `seed`.
  - Controladores: auth, users, projects, tasks.
  - Guards/Estrategias: `roles-guard`, `jwt.strategy`.
  - Bootstrap: `main.spec.ts` (mocks Nest/Swagger).
- Cobertura (último run):
  - Global líneas ≈ 94% (umbral >80% cumplido).
  - `auth.service.ts` ≈ 95% líneas; cubre 23505 y error genérico, login normalizado, hashing.
- Comandos: `npm run test`, `npm run test:cov` (reporte en `coverage/`).
- Umbral opcional en `package.json → jest.coverageThreshold`.

---

## Seed y Postman

- Seed:
  - GET `/api/v1/seed` para resetear y poblar datos (3 usuarios, 4 proyectos, 8 tareas).
- Colección Postman (sugerida):
  - Carpeta Auth: logins de admin, user1, user2.
  - CRUD Users (admin), Projects y Tasks.
  - Carpeta Permissions: casos 403 (operar recursos ajenos) y overrides de `superadmin`.

---

## Notas y buenas prácticas

- No exponer `/seed` en producción; usar migraciones.
- Mantener secretos y rondas de `bcrypt` en variables de entorno.
- Permisos centralizados en servicios y cascada de FK para consistencia.

---

## Resumen

- API con autenticación JWT, autorización por roles y control de propietario.
- CRUD completo de usuarios, proyectos y tareas con validación exhaustiva.
- Persistencia sólida con TypeORM y `onDelete: 'CASCADE'` en tareas.
- Documentación Swagger y pruebas con cobertura >90%.


