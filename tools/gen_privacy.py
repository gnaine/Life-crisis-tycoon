import html, sys
MAIL = 'contact@lifecrisistycoon.com'
M = f'<a href="mailto:{MAIL}">{MAIL}</a>'
# Each language: (name, title, updated, sections[(h2, html)]) ; {M} = contact link
L = {}
L['fr'] = ('Français', 'Politique de confidentialité', 'Dernière mise à jour : 22 novembre 2026', [
 ('Qui est responsable de tes données ?', '<p>L’éditeur du jeu Life Crisis Tycoon (gnaine). Cette politique s’applique à tous les joueurs, quel que soit leur pays. Pour toute question ou demande : {M}.</p>'),
 ('Quelles données, et pourquoi ?', '<table><tr><th>Donnée</th><th>Pourquoi</th></tr>'
  '<tr><td>Ton adresse e-mail</td><td>Créer ton compte et t’envoyer le code de connexion. Elle n’est jamais affichée aux autres joueurs.</td></tr>'
  '<tr><td>Ton pseudo</td><td>T’identifier dans le jeu et dans les classements publics.</td></tr>'
  '<tr><td>Ta progression (sauvegardes du jeu)</td><td>Retrouver ta partie sur n’importe quel appareil, et calculer tes scores dans les classements.</td></tr>'
  '<tr><td>Données techniques (adresse IP, date de connexion)</td><td>Faire fonctionner et sécuriser la connexion. Enregistrées automatiquement par nos prestataires.</td></tr></table>'
  '<p>Base légale : l’exécution du service que tu demandes en créant un compte (article 6.1.b du RGPD). Il n’y a <b>ni publicité, ni pistage, ni revente</b> de données.</p>'),
 ('Ce que les autres joueurs voient', '<p>Dans les classements, uniquement : ton pseudo, ton nombre d’étoiles et, pour chaque ville la valeur de ta clinique, le nombre de clients aidés, l’ambiance et le jour atteint.</p>'),
 ('Stockage sur ton appareil', '<p>Le jeu enregistre ta partie, ta langue et ta session de connexion dans le stockage local de ton navigateur. C’est indispensable au fonctionnement du jeu : il n’y a aucun cookie publicitaire ou de mesure d’audience.</p>'),
 ('Signal « Do Not Track »', '<p>Le jeu ne suit pas ton activité sur d’autres sites et ne fait aucun pistage publicitaire. Il fonctionne donc de la même façon que ton navigateur envoie ou non le signal « Do Not Track » (ou Global Privacy Control).</p>'),
 ('Nos prestataires', '<ul><li><b>Supabase</b> : comptes et sauvegardes, hébergés dans l’Union européenne (Paris).</li><li><b>Brevo</b> (France) : envoi des e-mails contenant le code de connexion.</li><li><b>GitHub Pages</b> (GitHub, États-Unis) : hébergement du site du jeu.</li><li><b>jsDelivr</b> et <b>Google Fonts</b> : chargement de bibliothèques et de polices d’écriture. Ton adresse IP leur est transmise à cette occasion.</li></ul>'
  '<p>Certains de ces prestataires peuvent traiter des données hors de l’Union européenne. Ces transferts sont encadrés par les garanties prévues par le RGPD (clauses contractuelles types ou cadre de protection des données UE–États-Unis).</p>'),
 ('Combien de temps ?', '<p>Tant que ton compte existe. Quand tu le supprimes, ton e-mail, ton pseudo et tes sauvegardes en ligne sont effacés immédiatement.</p>'),
 ('Tes droits', '<p>Où que tu vives, tu peux accéder à tes données, les corriger, les effacer, en demander une copie (portabilité) ou t’opposer à leur traitement.</p>'
  '<ul><li><b>Supprimer ton compte</b> : dans le jeu, 👤 Compte → « Supprimer mon compte ». Tout est effacé tout de suite.</li><li><b>Récupérer ta progression</b> : le bouton 💾 Exporter du jeu te donne un code de sauvegarde.</li><li>Pour toute autre demande : {M}. Réponse sous un mois.</li></ul>'
  '<p>Tu peux aussi porter réclamation auprès de l’autorité de protection des données de ton pays (en France, la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener">cnil.fr</a>).</p>'),
 ('Enfants', '<p>Si tu as moins de 15 ans (ou l’âge fixé dans ton pays), demande l’accord d’un parent avant de créer un compte. Le jeu ne s’adresse pas aux enfants de moins de 13 ans, et nous ne collectons pas sciemment leurs données. Si nous apprenons qu’un compte appartient à un enfant de moins de 13 ans, nous le supprimons. Un parent peut nous le signaler à {M}.</p>'),
 ('Changements', '<p>Si cette politique change, la date en haut de la page sera mise à jour.</p>'),
], '← Retour au jeu')

L['en'] = ('English', 'Privacy policy', 'Last updated: November 22, 2026', [
 ('Who is responsible for your data?', '<p>The publisher of Life Crisis Tycoon (gnaine). This policy applies to every player, whatever their country. For any question or request: {M}.</p>'),
 ('What data, and why?', '<table><tr><th>Data</th><th>Why</th></tr>'
  '<tr><td>Your email address</td><td>To create your account and send you the sign-in code. It is never shown to other players.</td></tr>'
  '<tr><td>Your username</td><td>To identify you in the game and in the public rankings.</td></tr>'
  '<tr><td>Your progress (game saves)</td><td>To restore your game on any device, and to compute your ranking scores.</td></tr>'
  '<tr><td>Technical data (IP address, sign-in time)</td><td>To run and secure sign-in. Logged automatically by our service providers.</td></tr></table>'
  '<p>Legal basis: providing the service you ask for when you create an account (GDPR article 6(1)(b)). There is <b>no advertising, no tracking and no selling</b> of data.</p>'),
 ('What other players see', '<p>In the rankings, only: your username, your number of stars and, for each city, your clinic’s value, the number of clients helped, its mood and the day reached.</p>'),
 ('Storage on your device', '<p>The game stores your progress, your language and your sign-in session in your browser’s local storage. This is needed for the game to work: there are no advertising or analytics cookies.</p>'),
 ('“Do Not Track” signals', '<p>The game does not follow your activity across other websites and does no advertising tracking. It therefore works the same way whether or not your browser sends a “Do Not Track” (or Global Privacy Control) signal.</p>'),
 ('Our service providers', '<ul><li><b>Supabase</b>: accounts and saves, hosted in the European Union (Paris).</li><li><b>Brevo</b> (France): sending the emails with your sign-in code.</li><li><b>GitHub Pages</b> (GitHub, United States): hosting the game’s website.</li><li><b>jsDelivr</b> and <b>Google Fonts</b>: loading code libraries and fonts. Your IP address is sent to them when this happens.</li></ul>'
  '<p>Some of these providers may process data outside the European Union. Such transfers rely on the safeguards provided by the GDPR (standard contractual clauses or the EU–US Data Privacy Framework).</p>'),
 ('How long?', '<p>As long as your account exists. When you delete it, your email, username and online saves are erased immediately.</p>'),
 ('Your rights', '<p>Wherever you live, you can access, correct or erase your data, ask for a copy (portability) or object to its processing.</p>'
  '<ul><li><b>Delete your account</b>: in the game, 👤 Account → “Delete my account”. Everything is erased right away.</li><li><b>Get your progress</b>: the game’s 💾 Export button gives you a save code.</li><li>For any other request: {M}. Answer within one month.</li></ul>'
  '<p>You can also complain to the data protection authority of your country (in France, the CNIL: <a href="https://www.cnil.fr" target="_blank" rel="noopener">cnil.fr</a>).</p>'),
 ('Children', '<p>If you are under 15 (or the age set in your country), ask a parent before creating an account. The game is not directed at children under 13, and we do not knowingly collect their data. If we learn that an account belongs to a child under 13, we delete it. A parent can tell us at {M}.</p>'),
 ('Changes', '<p>If this policy changes, the date at the top of the page will be updated.</p>'),
], '← Back to the game')

