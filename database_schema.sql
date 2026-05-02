-- =============================================================================
-- SCHEMA GRÊMIO ESTUDANTIL - VERSÃO DEFINITIVA
-- =============================================================================

-- 1. TABELAS DE APOIO
CREATE TYPE user_role AS ENUM ('Presidente', 'Vice-Presidente', 'Secretário Geral', 'Secretária', 'Tesoureira', 'Diretor', 'Ouvidoria');

-- 2. TABELA DE USUÁRIOS (BASE PARA AUTH CUSTOMIZADA)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    role user_role NOT NULL,
    department TEXT, -- Cultura, Esportes, Eventos, Comunicação, Resp. Social, Meio Ambiente, Protagonismo, Tecnologia, Ouvidoria
    color_hex TEXT,  -- Cor de identificação definida no prompt
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE TAREFAS
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    priority TEXT DEFAULT 'medium',
    department TEXT NOT NULL,
    assigned_to UUID REFERENCES profiles(id),
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELAS DE EVENTOS E FINANCEIRO
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    budget DECIMAL(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'planned',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL, -- income, expense
    date DATE DEFAULT CURRENT_DATE,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- REDES DE SEGURANÇA (RLS)
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;

-- POLICIES DE PERFIS (Read-only para autenticados)
CREATE POLICY "Profiles are viewable by authenticated users" 
ON profiles FOR SELECT USING (auth.role() = 'authenticated');

-- POLICIES DE TAREFAS (RBAC)
-- Presidente/Vice: Acesso Total
CREATE POLICY "Presidents full access to tasks" 
ON tasks FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Presidente', 'Vice-Presidente'))
);

-- Diretores: Editam apenas sua diretoria, veem todas
CREATE POLICY "Directors view all tasks" 
ON tasks FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Directors edit own department tasks" 
ON tasks FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND department = tasks.department)
);

-- POLICIES FINANCEIRO (Restrito à Tesouraria e Presidência)
CREATE POLICY "Finance access restricted" 
ON finances FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'Tesoureira' OR role IN ('Presidente', 'Vice-Presidente')))
);

-- POLICIES EVENTOS (Similar a tarefas)
CREATE POLICY "Events view all" 
ON events FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Events edit restricted" 
ON events FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role IN ('Presidente', 'Vice-Presidente') OR department = 'Eventos'))
);

-- =============================================================================
-- POPULANDO MEMBROS (Semente Inicial)
-- =============================================================================

INSERT INTO profiles (full_name, cpf, birth_date, role, department, color_hex) VALUES
('Lohanna', '000.000.000-00', '2000-01-01', 'Presidente', 'Geral', '#000000'),
('Raphaella', '000.000.000-01', '2000-01-01', 'Vice-Presidente', 'Geral', '#000000'),
('David', '000.000.000-02', '2000-01-01', 'Secretário Geral', 'Secretaria', '#FFFFFF'),
('Bianca', '000.000.000-03', '2000-01-01', 'Secretária', 'Secretaria', '#0000FF'),
('Ana Luzia', '000.000.000-04', '2000-01-01', 'Tesoureira', 'Financeiro', '#800080'),
('Agatha', '000.000.000-05', '2000-01-01', 'Diretor', 'Cultura', '#A52A2A'),
('Junior', '000.000.000-06', '2000-01-01', 'Diretor', 'Esportes', '#FFFFFF'),
('Maria Eduarda', '000.000.000-07', '2000-01-01', 'Diretor', 'Eventos', '#FFC0CB'),
('Atyla', '000.000.000-08', '2000-01-01', 'Diretor', 'Comunicação', '#FF0000'),
('Maria Fernanda', '000.000.000-09', '2000-01-01', 'Diretor', 'Resp. Social', '#00FFFF'),
('Kaylane', '000.000.000-10', '2000-01-01', 'Diretor', 'Meio Ambiente', '#FFFFFF'),
('Paulão', '000.000.000-11', '2000-01-01', 'Diretor', 'Protagonismo', '#800080'),
('Elvey', '100.302.232-45', '2009-06-21', 'Diretor', 'Tecnologia e Inovação', '#FFD700'),
('João Guilherme', '000.000.000-13', '2000-01-01', 'Ouvidoria', 'Ouvidoria', '#FFFF00');
