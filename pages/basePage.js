const { time } = require('console');
const { query } = require('express');
var webdriver = require('selenium-webdriver');
const { Builder, By, until, Key, Capabilities } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fsp = require('fs').promises

class BasePage {

    base_url = 'https://jurisprudencia.stf.jus.br/pages/search';
    old_window = [];

    iconePesquisaAvancada = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/mat-form-field/div/div[1]/div[4]/div/mat-icon[3]';
    botaoBuscaEntreAspas = 'html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[2]/label/div/input';
    botaoBuscaRadicais = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[4]/div/div[1]/div[2]/mat-checkbox[1]/label/div/input';
    botaoInteiroTeor = '//*[@id="mat-checkbox-3-input"]'
    inputPesquisa = '/html/body/app-root/app-home/main/search/div/search-input/div/div/div/div/div[2]/div/div[2]/div/mat-form-field/div/div[1]/div[3]/input';
    inputSelecaoMonocratica = '//*[@id="mat-radio-5"]/label/div[1]/div[1]'
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
        const headless = false;
        // var driver = new Builder().usingServer('http://localhost:4444').withCapabilities(Capabilities.chrome())
        var driver = new Builder().forBrowser('chrome')
        if (headless) {

            const chromeOptions = new chrome.Options();
            // const user_agent = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +https://www.google.com/bot.html) Safari/537.36"
            // chromeOptions.addArguments(`user-agent=${user_agent}`)
            // chromeOptions.addArguments("--blink-settings=imagesEnabled=false");
            // chromeOptions.addArguments('--ignore-certificate-errors')
            // chromeOptions.addArguments('--allow-running-insecure-content')
            // chromeOptions.addArguments("--disable-extensions")
            // chromeOptions.addArguments("--proxy-server='direct://'")
            // chromeOptions.addArguments("--proxy-bypass-list=*")
            // chromeOptions.addArguments("--disable-infobars")
            // chromeOptions.addArguments("--disable-dev-shm-usage")
            // chromeOptions.addArguments("--notifications")

            // chromeOptions.addArguments('--disable-gpu')
            // chromeOptions.addArguments('--disable-dev-shm-usage')
            // chromeOptions.addArguments('--no-sandbox')

            //ailton
            chromeOptions.addArguments('--headless');
            chromeOptions.addArguments('--disable-infobars');
            chromeOptions.addArguments('--disable-notifications');
            chromeOptions.addArguments('--disable-dev-shm-usage');
            chromeOptions.addArguments('--no-sandbox');

            const screen = {
                width: 1280,
                height: 720
            };

            driver = driver.setChromeOptions(chromeOptions.headless().windowSize(screen));

        }
        driver = driver.build();
        driver.manage().setTimeouts({ implicit: (2000) });
        global.driver = driver;
        if (!headless) {

            driver.manage().window().maximize()
        }

    }
    async titleCase(str) {
        return str.toLowerCase().split(' ').map(function (word) {
            if (word === 'de' || word === 'da' || word === 'das' || word === 'do' || word === 'dos') {
                return word;
            }
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }

    async go_to_url(theURL) {
        const old = await driver.getWindowHandle();
        this.old_window.push(old);
        await driver.get(theURL);
    }

    async openUrlAndWaitForPageLoad(url) {
        await this.go_to_url(url);

        //esperar a pagina carregar. Acho que nao é necessário
        //await this.selectAndWait(this.pathProcesso)
    }
    async enterTextByCss(css, searchText) {
        await driver.findElement(By.css(css)).sendKeys(searchText);
    }
    async getElementByXpath(xpath) {
        try {
            return await driver.findElement(By.xpath(xpath));
        }
        catch (err) {
            console.error("Erro ao encontrar elemento pelo xpath: " + xpath)
            //console.error(err.stack);
            throw err;
        }
    }
    async getTextUsingSelector(path, func = this.getElementByXpath) {
        const elem = await func(path)
        return elem.getText();
    }
    async getInnerTextUsingSelector(path, func = this.getElementByXpath) {
        const elem = await func(path)
        return elem.getAttribute('innerText');
    }
    async clickById(id) {
        await driver.findElement(By.id(id)).click();
    }
    async clickByXpath(xpath) {
        const elem = await driver.findElement(By.xpath(xpath))
        await elem.click();
    }
    async pressTab(element) {
        await element.sendKeys(webdriver.Key.TAB);
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
        const foundElements = await driver.findElements(By.xpath(`//${tag}[contains(text(), "${text}")]`));

        if (foundElements === null || foundElements.length === 0)
            return null;

        try {
            let textFound = null;
            for (const elementos of foundElements) {
                textFound = elementos.findElement(By.xpath("following-sibling::*"))
            }

            return await textFound.getText();
        } catch (err) {
            console.error(`Erro ao encontrar texto: ${text}`)
            console.error(err.stack);
            throw err;
        }

    }

    async newWindowUrl() {
        const handles = await driver.getAllWindowHandles();
        const currentWindow = await this.getWindowHandle()
        this.old_window.push(currentWindow);
        const newWindowUrl = handles.filter(handle => handle !== currentWindow)[0];

        await driver.switchTo().window(newWindowUrl);
    }
    async returnOldWindow() {
        const old = this.old_window.pop();
        driver.close();
        await driver.switchTo().window(old);
    }

    cleanText(text) {
        return text?.replace(/(\r\n|\n|\r)/gm, " ").trim();
    }

    async waitUntilElementIsVisible(element, timeout = 3000) {

        await driver.wait(webdriver.until.elementIsVisible(element), timeout);
    }
    async waitUntilElementIsEnabled(element, timeout = 3000) {
        await driver.wait(webdriver.until.elementIsEnabled(element), timeout);
    }

    async selectAndWait(xpath, timeout = 3000, mode = 'visible') {
        try{
        await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
        }catch(err){
            console.log("timeout error para elemento ", xpath)
        }
        return await this.getElementByXpath(xpath);

        //let el = await driver.findElement(By.xpath(xpath));
        //await driver.wait(until.elementIsVisible(el),100);



    }


    async getWindowHandle() {
        return await driver.getWindowHandle();
    }

    async closeBrowser() {
        await driver.quit();
    }

    async takeScreenshot(filename = "screenshot.png") {
        let image = await driver.takeScreenshot()
        await fsp.writeFile(filename, image, 'base64')

    }

    async setUpSearchOptions(type) {
        try {
            let elemento


            await this.go_to_url(this.base_url);

            await this.selectAndWait(this.iconePesquisaAvancada, 20000);

            // abre a pesquisa avançada

            await this.clickByXpath(this.iconePesquisaAvancada);

            await driver.sleep(1000);

            if (type == 'monocratica') {
                elemento = await this.getElementByXpath(this.inputSelecaoMonocratica);
                driver.executeScript("arguments[0].click();", elemento);
            }

            // DESABILITA BUSCA ENTRE ASPAS
            elemento = await this.getElementByXpath(this.botaoBuscaEntreAspas);
            driver.executeScript("arguments[0].click();", elemento);

            //HABILITA BUSCA POR RADICAIS
            elemento = await this.getElementByXpath(this.botaoBuscaRadicais);
            driver.executeScript("arguments[0].click();", elemento);

            if (type == 'acordeao') {
                //Clicar em inteiro teor
                elemento = await this.getElementByXpath(this.botaoInteiroTeor);
                driver.executeScript("arguments[0].click();", elemento);
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

            elemento.sendKeys(searchQuery) //mudar para variavel posteriormente

            //BOTAO PESQUISAR
            elemento = await this.getElementByXpath(this.botaoPesquisar);
            await elemento.click()

        }
        catch (err) {
            console.error("Erro ao configurar opções de pesquisa")

            throw err;
        }
    }
    async criarNovaUrlComParametro(dicionarioQueryValores, url = "") {
        if (url == "") {
            url = await driver.getCurrentUrl();
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

        await inputInicio.click()
        await inputInicio.sendKeys(dataJulgamento)
        await inputInicio.sendKeys(Key.ENTER)

        const inputFinal = await this.selectAndWait(this.inputFimDataJulgamento, 3000);

        await inputFinal.click()
        await inputFinal.sendKeys(dataPublicacao)
        await inputFinal.sendKeys(Key.TAB)

    }

    async getAllDocumentsInPage() {
       /* try {
            await this.selectAndWait(this.primeiroLink, 3000);
        }
        catch (err) {
            console.log("Não foi possível selecionar o primeiro link por algum motivo")
        }
        */
        const allLinks = await driver.findElements(By.css("a"));

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
            driver.sleep(1000); //esperar 1 segundo para evitar sobrecarregar o site e parar de dar o bug de nao achar a janela
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
        const processo = await this.getTextUsingSelector(this.pathProcesso);

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
                await driver.sleep(3000)
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
        const elemento = await this.selectAndWait(this.pathNumeroCnj, 6000);
        const texto = await elemento.getText();

        return texto;
    }

    async getAssuntoAcompanhamentoProcessual() {
        const assunto = await this.getInnerTextUsingSelector(this.pathAssuntoAcompanhamentoProcessual);
        return assunto;
    }

    async getUrlProcessoTribunalAcompanhamentoProcessual() {
        return await driver.getCurrentUrl();
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

            await this.clickByXpath(this.pathIconeInteiroTeor)
            await this.newWindowUrl();

            //await driver.sleep(3000)
            url = await driver.getCurrentUrl();

            await this.returnOldWindow()
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
        return await driver.getCurrentUrl();
    }

    //depreciado
    async alterarPagina(url, numPagina) {
        return url.replace(/page=\d+/, `page=${numPagina}`);
    }

}

module.exports = BasePage;