L['es'] = ('Español', 'Política de privacidad', 'Última actualización: 22 de noviembre de 2026', [
 ('¿Quién es responsable de tus datos?', '<p>El editor del juego Life Crisis Tycoon (gnaine). Esta política se aplica a todos los jugadores, sea cual sea su país. Para cualquier pregunta o solicitud: {M}.</p>'),
 ('¿Qué datos y para qué?', '<table><tr><th>Dato</th><th>Para qué</th></tr>'
  '<tr><td>Tu dirección de email</td><td>Crear tu cuenta y enviarte el código de acceso. Nunca se muestra a otros jugadores.</td></tr>'
  '<tr><td>Tu nombre de usuario</td><td>Identificarte en el juego y en las clasificaciones públicas.</td></tr>'
  '<tr><td>Tu progreso (partidas guardadas)</td><td>Recuperar tu partida en cualquier dispositivo y calcular tus puntuaciones en las clasificaciones.</td></tr>'
  '<tr><td>Datos técnicos (dirección IP, hora de acceso)</td><td>Hacer funcionar y proteger el acceso. Los registran automáticamente nuestros proveedores.</td></tr></table>'
  '<p>Base jurídica: la prestación del servicio que pides al crear una cuenta (artículo 6.1.b del RGPD). <b>No hay publicidad, ni seguimiento, ni venta</b> de datos.</p>'),
 ('Lo que ven los demás jugadores', '<p>En las clasificaciones, solo: tu nombre de usuario, tu número de estrellas y, para cada ciudad, el valor de tu clínica, los clientes ayudados, el ambiente y el día alcanzado.</p>'),
 ('Almacenamiento en tu dispositivo', '<p>El juego guarda tu partida, tu idioma y tu sesión en el almacenamiento local del navegador. Es imprescindible para que el juego funcione: no hay cookies publicitarias ni de medición de audiencia.</p>'),
 ('Señal «Do Not Track»', '<p>El juego no sigue tu actividad en otros sitios ni hace seguimiento publicitario. Por eso funciona igual tanto si tu navegador envía la señal «Do Not Track» (o Global Privacy Control) como si no.</p>'),
 ('Nuestros proveedores', '<ul><li><b>Supabase</b>: cuentas y partidas, alojadas en la Unión Europea (París).</li><li><b>Brevo</b> (Francia): envío de los emails con tu código de acceso.</li><li><b>GitHub Pages</b> (GitHub, Estados Unidos): alojamiento del sitio del juego.</li><li><b>jsDelivr</b> y <b>Google Fonts</b>: carga de bibliotecas y tipografías. En ese momento reciben tu dirección IP.</li></ul>'
  '<p>Algunos de estos proveedores pueden tratar datos fuera de la Unión Europea. Estas transferencias se basan en las garantías previstas por el RGPD (cláusulas contractuales tipo o el Marco de Privacidad de Datos UE–EE. UU.).</p>'),
 ('¿Durante cuánto tiempo?', '<p>Mientras exista tu cuenta. Cuando la eliminas, tu email, tu nombre de usuario y tus partidas en línea se borran de inmediato.</p>'),
 ('Tus derechos', '<p>Vivas donde vivas, puedes acceder a tus datos, corregirlos, borrarlos, pedir una copia (portabilidad) u oponerte a su tratamiento.</p>'
  '<ul><li><b>Eliminar tu cuenta</b>: en el juego, 👤 Cuenta → «Eliminar mi cuenta». Todo se borra al momento.</li><li><b>Recuperar tu progreso</b>: el botón 💾 Exportar del juego te da un código de guardado.</li><li>Para cualquier otra solicitud: {M}. Respuesta en un plazo de un mes.</li></ul>'
  '<p>También puedes reclamar ante la autoridad de protección de datos de tu país (en España, la AEPD: <a href="https://www.aepd.es" target="_blank" rel="noopener">aepd.es</a>).</p>'),
 ('Menores', '<p>Si tienes menos de la edad mínima fijada en tu país (14 años en España), pide permiso a tu madre, padre o tutor antes de crear una cuenta. El juego no está dirigido a menores de 13 años y no recopilamos sus datos a sabiendas. Si sabemos que una cuenta pertenece a un menor de 13 años, la eliminamos. Un adulto responsable puede avisarnos en {M}.</p>'),
 ('Cambios', '<p>Si esta política cambia, se actualizará la fecha de arriba.</p>'),
], '← Volver al juego')

