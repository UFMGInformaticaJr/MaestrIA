const puppeteer = require('puppeteer');
const sleep = require('util');


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
    botaoPesquisarAvancado = '/html/body/div[1]/div[2]/section/div/div/div/div/div/div/div[2]/div[2]/ul/li[1]/a'

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
            headless: true,
            defaultViewport: null,
            args: ['--start-maximized', '--disable-notifications', '--disable-infobars', '--disable-extensions', '--disable-dev-shm-usage', '--no-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36');
        
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
        this.takeScreenshot('paginaCarregada.png');

        //esperar a pagina carregar. Acho que nao é necessário
        //await this.selectAndWait(this.pathProcesso)
    }

    async renderizarPagina() {
        await this.page.waitForSelector('body', { visible: true }, 3000);
    }
    async enterTextByCss(css, searchText) {
        await this.page.findElement(By.css(css)).sendKeys(searchText);
    }
    async getElementByXpath(xpath) {
        try {
            return await this.page.waitForSelector(`xpath${xpath}`, { visible: true }, 1000);
        }
        catch (err) {
            console.error("Erro ao encontrar elemento pelo xpath: " + xpath)
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
        await elem.click();
    }
    async getLinkByXpath(xpath) {
        const elem = await this.getElementByXpath(xpath);
        return elem.evaluate(element => element.href, elem);
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
        const pages = await this.page.browser().pages();
        const newPage = pages.find(p => p !== this.page && p.url() !== 'about:blank');
        await newPage.bringToFront();
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

    async selectAndWait(xpath, timeout) {
        try{
        await this.page.waitForSelector(`xpath/${xpath}`, { visible: true }, timeout);
        }catch(err){
            console.log("timeout error para elemento ", xpath)
        }
        return await this.getElementByXpath(xpath);

        //let el = await this.page.findElement(By.xpath(xpath));
        //await this.page.wait(until.elementIsVisible(el),100);

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




    async inserirPaginaEDatasNaUrl(paginaInicial = 10, dataInicio = '01/01/2000', dataFim = '01/01/2021') {


        //deixar apenas numeros na data
        dataInicio = dataInicio.replace(/\D/g, '');
        dataFim = dataFim.replace(/\D/g, '');

        const intervalo = dataInicio + '-' + dataFim;


        const novasQueries = {
            'page': paginaInicial,
            'julgamento_data': intervalo
        }

        const urlComParametros = await this.criarNovaUrlComParametro(novasQueries);

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
       /* try {
            await this.selectAndWait(this.primeiroLink, 3000);
        }
        catch (err) {
            console.log("Não foi possível selecionar o primeiro link por algum motivo")
        }
        */
        const allLinks = await this.page.findElements(By.css("a"));

        //Todos seguem esse padrão, seja monocratica ou acordeao
        const regex = /\/pages\/search\//;

        const hrefsPaginas = [];

        for (const link of allLinks) {
            const href = await link.getAttribute("href");
            if (regex.test(href)) {
                hrefsPaginas.push(href);
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
            this.page.sleep(1000); //esperar 1 segundo para evitar sobrecarregar o site e parar de dar o bug de nao achar a janela
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

    async irPaginaAcompanhamentoProcessual(retry = true) {
        try {
            const elemento = await this.selectAndWait(this.pathIconeAcompanhamentoProcessual, 5000);
            //console.log('Acessando página de acompanhamento processual')
            await elemento.click();

            //mudar para a nova aba
            await this.newWindowUrl();
        }
        catch (e) {
            // geralmente muitos erros acontecem nesse método, então é legal tentar novamente
            if (retry) {
                await this.irPaginaAcompanhamentoProcessual(false);

            }
            else {
                console.log(e)
                console.error('Não foi possível acessar a página de acompanhamento processual, verifique se o processo possui essa página')
                e.message + - ('Não foi possível acessar a página de acompanhamento processual, verifique se o processo possui essa página')
                throw e;

            }
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

    async getLinkTeorIntegra() {
        //clicar no icone de mostrar integra e mudar para a nova aba
        let url = ''
        try {
            //TODO VE QUANDO NAO TEM O PDF 
            // await this.clickByXpath(this.pathIconeInteiroTeor)
            // await this.newWindowUrl();
           url =  await this.getLinkByXpath(this.pathIconeInteiroTeor)
            //await this.page.sleep(3000)
            // url = await this.page.url();

            // await this.returnOldWindow()
        } catch (error) {
            url = "Não disponível";

        }
        finally {
            return url;
        }

    }

    async getTotalPaginas() {
        try{
            var elemento = await this.getElementByXpath(this.pathTotalPaginas);
       // var texto = await this.getTextUsingSelector(this.pathTotalPaginas);
       let texto = await elemento.getText();
       texto = texto?.split(" ")[1];

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

}

module.exports = BasePage;