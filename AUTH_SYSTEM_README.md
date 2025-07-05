# Sistema de Autenticación con Zustand, Zod y localStorage

Este sistema proporciona autenticación completa usando:
- **Zustand/vanilla** para el manejo de estado (sin dependencias de React)
- **Zod** para validación de esquemas
- **localStorage** para persistencia
- **Funciones utilitarias** para uso simple y directo

## 📁 Estructura del Sistema

```
src/
├── store/
│   ├── authStore.ts      # Store principal de Zustand/vanilla
│   └── authUtils.ts      # Funciones utilitarias para autenticación
├── schema/
│   ├── authCredential.schema.ts  # Esquema para credenciales de login
│   └── user.schema.ts           # Esquema para datos del usuario
├── components/
│   └── navigation/
│       └── AuthNavigation.astro # Componente de navegación con auth
└── pages/
    ├── auth/
    │   └── login.astro          # Página de login
    └── onboarding/level.astro   # Página protegida completa
```

## 🔧 Configuración

### 1. Esquemas de Zod

**authCredential.schema.ts**
```typescript
import { z } from "zod";

export const authCredentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
}).strict();

export type AuthCredential = z.infer<typeof authCredentialSchema>;
```

**user.schema.ts**
```typescript
import { z } from "zod";

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

export type User = z.infer<typeof userSchema>;
```

### 2. Store de Zustand/vanilla

El store principal (`authStore.ts`) proporciona:
- ✅ Almacenamiento en localStorage
- ✅ Validación con Zod
- ✅ Manejo de errores
- ✅ Funciones de login/logout
- ✅ Inicialización automática
- ✅ Compatible con SSR/SSG (sin React)

### 3. Funciones Utilitarias

Las funciones utilitarias (`authUtils.ts`) proporcionan acceso directo:

```typescript
// Funciones principales
import { 
  initAuth,           // Inicializar autenticación
  isLoggedIn,         // Verificar si está autenticado
  signIn,             // Iniciar sesión
  signOut,            // Cerrar sesión
  requireAuth,        // Verificar auth y redirigir si es necesario
  
  // Obtener datos del usuario
  getCurrentUser,     // Obtener usuario completo
  getUserId,          // Obtener ID del usuario
  getUserName,        // Obtener nombre del usuario
  getUserEmail,       // Obtener email del usuario
  getUserInfo,        // Obtener resumen del usuario
  
  // Funciones avanzadas
  updateUser,         // Actualizar datos del usuario
  subscribeToAuthChanges,  // Suscribirse a cambios
  hasStoredAuth,      // Verificar si hay datos guardados
  getStoredAuthData,  // Obtener datos del localStorage
  clearAuth,          // Limpiar todo
} from '../store/authUtils';
```

## 🚀 Uso del Sistema

### 1. Inicializar autenticación

```typescript
// En cualquier componente o página
import { initAuth } from '../store/authUtils';

// Inicializar al cargar la página
initAuth();
```

### 2. Implementar Login

```typescript
// En un formulario de login
import { signIn } from '../store/authUtils';

const handleLogin = async (formData: FormData) => {
  const credentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  try {
    await signIn(credentials);
    // Redirigir al onboarding
    window.location.href = '/onboarding/level';
  } catch (error) {
    console.error('Error de login:', error);
    // Mostrar mensaje de error
  }
};
```

### 3. Proteger Páginas (Método Simple)

```typescript
// Método más fácil - verificación automática con redirección
import { requireAuth, getUserName } from '../store/authUtils';

// Verificar y redirigir automáticamente si no está autenticado
if (requireAuth()) {
  // Usuario autenticado - mostrar contenido
  const userName = getUserName();
  console.log(`Bienvenido, ${userName}!`);
}
```

### 4. Proteger Páginas (Método Manual)

```typescript
// Control manual del flujo
import { initAuth, isLoggedIn } from '../store/authUtils';

initAuth();

if (!isLoggedIn()) {
  // Redirigir a login
  window.location.href = '/auth/login';
} else {
  // Mostrar contenido protegido
}
```

### 5. Mostrar Información del Usuario

```typescript
// Obtener información específica
import { getUserName, getUserEmail, getUserInfo } from '../store/authUtils';

const name = getUserName();
const email = getUserEmail();

// O obtener todo junto
const userInfo = getUserInfo();
if (userInfo) {
  console.log(`${userInfo.name} (${userInfo.email})`);
}
```

### 6. Logout

```typescript
// Cerrar sesión
import { signOut } from '../store/authUtils';

const handleLogout = () => {
  signOut();
  window.location.href = '/auth/login';
};
```

## 📝 Uso en Páginas

### Página Protegida

