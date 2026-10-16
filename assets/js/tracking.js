/* Cruzeiro Contabilidade Digital — eventos para o Google Tag Manager
 *
 * Todos os eventos vão para window.dataLayer. No GTM, crie um acionador do tipo
 * "Evento personalizado" com o nome do evento (ex.: clique_whatsapp).
 *
 *   clique_whatsapp        clique em qualquer link de contato no WhatsApp da Cruzeiro
 *   compartilhar_whatsapp  clique em "Compartilhar no WhatsApp" (convite para parceiros)
 *   copiar_link_convite    clique em "Copiar link do convite"
 *   assistir_gravacao      clique para assistir à gravação de um encontro (YouTube)
 *   generate_lead          inscrição aceita pelo Pipe.run (disparado na página de obrigado)
 *
 * Este arquivo precisa ser carregado ANTES de assets/js/piperun.js.
 */
(function () {
  // ---------- Google Tag Manager ----------
  // Cole aqui o ID do contêiner (ex.: "GTM-ABC1234"). Vazio = GTM não carrega,
  // mas os eventos continuam sendo registrados no dataLayer.
  // Lembre de também descomentar o <noscript> do GTM logo após o <body> nas duas páginas.
  var GTM_ID = "";

  window.dataLayer = window.dataLayer || [];
  function push(data) { window.dataLayer.push(data); }

  if (/^GTM-[A-Z0-9]+$/.test(GTM_ID)) {
    push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var gtm = document.createElement("script");
    gtm.async = true;
    gtm.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
    document.head.appendChild(gtm);
  }

  var LEAD_FLAG = "cruzeiro_lead_ok";
  var PIPERUN_INGEST = "/integrations/connect/ingest/";

  // ---------- Cliques em WhatsApp ----------
  document.addEventListener("click", function (event) {
    var el = event.target.closest && event.target.closest("a, button");
    if (!el) return;
    var local = el.getAttribute("data-track-local") || "nao_informado";

    if (el.getAttribute("data-track-event") === "assistir_gravacao") {
      push({ event: "assistir_gravacao", encontro: el.getAttribute("data-track-encontro") || "", link_url: el.getAttribute("href") || "", pagina: location.pathname });
      return;
    }

    if (el.getAttribute("data-share") === "whatsapp") {
      push({ event: "compartilhar_whatsapp", whatsapp_local: local, pagina: location.pathname });
      return;
    }
    if (el.getAttribute("data-share") === "copy") {
      push({ event: "copiar_link_convite", pagina: location.pathname });
      return;
    }
    var href = el.getAttribute("href") || "";
    if (/(^https?:\/\/)?(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(href)) {
      push({ event: "clique_whatsapp", whatsapp_local: local, link_url: href, pagina: location.pathname });
    }
  }, true);

  // ---------- Lead: só quando o Pipe.run confirma o envio ----------
  // O formulário só marca a inscrição como válida quando o Pipe.run responde com
  // sucesso. Erro de validação, erro da API ou falha de rede não geram evento.
  // O evento em si é disparado na página de obrigado, que carrega o GTM inteiro —
  // assim a tag não se perde no meio do redirecionamento.
  // Chamado pelo envio do formulário quando o Pipe.run aceita a inscrição.
  window.cruzeiroMarkLead = function (info) {
    var payload = { form_id: (info && info.form_id) || "rota_tributaria", origem: location.pathname, ts: Date.now() };
    try {
      sessionStorage.setItem(LEAD_FLAG, JSON.stringify(payload));
    } catch (e) {
      // Sem sessionStorage (navegação privada restrita): dispara aqui mesmo.
      push({ event: "generate_lead", form_id: payload.form_id, form_origem: payload.origem });
    }
  };

  // Envio antigo do Pipe.run (submitter.js, usado enquanto o JSON não está ativo):
  // ele não avisa quando dá certo, então observamos a resposta da API.
  if (window.fetch) {
    var originalFetch = window.fetch;
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : (input && input.url) || "";
      var promise = originalFetch.apply(this, arguments);
      if (url.indexOf(PIPERUN_INGEST) === -1) return promise;
      return promise.then(function (response) {
        if (response && response.ok) window.cruzeiroMarkLead({ form_id: "rota_tributaria" });
        return response;
      });
    };
  }

  // Na página de obrigado: dispara uma única vez, e só se veio de um envio aceito.
  // Acesso direto ou recarregar a página não gera lead.
  if (document.documentElement.hasAttribute("data-thank-you")) {
    var stored = null;
    try {
      stored = sessionStorage.getItem(LEAD_FLAG);
      sessionStorage.removeItem(LEAD_FLAG);
    } catch (e) { /* ignore */ }
    if (stored) {
      var lead = {};
      try { lead = JSON.parse(stored) || {}; } catch (e) { /* ignore */ }
      push({ event: "generate_lead", form_id: lead.form_id || "rota_tributaria", form_origem: lead.origem || "" });
    }
  }
})();
