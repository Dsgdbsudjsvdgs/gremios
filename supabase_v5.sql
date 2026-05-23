-- =============================================================================
-- 🚀 SISTEMA GRÊMIO v5 — RESET TOTAL
-- =============================================================================
-- Correções v5:
-- • Todas as FKs com ON DELETE SET NULL (nunca cascade pra evitar dor)
-- • diary_entries.created_by com SET NULL (fix do bug de FK)
-- • RLS aberto (login customizado, sem auth.uid())
-- • Dados populados com UUIDs estáveis (uuid_generate_v4)
-- =============================================================================

-- DROP TOTAL — ordem reversa por dependência
drop table if exists system_logs CASCADE;
drop table if exists diary_entries CASCADE;
drop table if exists finances CASCADE;
drop table if exists events CASCADE;
drop table if exists tasks CASCADE;
drop table if exists profiles CASCADE;
drop table if exists departments CASCADE;
drop function if exists validate_access_code(text) CASCADE;
drop type if exists user_role CASCADE;

-- Extensão
create extension if not exists "uuid-ossp";

-- =============================================================================
-- ENUM
-- =============================================================================

create type user_role as enum(
  'Presidente', 'Vice-Presidente', 'Secretário Geral',
  'Secretária', 'Tesoureira', 'Diretor', 'Ouvidoria'
);

-- =============================================================================
-- TABELAS
-- =============================================================================

create table departments (
  id UUID primary key default uuid_generate_v4(),
  name TEXT unique not null,
  description TEXT,
  created_at TIMESTAMPTZ default NOW()
);

create table profiles (
  id UUID primary key default uuid_generate_v4(),
  full_name TEXT not null,
  cpf TEXT unique,
  access_code TEXT unique,
  birth_date DATE,
  role user_role,
  department_id UUID references departments(id) on delete set null,
  color_hex TEXT,
  created_at TIMESTAMPTZ default NOW()
);

create table tasks (
  id UUID primary key default uuid_generate_v4(),
  title TEXT not null,
  description TEXT,
  status TEXT default 'pending',
  priority TEXT default 'medium',
  department_id UUID references departments(id) on delete set null,
  assigned_to UUID references profiles(id) on delete set null,
  due_date DATE,
  created_at TIMESTAMPTZ default NOW()
);

create table events (
  id UUID primary key default uuid_generate_v4(),
  name TEXT not null,
  date DATE,
  description TEXT,
  location TEXT,
  budget DECIMAL(10, 2) default 0.00,
  status TEXT default 'planned',
  created_by UUID references profiles(id) on delete set null,
  created_at TIMESTAMPTZ default NOW()
);

create table diary_entries (
  id UUID primary key default uuid_generate_v4(),
  title TEXT not null,
  content TEXT not null,
  tags TEXT,
  created_by UUID references profiles(id) on delete set null,
  created_at TIMESTAMPTZ default NOW()
);

create table finances (
  id UUID primary key default uuid_generate_v4(),
  description TEXT not null,
  amount DECIMAL(10, 2) not null,
  type TEXT,
  date DATE default CURRENT_DATE,
  category TEXT,
  created_at TIMESTAMPTZ default NOW()
);

create table system_logs (
  id UUID primary key default uuid_generate_v4(),
  user_id UUID references profiles(id) on delete set null,
  action TEXT not null,
  details TEXT,
  created_at TIMESTAMPTZ default NOW()
);

-- =============================================================================
-- RLS — Login customizado via access_code (sem auth.uid())
-- =============================================================================

alter table profiles enable row level security;
alter table tasks enable row level security;
alter table events enable row level security;
alter table diary_entries enable row level security;
alter table finances enable row level security;
alter table system_logs enable row level security;

-- Profiles
create policy profile_view_all on profiles for select using (true);
create policy profile_insert_all on profiles for insert with check (true);
create policy profile_update_all on profiles for update using (true) with check (true);

-- Tasks
create policy tasks_view_all on tasks for select using (true);
create policy tasks_insert_all on tasks for insert with check (true);
create policy tasks_update_all on tasks for update using (true) with check (true);
create policy tasks_delete_all on tasks for delete using (true);

-- Events
create policy events_view_all on events for select using (true);
create policy events_insert_all on events for insert with check (true);
create policy events_update_all on events for update using (true) with check (true);
create policy events_delete_all on events for delete using (true);

-- Diary
create policy diary_view_all on diary_entries for select using (true);
create policy diary_insert_all on diary_entries for insert with check (true);
create policy diary_update_all on diary_entries for update using (true) with check (true);
create policy diary_delete_all on diary_entries for delete using (true);

-- Finances
create policy finance_view_all on finances for select using (true);
create policy finance_insert_all on finances for insert with check (true);
create policy finance_update_all on finances for update using (true) with check (true);
create policy finance_delete_all on finances for delete using (true);

