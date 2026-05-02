// Configurações do Supabase
const SUPABASE_URL = 'https://wearihgeytywbhhtvwlg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlYXrgbaHdleXR5d2JoaHR2d2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTQ2NDgsImV4cCI6MjA5MjM5MDY0OH0.5pz5JCKUEC5y7GuKt4OnSNW-VF_hrYUB4teoucHBNqY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const DEPT_FUNCTIONS = {
    'Presidente': 'Responsável pela representação máxima do Grêmio, coordenação de todas as diretorias e tomada de decisões estratégicas para o bem-estar estudantil.',
    'Vice-Presidente': 'Suporte direto à presidência, coordenação interna de projetos e substituição legal do presidente em ausências.',
    'Secretário Geral': 'Gestão da documentação oficial, atas de reuniões e organização do fluxo administrativo do Grêmio.',
    'Secretária': 'Apoio administrativo, organização de agendas e redação de comunicados oficiais.',
    'Tesoureira': 'Gestão financeira do Grêmio, controle de entradas e saídas de caixa, e planejamento orçamentário de eventos.',
    'Cultura': 'Promoção de eventos artísticos, musicais e intelectuais para estimular a diversidade cultural na escola.',
    'Esportes': 'Organização de campeonatos, torneios e incentivo à prática esportiva e saúde entre os alunos.',
    'Eventos': 'Planejamento logístico, organização de datas e execução de festas e comemorações escolares.',
    'Comunicação': 'Gestão das redes sociais, divulgação de avisos e ponte de informação entre alunos e diretoria.',
    'Resp. Social': 'Coordenação de campanhas de caridade, doações e projetos de impacto comunitário.',
    'Meio Ambiente': 'Promoção da sustentabilidade, hortas escolares, reciclagem e conscientização ecológica.',
    'Protagonismo': 'Incentivo ao liderança estudantil, oratória e empoderamento dos alunos em decisões escolares.',
    'Tecnologia e Inovação': 'Desenvolvimento de ferramentas digitais, suporte técnico ao Grêmio e modernização da gestão escolar.',
    'Ouvidoria': 'Canal direto de escuta dos alunos, recebimento de queixas e sugestões para melhoria do ambiente escolar.'
};

async function initDiretoria() {
    const params = new URLSearchParams(window.location.search);
    const profileId = params.get('id');

    if (!profileId) {
        document.getElementById('dept-content').innerHTML = '<<divdiv class="card">Perfil não identificado.</div>';
        return;
    }

    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

    if (error || !data) {
        document.getElementById('dept-content').innerHTML = '<<divdiv class="card">Membro não encontrado.</div>';
        return;
    }

    // Atualização Visual
    const avatar = document.getElementById('dept-avatar');
    const name = document.getElementById('dept-name');
    const role = document.getElementById('dept-role');
    const desc = document.getElementById('dept-description');

    // Definir cor baseada no cargo ou no color_hex do banco
    const color = data.color_hex || '#FFFFFF';
    
    avatar.style.backgroundColor = color;
    avatar.style.borderColor = 'rgba(255,255,255,0.3)';
    avatar.textContent = data.full_name.charAt(0).toUpperCase();
    
    name.textContent = data.full_name;
    role.textContent = data.role;
    role.style.backgroundColor = color;
    role.style.color = (color === '#FFFFFF' || color === '#FFFF00') ? '#000' : '#fff';
    
    // Definir a função baseada no cargo (ou departamento)
    const functionText = DEPT_FUNCTIONS[data.role] || DEPT_FUNCTIONS[data.department] || 'Responsável por auxiliar nas atividades do Grêmio Estudantil.';
    desc.textContent = functionText;
}

initDiretoria();