L['pt'] = ('Português (BR)', 'Política de privacidade', 'Última atualização: 22 de novembro de 2026', [
 ('Quem é responsável pelos seus dados?', '<p>O editor do jogo Life Crisis Tycoon (gnaine). Esta política vale para todos os jogadores, seja qual for o país. Para qualquer dúvida ou pedido: {M}.</p>'),
 ('Quais dados e por quê?', '<table><tr><th>Dado</th><th>Por quê</th></tr>'
  '<tr><td>Seu email</td><td>Criar sua conta e enviar o código de acesso. Nunca aparece para outros jogadores.</td></tr>'
  '<tr><td>Seu nome de usuário</td><td>Identificar você no jogo e nos rankings públicos.</td></tr>'
  '<tr><td>Seu progresso (saves do jogo)</td><td>Recuperar seu jogo em qualquer aparelho e calcular suas pontuações nos rankings.</td></tr>'
  '<tr><td>Dados técnicos (endereço IP, horário de acesso)</td><td>Fazer o acesso funcionar com segurança. Registrados automaticamente pelos nossos fornecedores.</td></tr></table>'
  '<p>Base legal: a execução do serviço que você pede ao criar uma conta (artigo 6.1.b do RGPD; art. 7, V da LGPD). <b>Não há publicidade, rastreamento nem venda</b> de dados.</p>'),
 ('O que os outros jogadores veem', '<p>Nos rankings, apenas: seu nome de usuário, seu número de estrelas e, para cada cidade, o valor da sua clínica, os clientes ajudados, o clima e o dia alcançado.</p>'),
 ('Armazenamento no seu aparelho', '<p>O jogo guarda seu progresso, seu idioma e sua sessão no armazenamento local do navegador. Isso é necessário para o jogo funcionar: não há cookies de publicidade nem de análise.</p>'),
 ('Sinal “Do Not Track”', '<p>O jogo não acompanha sua atividade em outros sites e não faz rastreamento publicitário. Por isso funciona do mesmo jeito, quer seu navegador envie ou não o sinal “Do Not Track” (ou Global Privacy Control).</p>'),
 ('Nossos fornecedores', '<ul><li><b>Supabase</b>: contas e saves, hospedados na União Europeia (Paris).</li><li><b>Brevo</b> (França): envio dos emails com o código de acesso.</li><li><b>GitHub Pages</b> (GitHub, Estados Unidos): hospedagem do site do jogo.</li><li><b>jsDelivr</b> e <b>Google Fonts</b>: carregamento de bibliotecas e fontes. Nesse momento eles recebem seu endereço IP.</li></ul>'
  '<p>Alguns desses fornecedores podem tratar dados fora da União Europeia e do Brasil. Essas transferências seguem as garantias previstas pelo RGPD e pela LGPD (cláusulas contratuais padrão ou o Data Privacy Framework UE–EUA).</p>'),
 ('Por quanto tempo?', '<p>Enquanto sua conta existir. Quando você a exclui, seu email, seu nome de usuário e seus saves online são apagados na hora.</p>'),
 ('Seus direitos', '<p>Onde quer que você more, pode acessar, corrigir ou apagar seus dados, pedir uma cópia (portabilidade) ou se opor ao tratamento.</p>'
  '<ul><li><b>Excluir sua conta</b>: no jogo, 👤 Conta → “Excluir minha conta”. Tudo é apagado na hora.</li><li><b>Recuperar seu progresso</b>: o botão 💾 Exportar do jogo dá um código de save.</li><li>Para qualquer outro pedido: {M}. Resposta em até um mês.</li></ul>'
  '<p>Você também pode reclamar à autoridade de proteção de dados do seu país (no Brasil, a ANPD: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener">gov.br/anpd</a>).</p>'),
 ('Crianças e adolescentes', '<p>Se você tem menos de 15 anos (ou da idade definida no seu país), peça autorização a um responsável antes de criar uma conta. O jogo não é destinado a crianças com menos de 13 anos, e não coletamos os dados delas de propósito. Se soubermos que uma conta pertence a uma criança com menos de 13 anos, nós a excluímos. Um responsável pode nos avisar em {M}.</p>'),
 ('Mudanças', '<p>Se esta política mudar, a data no topo da página será atualizada.</p>'),
], '← Voltar ao jogo')

