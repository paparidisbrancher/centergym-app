# Trazer correções do openGym

A Center Gym acompanha o código do [openGym](https://github.com/DuarteSantos8/openGym)
(Duarte Santos, GNU AGPL-3.0-or-later). A marca desta implantação fica de fora desse
fluxo: ela entra por [`frontend/brand.json`](../frontend/brand.json) e pelos poucos
pontos listados abaixo. O restante pode receber um merge do upstream.

Em 22 de outubro de 2026 o ancestral comum era `1350409` (o commit do upstream
imediatamente anterior à marca). O `main` do openGym estava em `e348fc17`, 608
commits à frente, já com as versões 1.4.0 e 1.4.1 — inclusive a troca do banco de
exercícios. O próximo sync não é um fast-forward. Faça numa branch e revise os
conflitos; não misture essa atualização com uma troca de logo.

## Remotes

`origin` é este repositório (`paparidisbrancher/centergym-app`). Um clone novo não
traz o upstream.

```bash
git remote add upstream https://github.com/DuarteSantos8/openGym.git
git fetch upstream
git checkout main
git checkout -b sync/opengym-AAAA-MM-DD
git merge upstream/main
```

Não faça push para `upstream`. Não abra pull request no openGym com a logo, as cores,
o README ou o workflow de prévia desta academia.

## Onde a marca mora

`frontend/brand.json` guarda o nome, a descrição, os arquivos de logo e ícone e as
paletas clara e escura. O build lê esse arquivo em `frontend/vite.config.js` (plugin
`gymBrand`) e reescreve o título, as metas e o `manifest.json` gerado. Em runtime,
`frontend/src/lib/brand.js` (`applyBrand`) aplica as variáveis CSS e o título por cima
da preferência de acento que o aluno tenha sincronizada.
`frontend/src/components/GymBrand.jsx` desenha a logo.

Estes caminhos são só desta implantação. Num conflito, fique com a versão da Center Gym
no arquivo inteiro:

| Caminho | Função |
|---|---|
| `frontend/brand.json` | Nome, logo, ícones, paletas |
| `frontend/public/logo.png`, `icon-180.png`, `icon-512.png` | Arquivos citados pelo JSON |
| `frontend/src/lib/brand.js`, `frontend/src/lib/brand.test.js` | Aplicar a paleta |
| `frontend/src/components/GymBrand.jsx` | Componente da logo |
| `docs/GYM_BRANDING.md` | Como trocar a academia |
| `docs/UPSTREAM.md` | Este guia |

Há marca dentro de arquivos que o upstream continua editando. Fique com o lado da
Center Gym só no trecho indicado e aceite o upstream no resto do arquivo:

- `frontend/src/lib/default-lang.js` — `autoLang` cai em `pt-BR`, sem consultar o idioma do navegador nem voltar para o inglês.
- `frontend/src/store/useStore.js` — `DEF.lang` e `detectedLang()` também são `pt-BR`.
- `frontend/index.html` e `frontend/public/manifest.json` — título e cores no fonte. O plugin do Vite reescreve os dois a partir de `brand.json` no build.
- `frontend/src/lib/plan-share.js` — o kicker do PDF diz "Center Gym".
- `frontend/src/lib/demo.js` — `REPO` é `https://github.com/paparidisbrancher/centergym-app`.
- `frontend/src/locales/pt-BR.js` — as strings de marca que deixaram de dizer openGym.
- `frontend/src/App.jsx` — chama `applyBrand` depois das preferências do aluno.
- `frontend/src/views/Home.jsx`, `Login.jsx`, `Settings.jsx` — usam `GymBrand`. Configurações não mostra o seletor de cor de acento.
- `frontend/src/index.css` — regras da logo.
- `frontend/vite.config.js` — o plugin `gymBrand` na lista de plugins.
- `README.md` e o aviso no topo de `NOTICE.md` — obra modificada, data e crédito ao openGym. Não troque pelo README do upstream: ele traz badges, demo e Discord do autor como se fossem desta cópia.
- `.github/workflows/pages.yml` — a prévia no GitHub Pages. Não substitua pelos workflows de release do upstream.
- `.github/dependabot.yml` — único bot de dependência desta cópia.

`RP_NAME` no `.env` é o nome que a passkey mostra e não é lido de `brand.json`.
Numa instância da Center Gym use `RP_NAME=Center Gym`. O `.env.example` conserva o
exemplo do upstream de propósito, para um merge continuar legível.

## Depois do merge

```bash
cd frontend && npm test
cd ../api && npm test
```

A suíte de idioma (`frontend/src/lib/default-lang.test.js`,
`frontend/src/store/useStore.default-lang.test.jsx` e um caso em
`useStore.restore.test.jsx`) espera `pt-BR` quando `DEFAULT_LANG` não nomeia um idioma
desta cópia. Um sync que reponha o fallback do upstream (navegador, depois inglês)
quebra esses testes. Não reverta `autoLang` só para a suíte ficar verde.

As fixtures do coach em `api/test/helpers.mjs` datam a sessão de exemplo em relação a
hoje. A janela de revisão é de 12 semanas; uma data fixa antiga faz o review voltar
`nochange`. Mantenha a data relativa.

Suba a instância com `docker compose up -d --build`. As linhas `image:` do Compose
apontam para `ghcr.io/duartesantos8/opengym-*`, que são o openGym sem esta marca.
`docker compose pull` não produz a Center Gym.

A licença continua a GNU AGPL-3.0-or-later. Conservar `LICENSE` e os textos de
terceiro em `NOTICE.md` faz parte do sync. O aviso de obra modificada no topo do
`NOTICE.md` fica.

## O que não trazer de volta

- Badges, a demo e o Discord de `opengym.duarte-santos.ch` como canais desta academia.
- `.gitlab-ci.yml`, `.gitea/`, `renovate.json` e o `test.yml` completo do upstream (imagens, APK, SBOM). Esta cópia usa GitHub Actions para a prévia (`pages.yml`) e, à parte, a suíte de frontend e API. Dependabot continua o único bot de dependência. Não traga `.github/workflows/cla.yml` nem `cla-issue.yml`: eles comentam em todo pull request e apontam para o CLA do openGym.
- `catalogue.yml` só valida o catálogo de exercícios (leitura). Pode ficar.
- A mídia grande dos exercícios continua fora do git. Desde o v1.4 o upstream versiona os stills e clipes de 180 px em `catalogue/media` (licença no `NOTICE.md` de lá). Esse diretório entra no sync e o `pages.yml` copia-o para a prévia com `scripts/catalogue/stage-media.mjs`. Não apague `catalogue/media` para "deixar a mídia de fora", e não volte a apontar a prévia para o dataset antigo no jsDelivr.
