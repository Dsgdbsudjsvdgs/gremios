-- =============================================================================
-- SCRIPT DE CONFIGURAÇÃO FINAL: LOGIN VIA CPF + DATA DE NASCIMENTO
-- =============================================================================

-- 1. Ajuste de Tabelas
ALTER TABLE public.membros ADD COLUMN IF NOT EXISTS data_nascimento TEXT;

-- 2. Função de Validação de Acesso (Sanal Login)
-- Verifica se o CPF e a Data coincidem e retorna o email do usuário
CREATE OR REPLACE FUNCTION public.validate_cpf_birthdate(input_cpf TEXT, input_birthdate TEXT)
RETURNS TABLE (email TEXT, user_id UUID) 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
    RETURN QUERY 
    SELECT m.email, m.id 
    FROM public.membros m 
    WHERE m.cpf = input_cpf AND m.data_nascimento = input_birthdate;
END;
$$;

-- 3. Outorgar permissões para a função de validação
GRANT EXECUTE ON FUNCTION public.validate_cpf_birthdate TO anon;
GRANT EXECUTE ON FUNCTION public.validate_cpf_birthdate TO authenticated;

-- 4. Exemplo de Inserção de Dados para Teste (Substitua pelos dados reais)
-- INSERT INTO public.membros (id, nome, email, cpf, data_nascimento) 
-- VALUES (gen_random_uuid(), 'Elvey', 'elvey@gremio.com', '100.302.232-45', '21/06/2009');

-- =============================================================================
-- FIM DO SCRIPT
-- =============================================================================
