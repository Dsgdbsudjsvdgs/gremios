-- =============================================================================
-- 🏢 Popular tabela departments + RLS fix (v2 — safe)
-- Rodar no SQL Editor do Supabase Dashboard
-- =============================================================================

-- 1. Drop policies existentes (ignora se não existir)
DROP POLICY IF EXISTS dept_view_all ON departments;
DROP POLICY IF EXISTS dept_insert_all ON departments;
DROP POLICY IF EXISTS dept_update_all ON departments;

-- 2. Habilitar RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- 3. Criar policies
CREATE POLICY dept_view_all ON departments FOR SELECT USING (true);
CREATE POLICY dept_insert_all ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY dept_update_all ON departments FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Popular departments (upsert — cria ou atualiza)
INSERT INTO departments (id, name, description) VALUES
  ('ff3bed48-8e9b-4e5c-8437-7cfaa09b5ab3', 'Presidência', 'Lidera o grêmio'),
  ('f0cb2007-f6e1-4f0b-b33c-521a54180212', 'Vice-Presidência', 'Auxilia o presidente'),
  ('169e1a56-2705-4ddd-9cab-67a9affa3353', 'Secretaria Geral', 'Documentos'),
  ('717afe9b-1943-43d9-ae92-b4dadb6b80bd', 'Secretaria', 'Administrativo'),
  ('1f8e99c3-e769-4930-9860-ddba55b85dcc', 'Tesouraria', 'Finanças'),
  ('326744ca-436e-4e8e-87a7-dba35b6dca81', 'Cultura', 'Culturais'),
  ('6d8c94ea-f967-4adf-b8de-7f661013bcc1', 'Esportes', 'Esportes'),
  ('15912d3f-81b2-46a8-aa81-7bf2256d30ee', 'Eventos', 'Eventos'),
  ('cbd5374e-671a-4f0d-aca6-68417902a383', 'Comunicação', 'Divulgação'),
  ('3e9e5f66-7024-4bf5-9e49-b786d91afd0c', 'Responsabilidade Social', 'Solidárias'),
  ('c7c31094-1ad6-488c-a93a-90f995c84a8a', 'Meio Ambiente', 'Ecologia'),
  ('5cfc89d3-9c99-4c28-a960-cb32dc915797', 'Protagonismo', 'Liderança'),
  ('54cfa2df-1b90-49f3-823f-6bb0df25b6f9', 'Tecnologia e Inovação', 'Digitais'),
  ('a0aa92e8-6213-4f5a-a840-1df4f60264cb', 'Ouvidoria', 'Sugestões')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
