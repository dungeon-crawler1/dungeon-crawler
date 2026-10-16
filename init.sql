-- =============================================================================
-- SCRIPT PRINCIPAL DE INICIALIZACIÓN DE LA BASE DE DATOS
-- Ejecuta de forma secuencial los scripts de migración ubicados en /migrations
-- =============================================================================

-- Desactivar salida de mensajes informativos para no saturar los logs
SET client_min_messages = warning;

-- Inclusión y ejecución de la migración inicial del esquema de datos
\i /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql