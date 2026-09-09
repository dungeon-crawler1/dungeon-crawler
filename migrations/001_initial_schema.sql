-- =============================================================================
-- MIGRACIÓN 001: Creación del Esquema Inicial de Base de Datos
-- Descripción: Crea las tablas de usuarios, partidas, reliquias y habitaciones.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLA 1: usuarios
-- Guarda las credenciales e información de perfil de los jugadores.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    -- Clave primaria auto-incremental
    id SERIAL PRIMARY KEY,
    
    -- Nombre de usuario único para inicio de sesión y visualización en el Leaderboard
    username VARCHAR(50) NOT NULL UNIQUE,
    
    -- Correo electrónico único para registro
    email VARCHAR(100) NOT NULL UNIQUE,
    
    -- Hash seguro de la contraseña (bcrypt de 60 caracteres)
    password_hash VARCHAR(255) NOT NULL,
    
    -- Estampa de tiempo para registrar cuándo se creó la cuenta
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLA 2: partidas
-- Guarda el resumen estadístico de cada partida finalizada (por victoria, derrota o retiro).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partidas (
    -- Clave primaria auto-incremental
    id SERIAL PRIMARY KEY,
    
    -- Clave foránea referenciando al usuario propietario de la partida
    usuario_id INT NOT NULL,
    
    -- Clase seleccionada ('Caballero', 'Bárbaro', 'Pícaro', 'Mago')
    clase VARCHAR(20) NOT NULL,
    
    -- Puntuación final (equivale a la cantidad de habitaciones superadas)
    puntuacion INT NOT NULL DEFAULT 0,
    
    -- Duración de la partida en segundos
    duracion_segundos INT NOT NULL DEFAULT 0,
    
    -- Métricas de economía
    monedas_obtenidas INT NOT NULL DEFAULT 0,
    monedas_gastadas INT NOT NULL DEFAULT 0,
    
    -- Métricas de combate
    danio_infligido INT NOT NULL DEFAULT 0,
    danio_recibido INT NOT NULL DEFAULT 0,
    
    -- Contadores de enemigos
    enemigos_derrotados INT NOT NULL DEFAULT 0,
    jefes_derrotados INT NOT NULL DEFAULT 0,
    
    -- Estado de fin de juego ('DERROTA', 'RETIRO')
    resultado VARCHAR(20) NOT NULL,
    
    -- Fecha y hora en que se registró la partida
    fecha_partida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción de Clave Foránea: si se borra un usuario, sus partidas se eliminan
    CONSTRAINT fk_partidas_usuario 
        FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- TABLA 3: reliquias_partida
-- Detalla de forma relacional qué reliquias obtuvo el jugador en una partida concreta.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reliquias_partida (
    -- Clave primaria auto-incremental
    id SERIAL PRIMARY KEY,
    
    -- Clave foránea a la partida correspondiente
    partida_id INT NOT NULL,
    
    -- Nombre de la reliquia (ej: 'imán de oro', 'anillo vampírico', 'escudo de acero')
    nombre_reliquia VARCHAR(100) NOT NULL,
    
    -- Descripción breve del efecto o beneficio otorgado
    efecto TEXT NOT NULL,
    
    -- Número de la habitación en la que el jugador la compró u obtuvo
    habitacion_obtenida INT NOT NULL,
    
    -- Restricción de Clave Foránea con eliminación en cascada
    CONSTRAINT fk_reliquias_partida 
        FOREIGN KEY (partida_id) 
        REFERENCES partidas(id) 
        ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- TABLA 4: habitaciones_partida
-- Guarda la secuencia paso a paso (Línea de Tiempo) de cada evento acontecido en la partida.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS habitaciones_partida (
    -- Clave primaria auto-incremental
    id SERIAL PRIMARY KEY,
    
    -- Clave foránea referenciando a la partida a la que pertenece este paso
    partida_id INT NOT NULL,
    
    -- Número correlativo de la habitación (1, 2, 3...)
    numero_habitacion INT NOT NULL,
    
    -- Tipo de evento ('combate', 'mercader', 'fuente_deseos', 'estatua', 'ayuda', 'tesoro', 'jefe', 'misteriosa')
    tipo_evento VARCHAR(30) NOT NULL,
    
    -- JSONB para guardar metadatos variables (ej: { "enemigo": "Orco", "daño_recibido": 15, "monedas_ganadas": 30 })
    detalle_evento JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Resultado del paso ('completada', 'derrota', 'huida')
    resultado VARCHAR(30) NOT NULL,
    
    -- Fecha y hora del registro del evento
    registrado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción de Clave Foránea con eliminación en cascada
    CONSTRAINT fk_habitaciones_partida 
        FOREIGN KEY (partida_id) 
        REFERENCES partidas(id) 
        ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- ÍNDICES DE RENDIMIENTO (B-TREE)
-- Optimización para cumplir el tiempo de respuesta exigido de la API (< 200ms)
-- -----------------------------------------------------------------------------

-- 1. Índice para acelerar la consulta del Top 10 Global (Leaderboard) por puntuación descendente
CREATE INDEX IF NOT EXISTS idx_partidas_puntuacion ON partidas (puntuacion DESC);

-- 2. Índice para acelerar la consulta del Top 10 Personal de un usuario
CREATE INDEX IF NOT EXISTS idx_partidas_usuario_puntuacion ON partidas (usuario_id, puntuacion DESC);

-- 3. Índice para cargar la Línea de Tiempo de una partida ordenada cronológicamente
CREATE INDEX IF NOT EXISTS idx_habitaciones_partida_orden ON habitaciones_partida (partida_id, numero_habitacion ASC);

-- 4. Índice para consultar rápidamente las reliquias de una partida
CREATE INDEX IF NOT EXISTS idx_reliquias_partida_partida_id ON reliquias_partida (partida_id);