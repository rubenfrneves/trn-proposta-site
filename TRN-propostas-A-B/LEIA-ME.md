# TRN — Proposta de novo website (Opção A e Opção B)

Conceito, design e textos © 2026 Rúben Neves.

Site estático (HTML, CSS e JavaScript simples, sem frameworks). Duas opções completas, cada uma em português, inglês e espanhol.
Abre-se com duplo clique em `index.html`, mesmo sem internet.

## O que está nesta pasta

```
index.html                  página "Escolha a opção" (A ou B), com PT / EN / ES
opcao-a/pt|en|es/           Opção A: evolução do site atual
opcao-b/pt|en|es/           Opção B: nova proposta, mais comercial
   index.html               página inicial
   recrutamento.html        (careers.html em inglês, empleo.html em espanhol)
   legal.html               privacidade e cookies
assets/css  assets/js  assets/img  assets/fonts
robots.txt  .nojekyll
```

## 1. Publicar no GitHub Pages (tudo pelo navegador)

1. Em github.com, abra o repositório (ou crie um novo, **público**, por exemplo `trn-proposta-site`).
2. Se já existir uma versão antiga, apague-a: abra a pasta antiga (por exemplo `site_trn`), menu **⋯ → Delete directory**, e confirme.
3. **Add file → Upload files**. No Finder, abra a pasta `TRN-propostas-A-B`, carregue em ⌘+A e **arraste** tudo para a caixa do GitHub. Use o Chrome: o botão "choose your files" não aceita pastas, só o arrastar.
   Arraste o **conteúdo** da pasta (`index.html`, `opcao-a`, `opcao-b`, `assets`, `robots.txt`), e não a própria pasta.
4. Escreva uma mensagem e carregue em **Commit changes**.
5. **Settings → Pages → Build and deployment**: *Source* = **Deploy from a branch**, *Branch* = **main**, pasta **/ (root)**, **Save**.
6. Ao fim de cerca de um minuto, o endereço aparece no topo dessa página: `https://O-SEU-UTILIZADOR.github.io/NOME-DO-REPOSITORIO/`. É esse que envia ao dono da TRN.

O ficheiro `.nojekyll` (escondido no Finder) não é obrigatório para este site.

Se o repositório tiver outro nome ou utilizador, altere `BASE` no início de `gerar.py` (pasta `TRN-propostas-A-B_gerador`) e corra `python3 gerar.py`. `BASE` é usado em `canonical`, `hreflang` e na imagem de partilha (`og:image`).

## 2. Onde preencher o telefone, o WhatsApp e o Formspree

Tudo num único ficheiro: **`assets/js/config.js`**. No GitHub: abra o ficheiro, carregue no lápis, edite e faça *Commit*.

```js
window.TRN_CONFIG = {
  phone: '+351 21 000 00 00',      // com indicativo
  whatsapp: '351910000000',        // só dígitos, com indicativo
  formspreeId: 'abcdwxyz',         // o código final de https://formspree.io/f/abcdwxyz
  email: 'geral@trnrodoviaria.pt'
};
```

- Enquanto `phone` e `whatsapp` estiverem vazios, o site mostra os marcadores **[Telefone]** e **[WhatsApp]**. Não há link a funcionar. Quando preenche, os marcadores desaparecem e os links `tel:` e `https://wa.me/` ficam ativos (cabeçalho, contactos, botão flutuante).
- **Formspree:** crie uma conta em formspree.io, crie um formulário e copie o código (a parte final do endereço). Cole-o em `formspreeId`. O pedido de orçamento e a candidatura passam a seguir para o Formspree.
  O site só mostra "Pedido recebido" depois de o Formspree responder que recebeu. Se falhar, mostra erro e mantém os dados.
- **Sem `formspreeId`:** o botão "Enviar pedido" abre o email do visitante com o pedido já escrito (`mailto:`). Nesse caso o pedido só fica enviado quando o visitante carregar em Enviar no email.
- **Currículos:** o envio de ficheiros pelo Formspree depende do plano da conta. Se o plano não aceitar ficheiros, o candidato envia o currículo por email (o formulário já o indica).
- O endereço `action="https://formspree.io/f/[ID]"` que se vê no HTML é só o marcador: não precisa de o alterar, o `config.js` trata disso.

## 3. Tirar o `noindex` quando o site for aprovado

