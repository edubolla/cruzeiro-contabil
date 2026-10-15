# Cruzeiro Contabilidade Digital — Rota Tributária

Landing page da trilha de webinars **"Reforma Tributária: qual rota sua empresa vai seguir?"** e página de obrigado.

- `index.html` — LP com formulário de inscrição
- `obrigado.html` — página pós-inscrição
- `assets/` — CSS, JS e imagens

## Formulário (Pipe.run)

O formulário continua enviando para o mesmo funil do Pipe.run (hash `4ks7o30fd8cgo0cggs4ccoockgok44k`), via `submitter.js` oficial.
Os campos `person_name`, `person_email`, `person_phone`, `privacy_policy` e `anti_spam` **não devem ser renomeados**.
Após o envio, o usuário é redirecionado para `obrigado.html` (ajuste `redirectUrl` no fim do `index.html` se a URL final mudar).

## Google Tag Manager e eventos

Tudo fica em `assets/js/tracking.js`.

1. Coloque o ID do contêiner em `GTM_ID` (ex.: `"GTM-ABC1234"`). Vazio = GTM não carrega.
2. Descomente o `<noscript>` do GTM logo após o `<body>` em `index.html` e `obrigado.html`, trocando `GTM-XXXXXXX`.
3. No GTM, crie acionadores do tipo **Evento personalizado** com os nomes abaixo.

| Evento | Quando dispara | Variáveis da camada de dados |
|---|---|---|
| `clique_whatsapp` | clique em link de contato no WhatsApp da Cruzeiro | `whatsapp_local` (`header`, `rodape`, `obrigado_falar_equipe`), `link_url`, `pagina` |
| `compartilhar_whatsapp` | clique em "Compartilhar no WhatsApp" (convite) | `whatsapp_local` (`lp_convite`, `obrigado_convite`), `pagina` |
| `copiar_link_convite` | clique em "Copiar link do convite" | `pagina` |
| `generate_lead` | inscrição **aceita pelo Pipe.run** (dispara na página de obrigado, uma única vez) | `form_id`, `form_origem` |

**Como o `generate_lead` garante que o envio foi válido:** a validação do navegador (campos obrigatórios, e-mail, aceite da política) barra envios incompletos antes de chegar ao Pipe.run. Depois, o `tracking.js` observa a resposta da API do Pipe.run e só marca o lead se ela vier com sucesso (`response.ok`). O evento é disparado na `obrigado.html`, onde o GTM carrega por completo. Acesso direto ou recarregar a página de obrigado não gera lead.

Novo link de WhatsApp? Basta usar `href="https://wa.me/..."` e, de preferência, `data-track-local="nome_do_local"`.

## Rodar localmente

```bash
python3 -m http.server 5173
```
