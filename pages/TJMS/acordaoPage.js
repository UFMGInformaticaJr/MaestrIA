var TJMSPage = require('./TJMSPage.js');

class AcordeaoPage extends TJMSPage {

    //variaveis sobrecarregadas
    primeiroLink = '';
    //pathProcesso = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[1]';
    pathProcesso = '';

    pathClasse = '';
    pathRelator = '';
    pathDataJulgamento = '';
    pathDataPublicacao = '';
    pathPartes = '';
    pathDecisaoJurisprudencia = '';
    //pathIconeAcompanhamentoProcessual = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/div/mat-icon[1]';
    //pathIconeInteiroTeor = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/div/mat-icon[2]';
    pathTotalPaginas = '';

    pathOrgaoJulgador = ''

    pathNumeroUnicoCnj = '';
    pathAssuntoAcompanhamentoProcessual = ''

    pathNumeroOrigemAcompanhamentoProcessual = ''
    pathTribunalOrigemAcompanhamentoProcessual = ''

    pathBadgeRepercussaoGeral = ''

    pathTabEmentafull = ''
    pathTabResultadoCompleto = ''
    pathEmentaFull = ''

    async enter_url(theURL) {
        await this.goToUrl(theURL);
    }
    async setUpSearchOptions() {
        await super.setUpSearchOptions('acordeao');
    }

    async getOrgaoJulgador() {
        // TODO: erro aqui, parei nisso
        const orgaoJulgador = await this.getTextUsingSelector(this.pathOrgaoJulgador);
        return orgaoJulgador;
    }

    async irAbaEmentaFulleRecuperarTexto() {
        //Clickar na aba ementa e mudar de aba
        await this.clickByXpath(this.pathTabEmentafull);

        await this.renderPage();
        
        const ementa_full = await this.getTextUsingSelector(this.pathEmentaFull);
        const ementa_full_elemento = await this.getElementByXpath(this.pathEmentaFull);

       

        //selecionar elemento abaixo do texto
       
        let filho = "following-sibling::span[1]"
        let parteSecundaria = await ementa_full_elemento.$x('following-sibling::span[1]');
        let linha_citacao = await parteSecundaria[0].evaluate(element => element.textContent, parteSecundaria);

        //voltar para a aba resultado completo
        await this.clickByXpath(this.pathTabResultadoCompleto);

        await this.renderPage();


        const textoCompleto = {
            ementa_full: ementa_full,
            linha_citacao: linha_citacao
        }


        return textoCompleto;

    }
    async getRepercussaoGeral() {
        //Verifica se o elemento exista na pagina
        let badge;
        try {
            //TODO: criar metodo com timeout menor pra isso
            badge = await this.getElementByXpath(this.pathBadgeRepercussaoGeral, 200, false);
            
        } catch (e) {
            console.log('Não existe badge de repercussão geral nessa pagina');
            return null;
        }


        const badgeText = await getTextUsingSelector(this.pathBadgeRepercussaoGeral);

        //get badge children a element
        // TODO: acho q isso nao funciona
        let badgeA = await badge.querySelector('a');
        let badgeAhref = await badgeA.getAttribute('href');


        const dados = {
            'texto': badgeText,
            'link': badgeAhref
        }

        return dados;


    }
   
}
module.exports = AcordeaoPage;