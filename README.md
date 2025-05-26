# Gestor Financiero Web

Este proyecto es una aplicación web integral para la gestión de finanzas personales. Permite a los usuarios rastrear ingresos y gastos, crear presupuestos, proyectar el flujo de caja y administrar sus datos financieros de forma segura.

## Funcionalidades Principales

*   **Autenticación de Usuarios:** Inicio de sesión seguro mediante correo electrónico y contraseña.
*   **Gestión de Ingresos y Gastos:**
    *   Registro detallado de ingresos y gastos.
    *   Soporte para diversas frecuencias (único, mensual, semanal, quincenal).
    *   Categorización de gastos (Fijos y Variables) y posibilidad de añadir/eliminar categorías.
    *   Opción de marcar ingresos como reembolsos y vincularlos a categorías de gasto específicas.
*   **Presupuestos:**
    *   Definición de presupuestos mensuales para diferentes categorías de gastos.
    *   Visualización de un resumen comparativo entre el presupuesto y los gastos reales del mes.
*   **Flujo de Caja:**
    *   Cálculo y presentación de una tabla detallada con la proyección del flujo de caja.
    *   Visualización gráfica del flujo de caja (saldo final, ingresos, gastos, flujo neto) mediante Chart.js.
    *   Ajuste de la periodicidad del análisis (mensual o semanal) y duración.
*   **Gestión de Datos con Firebase:**
    *   Almacenamiento de datos financieros en Firebase Realtime Database.
    *   Sistema de versiones (backups) para los datos, permitiendo cargar estados anteriores o el más reciente.
    *   Registro detallado de cambios (log) cada vez que se guarda una nueva versión.
*   **Seguimiento de Pagos:** Funcionalidad para marcar gastos programados como pagados en un período específico (mensual/semanal).
*   **Baby Steps de Dave Ramsey:** Herramienta para seguir y marcar el progreso en los "Baby Steps" para la libertad financiera.
*   **Recordatorios:** Lista de tareas pendientes y completadas para gestionar recordatorios financieros.
*   **Tasa de Cambio USD/CLP:** Obtención automática de la tasa de cambio USD/CLP desde CoinGecko para fines informativos.
*   **Validación de Datos:** Mecanismos para asegurar la integridad de los datos, como la validación de caracteres no permitidos en claves de Firebase.

## Stack Tecnológico

*   **Frontend:** HTML5, CSS3, JavaScript (ES6+)
*   **Base de Datos:** Firebase Realtime Database
*   **Autenticación:** Firebase Authentication
*   **Gráficos:** Chart.js
*   **APIs Externas:** CoinGecko API (para la tasa de cambio USD/CLP)

## Estructura del Proyecto

El proyecto se organiza de la siguiente manera:

*   `index.html`: Es el archivo HTML principal que estructura la página web. Contiene todos los elementos de la interfaz de usuario.
*   `style.css`: Contiene todas las reglas de CSS para dar estilo a la aplicación, incluyendo el diseño responsive.
*   `app.js`: Es el corazón de la aplicación. Este archivo JavaScript maneja toda la lógica del frontend, incluyendo:
    *   Interacción con el DOM (manipulación de elementos HTML).
    *   Gestión de eventos (clics de botones, cambios en formularios).
    *   Lógica de autenticación de usuarios.
    *   Comunicación con Firebase (lectura y escritura de datos).
    *   Cálculos financieros (flujo de caja, presupuestos).
    *   Renderizado dinámico de tablas y otros componentes.
    *   Integración con Chart.js para los gráficos.
    *   Llamadas a la API de CoinGecko.
*   `config.js`: Almacena la configuración de Firebase necesaria para conectar la aplicación con los servicios de Firebase (apiKey, authDomain, databaseURL, etc.). Es crucial configurar este archivo correctamente. Si bien la `apiKey` para aplicaciones web de Firebase es pública y se utiliza para identificar tu proyecto Firebase, otros detalles de configuración (como las credenciales de servicio si se usaran en un backend, aunque no es el caso aquí) sí son sensibles. La seguridad de los datos de usuario en el frontend se gestiona principalmente mediante las Reglas de Seguridad de Firebase.
*   `README.md`: Este archivo, con la descripción del proyecto.

## Configuración y Uso

Para ejecutar esta aplicación localmente, sigue estos pasos:

1.  **Clonar el Repositorio (o descargar los archivos):**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd <NOMBRE_DEL_DIRECTORIO>
    ```
    Si has descargado los archivos como un ZIP, extráelos en una carpeta.

2.  **Configurar Firebase:**
    *   Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
    *   En la configuración de tu proyecto Firebase, añade una nueva aplicación web.
    *   Copia el objeto de configuración de Firebase (que incluye `apiKey`, `authDomain`, `databaseURL`, etc.).
    *   Pega esta configuración en el archivo `config.js`, reemplazando el objeto `firebaseConfig` existente.
    *   Habilita **Firebase Authentication** con el proveedor "Correo electrónico/Contraseña".
    *   Configura **Firebase Realtime Database**. Puedes empezar en modo de prueba o definir reglas de seguridad adecuadas. La estructura de datos esperada por la aplicación se crea dinámicamente bajo rutas de usuario específicas (ver sección "Gestión de Datos").

3.  **Abrir la Aplicación:**
    *   Simplemente abre el archivo `index.html` en tu navegador web preferido.

4.  **Uso:**
    *   **Registro/Inicio de Sesión:** La primera vez, necesitarás que un usuario sea creado en Firebase Authentication, o modificar el código para permitir el registro si la aplicación no lo incluye directamente en la UI (el código actual se enfoca en el login, asumiendo que los usuarios ya existen o son gestionados por un administrador en Firebase). El código actual mapea UIDs de Firebase a sub-rutas específicas (`SS`, `JOSE`, `PAPAS`, etc.) en la base de datos. Deberás ajustar la función `getUserDataRef` en `app.js` para que coincida con los UIDs de tus usuarios y las rutas deseadas, o generalizarla si es necesario.
    *   **Navegación:** Utiliza las pestañas para acceder a las diferentes funcionalidades (Gastos, Ingresos, Flujo de Caja, etc.).
    *   **Guardar Cambios:** Cualquier modificación en los datos (ingresos, gastos, ajustes) se puede guardar como una nueva versión. Esto crea un backup con fecha y hora en Firebase.

## Critical: Firebase Security Rules

La seguridad de tus datos en Firebase Realtime Database es gestionada **principalmente** a través de las Reglas de Seguridad de Firebase. Es crucial entender y configurar estas reglas correctamente.

**Advertencia Importante:** Nunca utilices la configuración de "modo de prueba" de Firebase (`{ "rules": { ".read": true, ".write": true } }`) para aplicaciones en producción o que manejen datos sensibles. Esto permitiría a cualquier persona leer o escribir en tu base de datos, comprometiendo la seguridad de la información.

Las reglas deben estructurarse para garantizar que los usuarios solo puedan acceder a sus propios datos. Dado el diseño actual de esta aplicación, donde `getUserDataRef` en `app.js` mapea UIDs de Firebase a rutas específicas como "SS", "JOSE", o "PAPAS", la implementación de reglas de seguridad requiere una consideración cuidadosa.

A continuación, se muestra un ejemplo conceptual. Si los datos de cada usuario estuvieran almacenados directamente bajo su UID de Firebase, las reglas podrían ser más directas:

```json
{
  "rules": {
    "users": {
      "$uid": { // Asume que los datos del usuario están en /users/$uid
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        "backups": {
          // Permite a los usuarios leer sus propios backups
          ".read": "auth != null && auth.uid === $uid",
          // Solo permite crear nuevos backups (los usuarios no deberían modificar los existentes arbitrariamente)
          // Esta regla podría necesitar ser más granular (ej. usando .validate)
          ".write": "auth != null && auth.uid === $uid && (!data.exists() || newData.exists())"
        }
      }
      // Podrías tener otras reglas aquí para rutas específicas como "SS", "JOSE"
      // si necesitas que varios UIDs autenticados accedan a la misma ruta de datos.
      // Esto requeriría una lógica más compleja, potencialmente almacenando un mapeo de UIDs permitidos
      // para cada ruta (ej. /users/SS_access_uids/) y referenciándolo en las reglas.
      // Ejemplo (MUY SIMPLIFICADO y requiere una estructura de datos adicional):
      // "SS": {
      //   ".read": "root.child('user_mappings/SS_allowed_uids/' + auth.uid).exists()",
      //   ".write": "root.child('user_mappings/SS_allowed_uids/' + auth.uid).exists()"
      // }
    }
    // Otras reglas para datos públicos, acceso de administrador, etc.
  }
}
```

**Importante:** La función `getUserDataRef` en `app.js` es una conveniencia del lado del cliente para determinar a qué ruta de datos apuntar. **No proporciona seguridad por sí misma.** Si las Reglas de Seguridad de Firebase no están configuradas correctamente, un usuario malintencionado podría eludir la lógica del cliente y acceder o modificar datos no autorizados. La seguridad debe ser impuesta por las Reglas de Seguridad de Firebase en los servidores de Firebase.

### Consideraciones Adicionales para `getUserDataRef` y Seguridad de Rutas

El actual mapeo UID-a-ruta implementado en `getUserDataRef` ocurre completamente del lado del cliente. Esto presenta las siguientes consideraciones de seguridad y mantenimiento:

*   **Seguridad de Acceso a Rutas:** Si las Reglas de Seguridad de Firebase no son suficientemente estrictas para validar esta lógica también en el servidor (es decir, asegurar que el UID autenticado `auth.uid` realmente tiene permiso para acceder a la ruta específica como `/users/SS/`), un usuario con conocimientos técnicos podría modificar el código del cliente para intentar acceder a rutas de datos de otros usuarios. Confiar únicamente en el mapeo del cliente para la seguridad de las rutas es una forma de "seguridad por oscuridad".
*   **Recomendación para Robustez:** Para una seguridad y mantenibilidad robustas, se recomienda que la lógica de mapeo UID-a-ruta (o cualquier lógica que determine el acceso a subconjuntos de datos) se aplique y valide directamente dentro de las Reglas de Seguridad de Firebase. Alternativamente, para escenarios más complejos, un mecanismo de backend (como Firebase Cloud Functions) podría verificar los derechos de acceso de un usuario a una ruta específica basándose en su UID antes de permitir la operación.
*   **Desafío de Mantenimiento:** El actual mapeo en el cliente representa un desafío de mantenimiento, ya que agregar nuevos usuarios o perfiles de datos (ej. "JUANITO") requiere modificaciones directas en el código de `app.js` y un nuevo despliegue de la aplicación.

Para una guía detallada y completa sobre cómo estructurar y probar tus reglas de seguridad, consulta la [documentación oficial de Firebase sobre Reglas de Seguridad](https://firebase.google.com/docs/database/security).

### API Key Security and Firebase App Check

Es importante entender cómo funciona la seguridad de las `apiKey` de Firebase en el contexto de aplicaciones web:

*   **Las API Keys de Web No Son Secretas:** La `apiKey` en tu `firebaseConfig` (visible en el código del lado del cliente) no es un secreto. Está diseñada para identificar tu proyecto Firebase ante los servidores de Google, no para autenticar usuarios ni proteger datos por sí misma. Cualquier persona que inspeccione el código de tu aplicación web podrá verla.

*   **La Protección de Datos Recae en las Reglas de Seguridad:** Como se mencionó anteriormente, la verdadera protección de tus datos en Firebase Realtime Database, Firestore y Cloud Storage la proporcionan las **Reglas de Seguridad**. Estas reglas definen quién tiene acceso a qué datos y bajo qué condiciones, independientemente de quién tenga la `apiKey`.

*   **Recomendación: Firebase App Check:** Para añadir una capa adicional de seguridad, se recomienda encarecidamente implementar **Firebase App Check**. App Check ayuda a verificar que las solicitudes a tus servicios de Firebase (como Realtime Database, Firestore, Storage y Authentication) provienen de tu aplicación legítima y no de clientes no autorizados (por ejemplo, scripts maliciosos o aplicaciones clonadas que intentan usar tus credenciales de proyecto). Funciona con varios proveedores de atestación (como reCAPTCHA v3, DeviceCheck o App Attest) para verificar la autenticidad de la aplicación.

*   **App Check No Reemplaza las Reglas de Seguridad:** Aunque Firebase App Check es una herramienta de seguridad valiosa, no reemplaza la necesidad de tener Reglas de Seguridad sólidas y bien configuradas. App Check protege contra el abuso de tus recursos de backend por parte de clientes no autenticados/no verificados, mientras que las Reglas de Seguridad protegen tus datos del acceso no autorizado por parte de usuarios autenticados (o no autenticados, según tus reglas). Ambas son cruciales para una estrategia de seguridad integral.

Puedes encontrar más información sobre Firebase App Check en la [documentación oficial](https://firebase.google.com/docs/app-check).

### Prevención de Cross-Site Scripting (XSS) del Lado del Cliente

Otro aspecto importante de la seguridad en aplicaciones web es la prevención de Cross-Site Scripting (XSS). Esto es particularmente relevante cuando se muestra contenido dinámico en la página.

*   **Codificación de Salida (Output Encoding):** Cuando se renderizan datos provenientes de entradas del usuario o fuentes externas (como Firebase) en el DOM HTML, es crucial tratar estos datos como texto plano y no como HTML ejecutable. Si los datos se insertan directamente usando `innerHTML` sin una sanitización adecuada, y contienen scripts maliciosos, estos podrían ser ejecutados por el navegador.
*   **Uso de `textContent`:** La aplicación `app.js` utiliza predominantemente la propiedad `element.textContent = value;` para insertar datos dinámicos en los elementos HTML. Esta es una práctica recomendada porque `textContent` interpreta el valor asignado como texto puro; cualquier etiqueta HTML o script dentro del valor será renderizada como texto literal y no ejecutada. Esto ayuda a mitigar significativamente el riesgo de XSS.
*   **Atributos HTML:** Al establecer atributos HTML dinámicamente (ej. `element.setAttribute('title', value)`), también es importante asegurarse de que los valores no contengan código malicioso que pueda romper el contexto del atributo o ejecutar scripts. La validación de entradas (como la función `isFirebaseKeySafe` para nombres que podrían usarse en atributos o como claves) es una medida complementaria.

Siempre se deben seguir las mejores prácticas de seguridad para el desarrollo web, incluyendo la validación de entradas y la codificación de salidas, para proteger la aplicación y a sus usuarios.

## Gestión de Datos

La aplicación utiliza Firebase Realtime Database para almacenar todos los datos financieros.

*   **Estructura de Datos Específica por Usuario:**
    *   Los datos de cada "grupo" o "perfil" de usuario (ej. "SS", "JOSE", "PAPAS") se almacenan bajo una ruta específica dentro de `/users/`. Por ejemplo, los datos del perfil "SS" estarían en `/users/SS/`.
    *   La función `getUserDataRef` en `app.js` contiene un mapeo de UIDs de Firebase a estas sub-rutas (ej., `POurDKWezHXAsAQ9v86zT2KIHNH2` se mapea a `SS`). Esto significa que diferentes usuarios de Firebase pueden ser dirigidos a la misma conjunto de datos si sus UIDs están mapeados a la misma sub-ruta. Esta lógica debe ser adaptada según las necesidades específicas de gestión de acceso. Las consideraciones de seguridad y mantenimiento de este enfoque se detallan en la sección "Critical: Firebase Security Rules".

*   **Versiones (Backups):**
    *   Cada vez que se guardan los cambios, la aplicación crea un nuevo "backup" (una instantánea completa de los datos) bajo la ruta `/users/<USER_SUBPATH>/backups/backup_YYYYMMDDTHHMMSS`.
    *   Esto permite a los usuarios cargar versiones anteriores de sus datos o la más reciente disponible.

*   **Log de Cambios:**
    *   Junto con cada versión guardada, se actualiza un log de cambios (`change_log`) que reside dentro del objeto de datos del backup.
    *   Este log registra qué usuario (basado en el mapeo de email) guardó la versión, cuándo, y un resumen detallado de las modificaciones realizadas en comparación con la versión anterior.

## Notas Adicionales

*   **Tasa de Cambio USD/CLP:** La aplicación obtiene la tasa de cambio entre USD y CLP de forma automática desde la API de CoinGecko. Esta tasa se muestra en la pestaña de "Ajustes" y es solo para fines informativos, no se almacena persistente con los datos del usuario en Firebase.
*   **Validación de Nombres/Claves:** Para asegurar la compatibilidad con Firebase Realtime Database, los nombres de ingresos, gastos y categorías no deben contener caracteres prohibidos por Firebase para las claves (ej: `.`, `$`, `#`, `[`, `]`, `/`). La aplicación incluye validaciones para prevenir el guardado de datos con estos caracteres en nombres que podrían ser usados como claves.
