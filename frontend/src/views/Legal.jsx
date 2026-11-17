import { useNavigate, useLocation } from 'react-router-dom'
import { brand } from '../lib/brand.js'
import { DEMO, REPO } from '../lib/demo.js'
import Icon from '../components/Icon.jsx'

// Center Gym: Política de Privacidade e Termos de Uso. Os dados da academia vêm de
// gyms/<id>/brand.json ("legal"); o texto é o mesmo para toda academia.
// ponytail: só em português — o app é vendido a academias brasileiras e o texto segue a LGPD.
// Outro idioma ou cláusula por academia: mover o texto para gyms/<id>/.

const L = { company: brand.name, cnpj: '', address: '', city: '', email: '', operator: '', updated: '', ...brand.legal }
const cnpj = L.cnpj ? `, CNPJ ${L.cnpj}` : ''
const addr = L.address ? `, com sede em ${L.address}` : ''

const PRIVACY = [
  ['Quem cuida dos seus dados', [
    `Este aplicativo é oferecido por ${L.company}${cnpj}${addr} (“academia”), que decide como os seus dados são usados e é a controladora deles, nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018).`,
    L.operator && `${L.operator} desenvolve e mantém o aplicativo e o servidor em nome da academia, como operadora: só trata os dados para manter o serviço funcionando, seguindo as instruções da academia.`
  ]],
  ['Quais dados tratamos', [
    'Cadastro: o nome que você escolhe, o e-mail (se informar) e a sua forma de entrada — a senha é guardada apenas embaralhada (hash), e a chave de acesso (passkey) fica no seu aparelho.',
    'Treino: suas fichas, os treinos registrados, cargas, repetições, tempo, anotações e, se você usar, a percepção de esforço.',
    'Peso corporal e meta de peso, se você registrar. São dados de saúde e têm proteção maior na lei. Registrar é opcional e o aplicativo funciona sem eles.',
    'Fotos e vídeos que você anexar a um exercício ou treino. A localização gravada no arquivo é removida no seu aparelho antes do envio.',
    'Dados técnicos: data e hora das entradas na conta e das sincronizações, para segurança e suporte.'
  ]],
  ['Para que usamos', [
    'Para prestar o serviço que a academia oferece a você: guardar seu plano e seu histórico, mostrar sua evolução e manter tudo igual nos seus aparelhos (art. 7º, V, da LGPD).',
    'Peso corporal e outros dados de saúde são tratados com o seu consentimento (art. 11, I), dado quando você os registra. Você pode apagá-los quando quiser.',
    'Para proteger a sua conta e o serviço contra uso indevido (art. 7º, IX).',
    'Não usamos seus dados para publicidade, não os vendemos e o aplicativo não tem rastreadores de terceiros.'
  ]],
  ['Quem pode ver', [
    'Você, em qualquer aparelho em que entrar na sua conta.',
    'O professor da academia vê suas fichas e seus treinos recentes, para montar e ajustar o seu treino. Não vê seu peso corporal, suas fotos nem seus vídeos.',
    'A administração da academia vê o seu cadastro, o histórico de treinos e os registros de peso, para suporte e gestão das contas.',
    L.operator && `${L.operator} e a empresa de hospedagem do servidor têm acesso técnico, limitado à manutenção e às cópias de segurança.`,
    'Fora disso, só compartilhamos dados se a lei ou uma ordem de autoridade exigir.'
  ]],
  ['Onde ficam e por quanto tempo', [
    'Os dados ficam em servidor contratado pela academia, com conexão criptografada (HTTPS) e cópias de segurança. Parte deles também fica no seu aparelho, para o aplicativo funcionar sem internet.',
    'Guardamos os dados enquanto a sua conta estiver ativa. Encerrada a matrícula, a conta é desativada e os dados são apagados em até 90 dias, salvo quando a lei exigir guardá-los por mais tempo.'
  ]],
  ['Seus direitos', [
    'Você pode, a qualquer momento: confirmar se tratamos seus dados e acessá-los; corrigi-los; levá-los com você (Configurações → Exportar backup); pedir a exclusão da conta e dos dados; retirar o consentimento para dados de saúde; e saber com quem foram compartilhados.',
    L.email ? `Para exercer esses direitos ou tirar dúvidas, escreva para ${L.email} ou procure a recepção da academia. Respondemos em até 15 dias.` : 'Para exercer esses direitos ou tirar dúvidas, procure a recepção da academia. Respondemos em até 15 dias.',
    'Se entender que o seu pedido não foi atendido, você pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).'
  ]],
  ['Menores de idade', [
    'Alunos com menos de 18 anos usam o aplicativo com a autorização do responsável legal, dada na matrícula.'
  ]],
  ['Mudanças nesta política', [
    'Se esta política mudar de forma relevante, avisamos no aplicativo antes de a mudança valer.'
  ]]
]

