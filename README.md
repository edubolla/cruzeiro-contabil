# Cruzeiro Contabilidade Digital — Rota Tributária

Landing page da trilha de webinars **"Reforma Tributária: qual rota sua empresa vai seguir?"** e página de obrigado.

- `index.html` — LP com formulário de inscrição
- `obrigado.html` — página pós-inscrição
- `assets/` — CSS, JS e imagens

## Formulário (Pipe.run)

O formulário continua enviando para o mesmo funil do Pipe.run (hash `4ks7o30fd8cgo0cggs4ccoockgok44k`), via `submitter.js` oficial.
Os campos `person_name`, `person_email`, `person_phone`, `privacy_policy` e `anti_spam` **não devem ser renomeados**.
Após o envio, o usuário é redirecionado para `obrigado.html` (ajuste `redirectUrl` no fim do `index.html` se a URL final mudar).

## Rodar localmente

```bash
python3 -m http.server 5173
```
