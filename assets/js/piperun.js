/* Cruzeiro Contabilidade Digital — envio do formulário para o CRM Pipe.run
 *
 * Integração via JSON: https://ajuda.crmpiperun.com/como-configurar-uma-integracao-via-json
 *
 * Preencha PIPERUN.stageHash para ativar. Enquanto estiver vazio, a página usa o
 * envio antigo do Pipe.run (o mesmo da LP da lpage.run), para não perder leads.
 */
(function () {
  var PIPERUN = {
    // Hash da etapa do funil onde o lead deve entrar (obrigatório para ativar o JSON).
    stageHash: "70b994aa-a208-4906-9de2-2982127ce713",
    // E-mail do usuário dono da oportunidade. Vazio = sem dono (use a distribuição da etapa).
    owner: "",
    // Tags da oportunidade (são criadas automaticamente se não existirem).
    tags: ["Rota Tributária 2027"],
    // Origem da oportunidade quando a visita chega sem utm_source (com UTM, vale a utm_source).
    source: "LP Rota Tributária",
    // Prefixo do título da oportunidade; o nome da pessoa é adicionado no final.
    titlePrefix: "Rota Tributária 2027 · ",
    // Página para onde a pessoa vai depois de uma inscrição aceita.
    redirectUrl: "obrigado.html"
  };

  // Envio antigo (lpage.run / Pipe.run Landing Page) — usado só sem stageHash.
  var LEGACY = { hash: "4ks7o30fd8cgo0cggs4ccoockgok44k" };

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  var UTM_STORAGE = "cruzeiro_utms";

  var form = document.querySelector("#inscricao form");
  if (!form) return;

  if (!PIPERUN.stageHash) {
    loadLegacy();
    return;
  }

  // ---------- UTMs: guarda na sessão para não perder a campanha ----------
  function readUtms() {
    var params = new URLSearchParams(location.search);
    var fromUrl = {};
    UTM_KEYS.forEach(function (k) { var v = params.get(k); if (v) fromUrl[k] = v; });
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(UTM_STORAGE)) || {}; } catch (e) { /* ignore */ }
    if (Object.keys(fromUrl).length) {
      stored = fromUrl; // nova campanha substitui a anterior
      try { sessionStorage.setItem(UTM_STORAGE, JSON.stringify(stored)); } catch (e) { /* ignore */ }
    }
    return stored;
  }
  var utms = readUtms();

  // ---------- Máscara e validação do WhatsApp ----------
  var phone = form.querySelector('[name="person_phone"]');
  function formatPhone(digits) {
    digits = digits.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits.length ? "(" + digits : "";
    var ddd = digits.slice(0, 2), rest = digits.slice(2);
    var split = rest.length > 8 ? 5 : 4; // celular (9 dígitos) ou fixo (8)
    return "(" + ddd + ") " + rest.slice(0, split) + (rest.length > split ? "-" + rest.slice(split) : "");
  }
  function validatePhone() {
    var n = phone.value.replace(/\D/g, "").length;
    phone.setCustomValidity(n === 10 || n === 11 ? "" : "Informe o WhatsApp com DDD, ex.: (54) 99999-9999.");
  }
  if (phone) {
    phone.addEventListener("input", function () { phone.value = formatPhone(phone.value); validatePhone(); });
    validatePhone();
  }

  // ---------- Mensagem de erro no próprio formulário ----------
  var errorBox = form.querySelector(".form-error");
  function showError(msg) {
    if (!errorBox) { alert(msg); return; }
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function clearError() { if (errorBox) { errorBox.hidden = true; errorBox.textContent = ""; } }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function nowBR() {
    var d = new Date();
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function buildPayload() {
    var name = form.person_name.value.trim();
    var email = form.person_email.value.trim().toLowerCase();
    var whats = phone ? phone.value.trim() : "";

    var custom = { "Página de conversão": location.origin + location.pathname };
    UTM_KEYS.forEach(function (k) { if (utms[k]) custom[k] = utms[k]; });

    var lead = {
      id: email, // evita oportunidade duplicada para o mesmo e-mail
      title: PIPERUN.titlePrefix + name,
      user: PIPERUN.owner,
      name: name,
      email: email,
      mobile_phone: whats,
      person_phone_main: whats,
      last_conversion: { source: utms.utm_source || PIPERUN.source }, // UTM do anúncio tem prioridade
      custom_fields: custom,
      tags: PIPERUN.tags,
      notes: [
        "Inscrição na trilha de webinars Rota Tributária 2027 (13, 20 e 27/10, às 11h).<br/>" +
        "Nome: " + name + "<br/>" +
        "E-mail: " + email + "<br/>" +
        "WhatsApp: " + whats + "<br/>" +
        "Aceite da Política de Privacidade e contato por e-mail/WhatsApp: sim (" + nowBR() + ")" +
        (Object.keys(utms).length ? "<br/>" + Object.keys(utms).map(function (k) { return k + ": " + utms[k]; }).join("<br/>") : "")
      ]
    };
    Object.keys(lead).forEach(function (k) { if (lead[k] === "") delete lead[k]; });

    return {
      rules: { update: true, equal_pipeline: true, status: "open", filter_status_update: "open" },
      leads: [lead]
    };
  }

  // ---------- Envio ----------
  // O evento "submit" só chega aqui depois que o navegador validou os campos
  // obrigatórios, o e-mail, o WhatsApp e o aceite da política.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearError();

    var honeypot = form.querySelector('[name="anti_spam"]');
    if (honeypot && honeypot.value) return; // robô

    var button = form.querySelector('button[type="submit"]');
    var label = button.textContent;
    button.disabled = true;
    button.textContent = "Enviando...";

    fetch("https://api.pipe.run/v1/integrations/json/ingest/" + encodeURIComponent(PIPERUN.stageHash), {
      method: "POST",
      // text/plain é intencional (recomendação do Pipe.run): evita a requisição prévia de CORS.
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(buildPayload())
    })
      .then(function (response) {
        return response.text().then(function (text) {
          var body = null;
          try { body = JSON.parse(text); } catch (e) { /* resposta sem JSON */ }
          if (!response.ok || (body && body.success === false)) {
            throw new Error("HTTP " + response.status + ": " + text);
          }
          return body;
        });
      })
      .then(function () {
        if (window.cruzeiroMarkLead) window.cruzeiroMarkLead({ form_id: "rota_tributaria", crm: "piperun_json" });
        form.reset();
        location.href = PIPERUN.redirectUrl;
      })
      .catch(function (error) {
        console.error("[Pipe.run] Falha ao enviar lead:", error);
        showError("Não conseguimos concluir sua inscrição agora. Tente de novo em instantes ou fale com a gente pelo WhatsApp.");
        button.disabled = false;
        button.textContent = label;
      });
  });

  // ---------- Envio antigo (fallback) ----------
  function loadLegacy() {
    var scripts = [
      "https://static.pipe.run/js/landing-page/submitter.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js"
    ];
    var pending = scripts.length;
    scripts.forEach(function (src) {
      var s = document.createElement("script");
      s.src = src;
      s.async = false; // mantém a ordem
      s.onload = s.onerror = function () { if (--pending === 0) initLegacy(); };
      document.body.appendChild(s);
    });
  }
  function initLegacy() {
    if (typeof LandingPageSubmitter === "undefined") return;
    [
      new LandingPageSubmitter({
        hash: LEGACY.hash,
        hasThankYouPage: true,
        apiUrl: "https://api.pipe.run",
        successMessage: null,
        redirectUrl: PIPERUN.redirectUrl,
        redirectTarget: 0,
        customFields: []
      }),
      new LandingPageHelpers(),
      new LandingPagePhoneInput()
    ].forEach(function (s) { s.init(); });
  }
})();
