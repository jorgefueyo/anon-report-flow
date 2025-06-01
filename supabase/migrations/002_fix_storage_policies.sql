
-- Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "Allow all operations on denuncia-archivos" ON storage.objects;

-- Crear políticas más permisivas para denuncia-archivos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'denuncia-archivos');
CREATE POLICY "Public Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'denuncia-archivos');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'denuncia-archivos');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'denuncia-archivos');

-- Asegurar que el bucket sea público
UPDATE storage.buckets SET public = true WHERE id = 'denuncia-archivos';

-- Habilitar realtime para seguimiento_denuncias
ALTER TABLE seguimiento_denuncias REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE seguimiento_denuncias;
