-- =============================================================================
-- SCRIPT DE INICIALIZACIÓN DE LA BASE DE DATOS: ROGUELIKE GAME
-- Este archivo se ejecuta automáticamente al construir el contenedor por primera vez.
-- =============================================================================

-- 1. Eliminación de tablas si existen previa ejecución (limpieza)
DROP TABLE IF EXISTS linea_tiempo_partida CASCADE;
DROP TABLE IF EXISTS partidas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 2. Creación de la Tabla de Usuarios (Autenticación y Registro)
-- Permite almacenar la información básica de los usuarios registrados.
CREATE TABLE usuarios (
    -- Identificador único auto-incremental para cada usuario
    id SERIAL PRIMARY KEY,
    
    -- Nombre de usuario único para identificarlo en la plataforma
    username VARCHAR(50) UNIQUE NOT NULL,
    
    -- Correo electrónico único del usuario
    email VARCHAR(100) UNIQUE NOT NULL,
    
    -- Hash de la contraseña (NUNCA se guarda en texto plano por seguridad/bcrypt)
    password_hash VARCHAR(255) NOT NULL,
    
    -- Fecha y hora exacta de creación de la cuenta
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Creación de la Tabla de Partidas (Runs)
-- Registra cada intento de juego finalizado por derrota o retiro.
CREATE TABLE partidas (
    -- Identificador único de la partida
    id SERIAL PRIMARY KEY,
    
    -- Referencia al usuario que jugó la partida (Relación con usuarios)
    -- Si el usuario se elimina, sus partidas se eliminan en cascada (ON DELETE CASCADE)
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Clase seleccionada ('Caballero', 'Bárbaro', 'Pícaro', 'Mago')
    clase_personaje VARCHAR(20) NOT NULL,
    
    -- Puntuación total (equivale a la cantidad de habitaciones superadas)
    puntuacion INTEGER NOT NULL DEFAULT 0,
    
    -- Estado en que finalizó la partida ('DERROTA' o 'RETIRO')
    resultado_partida VARCHAR(20) NOT NULL,
    
    -- Métricas detalladas exigidas en el alcance funcional:
    enemigos_derrotados INTEGER DEFAULT 0,
    jefes_derrotados INTEGER DEFAULT 0,
    monedas_ganadas INTEGER DEFAULT 0,
    monedas_gastadas INTEGER DEFAULT 0,
    monedas_finales INTEGER DEFAULT 0,
    danio_infligido INTEGER DEFAULT 0,
    danio_recibido INTEGER DEFAULT 0,
    
    -- Duración total jugada expresada en segundos
    tiempo_jugado_segundos INTEGER DEFAULT 0,
    
    -- Almacenamiento de reliquias obtenidas en formato JSON para flexibilidad
    reliquias_obtenidas JSONB DEFAULT '[]'::jsonb,
    
    -- Fecha de la partida
    fecha_partida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Creación de la Tabla de Línea de Tiempo (Habitación por Habitación)
-- Permite alimentar la ventana emergente/modal para explorar cada habitación superada.
CREATE TABLE linea_tiempo_partida (
    -- Identificador único del evento de la línea de tiempo
    id SERIAL PRIMARY KEY,
    
    -- Partida a la que pertenece este paso
    partida_id INT NOT NULL REFERENCES partidas(id) ON DELETE CASCADE,
    
    -- Número correlativo de la habitación (1, 2, 3...)
    numero_habitacion INTEGER NOT NULL,
    
    -- Tipo de evento ('combate', 'mercader', 'fuente_deseos', 'estatua', 'ayuda', 'tesoro', 'jefe', 'misteriosa')
    tipo_evento VARCHAR(30) NOT NULL,
    
    -- Descripción textual breve de lo ocurrido en la habitación
    descripcion VARCHAR(255) NOT NULL,
    
    -- Información técnica del paso guardada en JSONB (daño recibido, enemigo enfrentado, item comprado, etc.)
    detalles_evento JSONB DEFAULT '{}'::jsonb,
    
    -- Estampa de tiempo del paso
    registrado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Índices de rendimiento
-- Acelera la consulta del Top 10 Global (Leaderboard) ordenando por puntuación descendente
CREATE INDEX idx_partidas_puntuacion ON partidas(puntuacion DESC);

-- Acelera la búsqueda de partidas específicas por usuario
CREATE INDEX idx_partidas_usuario ON partidas(usuario_id);

-- Acelera la carga de la línea de tiempo de una partida dada
CREATE INDEX idx_linea_tiempo_partida ON linea_tiempo_partida(partida_id, numero_habitacion);