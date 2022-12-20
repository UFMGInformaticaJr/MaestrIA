var BasePage = require('./basePage');

class MonocraticaPage extends BasePage {

    primeiroLink = '/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[1]/a';
    pathProcesso = '//*[@id="scrollId"]/div/div[1]/div/div[1]/div[1]/h4[1]'
    pathClasse = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[1]/h4[2]';
    pathRelator = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[1]/h4[3]';
    pathDataJulgamento = '//*[@id="scrollId"]/div/div[1]/div/div[1]/div[1]/div/h4[1]';
    pathDataPublicacao = '//*[@id="scrollId"]/div/div[1]/div/div[1]/div[1]/div/h4[2]';
    pathPartes = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[3]/div';
    pathInteiroTeorPuro = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[4]/div';
    pathIconeAcompanhamentoProcessual = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[2]/div/mat-icon[1]';
    pathIconeInteiroTeor =  '//*[@id="scrollId"]/div/div[1]/div/div[1]/div[2]/div/mat-icon[2]';
    pathTotalPaginas = '/html/body/app-root/app-home/main/search/div/div/div/div[2]/paginator/nav/div/span';
    urlInicial= '';

    //pathOrgaoJulgador = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[4]'

    
    pathNumeroUnico = '//*[@id="texto-pagina-interna"]/div/div/div/div[1]/div[1]/div[2]';

    pathNumeroCnj = '//*[@id="texto-pagina-interna"]/div/div/div/div[1]/div[1]/div[2]';
    pathAssuntoAcompanhamentoProcessual = '//*[@id="informacoes-completas"]/div[1]/div[2]/div[2]/ul/li'
    
    pathNumeroOrigemAcompanhamentoProcessual = '//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[8]'
    pathTribunalOrigemAcompanhamentoProcessual = '//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[4]'

    async setUpSearchOptions() {
        await super.setUpSearchOptions('monocratica');
    }

    async getNumeroUnico(){
        const numeroUnico = await this.getElementByXpath(this.pathNumeroUnico);
        return await numeroUnico.getText();
    }

    async setUrlInicial(urlInicial){
        this.urlInicial = urlInicial;
    }


}

module.exports = MonocraticaPage;