var BasePage = require('./basePage');

class MonocraticaPage extends BasePage {

    primeiroLink = '//*[@id="result-index-0"]/a';
    pathProcesso = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[1]/h4[1]'
    pathClasse = '//html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[1]/h4[2]';
    pathRelator = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[1]/h4[3]';
    pathDataJulgamento = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[1]/div/h4[1]';
    pathDataPublicacao = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[1]/div/h4[2]';
    pathPartes = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[3]/div';
    pathInteiroTeorPuro = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[4]/div';
    pathIconeAcompanhamentoProcessual = '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[2]/div/mat-icon[1]';
    pathIconeInteiroTeor =  '/html/body/app-root/app-home/main/app-search-detail/div/div/div[1]/div/div[1]/div[2]/div/mat-icon[2]';
    pathTotalPaginas = '/html/body/app-root/app-home/main/search/div/div/div/div[2]/paginator/nav/div/span';
 

    //pathOrgaoJulgador = '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[1]/h4[4]'

    
   

    pathNumeroUnicoCnj = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[1]/div[1]/div[2]';
    pathAssuntoAcompanhamentoProcessual = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[2]/div[4]/div[1]/div/div[1]/div[2]/div[2]/ul/li'
    
    pathNumeroOrigemAcompanhamentoProcessual = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[2]/div[4]/div[1]/div/div[2]/div[1]/div[2]/div[8]'
    pathTribunalOrigemAcompanhamentoProcessual = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[2]/div[4]/div[1]/div/div[2]/div[1]/div[2]/div[4]'

    async setUpSearchOptions() {
        await super.setUpSearchOptions('monocratica');
    }

    async getNumeroUnico(){
        const numeroUnico = await this.selectAndWait(this.pathNumeroUnico);
        return await numeroUnico.getText();
    }

    
}

module.exports = MonocraticaPage;