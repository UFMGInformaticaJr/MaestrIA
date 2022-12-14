var BasePage = require('../BasePage.js');
const sleep = require('util').promisify(setTimeout);

class STFPage extends BasePage {
    base_url = 'https://jurisprudencia.stf.jus.br/pages/search';
    old_window = [];

    iconePesquisaAvancada = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/mat-form-field/div/div[1]/div[4]/div/mat-icon[3]';
    botaoBuscaEntreAspas = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[2]/label/div';
    botaoBuscaRadicais = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[1]/label/div';
    botaoInteiroTeor = '//*[@id="mat-checkbox-3-input"]'
    inputPesquisa = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[2]/div/mat-form-field/div/div[1]/div[3]/input';
    inputSelecaoMonocratica = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[1]/div/mat-radio-group/span[4]/mat-radio-button/label/div[1]/div[1]'

    urlInicialPagina = '';
  

    //botao final de pesquisa no menu inicial
    botaoPesquisar = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[2]/button[2]'
   

    //datas no painel lateral
    inputInicioDataJulgamento = '/html/body/app-root/app-home/main/search/div/div/div/div[1]/div[2]/div[3]/div/div[2]/mat-form-field[1]/div/div[1]/div[3]/input'
    inputFimDataJulgamento = '/html/body/app-root/app-home/main/search/div/div/div/div[1]/div[2]/div[3]/div/div[2]/mat-form-field[2]/div/div[1]/div[3]/input'

    //botao na pagina de pesquisa avancada
    botaoInformacoesProcessoProcessual = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[2]/div[3]/nav/div/ul/li[1]/a'
    inputInformacao = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[2]/div[3]/nav/div/input'
    

    //elementos que monocraticas e acordeoes tem em comum na pagina do processo
    primeiroLink = 'sobrecarregar';
    pathProcesso = '';
    pathClasse = '';
    pathRelator = '';
    pathDataJulgamento = '';
    pathDataPublicacao = '';
    pathPartes = '';
    pathDecisaoJurisprudencia = '';
    pathIconeAcompanhamentoProcessual = '';
    pathIconeInteiroTeor = '';
    pathInteiroTeorPuro = '';
    pathTotalPaginas = '';

    //elementos na pagina de acompanhamento processual
    pathNumeroCnj = '';
    pathAssuntoAcompanhamentoProcessual = ''
    pathUrlProcessoTribunalAcompanhamentoProcessual = ''
    pathNumeroOrigemAcompanhamentoProcessual = ''
    pathTribunalOrigemAcompanhamentoProcessual = ''


    async setUpSearchOptions(type) {
        try {
            let elemento

        
            await this.goToUrl(this.base_url);

            await this.selectAndWait(this.iconePesquisaAvancada, 2000);

            // abre a pesquisa avan??ada
            await this.clickByXpath(this.iconePesquisaAvancada);

            if (type == 'monocratica') {
               await this.clickByXpath(this.inputSelecaoMonocratica);
            }

            // DESABILITA BUSCA ENTRE ASPAS
            await this.clickByXpath(this.botaoBuscaEntreAspas);

            //HABILITA BUSCA POR RADICAIS
            await this.clickByXpath(this.botaoBuscaRadicais);

            if (type == 'acordeao') {
                //Clicar em inteiro teor
                await this.clickByXpath(this.botaoInteiroTeor);
            }

            //colocar recurso na pesquisa em todos os campos
            elemento = await this.getElementByXpath(this.inputPesquisa);

            let searchQuery;

            if (type == 'monocraticas' || type == 'monocratica') {

                searchQuery = 'monocratica'
            }
            else if (type == 'acordeao') {
                searchQuery = 'recurso'
            }
            else {
                throw new Error('Invalid search type, must be acordeao or monocratica');
            }
            //enviar a query de pesquisa
            elemento.type(searchQuery);
            await sleep(1000);

            //BOTAO PESQUISAR
            await this.clickByXpath(this.botaoPesquisar);

        }
        catch (err) {
            console.error("Erro ao configurar op????es de pesquisa")

            throw err;
        }
    }