L['de'] = ('Deutsch', 'Datenschutzerklärung', 'Zuletzt aktualisiert: 22. November 2026', [
 ('Wer ist für deine Daten verantwortlich?', '<p>Der Herausgeber des Spiels Life Crisis Tycoon (gnaine). Diese Erklärung gilt für alle Spieler, egal in welchem Land. Für Fragen oder Anfragen: {M}.</p>'),
 ('Welche Daten und wozu?', '<table><tr><th>Daten</th><th>Wozu</th></tr>'
  '<tr><td>Deine E-Mail-Adresse</td><td>Um dein Konto anzulegen und dir den Anmeldecode zu schicken. Sie wird anderen Spielern nie angezeigt.</td></tr>'
  '<tr><td>Dein Spielername</td><td>Um dich im Spiel und in den öffentlichen Ranglisten zu zeigen.</td></tr>'
  '<tr><td>Dein Fortschritt (Spielstände)</td><td>Um dein Spiel auf jedem Gerät wiederherzustellen und deine Ranglisten-Ergebnisse zu berechnen.</td></tr>'
  '<tr><td>Technische Daten (IP-Adresse, Anmeldezeit)</td><td>Um die Anmeldung zu betreiben und abzusichern. Werden von unseren Dienstleistern automatisch protokolliert.</td></tr></table>'
  '<p>Rechtsgrundlage: die Erbringung des Dienstes, den du mit dem Anlegen eines Kontos anforderst (Art. 6 Abs. 1 lit. b DSGVO). Es gibt <b>keine Werbung, kein Tracking und keinen Verkauf</b> von Daten.</p>'),
 ('Was andere Spieler sehen', '<p>In den Ranglisten nur: deinen Spielernamen, deine Anzahl Sterne und für jede Stadt den Wert deiner Klinik, die Zahl der Kunden, denen geholfen wurde, die Stimmung und den erreichten Tag.</p>'),
 ('Speicherung auf deinem Gerät', '<p>Das Spiel speichert deinen Spielstand, deine Sprache und deine Anmeldesitzung im lokalen Speicher deines Browsers. Das ist für das Spiel notwendig: Es gibt keine Werbe- oder Analyse-Cookies.</p>'),
 ('„Do Not Track“-Signale', '<p>Das Spiel verfolgt deine Aktivität auf anderen Websites nicht und betreibt kein Werbe-Tracking. Es funktioniert daher gleich, egal ob dein Browser ein „Do Not Track“- (oder Global-Privacy-Control-)Signal sendet.</p>'),
 ('Unsere Dienstleister', '<ul><li><b>Supabase</b>: Konten und Spielstände, gehostet in der Europäischen Union (Paris).</li><li><b>Brevo</b> (Frankreich): Versand der E-Mails mit deinem Anmeldecode.</li><li><b>GitHub Pages</b> (GitHub, USA): Hosting der Website des Spiels.</li><li><b>jsDelivr</b> und <b>Google Fonts</b>: Laden von Code-Bibliotheken und Schriften. Dabei wird ihnen deine IP-Adresse übermittelt.</li></ul>'
  '<p>Einige dieser Dienstleister können Daten außerhalb der Europäischen Union verarbeiten. Solche Übermittlungen stützen sich auf die Garantien der DSGVO (Standardvertragsklauseln oder das EU-US Data Privacy Framework).</p>'),
 ('Wie lange?', '<p>So lange dein Konto besteht. Wenn du es löschst, werden deine E-Mail, dein Spielername und deine Online-Spielstände sofort gelöscht.</p>'),
 ('Deine Rechte', '<p>Egal wo du lebst, kannst du auf deine Daten zugreifen, sie berichtigen oder löschen, eine Kopie verlangen (Datenübertragbarkeit) oder der Verarbeitung widersprechen.</p>'
  '<ul><li><b>Konto löschen</b>: im Spiel 👤 Konto → „Mein Konto löschen“. Alles wird sofort gelöscht.</li><li><b>Fortschritt sichern</b>: Die Schaltfläche 💾 Exportieren im Spiel gibt dir einen Speichercode.</li><li>Für alle anderen Anfragen: {M}. Antwort innerhalb eines Monats.</li></ul>'
  '<p>Du kannst dich auch bei der Datenschutzaufsichtsbehörde deines Landes beschweren.</p>'),
 ('Kinder', '<p>Wenn du unter 16 bist (oder unter dem in deinem Land festgelegten Alter), frag vor dem Anlegen eines Kontos deine Eltern. Das Spiel richtet sich nicht an Kinder unter 13 Jahren, und wir erheben ihre Daten nicht wissentlich. Erfahren wir, dass ein Konto einem Kind unter 13 gehört, löschen wir es. Eltern können uns unter {M} informieren.</p>'),
 ('Änderungen', '<p>Wenn sich diese Erklärung ändert, wird das Datum oben auf der Seite aktualisiert.</p>'),
], '← Zurück zum Spiel')

