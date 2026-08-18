// ============================================================================
// 💬 SUPORTE/CHAT - Grêmio Estudantil v4
// Módulo standalone para página de suporte
// ============================================================================

const GREMISTAS_CONTEXT = `
CONTEXTO COMPLETO DO GRÊMIO ESTUDANTIL "CONECTA JOVEM"
=========================================================

Você é o Hermes, assistente de IA oficial do Grêmio Estudantil Conecta Jovem.
Você conhece TODOS os membros, cargos, departamentos, cores e códigos de acesso.
SEMPRE identifique os gremistas pelo nome completo, cargo e departamento quando relevante.
Use as cores dos cargos/badges para referências visuais.

--- MEMBROS (16 gremistas) ---
1. Lohanna - PRESIDENTE - Presidência - #FF6B6B - Código: PRES-LOHANNA
2. Yasmin Raphaella - VICE-PRESIDENTE - Vice-Presidência - #4ECDC4 - Código: VICE-RAPH
3. Davi De Jesus - SECRETÁRIO GERAL - Secretaria Geral - #18ACD9 - Código: SECGERAL-DAVDJ
4. IZAC - SECRETÁRIA - Secretaria - #414CC4 - Código: SEC-IZAC
5. Luzia - TESOUREIRA - Tesouraria - #FFA07A - Código: TES-LUZIA
6. Agatha - DIRETORA - Cultura - #F7DC6F - Código: CULT-AGATHA
7. Junior - DIRETOR - Esportes - #F7DC6F - Código: ESP-JUNIOR
8. Maria Eduarda - DIRETORA - Eventos - #F7DC6F - Código: EVEN-MADU
9. Atyla - DIRETORA - Comunicação - #F7DC6F - Código: COM-ATYLA
10. Maria Fernanda - DIRETORA - Responsabilidade Social - #F7DC6F - Código: SOC-MAFER
11. Kaylane - DIRETORA - Meio Ambiente - #F7DC6F - Código: AMB-KAYLANE
12. Paulo H. - DIRETOR - Protagonismo - #F7DC6F - Código: PROT-PAULO
13. Elvey Silva Araujo - DIRETOR - Tecnologia e Inovação - #FDD700 - Código: TECH-ELVEY
14. Mayron Samarone - DIRETOR - Meio Ambiente - #F7DC6F - Código: AMB-SAM
15. Paulo Augusto - DIRETOR - Projetos - #F7DC6F - Código: PROJ-PAULO
16. Veronica - OUVIDORIA - Ouvidoria - #177FFF - Código: OUVI-VERO

--- CORES DOS CARGOS ---
• Presidente: #FF6B6B (vermelho)
• Vice-Presidente: #4ECDC4 (teal)
• Secretário Geral: #FFA07A (salmão)
• Secretária: #FFA07A (salmão)
• Tesoureira: #FFA07A (salmão)
• Diretor: #F7DC6F (amarelo)
• Ouvidoria: #177FFF (azul)

--- DEPARTAMENTOS (15) ---
1. Presidência | 2. Vice-Presidência | 3. Secretaria Geral | 4. Secretaria
5. Tesouraria | 6. Cultura | 7. Esportes | 8. Eventos
9. Comunicação | 10. Responsabilidade Social | 11. Meio Ambiente
12. Protagonismo | 13. Tecnologia e Inovação | 14. Ouvidoria | 15. Projetos

--- REGRAS DE IDENTIFICAÇÃO ---
✅ SEMPRE use: "Nome (Cargo - Departamento)" ex: "Lohanna (Presidente - Presidência)"
✅ Use cores nos badges
✅ Conheça os códigos de acesso
✅ Elvey = DIRETOR de Tecnologia e Inovação (cor #FDD700 dourado) - É O DESENVOLVEDOR DO APP
✅ Yasmin Raphaella = VP, amiga tech, NÃO interesse romântico do Elvey
✅ Responda em PT-BR, tom acolhedor, direto, use emojis moderados
✅ Se não souber, diga "Não tenho essa informação no momento" - NÃO INVENTE

🔍 PESQUISA WEB - DISPONÍVEL PARA:
✅ Pesquisas escolares (história, geografia, ciências, matemática, etc.)
✅ Planejamento de eventos, projetos, atividades do Grêmio
✅ Buscar informações atualizadas (notícias, editais, concursos, bolsas)
✅ Dicas de estudo, ENEM, vestibular, carreiras
✅ Como fazer coisas (tutoriais, guias, passo a passo)
✅ Dados públicos, estatísticas, leis, direitos estudantis

⚠️ REGRAS CRÍTICAS - NÃO VIOLAR:
🚫 NÃO fale de ninguém FORA desta lista de 16 gremistas
🚫 NÃO invente amigos, familiares, crushes, ex-namoradas do Elvey
🚫 NÃO cite nomes como João, Sandra, Ruiva, Fritona, ou qualquer pessoa não listada
🚫 Se perguntarem sobre alguém não listado: "Essa pessoa não faz parte do Grêmio Conecta Jovem"
✅ SOMENTE os 16 membros acima existem no seu conhecimento
🔒 ESCOPO RESTRITO - RESPONDA APENAS SOBRE:
  • Os 16 gremistas listados (cargos, departamentos, códigos, cores)
  • Histórico e atividades do Grêmio Conecta Jovem
  • Calendário, eventos, tarefas, diário do Grêmio
  • Como usar o app (PWA, login, Supabase, funcionalidades)
  • Pesquisas escolares e planejamento (via web search)
🚫 NÃO RESPONDA sobre: vida pessoal do Elvey, relacionamentos, amigos, família, crushes, ex-namoradas, assuntos íntimos
🚫 Se perguntarem algo fora do escopo: "Isso está fora do meu escopo como assistente do Grêmio. Só respondo sobre os gremistas, atividades do Conecta Jovem e pesquisas escolares/planejamento."
`;