    async insertPageAndDatesInUrl(paginaInicial = 10, dataInicio = '01/01/2000', dataFim = '01/01/2021', url="") {

        //deixar apenas numeros na data
        dataInicio = dataInicio.replace(/\D/g, '');
        dataFim = dataFim.replace(/\D/g, '');

        const intervalo = dataInicio + '-' + dataFim;


        const novasQueries = {
            'page': paginaInicial,
            'julgamento_data': intervalo
        }

        const urlComParametros = await this.createNewUrlWithParameter(novasQueries, url);

        return urlComParametros;
    }


    async getAllDocumentsInPage() {

        // //Todos seguem esse padr??o, seja monocratica ou acordeao
        const regex = /\/pages\/search\//;

        const hrefsPaginas = [];


        const links = await this.page.evaluate(() => {
          return Array.from(document.querySelectorAll('a'), a => a.href);
        });

        for (const link of links) {
            if (regex.test(link)) {
                hrefsPaginas.push(link);
            }
        }

        
        return hrefsPaginas;


    }


    async scrapAllDocumentsInPage(scrapSingleElement = async (basePage, url) => { throw new Error("scrapSingleElement not implemented") }) {

        const hrefsPaginas = await this.getAllDocumentsInPage();
        let retrials = 0;
        let currentElement = 0;
        let totalElementos = hrefsPaginas.length;
        
        const listaElementos = [];

        while (currentElement < totalElementos) {

            try {
                const url = hrefsPaginas[currentElement];

                console.log("Pegando elemento " + currentElement + " da p??gina com url " + url)



                const teste = await scrapSingleElement(this, url);
                //TODO: por algum motivo isso da referencia circular
                listaElementos.push(teste)
                currentElement++;
            }

            catch (error) {
                retrials++;
                if (retrials > 3) {
                    console.log("Erros por p??gina excedidos")
                    throw error
                }
                else {
                    console.log("Erro ao pegar acordeao " + currentElement + " da p??gina, tentando novamente")
                    console.error(error)
                }
            }
            //esperar 1 segundo para evitar sobrecarregar o site e parar de dar o bug de nao achar a janela
            await sleep(1000);
        }
        return listaElementos;
    }

    async clickarPrimeiroAcordeao() {
        //cliclar no link de dados completos
        const elemento = await this.getElementByXpath(this.primeiroLink);
        await elemento.click()

        //aguardar pagina carregar
        await this.selectAndWait(this.pathProcesso);
    }
    async getProcesso() {
        
        const processo = await this.getTextUsingSelector(this.pathProcesso)

        return processo;
    }

    async getClasse() {
        const texto = await this.getTextUsingSelector(this.pathClasse);
        return texto;
    }

    async getRelator() {
        const texto = await this.getTextUsingSelector(this.pathRelator);
        return texto;
    }
    async getDataJulgamento() {
        const texto = await this.getTextUsingSelector(this.pathDataJulgamento);
        return texto;
    }
    async getDataPublicacao() {
        const texto = await this.getTextUsingSelector(this.pathDataPublicacao);
        return texto;
    }
    async getPartes() {
        const texto = await this.getTextUsingSelector(this.pathPartes);
        return texto;
    }
    async getDecisaoJurisprudencia() {
        const texto = await this.getTextUsingSelector(this.pathDecisaoJurisprudencia);
        return texto;
    }
    async getInteiroTeorPuro() {
        try {
            const texto = await this.getTextUsingSelector(this.pathInteiroTeorPuro);
            return texto;
        }
        catch (e) {
            console.error("Erro ao buscar inteiro teor puro")
            throw e;
        }
    }


    async getCnjCruAcompanhamentoProcessual() {
        const elemento = await this.selectAndWait(this.pathNumeroUnicoCnj, 2000);
        const value = await elemento.evaluate(el => el.textContent)

        return value
    }

