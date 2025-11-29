-- Script de inicialización de la base de datos
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL
-- NOTA: docker-entrypoint-initdb.d ejecuta scripts solo si la base de datos está vacía
-- La base de datos 'midatopay' ya se crea automáticamente por la variable POSTGRES_DB

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- El usuario ya se crea automáticamente por POSTGRES_USER en docker-compose
-- Otorgar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE midatopay TO midatopay;
GRANT ALL PRIVILEGES ON SCHEMA public TO midatopay;
