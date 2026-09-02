# Documento de Definición del Proyecto

## Título del Proyecto y Resumen General

- Nombre del Proyecto: Aplicación Web de Videojuego Roguelike Interactivo por Turnos con Eventos Procedurales.

- Resumen: Aplicación web interactiva donde el jugador selecciona una clase de personaje e ingresa a una mazmorra procedural con bifurcación de caminos (2-3 puertas). Cada habitación presenta un evento aleatorio (combates, mercaderes, fuentes de deseos, estatuas sagradas, salas de ayuda, salas de tesoros o jefes). Al finalizar cada partida (por derrota o retiro), los resultados y las estadísticas detalladas paso a paso se registran en una base de datos centralizada, alimentando una tabla de clasificación global (Leaderboard) y un historial de usuario.

## Objetivo Principal del Sistema

Desarrollar una aplicación web de videojuego roguelike por turnos respaldada por un sistema cliente-servidor dockerizado, que permita a los usuarios jugar partidas dinámicas, guardar sus progresos/estadísticas detalladas y comparar sus resultados mediante una tabla de posiciones global interactiva.

## Límites del Sistema (Límites y Alcance General)

### Dentro del Alcance (In-Scope)

- Autenticación y Registro: Sistema de registro e inicio de sesión de usuarios con gestión de sesiones mediante tokens JWT.
- Selección de Clase: Cuatro clases jugables (Caballero, Bárbaro, Pícaro y Mago) con atributos y habilidades únicas.
- Generación Procedural y Bifurcación: Sistema de navegación por habitaciones con selección de 2 a 3 puertas con iconos descriptivos.
- Eventos de Habitaciones:
  - Combates normales, de élite y jefes finales (con IA básica por probabilidades y ataques especiales).
  - Mercader común y Mercader de lujo con inventario limitado de pociones y reliquias únicas.
  - Fuente de los deseos, Estatuas sagradas por clase, Salas de ayuda (hoguera, cabaña, estanque, comedor), Salas del tesoro y Salas misteriosas.
- Gestión de Inventario y Atributos: Sistema de monedas, pociones de consumo inmediato o por batalla, y reliquias de efecto permanente o condicional.
- Tabla de Posiciones (Leaderboard): Top 10 global y Top 10 del usuario con desglose detallado de partida.
- Línea de Tiempo Interactiva: Modal/ventana emergente con el desglose habitación por habitación y resumen estadístico de la partida.
- Diversidad de Frameworks:
  - Dos implementaciones de Backend funcionales con la misma API REST.
  - Dos implementaciones de Frontend funcionales con la misma interfaz y flujos.
- Infraestructura Dockerizada: Base de datos relacional en contenedor Docker con volumen persistente y script de docker-compose.

### Fuera del Alcance (Out-of-Scope)

- Aplicaciones móviles nativas (iOS/Android).
- Gráficos 3D o motores pesados como Unity/Unreal Engine (el juego será renderizado en web 2D/UI basada en componentes web).
- Modo multijugador en tiempo real o PvP.
- Sistema de chat en vivo o notificaciones push externas.
- Sonido/Música procedural avanzado (se limita a efectos o música opcional simple en frontend).

## Alcances Funcionales

### Gestión de Usuarios y Autenticación
- Registro de usuario (nombre de usuario, email, contraseña).
- Inicio de sesión con autenticación JWT y persistencia de sesión.
- Perfil de usuario con consulta de su historial de partidas.
### Bucle de Juego (Gameplay Loop)
- Inicio de Partida (Run): Elección entre las clases Caballero, Bárbaro, Pícaro y Mago.
- Bifurcación de Caminos: Tras superar una habitación, se generan de 2 a 3 puertas con iconos descriptivos para que el jugador elija su siguiente evento.
- Sistema de Combate por Turnos:
  - Turno del jugador: Atacar, usar hechizo (solo Mago usando Maná), o consumir poción/objeto.
  - Turno del enemigo: Ataque normal o activación de habilidad especial basada en porcentajes de probabilidad.
  - Tipos de Enemigos: Bajo nivel, Medio nivel, Alto nivel y Jefes con mecánicas y recompensas específicas.
- Mercaderes y Economía:
  - Compra de pociones de salud, daño, evasión, defensa, bloqueo o escape con monedas.
  - Compra de reliquias únicas por partida.
  - Descuentos y efectos especiales según la clase o reliquias equipadas.
- Eventos Especiales:
  - Fuente de los deseos: 5% de probabilidad de buff permanente por moneda.
  - Estatua sagrada: Buffs exclusivos para la clase del jugador (máximo 1 vez por partida).
  - Salas de ayuda: Recuperación de Vida/Maná mediante hoguera, cabaña, estanque mágico o comedor.
### Registro de Resultados y Clasificación
- Guardado automático al finalizar la partida por derrota o retiro.
- Registro de la puntuación final (1 punto por cada habitación superada).
- Registro de métricas detalladas: enemigos derrotados, tiempo jugado, monedas ganadas/gastadas, reliquias obtenidas, jefes derrotados, daño infligido/recibido y lista detallada de habitaciones superadas.
- Visualización del Top 10 Global y Top 10 Personal en la pantalla principal.
- Modal desplegable de "Línea de Tiempo" para explorar la secuencia paso a paso de cualquier partida del Top.

## Alcances No Funcionales

### Arquitectura y Diversidad de Frameworks
- Backend Doble: Implementación de la misma API REST con 2 frameworks distintos (ej: Express / FastAPI / NestJS / Spring Boot) manteniendo equivalencia 1:1 en endpoints, validaciones y lógica.
- Frontend Doble: Implementación de la misma interfaz gráfica con 2 frameworks distintas (ej: React / Vue / Angular / Svelte) consumiendo la misma API REST.
- Base de Datos: Motor relacional (ej: PostgreSQL) ejecutado en contenedor Docker con volumen de datos persistente.
### Rendimiento y Seguridad
- Tiempo de Respuesta: Tiempos de respuesta de la API menores a 200 ms en operaciones estándar.
- Seguridad de Datos: Contraseñas encriptadas mediante hashing seguro (bcrypt).
- Validación: Validación estricta de datos tanto en el frontend como en el backend antes de persistir.
### Usabilidad y Despliegue
- Interfaz Adaptativa (Responsive): Diseño adaptado a navegadores de escritorio y laptops.
- Facilidad de Ejecución: Un archivo docker-compose.yml que levante la base de datos y los servicios requeridos con un solo comando.

## Objetivos Específicos y Medibles (SMART)

- Implementación del Backend Dual: Desarrollar e integrar el servicio API REST en 2 frameworks distintos con 100% de paridad funcional y de endpoints.
- Implementación del Frontend Dual: Desarrollar la aplicación cliente en 2 frameworks distintos compartiendo el mismo diseño visual, flujos y consumo de la API REST.
- Persistencia y Dockerización: Configurar el contenedor de la Base de Datos mediante Docker Compose asegurando persistencia de datos.
- Lógica Completa de Juego: Implementar las 4 clases jugables, los 10 tipos de habitaciones/eventos y el sistema de combate por turnos según la especificación de diseño.
- Leaderboard y Línea de Tiempo: Diseñar la API y las vistas necesarias para consultar el Top 10 global/personal y desplegar el desglose interactivo habitación por habitación de cualquier partida.
- Cobertura de Pruebas: Alcanzar al menos un 70% de cobertura de pruebas unitarias/integración en los servicios backend.
- Flujo de Trabajo en Git: Cumplir con el 100% de las normas de Git solicitadas: prohibido push directo a main, uso de ramas por Issue, mensajes con Conventional Commits y Pull Requests revisados por el docente.

## Stack Tecnológico Propuesto

- Base de Datos: PostgreSQL (Dockerizada con volumen para persistencia).
- Backend Opción A: Node.js con Express.
- Backend Opción B: Python con FastAPI.
- Frontend Opción A: React.js.
- Frontend Opción B: Vue.js.
- Contenedores y Despliegue: Docker y Docker Compose.
- Control de versiones: Git, GitHub / GitLab (con Conventional Commits).