    async getAssuntoAcompanhamentoProcessual() {
        const assunto = await this.getInnerTextUsingSelector(this.pathAssuntoAcompanhamentoProcessual);
        return assunto;
    }

    async getUrlProcessoTribunalAcompanhamentoProcessual() {
        return await this.page.url();
    }
    async getNumeroOrigemAcompanhamentoProcessual() {
        const numero = await this.getInnerTextUsingSelector(this.pathNumeroOrigemAcompanhamentoProcessual);
        return numero
    }
    async getTribunalOrigemAcompanhamentoProcessual() {
        const tribunal = await this.getInnerTextUsingSelector(this.pathTribunalOrigemAcompanhamentoProcessual);
        return tribunal;
    }

    async getLinkTeorIntegra(xpathTeorIntegra) {
        //clicar no icone de mostrar integra e mudar para a nova aba
        let url = ''
        try {
            await this.clickByXpath(xpathTeorIntegra);
            await this.newWindowUrl();
            url = await this.page.url();

            await this.returnOldWindow()
        } catch (error) {
            url = "N??o dispon??vel";

        }
        finally {
            return url;
        }

    }

    async getElementCountInPage(){
        const xpath = '/html/body/app-root/app-home/main/search/div/div/div/div[2]/div'

        /* Deveria funcionar?
        const element = await this.page.evaluate(() => {
            //seletor para a coluna que tem todos os rows de elementos
            return document.querySelector('#scrollId > div > div > div:nth-child(2) > div > div:nth-child(2)');
          });

        return element?.childElementCount ?? 0
          
        const element = await this.page.evaluate((xpath) => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            return element;
          }, xpath);
          
        const childrenCount = element.children.length;
        return childrenCount;
        */
        const elem = await this.page.$x(xpath);
       
        const childrenCount = await this.page.evaluate(elem => elem.children.length, elem)
        return childrenCount
                
          
    }

    async getTotalPages() {
        try{
            
            let texto = await this.getTextUsingSelector(this.pathTotalPaginas);
            await this.page.screenshot({ path: 'example.png' });
            
            const match = texto.match(/\d+/);

            // verifique se h?? um resultado
            if (match) {
            // o resultado estar?? no primeiro elemento do array
            texto = match[0];
            }

            return texto;
        }
        catch(e){
            console.error("N??o h?? paginas para a consulta")
           
            return 0;
        }
        
    }

    setUrlInicial(urlInicialPagina) {
        this.urlInicialPagina = urlInicialPagina;
    }

    async getUrlProcesso(i){
        let xpathProcesso = `/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[${i}]/a`
        let url = await this.getUrlByXpath(xpathProcesso, false);
        return url;
    }

    async getUrlAcompanhamento (i, offset=0){
        
        let xpathAcompanhamento = `/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[${i}]/div[1]/div/a[${2+offset}]`
        let url = await this.getUrlByXpath(xpathAcompanhamento, false);
        return url;
    }

    async getUrlPDF (i, offset=0){
        let xpathPDF = `/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[${i}]/div[1]/div/a[${3+offset}]`
        let url = await this.getLinkTeorIntegra(xpathPDF);
        return url;
    }


    async getUrls(i, isAcordeao=false){

        let offset = 0;
        if(isAcordeao){
            offset = 1;
        }

        let urls = [];
        try {
        urls.push(await this.getUrlProcesso(i));
        urls.push(await this.getUrlAcompanhamento(i, offset));
        urls.push(await this.getUrlPDF(i, offset));
        }
        //acontece se temos menos que 10 elementos na pagina, de forma que ele n??o ache o i-esimo e levante uma excess??o
        catch(e){
            
            if(i > 1){
                console.log("Acabaram os elementos na pagina")
            return []

            }
            else {
                throw e;
            }
        }
        return urls;
    }

}

module.exports = STFPage;