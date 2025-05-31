
-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-secret-jwt-token-with-at-least-32-characters-long';

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'viewer');
CREATE TYPE denuncia_estado AS ENUM ('pendiente', 'asignada', 'en_tramite', 'finalizada');

-- Tabla de empresas
CREATE TABLE empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cif VARCHAR(20) NOT NULL UNIQUE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    color_primario VARCHAR(7) DEFAULT '#1e40af',
    color_secundario VARCHAR(7) DEFAULT '#3b82f6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de usuarios del backoffice
CREATE TABLE usuarios_backoffice (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    rol user_role NOT NULL DEFAULT 'viewer',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de denuncias
CREATE TABLE denuncias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    codigo_seguimiento VARCHAR(20) NOT NULL UNIQUE,
    
    -- Datos del denunciante (encriptados)
    email_encriptado TEXT NOT NULL,
    nombre_encriptado TEXT,
    telefono_encriptado TEXT,
    domicilio_encriptado TEXT,
    
    -- Relación y categoría
    relacion_empresa VARCHAR(100),
    categoria VARCHAR(255),
    
    -- Descripción de hechos
    hechos TEXT NOT NULL,
    fecha_hechos DATE,
    lugar_hechos TEXT,
    
    -- Testigos e implicados
    testigos TEXT,
    personas_implicadas TEXT,
    
    -- Estado y asignación
    estado denuncia_estado DEFAULT 'pendiente',
    asignado_a UUID REFERENCES usuarios_backoffice(id),
    observaciones_internas TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de historial de estados
CREATE TABLE historial_estados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    denuncia_id UUID REFERENCES denuncias(id) ON DELETE CASCADE,
    estado_anterior denuncia_estado,
    estado_nuevo denuncia_estado NOT NULL,
    usuario_id UUID REFERENCES usuarios_backoffice(id),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Función para generar código de seguimiento
CREATE OR REPLACE FUNCTION generate_codigo_seguimiento()
RETURNS TEXT AS $$
BEGIN
    RETURN 'DEN-' || UPPER(substring(gen_random_uuid()::text from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-generar código de seguimiento
CREATE OR REPLACE FUNCTION set_codigo_seguimiento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_seguimiento IS NULL THEN
        NEW.codigo_seguimiento := generate_codigo_seguimiento();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_codigo_seguimiento
    BEFORE INSERT ON denuncias
    FOR EACH ROW
    EXECUTE FUNCTION set_codigo_seguimiento();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios_backoffice FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_denuncias_updated_at BEFORE UPDATE ON denuncias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_backoffice ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their company data" ON empresas FOR SELECT USING (
    id IN (
        SELECT empresa_id FROM usuarios_backoffice 
        WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can view users from their company" ON usuarios_backoffice FOR SELECT USING (
    empresa_id IN (
        SELECT empresa_id FROM usuarios_backoffice 
        WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can view denuncias from their company" ON denuncias FOR SELECT USING (
    empresa_id IN (
        SELECT empresa_id FROM usuarios_backoffice 
        WHERE auth_user_id = auth.uid()
    )
);

-- Insert empresa por defecto
INSERT INTO empresas (nombre, cif, email, direccion) VALUES 
('Empresa Demo', '12345678A', 'demo@empresa.com', 'Calle Demo 123, Madrid');

-- Insert usuario administrador por defecto (se creará después del signup)