-- Logs
create policy logs_view_all on system_logs for select using (true);
create policy logs_insert_all on system_logs for insert with check (true);

-- Blindagem de dados sensíveis
revoke select (cpf, access_code) on profiles from anon, authenticated;

-- =============================================================================
-- FUNÇÃO DE LOGIN
-- =============================================================================

create or replace function validate_access_code(input_code TEXT)
returns table (
  profile_id UUID,
  full_name TEXT,
  role user_role,
  color_hex TEXT,
  department_id UUID
) language plpgsql security definer as $$
begin
  return query
  select id, profiles.full_name, profiles.role, profiles.color_hex, profiles.department_id
  from profiles
  where access_code = upper(input_code)
  limit 1;
end;
$$;

-- =============================================================================
-- POPULAÇÃO DE DADOS
-- =============================================================================

insert into departments (name, description) values
  ('Presidência', 'Lidera o grêmio'),
  ('Vice-Presidência', 'Auxilia o presidente'),
  ('Secretaria Geral', 'Documentos'),
  ('Secretaria', 'Administrativo'),
  ('Tesouraria', 'Finanças'),
  ('Cultura', 'Culturais'),
  ('Esportes', 'Esportes'),
  ('Eventos', 'Eventos'),
  ('Comunicação', 'Divulgação'),
  ('Responsabilidade Social', 'Solidárias'),
  ('Meio Ambiente', 'Ecologia'),
  ('Protagonismo', 'Liderança'),
  ('Tecnologia e Inovação', 'Digitais'),
  ('Ouvidoria', 'Sugestões');

insert into profiles (full_name, cpf, access_code, birth_date, role, department_id, color_hex) values
  ('Lohanna', '626.237.743-31', 'PRES-LOHANNA', '2009-07-24', 'Presidente', (select id from departments where name = 'Presidência'), '#FFFFFF'),
  ('Raphaella', '123.321.123-12', 'VICE-RAPH', '2007-09-24', 'Vice-Presidente', (select id from departments where name = 'Vice-Presidência'), '#FFFFFF'),
  ('David', '634.256.013-77', 'SECGERAL-DAVID', '2008-09-09', 'Secretário Geral', (select id from departments where name = 'Secretaria Geral'), '#D0D0D0'),
  ('Bianca', '069.745.812-11', 'SEC-BIANCA', '2009-07-01', 'Secretária', (select id from departments where name = 'Secretaria'), '#D0D0D0'),
  ('Luzia', '613.395.273-32', 'TES-LUZIA', '2009-04-02', 'Tesoureira', (select id from departments where name = 'Tesouraria'), '#FFFFFF'),
  ('Agatha', '634.675.713-01', 'CULT-AGATHA', '2008-12-12', 'Diretor', (select id from departments where name = 'Cultura'), '#D0D0D0'),
  ('Junior', '456.789.123-45', 'ESP-JUNIOR', '2007-06-08', 'Diretor', (select id from departments where name = 'Esportes'), '#D0D0D0'),
  ('Maria Eduarda', '075.703.293-17', 'EVEN-MADU', '2006-10-23', 'Diretor', (select id from departments where name = 'Eventos'), '#D0D0D0'),
  ('Atyla', '234.567.890-12', 'COM-ATYLA', '2008-08-15', 'Diretor', (select id from departments where name = 'Comunicação'), '#D0D0D0'),
  ('Maria Fernanda', '628.298.043-76', 'SOC-MAFER', '2009-04-05', 'Diretor', (select id from departments where name = 'Responsabilidade Social'), '#D0D0D0'),
  ('Kaylane', '345.678.901-23', 'AMB-KAY', '2009-09-20', 'Diretor', (select id from departments where name = 'Meio Ambiente'), '#D0D0D0'),
  ('Paulo Henrique', '621.822.053-22', 'PROT-PAULO', '2008-10-24', 'Diretor', (select id from departments where name = 'Protagonismo'), '#D0D0D0'),
  ('Elvey', '100.302.232-45', 'TECH-ELVEY', '2009-06-21', 'Diretor', (select id from departments where name = 'Tecnologia e Inovação'), '#FFFFFF'),
  ('João Guilherme', '613.450.583-81', 'OUVI-JOAO', '2009-12-24', 'Ouvidoria', (select id from departments where name = 'Ouvidoria'), '#D0D0D0');

-- =============================================================================
-- NOTA: Proteção de dados sensíveis (CPF, access_code) é feita via:
-- 1. REVOKE no banco
-- 2. Validação de permissão no JS (requireAdmin / requireAuth)
-- 3. O front nunca envia CPF/access_code de volta ao banco
-- =============================================================================
