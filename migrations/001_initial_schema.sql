-- =============================================================================
-- MIGRACIÓN 001: Creación del Esquema Inicial de Base de Datos
-- =============================================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Partidas
CREATE TABLE IF NOT EXISTS partidas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    clase VARCHAR(20) NOT NULL,
    puntuacion INT NOT NULL DEFAULT 0,
    duracion_segundos INT NOT NULL DEFAULT 0,
    monedas_obtenidas INT NOT NULL DEFAULT 0,
    monedas_gastadas INT NOT NULL DEFAULT 0,
    danio_infligido INT NOT NULL DEFAULT 0,
    danio_recibido INT NOT NULL DEFAULT 0,
    enemigos_derrotados INT NOT NULL DEFAULT 0,
    jefes_derrotados INT NOT NULL DEFAULT 0,
    resultado VARCHAR(20) NOT NULL,
    fecha_partida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_partidas_usuario 
        FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE
);

-- 3. Tabla de Reliquias por Partida
CREATE TABLE IF NOT EXISTS reliquias_partida (
    id SERIAL PRIMARY KEY,
    partida_id INT NOT NULL,
    nombre_reliquia VARCHAR(100) NOT NULL,
    efecto TEXT NOT NULL,
    habitacion_obtenida INT NOT NULL,
    CONSTRAINT fk_reliquias_partida 
        FOREIGN KEY (partida_id) 
        REFERENCES partidas(id) 
        ON DELETE CASCADE
);

-- 4. Tabla de Línea de Tiempo paso a paso
CREATE TABLE IF NOT EXISTS habitaciones_partida (
    id SERIAL PRIMARY KEY,
    partida_id INT NOT NULL,
    numero_habitacion INT NOT NULL,
    tipo_evento VARCHAR(30) NOT NULL,
    detalle_evento JSONB NOT NULL DEFAULT '{}'::jsonb,
    resultado VARCHAR(30) NOT NULL,
    registrado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_habitaciones_partida 
        FOREIGN KEY (partida_id) 
        REFERENCES partidas(id) 
        ON DELETE CASCADE
);

-- 5. Índices B-Tree para optimización de consultas del Leaderboard y Filtros
CREATE INDEX IF NOT EXISTS idx_partidas_puntuacion ON partidas (puntuacion DESC);
CREATE INDEX IF NOT EXISTS idx_partidas_usuario_puntuacion ON partidas (usuario_id, puntuacion DESC);
CREATE INDEX IF NOT EXISTS idx_habitaciones_partida_orden ON habitaciones_partida (partida_id, numero_habitacion ASC);
CREATE INDEX IF NOT EXISTS idx_reliquias_partida_partida_id ON reliquias_partida (partida_id);