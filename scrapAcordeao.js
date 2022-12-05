const Acordeao = require('./acordeao')
const PageAcordeaoClass = require('./pages/acordeaoPage')
const { Builder, By, until, Key } = require('selenium-webdriver');
const scrapingAcordeao = async  () => {
    //const driver = await new Builder().forBrowser('chrome').build(); //
    //driver.manage().window().maximize();
    try {
        const PageAcordeao = new PageAcordeaoClass();
        await PageAcordeao.setUpSearchOptions();
        console.log("Finished scraping acordeao");

        
       

        //Filtra Datas (tive que colocar varios awaits para dar tempo de carregar a pagina)
        await PageAcordeao.inserirDatas()
        
    
        //cliclar no link de dados completos
        //elemento = await driver.findElement(By.xpath('/html/body/app-root/app-home/main/search/div/div/div/div[2]/div/div[2]/div[1]/a'))
        //elemento.click()

        await PageAcordeao.clickarPrimeiroAcordeao()


        Acordeao.id = 1;
        Acordeao.url_jurisprudencia = await driver.getCurrentUrl();

        const textoProcesso = await PageAcordeao.getProcesso();
        
        Acordeao.processo = textoProcesso.split('-')[0];

        //acho que nao eh necessario
        await driver.sleep(2000)
        //---------------IMPLEMNTAR A PARTE DAS PÁGINAS E MUDAR A QUANTIDADE DE PÁGINAS PELO HTML PRA 250--------------------------------------
     
       
        //parte da COLETA mudar para funçao
  
        //CHECAR SE EXISTE ELEMENTOS NA PÁGINA
        
        Acordeao.tema= await PageAcordeao.getContentIfTextExists("tema", "h4")
        

       Acordeao.indexacao  = await PageAcordeao.getContentIfTextExists("Indexação", "h4")
       Acordeao.legislacao  = await PageAcordeao.getContentIfTextExists("Legislação", "h4")
       Acordeao.observacao= await PageAcordeao.getContentIfTextExists("Observação", "h4")
       Acordeao.doutrina= await PageAcordeao.getContentIfTextExists("Doutrina", "h4")

        //barra azul no canto superior direito
        //TODO: Buscar link disso
        const repercusao_geral = await driver.findElements(By.xpath('//div[contains(text(), "Repercussão Geral")]'))

        const textoClasse = await PageAcordeao.getClasse();
        Acordeao.classe = textoClasse.split(' ')[0];

        const textoRelator = await PageAcordeao.getRelator();
        Acordeao.relator = ("Min.") + textoRelator.split('.')[1];

        Acordeao.data_julgamento = await PageAcordeao.getDataJulgamento();
        Acordeao.data_julgamento = Acordeao.data_julgamento.split(' ')[1];

        Acordeao.data_publicacao = await PageAcordeao.getDataPublicacao();
        Acordeao.data_publicacao = Acordeao.data_publicacao.split(' ')[1];

        Acordeao.partes = await PageAcordeao.getPartes();
        Acordeao.partes = PageAcordeao.cleanText(Acordeao.partes)
        
        Acordeao.decisao_jurisprudencia = await PageAcordeao.getDecisaoJurisprudencia()
        Acordeao.decisao_jurisprudencia = PageAcordeao.cleanText(Acordeao.decisao_jurisprudencia)
        

        //ACOMPANHAMENTO PROCESSUAL
 

        //clicar no icone de acompanhamento processual
       await PageAcordeao.irPaginaAcompanhamentoProcessual()

        //pegando número unico
        //verificar se o elemento existe

        //existem alguns que o cnpj nao existe, o texto diz sem numero unico

        const textpCnpj = await PageAcordeao.getCnpjCruAcompanhamentoProcessual()
        Acordeao.numero_unico_cnpj = textpCnpj.split('-')[0];
    


        //pegando assunto
        Acordeao.assunto = await PageAcordeao.getAssuntoAcompanhamentoProcessual()
        Acordeao.assunto =  PageAcordeao.cleanText(Acordeao.assunto)

        //pegando url do processo
        Acordeao.url_processo_tribunal = await PageAcordeao.getUrlProcessoTribunalAcompanhamentoProcessual()

        //pegando número de origem
        Acordeao.numero_origem = await PageAcordeao.getNumeroOrigemAcompanhamentoProcessual()
        Acordeao.numero_origem =  PageAcordeao.cleanText(Acordeao.numero_origem)

        //pegando tribunal de origem
        Acordeao.tribunal_origem =await PageAcordeao.getTribunalOrigemAcompanhamentoProcessual()
        Acordeao.tribunal_origem =  PageAcordeao.cleanText(Acordeao.tribunal_origem)

        await PageAcordeao.returnOldWindow()

        
        const link_inteiro_teor = await PageAcordeao.getLinkTeorIntegra()

        Acordeao.url_inteiro_teor = link_inteiro_teor

        console.log(Acordeao)
    
    

        //PEGAR TODOS DA PÁGINA
        // var pdfs = await driver.findElements(By.className('mat-tooltip-trigger ng-star-inserted'))

        // for (const pdf of pdfs) {
        //     let link = await pdf.getAttribute('href')

        //     linksDetails.push({
        //         link: link ?? 'Não tem pdf',
        //     });

        // }


    } catch (error) {
        console.log(error);
        return error;
    } finally {
        await driver.quit();
    }

    return Acordeao;

}



module.exports = scrapingAcordeao 