Enquanto for proposta, todas as páginas têm `<meta name="robots" content="noindex, nofollow">` e o `robots.txt` bloqueia tudo.

Quando o site for aprovado:
1. Abra `TRN-propostas-A-B_gerador/gerar.py` e mude `NOINDEX = True` para `NOINDEX = False`.
2. No Terminal: `cd TRN-propostas-A-B_gerador && python3 gerar.py`.
3. Volte a carregar a pasta `TRN-propostas-A-B` para o GitHub. Passa a ter `index, follow`, `robots.txt` aberto e `sitemap.xml`.

Tenha também em conta: ao publicar a versão final, mantenha só **uma** das opções (apague a outra e a página de escolha), ou aponte o endereço final para a opção escolhida.

## 4. O que ainda é marcador

| Marcador | Onde | Quem preenche |
|---|---|---|
| `[Telefone]`, `[WhatsApp]` | `assets/js/config.js` | TRN |
| `[ID]` do Formspree | `assets/js/config.js` | Rúben ou TRN |
| `[1 dia útil — a confirmar]` | texto do prazo de resposta (várias páginas) | TRN |
| `[NIPC]`, `[prazo a definir]`, `[a listar]`, `[contacto para dados pessoais]`, `[a preencher]` | página Legal | TRN, com revisão jurídica |
| `[a confirmar]` na viatura de substituição | janela "Transporte de trabalhadores" | TRN |
| `[Vagas de exemplo — a confirmar]` | página Recrutamento | TRN |

Wi-Fi, WC, ar condicionado e cintos aparecem com a nota "conforme a viatura". A lotação aparece só como "a partir de 16" e "até 59".

## 5. Diferenças entre a Opção A e a Opção B

| | Opção A — Evolução do site atual | Opção B — Nova proposta, mais comercial |
|---|---|---|
| Topo | Escuro, com a fotografia da ponte e a frota; formulário de orçamento à direita | Claro, com o autocarro MAN emoldurado pela risca laranja; barra de orçamento em linha por baixo |
| Título | "Aluguer de autocarros com motorista" | "Autocarros de 16 a 59 lugares, à hora combinada." |
| Serviços | Primeiro cartão (transporte de trabalhadores) maior, seguido de cinco cartões | Quatro separadores por tipo de cliente, cada um com fotografia e três serviços |
| Frota | Quatro cartões com fotografia (miniautocarros, autocarros, vans, berlinas) | Fotografia larga da frota e três cartões de categoria, mais as comodidades em etiquetas |
| Fecho | Faixa escura de pedido, com contactos | Três blocos: contactos, transporte executivo, trabalhe connosco |
| Tamanho | Cerca de 3,2 ecrãs em 1440×900 | Cerca de 3,3 ecrãs em 1440×900 |
| Tom | Mais institucional | Mais comercial e orientado ao pedido |

As duas opções usam os mesmos dados e as mesmas fotografias, e têm as mesmas funcionalidades: pedido de orçamento em dois passos, janela "Transporte de trabalhadores para empresas", aviso de cookies, botão flutuante de WhatsApp, recrutamento e legal.

## 6. Notas importantes

- **Imagens:** as fotografias da frota (autocarros, vans e berlina) são imagens editadas e não fotografias de campo; as matrículas visíveis são chapas promocionais TRN. Confirme com a TRN que representam a frota e que podem ser usadas comercialmente.
- **Letras:** Archivo e Manrope estão incluídas na pasta `assets/fonts` (as mesmas famílias pedidas), em vez de serem pedidas ao Google Fonts. O visual é o mesmo, não há pedidos a terceiros e o site funciona sem internet.
- **Cookies:** o aviso (aceitar/recusar) está ligado à página Legal. O site não usa estatísticas nem cookies de publicidade. Se vier a usá-las, só devem ser ativadas depois de "Aceitar".
- **Texto legal:** a página Legal é uma minuta. Precisa de revisão jurídica antes da publicação final.
- **Quem altera textos:** os textos estão no gerador (`TRN-propostas-A-B_gerador/content.py`). Depois de alterar, correr `python3 gerar.py`. Para mudar só telefone, WhatsApp e Formspree não é preciso gerar nada.
- **Verificação:** o gerador inclui `tools/testar.py` (testes automáticos de janelas, formulários e idiomas), `tools/verificar.py` (ligações, imagens, títulos, hreflang) e `tools/largura.py` (largura em 375 e 320 px).