L['ja'] = ('日本語', 'プライバシーポリシー', '最終更新日：2026年11月22日', [
 ('データの管理者', '<p>Life Crisis Tycoon の発行者（gnaine）です。このポリシーは、国に関係なくすべてのプレイヤーに適用されます。ご質問やご依頼は {M} までどうぞ。</p>'),
 ('集めるデータとその目的', '<table><tr><th>データ</th><th>目的</th></tr>'
  '<tr><td>メールアドレス</td><td>アカウントの作成と、ログインコードの送信のため。ほかのプレイヤーに表示されることはありません。</td></tr>'
  '<tr><td>ユーザー名</td><td>ゲーム内と公開ランキングであなたを表示するため。</td></tr>'
  '<tr><td>進行状況（セーブデータ）</td><td>どの端末でもゲームを続けられるように、またランキングのスコアを計算するため。</td></tr>'
  '<tr><td>技術データ（IPアドレス、ログイン日時）</td><td>ログインを動かし、安全に保つため。委託先が自動的に記録します。</td></tr></table>'
  '<p>法的根拠：アカウント作成によってあなたが求めるサービスの提供（GDPR第6条1項(b)）。<b>広告、トラッキング、データの販売は一切ありません。</b></p>'),
 ('ほかのプレイヤーに見えるもの', '<p>ランキングに表示されるのは、ユーザー名、スターの数、そして都市ごとのクリニックの価値・助けたお客さんの数・雰囲気・到達した日数だけです。</p>'),
 ('端末への保存', '<p>ゲームは、進行状況・言語・ログイン状態をブラウザのローカルストレージに保存します。ゲームの動作に必要なもので、広告や分析のためのクッキーはありません。</p>'),
 ('「Do Not Track」信号', '<p>このゲームはほかのサイトでのあなたの行動を追跡せず、広告のためのトラッキングも行いません。そのため、ブラウザが「Do Not Track」（または Global Privacy Control）信号を送っていてもいなくても、動作は同じです。</p>'),
 ('委託先', '<ul><li><b>Supabase</b>：アカウントとセーブデータ。欧州連合（パリ）で保管。</li><li><b>Brevo</b>（フランス）：ログインコードのメール送信。</li><li><b>GitHub Pages</b>（GitHub、アメリカ）：ゲームサイトのホスティング。</li><li><b>jsDelivr</b> と <b>Google Fonts</b>：プログラムとフォントの読み込み。その際にあなたのIPアドレスが送られます。</li></ul>'
  '<p>一部の委託先は、欧州連合の外でデータを扱うことがあります。こうした移転は、GDPRが定める保護措置（標準契約条項、またはEU・米国データプライバシーフレームワーク）に基づいて行われます。</p>'),
 ('保存期間', '<p>アカウントがある間だけです。アカウントを削除すると、メールアドレス・ユーザー名・オンラインのセーブデータはすぐに消去されます。</p>'),
 ('あなたの権利', '<p>どこに住んでいても、自分のデータの開示・訂正・削除、コピーの請求（データポータビリティ）、利用の停止を求めることができます。</p>'
  '<ul><li><b>アカウントの削除</b>：ゲーム内の 👤 アカウント →「アカウントを削除」。すべてすぐに消去されます。</li><li><b>進行状況の取り出し</b>：ゲームの 💾 エクスポートボタンでセーブコードを取得できます。</li><li>そのほかのご依頼：{M}。1か月以内にお返事します。</li></ul>'
  '<p>お住まいの国のデータ保護機関（日本では個人情報保護委員会）に申し立てることもできます。</p>'),
 ('お子さま', '<p>15歳未満（またはお住まいの国で定められた年齢未満）の方は、アカウントを作る前に保護者の同意を得てください。このゲームは13歳未満の子ども向けではなく、その個人データを意図的に集めることはありません。13歳未満の子どものアカウントだとわかった場合は削除します。保護者の方は {M} までお知らせください。</p>'),
 ('変更', '<p>このポリシーを変更したときは、ページ上部の日付を更新します。</p>'),
], '← ゲームに戻る')

