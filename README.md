# Cruzeiro Contabilidade Digital — Rota Tributária

Landing page da trilha de webinars **"Reforma Tributária: qual rota sua empresa vai seguir?"** e página de obrigado.

- `index.html` — LP com formulário de inscrição
- `obrigado.html` — página pós-inscrição
- `assets/` — CSS, JS e imagens

## Formulário → CRM Pipe.run (integração via JSON)

Tudo fica em `assets/js/piperun.js`, no bloco `PIPERUN` do topo:

| Campo | O que é |
|---|---|
| `stageHash` | Hash da etapa do funil onde o lead entra. **Vazio = usa o envio antigo** do Pipe.run (LP da lpage.run) |
| `owner` | E-mail do dono da oportunidade. Vazio = sem dono (use a distribuição da etapa) |
| `tags` | Tags da oportunidade (criadas automaticamente se não existirem) |
| `source` | Origem da oportunidade quando não há `utm_source`. Com UTM, a origem é o valor de `utm_source` (ex.: `meta`) |
| `titlePrefix` | Prefixo do título; o nome da pessoa vai no final |
| `redirectUrl` | Página após inscrição aceita (`obrigado.html`) |

O que vai para o Pipe.run em cada inscrição:
- nome, e-mail (em minúsculas) e WhatsApp (`mobile_phone` e `person_phone_main`);
- `id` = e-mail, com `update: true` e `equal_pipeline: true`: se a pessoa se inscrever de novo, a oportunidade aberta no mesmo funil é atualizada em vez de duplicada;
- campos personalizados: página de conversão e UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`, `fbclid`), guardadas na sessão;
- nota com os dados, o aceite da política (com data e hora) e as UTMs.

O envio só acontece depois da validação do navegador (campos obrigatórios, e-mail, WhatsApp com DDD e aceite). Se o Pipe.run recusar ou a conexão falhar, aparece uma mensagem no formulário e a pessoa pode tentar de novo; nesse caso não há redirecionamento nem evento de lead.

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

**Como o `generate_lead` garante que o envio foi válido:** a validação do navegador (campos obrigatórios, e-mail, aceite da política) barra envios incompletos antes de chegar ao Pipe.run. Depois, o `piperun.js` só marca o lead quando o Pipe.run responde com sucesso (no envio antigo, o `tracking.js` observa a resposta da API). O evento é disparado na `obrigado.html`, onde o GTM carrega por completo. Acesso direto ou recarregar a página de obrigado não gera lead.

Novo link de WhatsApp? Basta usar `href="https://wa.me/..."` e, de preferência, `data-track-local="nome_do_local"`.

## Rodar localmente

```bash
python3 -m http.server 5173
```
