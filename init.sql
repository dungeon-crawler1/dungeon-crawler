-- =============================================================================
-- ORQUESTADOR DE INICIALIZACIÓN
-- Ejecuta los scripts de migración ordenados cronológicamente
-- =============================================================================

-- Desactivar salida verbosa para evitar mensajes excesivos en el log
SET client_min_messages = warning;

-- Inclusión y ejecución del script de migración 001
\i /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql