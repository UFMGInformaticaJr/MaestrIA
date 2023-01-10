const { Key, By } = require('selenium-webdriver');
var BasePage = require('./basepage');

class AcordeaoPage extends BasePage {

    //variaveis sobrecarregadas
    primeiroLink = '/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[1]/a';
    //pathProcesso = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[1]';
    pathProcesso = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/div/mat-tab-body[1]/div/div/div[1]/div[1]/h4[1]';

    pathClasse = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/div/mat-tab-body[1]/div/div/div[1]/div[1]/h4[2]';
    pathRelator = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/div/mat-tab-body[1]/div/div/div[1]/div[1]/h4[3]';
    pathDataJulgamento = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/div/mat-tab-body[1]/div/div/div[1]/div[1]/div/h4[1]';
    pathDataPublicacao = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/div/mat-tab-body[1]/div/div/div[1]/div[1]/div/h4[2]';
    pathPartes = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/div/mat-tab-body[1]/div/div/div[4]/h4';
    pathDecisaoJurisprudencia = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/div/mat-tab-body[1]/div/div/div[6]/h4';
    //pathIconeAcompanhamentoProcessual = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/div/mat-icon[1]';
    //pathIconeInteiroTeor = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/div/mat-icon[2]';
    pathTotalPaginas = '/html/body/app-root/app-home/main/search/div/div/div/div[2]/paginator/nav/div/span';

    pathOrgaoJulgador = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/div/mat-tab-body[1]/div/div/div[1]/div[1]/h4[4]'

    pathNumeroUnicoCnj = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[1]/div[1]/div[2]';
    pathAssuntoAcompanhamentoProcessual = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[2]/div[4]/div[1]/div/div[1]/div[2]/div[2]/ul/li[1]'

    pathNumeroOrigemAcompanhamentoProcessual = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[2]/div[4]/div[1]/div/div[2]/div[1]/div[2]/div[8]'
    pathTribunalOrigemAcompanhamentoProcessual = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[2]/div[4]/div[1]/div/div[2]/div[1]/div[2]/div[4]'

    pathBadgeRepercussaoGeral = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/app-badge'

    pathTabEmentafull = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/mat-tab-header/div[2]/div/div/div[2]'
    pathTabResultadoCompleto = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/mat-tab-header/div[2]/div/div/div[1]'
    pathEmentaFull = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/mat-tab-group/div/mat-tab-body[2]/div/div/span[1]'

    async enter_url(theURL) {
        await this.go_to_url(theURL);
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

        await this.renderizarPagina();
        
        const ementa_full = await this.getTextUsingSelector(this.pathEmentaFull);
        const ementa_full_elemento = await this.getElementByXpath(this.pathEmentaFull);

       

        //selecionar elemento abaixo do texto
       
        let filho = "following-sibling::span[1]"
        let parteSecundaria = await ementa_full_elemento.$x('following-sibling::span[1]');
        let linha_citacao = await parteSecundaria[0].evaluate(element => element.textContent, parteSecundaria);

        //voltar para a aba resultado completo
        await this.clickByXpath(this.pathTabResultadoCompleto);

        await this.renderizarPagina();


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