-- =============================================================================
-- 🛡️ REVISÃO DE SEGURANÇA RLS - GRÊMIO ESTUDANTIL v3.2
-- =============================================================================

-- 1. Limpar políticas públicas perigosas
drop policy if exists tasks_view_all on tasks;
drop policy if exists events_view_all on events;
drop policy if exists finance_view_auth on finances;
drop policy if exists logs_view_all on system_logs;

-- 2. Nova Estratégia: Acesso via Validação de Código (Sessão)
-- Como o sistema usa login customizado (access_code), vamos restringir a leitura
-- para que apenas quem tem a chave de acesso possa ler os dados.

-- Tasks: Apenas leitura se houver validação (via API ou Token)
-- Para manter a compatibilidade com o front atual, permitiremos a leitura
-- mas vamos blindar a alteração (Insert/Update/Delete) apenas para ADMINS.
create policy tasks_view_auth on tasks for select using (true); 
create policy tasks_manage_admin on tasks for all using (
  exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'Presidente'
  )
);

-- Finanças: BLOQUEIO TOTAL para anônimos. Apenas quem é Tesoureiro ou Presidente.
create policy finance_strict_access on finances for select using (
  exists (
    select 1 from profiles 
    where id = auth.uid() and role in ('Presidente', 'Tesoureira')
  )
);

-- Logs: Apenas Admin
create policy logs_admin_only on system_logs for select using (
  exists (
    select 1 from profiles 
    where id = auth.uid() and role = 'Presidente'
  )
);

-- Blindagem total de dados sensíveis do perfil
revoke select (cpf, access_code, birth_date) on profiles from anon;
