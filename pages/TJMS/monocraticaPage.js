var TJMSPage = require('.TJMSPage.js');

class MonocraticaPage extends TJMSPage {

    primeiroLink = '';
    pathProcesso = ''
    pathClasse = '';
    pathRelator = '';
    pathDataJulgamento = '';
    pathDataPublicacao = '';
    pathPartes = '';
    pathInteiroTeorPuro = '';
    pathIconeAcompanhamentoProcessual = '';
    pathIconeInteiroTeor =  '';
    pathTotalPaginas = '';
 

    pathNumeroUnicoCnj = '';
    pathAssuntoAcompanhamentoProcessual = ''
    
    pathNumeroOrigemAcompanhamentoProcessual = ''
    pathTribunalOrigemAcompanhamentoProcessual = ''

    async setUpSearchOptions() {
        await super.setUpSearchOptions('monocratica');
    }

    async getNumeroUnico(){
        const numeroUnico = await this.selectAndWait(this.pathNumeroUnico);
        return await numeroUnico.getText();
    }

    
}

module.exports = MonocraticaPage;