/* Cruzeiro Contabilidade Digital — Rota Tributária */
(function () {
  document.documentElement.classList.remove("no-js");

  // ---------- Gravações dos encontros ----------
  // Cole o link do YouTube de cada encontro já realizado. Vazio = sem botão de gravação.
  var GRAVACOES = {
    "2026-10-13": "", // Encontro 1 · Entenda antes de escolher
    "2026-10-20": "", // Encontro 2 · Veja o que os números revelam
    "2026-10-27": ""  // Encontro 3 · Tire suas dúvidas com o especialista
  };
  var ENCONTRO_NUM = { "2026-10-13": 1, "2026-10-20": 2, "2026-10-27": 3 };

  var PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>';

  function recordingLink(date, className, label) {
    var a = document.createElement("a");
    a.className = className;
    a.href = GRAVACOES[date];
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("data-track-event", "assistir_gravacao");
    a.setAttribute("data-track-encontro", String(ENCONTRO_NUM[date] || ""));
    a.innerHTML = PLAY_ICON + "<span>" + label + "</span>";
    return a;
  }

  // Encontros: cada um termina por volta das 12h (horário de Brasília, UTC-3)
  function endsAt(isoDate) { return new Date(isoDate + "T12:00:00-03:00"); }
  var now = new Date();
  var params = new URLSearchParams(location.search);
  // ?simular=AAAA-MM-DD permite conferir o layout como se fosse outra data
  if (/^\d{4}-\d{2}-\d{2}$/.test(params.get("simular") || "")) now = new Date(params.get("simular") + "T15:00:00-03:00");

  // Linha do tempo: marca encontros realizados (com gravação, se houver) e o próximo
  var steps = document.querySelectorAll(".step[data-date]");
  var nextMarked = false;
  steps.forEach(function (step) {
    var date = step.dataset.date;
    var top = step.querySelector(".step-top");
    var badge = document.createElement("span");
    if (endsAt(date) < now) {
      step.classList.add("is-done");
      badge.className = "badge badge-done";
      badge.textContent = "Realizado";
      top.appendChild(badge);
      if (GRAVACOES[date]) {
        step.classList.add("has-recording");
        badge.className = "badge badge-recorded";
        badge.textContent = "Gravação disponível";
        var time = step.querySelector(".step-time");
        var btn = recordingLink(date, "btn btn-youtube btn-block step-recording", "Assistir à aula no YouTube");
        if (time) time.replaceWith(btn); else step.appendChild(btn);
      }
    } else if (!nextMarked) {
      nextMarked = true;
      step.classList.add("is-next");
      badge.className = "badge badge-next";
      badge.textContent = "Próximo encontro";
      top.appendChild(badge);
    }
  });

  // Links de agenda (página de obrigado): encontro realizado vira link da gravação
  document.querySelectorAll(".cal-list a[data-date]").forEach(function (a) {
    var date = a.dataset.date;
    if (endsAt(date) < now) {
      if (GRAVACOES[date]) {
        a.href = GRAVACOES[date];
        a.classList.add("is-recording");
        a.setAttribute("data-track-event", "assistir_gravacao");
        a.setAttribute("data-track-encontro", String(ENCONTRO_NUM[date] || ""));
        a.querySelector("span").textContent = "▶ Assistir";
      } else {
        a.classList.add("is-done");
        a.setAttribute("aria-disabled", "true");
        a.querySelector("span").textContent = "Realizado";
      }
    }
  });

  // Ano no rodapé
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = now.getFullYear(); });

  // Header com sombra ao rolar
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Compartilhar convite
  var inviteUrl = document.body.dataset.inviteUrl || (location.origin + location.pathname.replace(/obrigado\.html$/, ""));
  var inviteText = "Reforma Tributária: qual rota sua empresa vai seguir? Trilha de webinars gratuita da Cruzeiro Contabilidade, com Fernando Bertolla. Inscreva-se: ";
  document.querySelectorAll('[data-share="whatsapp"]').forEach(function (a) {
    a.href = "https://wa.me/?text=" + encodeURIComponent(inviteText + inviteUrl);
  });
  document.querySelectorAll('[data-share="copy"]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      var feedback = btn.parentElement.querySelector(".copy-feedback");
      function done(msg) { if (feedback) feedback.textContent = msg; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(inviteUrl).then(
          function () { done("Link copiado! Agora é só colar e enviar."); },
          function () { done(inviteUrl); }
        );
      } else {
        done(inviteUrl);
      }
    });
  });

  // Animação de entrada
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  // CTA fixo no mobile: aparece depois do formulário sair da tela
  var mobileCta = document.querySelector(".mobile-cta");
  var formCard = document.querySelector("#inscricao");
  if (mobileCta && formCard && "IntersectionObserver" in window) {
    var past = false, formVisible = true;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        formVisible = e.isIntersecting;
        past = !e.isIntersecting && e.boundingClientRect.top < 0;
      });
      mobileCta.classList.toggle("is-visible", past && !formVisible);
    }).observe(formCard);
  }
})();