const TERMS = [
  ['O que é este aplicativo', [
    `É a ferramenta de treino que ${L.company} oferece aos seus alunos: fichas, treino guiado, registro de cargas e acompanhamento da evolução.`
  ]],
  ['Quem pode usar', [
    'O acesso é gratuito e faz parte da matrícula. Vale enquanto a matrícula estiver ativa; encerrada, a conta é desativada, e você pode pedir antes uma cópia dos seus dados.',
    'A conta é pessoal. Guarde sua senha ou chave de acesso e avise a academia se suspeitar de uso por outra pessoa.'
  ]],
  ['Cuidados com a sua saúde', [
    'O aplicativo organiza e registra o treino. Ele não substitui a avaliação de um médico nem a orientação presencial de um profissional de Educação Física.',
    'Faça avaliação médica antes de começar ou de aumentar a intensidade dos treinos. Cargas e progressões sugeridas são referência: ajuste com o seu professor.',
    'Pare o exercício e procure ajuda se sentir dor, tontura ou mal-estar.'
  ]],
  ['Uso adequado', [
    'Não use o aplicativo para tentar acessar dados de outras pessoas, prejudicar o funcionamento do serviço ou enviar conteúdo ilegal ou ofensivo.',
    'As fotos e os vídeos que você anexa continuam sendo seus. Só anexe o que você tem direito de usar.'
  ]],
  ['Disponibilidade', [
    'Cuidamos para o serviço ficar no ar, mas ele pode parar por manutenção ou falha. O aplicativo segue registrando treinos sem internet e sincroniza depois.',
    'Você pode exportar seus dados quando quiser, em Configurações → Exportar backup.'
  ]],
  ['Software e conteúdo de terceiros', [
    'O aplicativo é baseado no openGym, software livre sob a licença GNU AGPL-3.0. O código-fonte desta versão está disponível publicamente.',
    'As imagens e animações dos exercícios pertencem aos seus respectivos titulares.'
  ]],
  ['Responsabilidade', [
    'A academia responde pelo serviço nos limites da lei. Na medida em que a lei permitir, não responde por danos causados por uso do aplicativo em desacordo com estes termos ou com a orientação do professor.'
  ]],
  ['Mudanças e foro', [
    'Estes termos podem ser atualizados; mudanças relevantes são avisadas no aplicativo.',
    `Aplica-se a lei brasileira. Fica eleito o foro ${L.city ? 'da comarca de ' + L.city : 'do domicílio do aluno'}, sem prejuízo do direito do consumidor de escolher o foro do seu domicílio.`
  ]]
]

const DOCS = { privacidade: ['Política de Privacidade', PRIVACY], termos: ['Termos de Uso', TERMS] }

export default function Legal() {
  const nav = useNavigate()
  const key = useLocation().pathname.split('/').pop()
  const [title, sections] = DOCS[key] || DOCS.privacidade
  const other = key === 'termos' ? 'privacidade' : 'termos'
  return <div className="narrow" style={{ paddingBottom: 40 }}>
    <div className="hdr">
      <button className="iconbtn" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/home'))} aria-label="Voltar"><Icon name="chevronLeft" /></button>
      <div style={{ flex: 1, marginInlineStart: 8 }}><h1 style={{ margin: 0, fontSize: 26 }}>{title}</h1>
        <div className="sub">{brand.name}{L.updated ? ` · atualizado em ${L.updated.split('-').reverse().join('/')}` : ''}</div></div>
    </div>
    {DEMO && <div className="card small muted" style={{ marginBottom: 14, lineHeight: 1.45 }}>
      Você está na versão de demonstração: nada do que você registra aqui sai deste navegador. O texto abaixo descreve o aplicativo completo, com conta e servidor.
    </div>}
    {sections.map(([h, ps], i) => <section key={h} style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 17, margin: '0 0 6px' }}>{i + 1}. {h}</h2>
      {ps.filter(Boolean).map((p, j) => <p key={j} className="muted" style={{ margin: '0 0 8px', lineHeight: 1.5, fontSize: 15 }}>{p}</p>)}
    </section>)}
    <div className="dim small" style={{ lineHeight: 1.6 }}>
      <a href={'#/legal/' + other} onClick={e => { e.preventDefault(); nav('/legal/' + other, { replace: true }) }}>{DOCS[other][0]}</a>
      {' · '}<a href={REPO} target="_blank" rel="noopener">Código-fonte</a>
    </div>
  </div>
}

/** Os dois links, para o rodapé do login e das Configurações. Links de hash puros (HashRouter),
 *  sem hook de navegação: o login também é renderizado fora de um Router nos testes. */
export function LegalLinks() {
  return <>
    <a href="#/legal/termos">Termos de Uso</a>{' · '}
    <a href="#/legal/privacidade">Política de Privacidade</a>
  </>
}
