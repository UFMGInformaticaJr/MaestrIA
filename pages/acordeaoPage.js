const {Key} = require('selenium-webdriver');
var BasePage = require ('./basepage');

class AcordeaoPage extends BasePage{

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
    pathIconeInteiroTeor =  '//*[@id="mat-tab-content-0-0"]/div/div/div[1]/div[2]/div/mat-icon[2]';

    pathNumeroCnpj = '//*[@id="texto-pagina-interna"]/div/div/div/div[1]/div[1]/div[2]';
    pathAssuntoAcompanhamentoProcessual = '//*[@id="informacoes-completas"]/div[1]/div[2]/div[2]/ul/li'
    
    pathNumeroOrigemAcompanhamentoProcessual = '//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[8]'
    pathTribunalOrigemAcompanhamentoProcessual = '//*[@id="informacoes-completas"]/div[2]/div[1]/div[2]/div[4]'


    async enter_url(theURL){
        await this.go_to_url(theURL);
    }
    async setUpSearchOptions(){
        await super.setUpSearchOptions('acordeao');
    }
    
}
module.exports = AcordeaoPage;