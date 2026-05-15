-- =============================================================================
-- 🚀 DATABASE SCHEMA - GRÊMIO ESTUDANTIL v3.2 (Sincronizado)
-- =============================================================================
-- Este script deve ser executado no SQL Editor do Supabase.
-- Sincronizado com os módulos de Calendário, Diário e Dashboard.

-- 1. EXTENSÕES E TIPOS
create extension if not exists "uuid-ossp";

do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'user_role') then
        create type user_role as ENUM(
            'Presidente', 'Vice-Presidente', 'Secretário Geral', 
            'Secretária', 'Tesoureira', 'Diretor', 'Ouvidoria'
        );
    end if;
end $$;

-- 2. TABELAS
create table if not exists departments (
    id UUID primary key default uuid_generate_v4 (),
    name TEXT unique not null,
    description TEXT,
    created_at TIMESTAMPTZ default NOW()
);

create table if not exists profiles (
    id UUID primary key default uuid_generate_v4 (),
    full_name TEXT,
    cpf TEXT unique,
    access_code TEXT unique,
    birth_date DATE,
    role user_role,
    department_id UUID references departments (id) on delete set null,
    color_hex TEXT,
    created_at TIMESTAMPTZ default NOW()
);

create table if not exists tasks (
    id UUID primary key default uuid_generate_v4 (),
    title TEXT not null,
    description TEXT,
    status TEXT default 'pendente', -- Sincronizado com CONFIG.STATUS
    priority TEXT default 'media',    -- Sincronizado com CONFIG.PRIORITY
    department_id UUID references departments (id) on delete set null,
    assigned_to UUID references profiles (id) on delete set null,
    due_date DATE,
    created_at TIMESTAMPTZ default NOW()
);

create table if not exists events (
    id UUID primary key default uuid_generate_v4 (),
    name TEXT not null,
    date DATE,
    description TEXT,
    location TEXT, -- Adicionado para bater com calendar.js
    budget DECIMAL(10, 2) default 0.00,
    status TEXT default 'planned',
    created_at TIMESTAMPTZ default NOW()
);

create table if not exists diary_entries (
    id UUID primary key default uuid_generate_v4 (),
    title TEXT not null,
    content TEXT not null,
    tags TEXT,
    created_by UUID references profiles (id) on delete cascade,
    created_at TIMESTAMPTZ default NOW()
);

create table if not exists finances (
    id UUID primary key default uuid_generate_v4 (),
    description TEXT not null,
    amount DECIMAL(10, 2) not null,
    type TEXT,
    date DATE default CURRENT_DATE,
    category TEXT,
    created_at TIMESTAMPTZ default NOW()
);

create table if not exists system_logs (
    id UUID primary key default uuid_generate_v4 (),
    user_id UUID references profiles (id),
    action TEXT not null,
    details TEXT,
    created_at TIMESTAMPTZ default NOW()
);

-- 3. SEGURANÇA E RLS
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table events enable row level security;
alter table diary_entries enable row level security;
alter table finances enable row level security;
alter table system_logs enable row level security;

-- Políticas de Visualização Pública (Para Dashboard e Listagens)
create policy profile_view_all on profiles for select using (true);
create policy tasks_view_all on tasks for select using (true);
create policy events_view_all on events for select using (true);
create policy diary_view_all on diary_entries for select using (true);
create policy finance_view_auth on finances for select using (true);
create policy logs_view_all on system_logs for select using (true);

-- Políticas de Gestão (Simulas via JS, mas abertas para Anon/Auth no estágio de dev)
create policy tasks_manage_all on tasks for all using (true);
create policy events_manage_all on events for all using (true);
create policy diary_manage_all on diary_entries for all using (true);
create policy finance_manage_all on finances for all using (true);

-- Blindagem de dados sensíveis
revoke select (cpf, access_code) on profiles from anon, authenticated;

-- 4. FUNÇÕES de SUPORTE
create or replace function validate_access_code (input_code TEXT) 
RETURNS table (
  profile_id UUID,
  full_name TEXT,
  role user_role,
  color_hex TEXT,
  department_id UUID
) LANGUAGE plpgsql SECURITY DEFINER as $$
BEGIN
    RETURN QUERY
    SELECT id, profiles.full_name, profiles.role, profiles.color_hex, profiles.department_id
    FROM profiles
    WHERE access_code = upper(input_code)
    LIMIT 1;
END;
$$;

-- 5. DADOS INICIAIS (Departamentos)
insert into departments (name, description)
select d.name, d.description 
from (values 
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
  ('Ouvidoria', 'Sugestões')
) as d(name, description)
where not exists (select 1 from departments);