L['ko'] = ('한국어', '개인정보 처리방침', '최종 업데이트: 2026년 11월 22일', [
 ('개인정보 책임자', '<p>Life Crisis Tycoon 게임의 발행자(gnaine)입니다. 이 방침은 국가와 관계없이 모든 플레이어에게 적용돼요. 문의나 요청은 {M} 으로 보내 주세요.</p>'),
 ('수집하는 정보와 이유', '<table><tr><th>정보</th><th>이유</th></tr>'
  '<tr><td>이메일 주소</td><td>계정을 만들고 로그인 코드를 보내기 위해서예요. 다른 플레이어에게는 절대 보이지 않아요.</td></tr>'
  '<tr><td>닉네임</td><td>게임과 공개 순위표에서 나를 표시하기 위해서예요.</td></tr>'
  '<tr><td>진행 상황(게임 저장 데이터)</td><td>어느 기기에서든 게임을 이어 하고, 순위 점수를 계산하기 위해서예요.</td></tr>'
  '<tr><td>기술 정보(IP 주소, 접속 시간)</td><td>로그인을 운영하고 안전하게 지키기 위해서예요. 위탁 업체가 자동으로 기록해요.</td></tr></table>'
  '<p>법적 근거: 계정을 만들 때 요청한 서비스의 제공(GDPR 제6조 1항 (b)). <b>광고, 추적, 데이터 판매는 전혀 없어요.</b></p>'),
 ('다른 플레이어에게 보이는 것', '<p>순위표에는 닉네임, 별 개수, 그리고 도시별 클리닉 가치·도운 손님 수·분위기·도달한 날짜만 표시돼요.</p>'),
 ('기기 저장', '<p>게임은 진행 상황, 언어, 로그인 상태를 브라우저의 로컬 저장소에 저장해요. 게임 작동에 꼭 필요한 것이며, 광고나 분석용 쿠키는 없어요.</p>'),
 ('“Do Not Track” 신호', '<p>이 게임은 다른 사이트에서의 활동을 추적하지 않고 광고용 추적도 하지 않아요. 그래서 브라우저가 “Do Not Track”(또는 Global Privacy Control) 신호를 보내든 안 보내든 똑같이 작동해요.</p>'),
 ('처리 위탁 업체', '<ul><li><b>Supabase</b>: 계정과 저장 데이터, 유럽연합(파리)에 보관.</li><li><b>Brevo</b>(프랑스): 로그인 코드 이메일 발송.</li><li><b>GitHub Pages</b>(GitHub, 미국): 게임 사이트 호스팅.</li><li><b>jsDelivr</b>와 <b>Google Fonts</b>: 코드 라이브러리와 글꼴 불러오기. 이때 IP 주소가 전달돼요.</li></ul>'
  '<p>일부 업체는 유럽연합 밖에서 데이터를 처리할 수 있어요. 이러한 국외 이전은 GDPR이 정한 보호 장치(표준계약조항 또는 EU–미국 데이터 프라이버시 프레임워크)에 따라 이루어져요.</p>'),
 ('보관 기간', '<p>계정이 있는 동안만 보관해요. 계정을 삭제하면 이메일, 닉네임, 온라인 저장 데이터가 즉시 지워져요.</p>'),
 ('나의 권리', '<p>어디에 살든 내 정보의 열람, 정정, 삭제, 사본 요청(이동권), 처리 정지를 요구할 수 있어요.</p>'
  '<ul><li><b>계정 삭제</b>: 게임에서 👤 계정 → “계정 삭제”. 모든 것이 바로 지워져요.</li><li><b>진행 상황 가져가기</b>: 게임의 💾 내보내기 버튼으로 저장 코드를 받을 수 있어요.</li><li>그 밖의 요청: {M}. 한 달 안에 답변해요.</li></ul>'
  '<p>거주 국가의 개인정보 보호 기관(한국은 개인정보보호위원회)에 민원을 낼 수도 있어요.</p>'),
 ('어린이', '<p>만 14세 미만(또는 거주 국가에서 정한 나이 미만)이라면 계정을 만들기 전에 보호자의 동의를 받아 주세요. 이 게임은 만 13세 미만 어린이를 대상으로 하지 않으며, 그 정보를 알면서 수집하지 않아요. 만 13세 미만 어린이의 계정임을 알게 되면 삭제해요. 보호자는 {M} 으로 알려 주세요.</p>'),
 ('변경', '<p>이 방침이 바뀌면 페이지 위쪽의 날짜를 업데이트해요.</p>'),
], '← 게임으로 돌아가기')