```astro
---
// onboarding/level.astro
import Layout from "../../layouts/Layout.astro";
---

<Layout title="Onboarding - Level">
  <div id="content" class="hidden">
    <h1>Bienvenido, <span id="userName"></span>!</h1>
    <button id="logoutBtn">Logout</button>
  </div>
  
  <div id="loading">Verificando acceso...</div>
</Layout>

<script>
  import { requireAuth, getUserName, signOut } from '../store/authUtils';
  
  const content = document.getElementById('content');
  const loading = document.getElementById('loading');
  const userName = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Verificar autenticación (redirige automáticamente si no está autenticado)
  setTimeout(() => {
    if (requireAuth()) {
      // Usuario autenticado
      userName.textContent = getUserName();
      loading.classList.add('hidden');
      content.classList.remove('hidden');
    }
  }, 500);
  
  // Manejar logout
  logoutBtn.addEventListener('click', () => {
    signOut();
    window.location.href = '/auth/login';
  });
</script>
```

### Login Component

```astro
---
// login.astro
import AuthLayout from "../../layouts/AuthLayout.astro";
---

<AuthLayout>
  <form id="loginForm">
    <input type="email" name="email" required />
    <input type="password" name="password" required />
    <button type="submit">Login</button>
  </form>
</AuthLayout>

<script>
  import { signIn, isLoggedIn } from '../../store/authUtils';
  
  const form = document.getElementById('loginForm');
  
  // Redirigir si ya está autenticado
  if (isLoggedIn()) {
    window.location.href = '/onboarding/level';
  }
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    try {
      await signIn({
        email: formData.get('email'),
        password: formData.get('password'),
      });
      window.location.href = '/onboarding/level';
    } catch (error) {
      alert('Error: ' + error.message);
    }
  });
</script>
```

## 🛡️ Características de Seguridad

1. **Validación con Zod**: Todos los datos se validan antes de ser almacenados
2. **Manejo de Errores**: Datos corruptos se limpian automáticamente
3. **Verificación de Tipos**: TypeScript asegura tipos correctos
4. **Limpieza Automática**: Datos inválidos se eliminan del localStorage
5. **Sin dependencias de React**: Funciona completamente en entornos vanilla

## 🔄 Flujo de Autenticación

1. **Inicialización**: `initAuth()` verifica localStorage
2. **Login**: `signIn()` valida credenciales y guarda usuario
3. **Persistencia**: Datos se guardan en localStorage automáticamente
4. **Verificación**: `requireAuth()` o `isLoggedIn()` verifican estado
5. **Logout**: `signOut()` limpia localStorage y estado

## 📊 Datos en localStorage

Los datos se guardan con la clave `auth-user` y tienen esta estructura:

```json
{
  "id": "uuid-here",
  "email": "usuario@test.com",
  "name": "Usuario Test"
}
```

## 🎯 Funciones Utilitarias Disponibles

### Básicas
- `initAuth()` - Inicializar autenticación
- `isLoggedIn()` - Verificar si está autenticado
- `signIn(credentials)` - Iniciar sesión
- `signOut()` - Cerrar sesión
- `requireAuth(redirectUrl?)` - Verificar auth y redirigir

### Información del Usuario
- `getCurrentUser()` - Obtener usuario completo
- `getUserId()` - Obtener ID
- `getUserName()` - Obtener nombre
- `getUserEmail()` - Obtener email
- `getUserInfo()` - Obtener resumen

### Avanzadas
- `updateUser(user)` - Actualizar datos
- `subscribeToAuthChanges(callback)` - Suscribirse a cambios
- `hasStoredAuth()` - Verificar si hay datos guardados
- `getStoredAuthData()` - Obtener datos del localStorage (debug)
- `clearAuth()` - Limpiar todo completamente

## 🔍 Debugging

Para inspeccionar el estado de autenticación:

```javascript
// En la consola del navegador
import { getStoredAuthData, getUserInfo } from './store/authUtils';

console.log('Datos en localStorage:', getStoredAuthData());
console.log('Info del usuario:', getUserInfo());
```

## 🚀 Ventajas del Sistema de Funciones Utilitarias

1. **Simplicidad**: Funciones directas sin complejidad de hooks
2. **Flexibilidad**: Úsalas donde necesites, como necesites
3. **Rendimiento**: Sin overhead de React o sistemas complejos
4. **Compatibilidad**: Funciona en cualquier entorno JavaScript/TypeScript
5. **Mantenibilidad**: Código más claro y fácil de entender

Este sistema proporciona una base sólida para la autenticación en aplicaciones Astro con TypeScript, usando las mejores prácticas de validación y manejo de estado sin dependencias innecesarias. 