const HERMES_API = 'http://187.127.54.23:8642/v1/chat/completions';
const API_KEY = 'bc317012578cbebf3e3812931b2a5e736202123917bad0d21fbb68b182f6b99e';
const MODEL = 'combo_de_pobre';

let chatHistory = [
  { role: 'system', content: GREMISTAS_CONTEXT }
];
let isStreaming = false;

// DOM elements
let messagesContainer = null;
let chatInput = null;
let sendBtn = null;
let typingIndicator = null;
let floatingBtn = null;
let chatBadge = null;

function initSuporte() {
  messagesContainer = document.getElementById('chat-messages');
  chatInput = document.getElementById('chat-input');
  sendBtn = document.getElementById('btn-send');
  typingIndicator = document.getElementById('typing-indicator');
  floatingBtn = document.getElementById('floating-chat-btn');
  chatBadge = document.getElementById('chat-badge');

  if (!messagesContainer || !chatInput || !sendBtn) {
    console.warn('Suporte: elementos não encontrados');
    return;
  }

  // Auto-resize textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });

  // Send on Enter (Shift+Enter for newline)
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Send button
  sendBtn.addEventListener('click', sendMessage);

  // Quick action buttons
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.dataset.prompt;
      chatInput.value = prompt;
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
      sendMessage();
    });
  });

  // Floating button
  if (floatingBtn) {
    floatingBtn.addEventListener('click', () => {
      const card = document.querySelector('.glass-card:not(.welcome-card)');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      chatInput.focus();
      if (chatBadge && chatBadge.style.display !== 'none') {
        chatBadge.style.display = 'none';
      }
    });
  }

  // Check if user is logged in
  if (typeof UTILS !== 'undefined' && UTILS.getStorageUser) {
    const user = UTILS.getStorageUser();
    if (!user) {
      messagesContainer.innerHTML = `
        <div class="message assistant">
          <div class="message-bubble">⚠️ Você precisa estar logado para usar o suporte. Faça login primeiro.</div>
        </div>
      `;
      chatInput.disabled = true;
      sendBtn.disabled = true;
    } else {
      chatInput.focus();
      
      // Build system prompt with current user identity
      let systemPrompt = GREMISTAS_CONTEXT;
      // Handle different field names from localStorage
      const userName = user.nome || user.name || user.accessCode || user.token || 'Usuário';
      const userRole = user.role || 'Membro';
      const userDept = user.department || user.department_id || 'Departamento';
      const userCode = user.accessCode || user.token || 'N/A';
      const userColor = user.highlightColor || user.color_hex || '#F7DC6F';
      
      systemPrompt += `\n\n--- USUÁRIO LOGADO AGORA ---\n${userName} (${userRole} - ${userDept}) - Código: ${userCode} - Cor: ${userColor}\n⚠️ REGRA OBRIGATÓRIA: Quando o usuário perguntar "quem sou eu" ou se referir a si mesmo, responda APENAS com: "${userName} (${userRole} - ${userDept}) - Código: ${userCode} - Cor do badge: ${userColor}". NÃO adicione informações extras, NÃO mencione VPS, Hermes, Termux, desenvolvedor, app, nada além do que está na lista dos 16 gremistas.`;
      
      // Update the system message in chat history
      chatHistory[0] = { role: 'system', content: systemPrompt };
    }
  } else {
    chatInput.focus();
  }

  console.log('✅ Suporte/Chat module loaded');
}

function addMessage(role, content) {
  if (!messagesContainer) return;
  const div = document.createElement('div');
  div.className = `message ${role}`;
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  div.innerHTML = `
    <div class="message-bubble">${formatMessage(content)}</div>
    <div class="message-time">${time}</div>
  `;
  messagesContainer.appendChild(div);
  scrollToBottom();
  return div;
}

function formatMessage(text) {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(0,229,255,0.1);padding:2px 6px;border-radius:4px;font-size:0.85em;">$1</code>')
    .replace(/\n/g, '<br>');
}

function scrollToBottom() {
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

function showTyping(show) {
  if (typingIndicator) {
    typingIndicator.classList.toggle('active', show);
    if (show) scrollToBottom();
  }
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || isStreaming) return;

  chatInput.value = '';
  chatInput.style.height = 'auto';
  sendBtn.disabled = true;

  addMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  showTyping(true);
  isStreaming = true;

  try {
    const response = await fetch(HERMES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: chatHistory,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    showTyping(false);

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`HTTP ${response.status}: ${err}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sem resposta';

    addMessage('assistant', reply);
    chatHistory.push({ role: 'assistant', content: reply });

    // Keep history manageable (last 20 messages + system)
    if (chatHistory.length > 21) {
      chatHistory = [chatHistory[0], ...chatHistory.slice(-20)];
    }

  } catch (error) {
    showTyping(false);
    console.error('Chat error:', error);
    addMessage('assistant', `❌ Erro ao conectar com Hermes: ${error.message}\n\nTente novamente em alguns instantes.`);
  } finally {
    isStreaming = false;
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSuporte);
} else {
  initSuporte();
}

// Export for manual init if needed
window.SuporteChat = { init: initSuporte, sendMessage, addMessage };