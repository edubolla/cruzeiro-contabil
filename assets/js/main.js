/* Cruzeiro Contabilidade Digital — Rota Tributária */
(function () {
  document.documentElement.classList.remove("no-js");

  // Encontros: cada um termina por volta das 12h (horário de Brasília, UTC-3)
  function endsAt(isoDate) { return new Date(isoDate + "T12:00:00-03:00"); }
  var now = new Date();

  // Linha do tempo: marca encontros realizados e o próximo
  var steps = document.querySelectorAll(".step[data-date]");
  var nextMarked = false;
  steps.forEach(function (step) {
    var top = step.querySelector(".step-top");
    var badge = document.createElement("span");
    if (endsAt(step.dataset.date) < now) {
      step.classList.add("is-done");
      badge.className = "badge badge-done";
      badge.textContent = "Realizado";
      top.appendChild(badge);
    } else if (!nextMarked) {
      nextMarked = true;
      step.classList.add("is-next");
      badge.className = "badge badge-next";
      badge.textContent = "Próximo encontro";
      top.appendChild(badge);
    }
  });

  // Links de agenda (página de obrigado)
  document.querySelectorAll(".cal-list a[data-date]").forEach(function (a) {
    if (endsAt(a.dataset.date) < now) {
      a.classList.add("is-done");
      a.setAttribute("aria-disabled", "true");
      a.querySelector("span").textContent = "Realizado";
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
