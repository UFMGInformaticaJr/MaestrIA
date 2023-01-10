const puppeteer = require('puppeteer-extra') 
const pluginStealth = require('puppeteer-extra-plugin-stealth') 
const {executablePath} = require('puppeteer');
puppeteer.use(pluginStealth())

const sleep = require('util').promisify(setTimeout);


class BasePage {
   
    base_url = 'https://jurisprudencia.stf.jus.br/pages/search';
    old_window = [];

    iconePesquisaAvancada = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/mat-form-field/div/div[1]/div[4]/div/mat-icon[3]';
    botaoBuscaEntreAspas = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[2]/label/div';
    botaoBuscaRadicais = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[1]/label/div';
    botaoInteiroTeor = '//*[@id="mat-checkbox-3-input"]'
    inputPesquisa = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[2]/div/mat-form-field/div/div[1]/div[3]/input';
    inputSelecaoMonocratica = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[1]/div/mat-radio-group/span[4]/mat-radio-button/label/div[1]/div[1]'
    // pathProximaPagina = '//*[@id="mat-input-179"]';
    //armazena a url da pagina de busca, para mantermos os parametros
    urlInicialPagina = '';
    //desnecessario, se ele nao achar nenhum link valido vai parar automatico
    //textoNenhumResultado = '//*[@id="scrollId"]/div/div/div[2]/div/div/div/span'


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

    constructor() {
        this.browser = null;
        this.page = null;
        
    }

    async init() {
        this.browser = await puppeteer.launch({
            executablePath: executablePath(),
            headless: true,
            defaultViewport: null,
            args: [
                '--start-maximized',
                '--ignore-certificate-errors',
                '--allow-running-insecure-content',
                '--disabel-extension',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--proxy-server="direct://"',
                '--proxy-bypass-list=*'

            ],
            ignoreHTTPSErrors: true
        });

          

        this.page = await this.browser.newPage();
        await this.page.setViewport({
            width: 375,
            height: 667
          });
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');

    }

    async scrollRow() {
        const element = await this.selectAndWait(this.botaoPesquisar, 2000);
        await this.page.evaluate((element) => {
            element.scrollIntoView();
        }, element);
    }
          
    async newSetupOptions(type){
        const url = "https://jurisprudencia.stf.jus.br/pages/search?base=acordaos"


        const params = {
            base: 'acordaos',
            pesquisa_inteiro_teor: true,
            sinonimo: true,
            plural: false,
            radicais: true,
            buscaExata: false,
            page: 1,
            pageSize: 10,
            queryString: 'recurso',
            sort: '_score',
            sortBy: 'desc',
            isAdvanced: true

        }

        const novaUrl = await this.criarNovaUrlComParametro(params, url)

        return novaUrl;
    }   

