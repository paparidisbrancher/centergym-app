<div align="center">

<img src="frontend/public/logo.png" alt="Center Gym" width="280">

**O treino da Center Gym, no servidor da própria academia.**

Planeje a semana, conduza o treino e registre cada série e o peso corporal —
no celular, sincronizado entre aparelhos, com login por passkey.

[Prévia](https://paparidisbrancher.github.io/centergym-app/) ·
[Self-hosting](docs/SELF_HOSTING.md) ·
[Identidade](docs/GYM_BRANDING.md) ·
[Licença AGPL-3.0](LICENSE) ·
[NOTICE](NOTICE.md)

</div>

> **Obra modificada (6 de outubro de 2026) / Modified work (2026-10-06).**
> Center Gym é uma implantação com marca própria do [openGym](https://github.com/DuarteSantos8/openGym), de Duarte Santos (Copyright © 2026 Duarte Santos). O código desta cópia continua sob a [GNU AGPL v3.0 ou posterior](LICENSE), a mesma licença do original, inclusive a permissão adicional da seção 7 descrita em [NOTICE.md](NOTICE.md). Este repositório não é o projeto upstream: o site, a demo, o Discord, os badges de estrelas e as imagens publicadas em nome do openGym pertencem ao autor original.

## O que é

A Center Gym usa este aplicativo para o aluno planejar a semana, treinar com guia e acompanhar carga, repetições e peso corporal. Os dados ficam numa pasta do servidor da implantação — sem conta em serviço de terceiro, sem assinatura e sem telemetria no build padrão.

A marca (nome, logo, ícones e paleta preto e branco) fica isolada em [`frontend/brand.json`](frontend/brand.json). Login, início, configurações, título do navegador e o manifesto do app instalado leem esse arquivo. O restante do código segue o openGym, para que correções do upstream possam entrar sem misturar a identidade da academia. O passo a passo dessa separação está em [docs/GYM_BRANDING.md](docs/GYM_BRANDING.md).

<table align="center">
<tr>
<td align="center"><img src="assets/screenshots/home.png" alt="Tela inicial do aplicativo" width="230"><br><sub><b>Início</b> · treino do dia e peso</sub></td>
<td align="center"><img src="assets/screenshots/workout.png" alt="Tela de treino guiado" width="230"><br><sub><b>Treino</b> · demonstração e séries</sub></td>
<td align="center"><img src="assets/screenshots/stats.png" alt="Tela de estatísticas" width="230"><br><sub><b>Estatísticas</b> · mapa, gráficos e recordes</sub></td>
</tr>
</table>

<p align="center"><sub>As capturas mostram o fluxo herdado do openGym. Nesta implantação a logo e as cores vêm de <code>frontend/brand.json</code> (preto e branco), não do verde do projeto original.</sub></p>

## Prévia

<https://paparidisbrancher.github.io/centergym-app/> é a prévia **deste** repositório, publicada pelo GitHub Pages (`.github/workflows/pages.yml`) com `VITE_DEMO=1`. O aplicativo abre em modo convidado, com um histórico de exemplo, e as imagens dos exercícios vêm do conjunto de dados upstream. Não é o servidor da academia e não é a demonstração do autor do openGym.

## Subir uma instância

É preciso [Docker](https://docs.docker.com/get-docker/) com Compose.

```bash
git clone https://github.com/paparidisbrancher/centergym-app.git
cd centergym-app
cp .env.example .env
docker compose up -d --build
```

Abra <http://localhost:8080>. A primeira subida baixa a mídia dos exercícios (cerca de 140 MB) uma vez.

Use `--build`. As linhas `image:` do `docker-compose.yml` ainda apontam para as imagens upstream `ghcr.io/duartesantos8/opengym-{api,web}`. Um `docker compose pull` sobe o openGym sem a marca da Center Gym, porque nome, logo e paleta entram no frontend na hora do build.

No `.env`, defina `RP_NAME=Center Gym` para o nome que o sistema mostra no prompt da passkey. `RP_ID` e `ORIGIN` precisam ser o hostname e a URL exatos da implantação; passkey exige HTTPS fora de localhost. O guia de [self-hosting](docs/SELF_HOSTING.md) cobre Cloudflare Tunnel, Caddy, Traefik e nginx, com guias separados para [HTTPS na rede local](docs/SELF_HOSTING_HTTPS.md) e [Kubernetes](docs/SELF_HOSTING_KUBERNETES.md).

<details>
<summary><b>Variáveis de ambiente</b> (todas pelo <code>.env</code>)</summary>

| Variável | Função | Padrão |
|---|---|---|
| `RP_ID` | Hostname ao qual a passkey fica presa | `localhost` |
| `ORIGIN` | URL completa em que o app é servido | `http://localhost:8080` |
| `WEB_PORT` | Porta do host para a interface | `8080` |
| `NGINX_PORT` | Porta em que o nginx escuta dentro do container | `80` |
| `BACKEND` | Nome do serviço da API para o proxy de `/api` | `api` |
| `PORT` | Porta da API; o container web usa o mesmo valor | `3000` |
| `RP_NAME` | Nome no prompt da passkey. Nesta implantação: `Center Gym` | `openGym` no exemplo upstream |
| `SESSION_DAYS` | Duração do login, em dias | `90` |
| `ADMIN_UIDS` | Ids com acesso ao painel de administração, separados por vírgula | *(nenhum)* |
| `INVITE_ONLY` | Exigir código de convite para criar perfil | *(desligado)* |
| `ALLOW_GUEST` | Oferecer continuar sem conta; `0` exige perfil | *(ligado)* |
| `PASSWORD_LOGIN` | Oferecer nome e senha além da passkey | *(desligado)* |
| `TRUST_PROXY` | A limitação de login lê o endereço do cliente nos cabeçalhos do proxy | `1` no `docker-compose.yml` |
| `AUDIT_LOG` | Registrar logins e ações de admin; `0` não registra | *(ligado)* |
| `AUDIT_MAX` | Eventos mantidos no log; `0` sem limite | `5000` |
| `AUDIT_DAYS` | Dias mantidos no log; `0` vale até `AUDIT_MAX` | `90` |
| `AUDIT_IP` | Gravar o endereço de quem chama: `off`, `net` ou `full` | `off` |
| `VAPID_SUBJECT` | URL de contato enviada com as notificações push | o `ORIGIN` |
| `API_TARGET` | Alvo da imagem da API: `default`, ou `coach` com o SDK do coach | `default` |
| `COACH_DISABLED` | `1` desliga o coach de IA na instância inteira | *(não definido)* |

As chaves de push são geradas na primeira execução em `./data/vapid.json`. `DATA_DIR` fica fixo em `/data` dentro do container e mapeado para `./data` no host. O [guia de self-hosting](docs/SELF_HOSTING.md) detalha cada opção.

</details>

## O que o aplicativo faz

**Planejamento**

- Uma rotina por dia da semana, sobre uma biblioteca de **1.324 exercícios** com demonstração animada, busca e mapa muscular. Dá para filtrar pelo equipamento disponível.
- Quatro planos iniciais (Push/Pull/Legs, Upper/Lower, Full Body, 5×5), editáveis como qualquer outra rotina.
- Mover uma sessão de dia sem alterar o plano da semana. A semana começa na segunda ou no domingo.
- Superséries, aquecimento, drop set, rest-pause, exercícios por tempo, cardio por tempo e velocidade, descanso por exercício e deload planejado.
- Exercícios próprios, com foto, GIF ou vídeo curto. Dados de localização são removidos no aparelho antes do envio.

**Treino**

- Sessão guiada: o treino do dia já vem preenchido com a carga da última vez, o descanso corre entre as séries e os recordes aparecem na hora.
- Tela enxuta, com visão em cartões ou em lista. O esforço pode ser RIR ou RPE.
- Cálculo de anilhas para barra, EZ, trap bar e Smith, a partir das anilhas disponíveis.
- Exercícios de peso corporal registram repetições e, se houver, a carga da cinta.
- Repetições por lado, tela acesa durante o treino e alerta visual do descanso.

**Progresso**

- Regras de progressão por rotina ou por exercício: linear, Greyskull LP, progressão dupla numa faixa de repetições, ou tempo. Repetição faltando não aumenta a carga; estagnação dispara deload.
- 1RM estimado, equilíbrio estrutural, mapa de calor do ano e mapa muscular (volume, recuperação e o que ficou sem treino).
- Gráfico de peso corporal com uma linha de meta.
- Editar um treino já salvo, registrar um treino feito no papel ou corrigir a data. Os recordes são relidos do histórico corrigido.

**Contas e dados**

- Passkey (Face ID, Touch ID, digital) e dados por perfil, sincronizados entre aparelhos. Senha pode ser ligada na instância. Um aparelho novo entra com código de uso único ou QR.
- Duas edições ao mesmo tempo se combinam em vez de uma sobrescrever a outra.
- Importação de FitNotes, Strong, Hevy (CSV ou chave de API) e peso do Apple Health. Exportação de tudo num JSON.
- Compartilhar um plano ou imprimir em PDF.
- Painel de administração opcional, cadastro só por convite e log de atividade.
- 17 idiomas, inclusive árabe da direita para a esquerda. O padrão desta implantação é português do Brasil.

**Extras, desligados por padrão**

- Um [coach de IA](docs/AI_COACH.md) que rascunha a semana e depois sugere mudanças com base no que foi registrado. Cada mudança precisa de aprovação. Roda no seu servidor, com a chave do provedor que você configurar.
- Um [servidor MCP](mcp/README.md) para um assistente local ler o histórico de treino. Somente leitura; não entra na imagem Docker.

O histórico de versões do código herdado está no [changelog](CHANGELOG.md).

## Celular

O mesmo código gera um app com Capacitor: sem conta e sem servidor, os dados ficam no aparelho, com lembretes nativos.

Esta cópia **não** publica APK assinado nem usa a loja. O APK e o site `opengym.duarte-santos.ch` são do openGym upstream, com a marca original, e não devem ser distribuídos como Center Gym. Para um build próprio, siga [docs/MOBILE.md](docs/MOBILE.md). No iPhone, o caminho suportado sem loja é a PWA (Safari → Adicionar à Tela de Início) ou um build local no Xcode.

## Como funciona

- **`frontend/`** — React 19 e Vite (React Router, Zustand). A identidade da academia entra por `frontend/brand.json` no build.
- **`api/`** — `node:http`, sem framework. Dependências de runtime: `@simplewebauthn/server` (passkey) e `web-push`. O estado é JSON em `./data`.
- **`web/`** — constrói o frontend e serve com nginx, fazendo proxy de `/api` para uma única origem, que a passkey exige.

A lógica de treino (progressão, 1RM, releitura da sessão) está em funções puras em `frontend/src/lib/`, com teste ao lado. A API HTTP está em [`api/openapi.yaml`](api/openapi.yaml).

Cada perfil é um documento com revisão no servidor. O aparelho envia a revisão que viu; se outro aparelho gravou no meio, o servidor recusa, devolve o documento atual, e o aparelho combina e tenta de novo. O que ainda não chegou ao servidor não é apagado ao desconectar.

| Arquivo em `./data` | Conteúdo |
|---|---|
| `db.json` | Perfis e dados públicos de passkey |
| `state-<usuário>.json` | Plano, treinos, peso corporal e ajustes |
| `audit.log` | Log de administração (sem IP, a menos que você ligue) |
| `secret` | Chave que assina o cookie de sessão |

Copiar `./data` é o backup. A chave privada da passkey não vai para o servidor.

## Documentação

O [índice](docs/README.md) separa os guias por leitor. Os mais usados:

| Quero | Leia |
|---|---|
| Resposta curta | [FAQ](docs/FAQ.md) |
| Subir esta instância | [Self-hosting](docs/SELF_HOSTING.md) |
| Trocar nome, logo e cores | [Identidade](docs/GYM_BRANDING.md) |
| App Android ou iPhone | [Celular](docs/MOBILE.md) |
| Trazer histórico de outro app | [Importação](docs/DATA_IMPORTS.md) |
| Ligar o coach de IA | [Coach](docs/AI_COACH.md) |
| Reportar um problema de segurança do código herdado | [Security](SECURITY.md) |

Problema de login nesta implantação é quase sempre `RP_ID` ou `ORIGIN` diferente do endereço real. O guia de self-hosting descreve o caso.

## Créditos, licença e avisos

### Projeto original

O aplicativo é o openGym, escrito e mantido por Duarte Santos e por quem contribuiu naquele repositório:

- Código e histórico: <https://github.com/DuarteSantos8/openGym>
- Copyright do código original: © 2026 Duarte Santos
- O upstream documenta o próprio processo de desenvolvimento em `CLAUDE.md` e no README original. Esse texto descreve o openGym, não uma equipe da Center Gym.

Canais do **autor original** (não são suporte desta academia): o site e a demo em <https://opengym.duarte-santos.ch>, o [Discord](https://discord.gg/e62jY6fwVb) e as [Discussions](https://github.com/DuarteSantos8/openGym/discussions). Issues desta implantação ficam em <https://github.com/paparidisbrancher/centergym-app/issues>.

Modificações nesta cópia, com data relevante de 6 de outubro de 2026: identidade Center Gym (`frontend/brand.json`, logo, ícones, paleta e textos de marca) e a documentação que distingue esta implantação do upstream. O restante acompanha o openGym.

### Licença

O código do openGym e as modificações desta cópia estão sob a [GNU AGPL v3.0 ou posterior](LICENSE). Você pode hospedar, usar, modificar e compartilhar. Se oferecer uma versão modificada como serviço na rede, precisa disponibilizar o código-fonte correspondente sob a mesma licença.

A permissão adicional da seção 7 (distribuição do app móvel por lojas cujo contrato seria incompatível com a AGPL, desde que o fonte continue disponível sob a AGPL) está reproduzida em [NOTICE.md](NOTICE.md). Ela vale para o canal de distribuição e não afrouxa o resto da licença.

### Mídia dos exercícios

> [!IMPORTANT]
> **A mídia dos exercícios não entra nessa licença.** Metadados e textos de instrução vêm do [ExerciseDB v1](https://exercisedb.dev/) via [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset), sob MIT. Imagens e animações são conteúdo de terceiro, nem MIT nem AGPL, com titularidade disputada entre [Gym visual](https://gymvisual.com/) e [ExerciseDB/AscendAPI](https://exercisedb.io/faq). Esta cópia não redistribui essa mídia (a instância baixa na primeira subida) e não a relicencia. Para reutilizá-la, resolva a licença com o titular.

Os avisos completos, inclusive a geometria do diagrama corporal (MuscleMap, MIT), o renderizador de QR (`lean-qr`, MIT) e as traduções para português, estão em [NOTICE.md](NOTICE.md). Esse arquivo é mantido junto com o código; não apague os textos de licença de terceiro ao atualizar a marca.

### English

Center Gym is a modified deployment of [openGym](https://github.com/DuarteSantos8/openGym) (Copyright © 2026 Duarte Santos). Modifications in this repository, dated 2026-10-06, are the gym's name, logo, icons and black-and-white palette in `frontend/brand.json`, plus docs that separate this deployment from upstream. The program is licensed under the GNU Affero General Public License v3.0 or later ([LICENSE](LICENSE)). Third-party notices, including MIT texts that must be preserved, are in [NOTICE.md](NOTICE.md). Upstream badges, the author's demo, Discord and published container images are not this project. Build from this source (`docker compose up -d --build`); do not present upstream images or the upstream APK as Center Gym.