order = ['en', 'fr', 'es', 'pt', 'de', 'ja', 'ko']
nav = ''.join(f'<a href="#{l}" data-l="{l}">{L[l][0]}</a>' for l in order)
secs = []
for l in order:
    name, title, upd, parts, back = L[l]
    body = ''.join(f'<h2>{h}</h2>{c}' for h, c in parts).replace('{M}', M)
    secs.append(f'<section id="p-{l}" lang="{"pt-BR" if l == "pt" else l}"><h1>{title}</h1><p class="upd">{upd}</p>{body}<a class="back" href="./">{back}</a></section>')
out = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Life Crisis Tycoon — Privacy</title>
<style>
  body{{margin:0;background:#FFF6E5;color:#2a2e3a;font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,"Hiragino Sans","Apple SD Gothic Neo",sans-serif}}
  main{{max-width:720px;margin:0 auto;padding:22px 20px 60px}}
  h1{{font-size:26px;line-height:1.25;margin:0 0 4px}}h2{{font-size:18px;margin:28px 0 6px}}
  .upd{{color:#6b7080;font-size:14px;margin:0 0 18px}}
  nav{{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px}}nav a{{background:#fff;border:2px solid #f0dcae;border-radius:12px;padding:5px 11px;color:#2a2e3a;text-decoration:none;font-weight:700;font-size:14px}}nav a.on{{background:#FFD36E;border-color:#FFD36E}}
  table{{border-collapse:collapse;width:100%;font-size:14px}}td,th{{border:1px solid #ecdcb8;padding:7px 8px;text-align:left;vertical-align:top}}th{{background:#fff}}
  a{{color:#3c6fd8}}section+section{{border-top:2px dashed #ecdcb8;margin-top:40px;padding-top:24px}}
  .js section{{display:none;border:0;margin:0;padding:0}}.js section.on{{display:block}}
  .back{{display:inline-block;margin-top:30px;font-weight:700}}
</style>
</head>
<body>
<main>
<nav>{nav}</nav>
{''.join(secs)}
</main>
<script>
// show one language: the one in the link (#fr…), else the saved game language, else the browser's
(function () {{
  var ok = {order!r};
  function pick() {{
    var h = location.hash.slice(1), s = null;
    try {{ s = localStorage.getItem('ahq_lang'); }} catch (e) {{}}
    var n = (navigator.language || 'en').slice(0, 2).toLowerCase();
    var l = ok.indexOf(h) >= 0 ? h : ok.indexOf(s) >= 0 ? s : ok.indexOf(n) >= 0 ? n : 'en';
    document.documentElement.className = 'js'; document.documentElement.lang = l === 'pt' ? 'pt-BR' : l;
    document.querySelectorAll('section').forEach(function (x) {{ x.classList.toggle('on', x.id === 'p-' + l); }});
    document.querySelectorAll('nav a').forEach(function (a) {{ a.classList.toggle('on', a.dataset.l === l); }});
    window.scrollTo(0, 0);
  }}
  addEventListener('hashchange', pick); pick();
}})();
</script>
</body>
</html>
'''
open(sys.argv[1], 'w', encoding='utf-8').write(out)
print('ok', len(out))
