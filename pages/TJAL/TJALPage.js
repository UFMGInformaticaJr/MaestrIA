var BasePage = require('../basePage.js');
const sleep = require('util').promisify(setTimeout);

class STFPage extends BasePage {
    base_url = 'https://www2.tjal.jus.br/cjsg/consultaCompleta.do';
    old_window = [];
    urlInicialPagina = '';

    // datas
    inputInicioDataJulgamento = '/html/body/app-root/app-home/main/search/div/div/div/div[1]/div[2]/div[3]/div/div[2]/mat-form-field[1]/div/div[1]/div[3]/input'
    inputFimDataJulgamento = '/html/body/app-root/app-home/main/search/div/div/div/div[1]/div[2]/div[3]/div/div[2]/mat-form-field[2]/div/div[1]/div[3]/input'

    // tipo jurusdicao
    input2Grau = '/html/body/table[4]/tbody/tr/td/form/div[3]/table[2]/tbody/tr[10]/td[2]/table/tbody/tr/td/input[1]'
    inputColegiosRecursais = '/html/body/table[4]/tbody/tr/td/form/div[3]/table[2]/tbody/tr[10]/td[2]/table/tbody/tr/td/input[2]'
  
    //botao final de pesquisa no menu inicial
    botaoPesquisar = '/html/body/table[4]/tbody/tr/td/form/table/tbody/tr/td[2]/input[1]'

    //Itens de coleta
    pathProcesso = '/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[1]/td[2]/table/tbody/tr[1]/td/a[1]';
    pathClasseAssunto = '/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[1]/td[2]/table/tbody/tr[2]/td';
    pathRelator = '/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[1]/td[2]/table/tbody/tr[3]/td';
    pathOrgaoJulgador = '/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[1]/td[2]/table/tbody/tr[5]/td'
    pathDataJulgamento = '/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[1]/td[2]/table/tbody/tr[6]/td';
    pathDataPublicacao = '/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[1]/td[2]/table/tbody/tr[7]/td';
    pathEmentaFull = '/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[1]/td[2]/table/tbody/tr[1]/td/a[3]/img';
    pathNumeroUnicoCnj = '';
    pathUrlPdf = '/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[1]/td[2]/table/tbody/tr[1]/td/a[2]';
    pathComarca = '/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[1]/td[2]/table/tbody/tr[4]/td';

    async getProcesso() {
        const processo = await this.getTextUsingSelector(this.pathProcesso)

        return processo;
    }
    async getClasse() {
        const texto = await this.getTextUsingSelector(this.pathClasseAssunto);
        return texto;
    }
    async getAssunto() {
        const texto = await this.getTextUsingSelector(this.pathClasseAssunto);
        return texto;
    }
    async getRelator() {
        const texto = await this.getTextUsingSelector(this.pathRelator);
        return texto;
    }
    async getOrgaoJulgador() {
        // TODO: erro aqui, parei nisso
        const orgaoJulgador = await this.getTextUsingSelector(this.pathOrgaoJulgador);
        return orgaoJulgador;
    }
    async getDataJulgamento() {
        const texto = await this.getTextUsingSelector(this.pathDataJulgamento);
        return texto;
    }
    async getDataPublicacao() {
        const texto = await this.getTextUsingSelector(this.pathDataPublicacao);
        return texto;
    }
    async getEmenta() {
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
    async getUrlPDF (i, offset=0){
        let xpathPDF = `/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[${i}]/div[1]/div/a[${3+offset}]`
        let url = await this.getLinkTeorIntegra(xpathPDF);
        return url;
    }
    async getComarca() {
        const texto = await this.getTextUsingSelector(this.pathComarca);
        return texto;
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

            // verifique se há um resultado
            if (match) {
            // o resultado estará no primeiro elemento do array
            texto = match[0];
            }

            return texto;
        }
        catch(e){
            console.error("Não há paginas para a consulta")
           
            return 0;
        }
        
    }

    setUrlInicial(urlInicialPagina) {
        this.urlInicialPagina = urlInicialPagina;
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
        //acontece se temos menos que 10 elementos na pagina, de forma que ele não ache o i-esimo e levante uma excessão
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
    async enter_url(theURL) {
        await this.goToUrl(theURL);
    }
    async setUpSearchOptions() {
        await super.setUpSearchOptions('acordeao');
    }
    async setUpSearchOptions(type) {
        try {
            let elemento
        
            await this.goToUrl(this.base_url);

            await this.selectAndWait(this.iconePesquisaAvancada, 2000);

            // abre a pesquisa avançada
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
            console.error("Erro ao configurar opções de pesquisa")

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

        // //Todos seguem esse padrão, seja monocratica ou acordeao
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

                console.log("Pegando elemento " + currentElement + " da página com url " + url)



                const teste = await scrapSingleElement(this, url);
                //TODO: por algum motivo isso da referencia circular
                listaElementos.push(teste)
                currentElement++;
            }

            catch (error) {
                retrials++;
                if (retrials > 3) {
                    console.log("Erros por página excedidos")
                    throw error
                }
                else {
                    console.log("Erro ao pegar acordeao " + currentElement + " da página, tentando novamente")
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

}

module.exports = STFPage;