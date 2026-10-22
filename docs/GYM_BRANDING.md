# Identidade por academia

Cada implantação utiliza `frontend/brand.json` como configuração de nome, logo,
ícones e paletas clara/escura. A Center Gym usa a logo fornecida e preto/branco.
Login, início (inclusive alunos conectados), configurações, título do navegador
e manifesto do app instalado usam essa identidade. O aluno pode escolher claro,
escuro ou sistema; cores pessoais antigas não substituem as cores da academia.

Para outra academia, altere brand.json e coloque seus arquivos em frontend/public.
Execute npm run build em frontend e publique a implantação correspondente.
Isso configura uma academia por implantação; não seleciona academias por conta
nem implementa isolamento de dados entre academias no backend.

Para trazer correções do openGym sem reverter essa identidade, siga
[docs/UPSTREAM.md](UPSTREAM.md).
