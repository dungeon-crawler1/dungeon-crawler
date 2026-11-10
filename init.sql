-- =============================================================================
-- ESQUEMA DDL UNIFICADO (SQL=0: Parametrización y tablas autocontenidas)
-- =============================================================================
SET client_min_messages = warning;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Partidas Roguelike
CREATE TABLE IF NOT EXISTS partidas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    clase VARCHAR(50) NOT NULL,
    vida_actual INTEGER NOT NULL,
    vida_maxima INTEGER NOT NULL,
    ataque INTEGER NOT NULL,
    defensa INTEGER NOT NULL,
    monedas_actuales INTEGER NOT NULL DEFAULT 0,
    puntuacion INTEGER NOT NULL DEFAULT 0,
    resultado VARCHAR(20) NOT NULL DEFAULT 'EN_PROGRESO',
    estado_run JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_partidas_usuario ON partidas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_partidas_resultado ON partidas(resultado);