    async setUpSearchOptions(type) {
        try {
            let elemento

            

            await this.go_to_url(this.base_url);

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
   

    async go_to_url(theURL) {
        const old = this.page.target();
        this.old_window.push(old);
        await this.page.goto(theURL);
        
    }

    async openUrlAndWaitForPageLoad(url) {
        await this.go_to_url(url);

        await sleep(3000);
    }

    async renderizarPagina() {
        await this.page.waitForSelector('body', { visible: true }, 3000);
    }
    async enterTextByCss(css, searchText) {
        await this.page.findElement(By.css(css)).sendKeys(searchText);
    }
    async getElementByXpath(xpath, timeout=1000, log=true) {
        try {
            return await this.page.waitForSelector(`xpath${xpath}`, { visible: true }, timeout);
        }
        catch (err) {
            if (log){
                console.error("Erro ao encontrar elemento pelo xpath: " + xpath)
            }    
            throw err;
        }
    }
    async getTextUsingSelector(path) {
        
        let element = await this.getElementByXpath(path);
       
        return await element.evaluate(element => element.textContent, element)
    }
    async getInnerTextUsingSelector(path) {
        const elem = await this.getElementByXpath(path);
        return elem.evaluate(element => element.innerText, elem);
    }
    async clickById(id) {
        await this.page.findElement(By.id(id)).click();
    }
    async clickByXpath(xpath) {
        const elem = await this.getElementByXpath(xpath);
        await sleep(1000);
        await elem.click();
    }
    async getLinkByXpath(xpath) {
        const elem = await this.getElementByXpath(xpath);
        return await elem.evaluate(element => element.href, elem);
    }
    async pressTab(element) {
        await element.sendKeys(webthis.page.Key.TAB);
    }


    async elementExists(path, func = this.getElementByXpath) {
        try {
            const elem = await func(path);
            if (elem) {
                return true;
            }
            else {
                return false;
            }

        } catch (err) {
            console.error(err);
            return false;
        }
    }
    async getContentIfTextExists(text, tag = 'div') {
        try {
          const elements = await this.page.$$(tag);
          if (elements.length === 0) return null;
      
          let textFound = null;
          for (const element of elements) {
            const elementText = await this.page.evaluate(element => element.innerText, element);
            if (elementText.includes(text)) {
              textFound = await this.page.evaluate(element => element.nextElementSibling.innerText, element);
              break;
            }
          }
      
          return textFound;
        } catch (err) {
          console.error(`Erro ao encontrar texto: ${text}`);
          console.error(err.stack);
          throw err;
        }
      }

    async newWindowUrl() {
        await sleep(3000);
        const pages = await this.page.browser().pages();
        const newPage = await pages[pages.length - 1];
        await sleep(3000);
        this.old_window.push(this.page);
        this.page = newPage;
    }
    async returnOldWindow() {
        const oldPage = this.page;
        this.page = this.old_window.pop();
        await oldPage.close();
        await this.page.bringToFront();
    }

    cleanText(text) {
        return text?.replace(/(\r\n|\n|\r)/gm, " ").trim();
    }

    async titleCase(str) {
        return str.toLowerCase().split(' ').map(function (word) {
            if (word === 'de' || word === 'da' || word === 'das' || word === 'do' || word === 'dos') {
                return word;
            }
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }

    async waitUntilElementIsVisible(element, timeout = 3000) {

        await this.page.wait(webthis.page.until.elementIsVisible(element), timeout);
    }
    async waitUntilElementIsEnabled(element, timeout = 3000) {
        await this.page.wait(webthis.page.until.elementIsEnabled(element), timeout);
    }

    async selectAndWait(xpath, timeout=1000, log=true) {
        try{
        await this.page.waitForSelector(`xpath/${xpath}`, { visible: true }, timeout);
        }catch(err){
            if (log)
                console.log("timeout error para elemento ", xpath)
        }
        return await this.getElementByXpath(xpath,timeout, log);


    }


    async getWindowHandle() {
        return await this.page.getWindowHandle();
    }

    async closeBrowser() {
        await this.page.quit();
    }


   
    async criarNovaUrlComParametro(dicionarioQueryValores, url = "") {
        if (url == "") {
            url = await this.page.url();
        }

        const urlParams = new URLSearchParams(url.split('?')[1]);

        // para cada entrada, setar chave e url
        for (let key in dicionarioQueryValores) {
            urlParams.set(key, dicionarioQueryValores[key]);
        }

        return (url.split('?')[0] + '?' + urlParams.toString());
    }




    async inserirPaginaEDatasNaUrl(paginaInicial = 10, dataInicio = '01/01/2000', dataFim = '01/01/2021', url="") {


        //deixar apenas numeros na data
        dataInicio = dataInicio.replace(/\D/g, '');
        dataFim = dataFim.replace(/\D/g, '');

        const intervalo = dataInicio + '-' + dataFim;


        const novasQueries = {
            'page': paginaInicial,
            'julgamento_data': intervalo
        }

        const urlComParametros = await this.criarNovaUrlComParametro(novasQueries, url);

        return urlComParametros;
    }

    async inserirDatas(dataJulgamento = '01/01/2000', dataPublicacao = '01/01/2021') {


        const inputInicio = await this.selectAndWait(this.inputInicioDataJulgamento, 4000);

        await inputInicio.click();
        await inputInicio.type(dataJulgamento);
        await inputInicio.press('Enter');

        const inputFinal = await this.selectAndWait(this.inputFimDataJulgamento, 3000);

        await inputFinal.click();
        await inputFinal.type(dataPublicacao);
        await inputFinal.press('Tab');

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

    //legado, nao pecisa mais
    async irPaginaAcompanhamentoProcessual() {
        
            // let url = await this.getLinkByXpath(this.pathIconeAcompanhamentoProcessual);
            // console.log("Acessando página de acompanhamento processual  " + url)
            const elemento = await this.selectAndWait(this.pathIconeAcompanhamentoProcessual, 5000);
            //console.log('Acessando página de acompanhamento processual')
            await elemento.click();

            //mudar para a nova aba
            await this.newWindowUrl();
      

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
            //TODO VE QUANDO NAO TEM O PDF 
            await this.clickByXpath(xpathTeorIntegra);
            await this.newWindowUrl();
            url = await this.page.url();

            await this.returnOldWindow()
        } catch (error) {
            url = "Não disponível";

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

    async getTotalPaginas() {
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
    async goToNextPage(newPage) {

        const queryPagina = {
            'page': newPage
        }

        let urlProximaPagina = await this.criarNovaUrlComParametro(queryPagina, this.urlInicialPagina)

        console.log("Acessando página " + urlProximaPagina);
        await this.go_to_url(urlProximaPagina);

        return urlProximaPagina;
    }

    async getCurrentUrl() {
        return await this.page.getCurrentUrl();
    }

    //depreciado
    async alterarPagina(url, numPagina) {
        return url.replace(/page=\d+/, `page=${numPagina}`);
    }

    async takeScreenshot (nomearquivo){
        await this.page.screenshot({path: nomearquivo});
    }

    async getUrlByXpath(xpath, log=true) {
        const elemento = await this.selectAndWait(xpath, 2000, log);
        const value = await elemento.evaluate(el => el.href)
        return value
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

}

module.exports = BasePage;