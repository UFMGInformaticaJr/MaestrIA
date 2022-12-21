const { Key, By } = require('selenium-webdriver');
var BasePage = require('./basepage');

class AcordeaoPage extends BasePage {

    //variaveis sobrecarregadas
    primeiroLink = '/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[1]/a';
    pathProcesso = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[1]';
    pathClasse = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[2]';
    pathRelator = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[3]';
    pathDataJulgamento = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/div/h4[1]';
    pathDataPublicacao = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/div/h4[2]';
    pathPartes = '//*[@id="mat-tab-content-0-0"]/div/div/div[4]/div';
    pathDecisaoJurisprudencia = '//*[@id="mat-tab-content-0-0"]/div/div/div[6]/div';
    pathIconeAcompanhamentoProcessual = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/div/mat-icon[1]';
    pathIconeInteiroTeor = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/div/mat-icon[2]';
    pathTotalPaginas = '/html/body/app-root/app-home/main/search/div/div/div/div[2]/paginator/nav/div/span';

    pathOrgaoJulgador = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[4]'

    pathNumeroCnj = '//*[@id="texto-pagina-interna"]/div/div/div/div[1]/div[1]/div[2]';
    pathAssuntoAcompanhamentoProcessual = '//*[@id="informacoes-completas"]/div[1]/div[2]/div[2]/ul/li'

    pathNumeroOrigemAcompanhamentoProcessual = '//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[8]'
    pathTribunalOrigemAcompanhamentoProcessual = '//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[4]'

    pathBadgeRepercussaoGeral = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/app-badge'

    pathTabEmentafull = '//*[@id="mat-tab-label-0-1"]'
    pathTabResultadoCompleto = '//*[@id="mat-tab-label-0-0"]'
    pathEmentaFull = '//*[@id="mat-tab-content-0-1"]/div/div/span[1]'

    async enter_url(theURL) {
        await this.go_to_url(theURL);
    }
    async setUpSearchOptions() {
        await super.setUpSearchOptions('acordeao');
    }

    async getOrgaoJulgador() {
        const orgaoJulgador = await this.getElementByXpath(this.pathOrgaoJulgador);
        return await orgaoJulgador.getText();
    }

    async irAbaEmentaFulleRecuperarTexto() {
        //Clickar na aba ementa e mudar de aba
        await this.clickByXpath(this.pathTabEmentafull);
        const ementafull = await this.selectAndWait(this.pathEmentaFull);

        let ementa_full = await ementafull.getText();

        //selecionar elemento abaixo do texto
        //Talvez seja necessário um regex, estou confuso
        let parteSecundaria = await ementafull.findElement(By.xpath("following-sibling::span[1]"));
        let linha_citacao = await parteSecundaria.getText();

        //voltar para a aba resultado completo
        await this.clickByXpath(this.pathTabResultadoCompleto);

        // esperar o elemento ser carregado
        await this.selectAndWait(this.pathRelator);

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
            badge = await this.getElementByXpath(this.pathBadgeRepercussaoGeral);
            
        } catch (e) {
            console.log('Não existe badge de repercussão geral, erro');
            return null;
        }


        const badgeText = await badge.getText();

        //get badge children a element
        let badgeA = await badge.findElement({ tagName: 'a' });
        let badgeAhref = await badgeA.getAttribute('href');


        const dados = {
            'texto': badgeText,
            'link': badgeAhref
        }

        return dados;


    }
   
}
module.exports = AcordeaoPage;