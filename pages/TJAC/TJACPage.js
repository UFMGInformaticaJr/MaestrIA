var BasePage = require('../basePage.js');
const sleep = require('util').promisify(setTimeout);

class TJACPage extends BasePage {
    base_url = 'https://esaj.tjac.jus.br/cjsg/consultaCompleta.do';
    old_window = [];

    //elementos que monocraticas e acordeoes tem em comum na pagina do processo
    // primeiroLink = 'sobrecarregar';
    // pathProcesso = '';
    // pathClasse = '';
    // pathRelator = '';
    // pathDataJulgamento = '';
    // pathDataPublicacao = '';
    // pathPartes = '';
    // pathDecisaoJurisprudencia = '';
    // pathIconeAcompanhamentoProcessual = '';
    // pathIconeInteiroTeor = '';
    // pathInteiroTeorPuro = '';
    pathTotalResultados = '/html/body/table[4]/tbody/tr/td/div/div/div[1]/table/tbody/tr[1]/td[1]';

    //elementos na pagina de acompanhamento processual
    // pathNumeroCnj = '';
    // pathAssuntoAcompanhamentoProcessual = ''
    // pathUrlProcessoTribunalAcompanhamentoProcessual = ''
    // pathNumeroOrigemAcompanhamentoProcessual = ''
    // pathTribunalOrigemAcompanhamentoProcessual = ''

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
    async getNumbers(i) {
        const processo = await this.getProcesso(i);
        const cod_cnj_tj = processo.match(/\d.\d\d/)[0].replace('.', '');
        const numero_unico_cnj = processo.replace('-', '').replace('.', '');

        return { processo, cod_cnj_tj, numero_unico_cnj };
    }
    async getProcesso(i) {
        const xPathProcesso = `/html/body/table[4]/tbody/tr/td/div/div/table/tbody/tr/td[1]/div/table/tbody/tr[${i}]/td[2]/table/tbody/tr[1]/td/a[1]`;
        const processo = await this.getInnerTextUsingSelector(xPathProcesso)
        return processo;
    }

    async getClasseAssunto() {
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

    async getTotalResultados() {
        try{
            
            let texto = await this.getTextUsingSelector(this.pathTotalResultados);
            await this.page.screenshot({ path: 'example.png' });
            
            const match = texto.match(/\d+/g);

            // verifique se há um resultado
            if (!match) {
                throw new Error("Não há paginas para a consulta")
            }

            // o resultado estará no terceiro elemento do array
            texto = match[2];

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

}

module.exports = TJACPage;