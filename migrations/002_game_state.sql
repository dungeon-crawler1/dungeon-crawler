-- =============================================================================
-- MIGRACIÓN 002: Campos de Estado Activo para el Motor del Juego
-- =============================================================================

ALTER TABLE partidas 
ADD COLUMN IF NOT EXISTS vida_actual INT NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS vida_maxima INT NOT NULL DEFAULT 100,
ADD COLUMN IF NOT EXISTS ataque INT NOT NULL DEFAULT 15,
ADD COLUMN IF NOT EXISTS defensa INT NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS monedas_actuales INT NOT NULL DEFAULT 20,
ADD COLUMN IF NOT EXISTS estado_run JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Actualizar constraint para permitir el estado 'EN_PROGRESO'
ALTER TABLE partidas DROP CONSTRAINT IF EXISTS chk_resultado_partida;
ALTER TABLE partidas ADD CONSTRAINT chk_resultado_partida 
    CHECK (resultado IN ('EN_PROGRESO', 'DERROTA', 'RETIRO'));