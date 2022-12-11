const Acordeao = require('./acordeao')
const PageAcordeaoClass = require('./pages/acordeaoPage')
const { Builder, By, until, Key } = require('selenium-webdriver');



const scrapingSetup = async (PageAcordeao) => {
    await PageAcordeao.setUpSearchOptions();
     
        
       
    //Filtra Datas (tive que colocar varios awaits para dar tempo de carregar a pagina)
    await PageAcordeao.inserirDatas()
    


    //aqui deveria construir um json com as infos do scraping

}

const scrapSingleAcordeao = async (linkAcordeao) => {
}

const scrapingAcordeao = async  () => {
    //const driver = await new Builder().forBrowser('chrome').build(); //
    //driver.manage().window().maximize();
    try {
        const PageAcordeao = new PageAcordeaoClass();
       
        await scrapingSetup(PageAcordeao);

        const urlsPaginas = await PageAcordeao.getAllDocumentsInPage();
        // TODO: extrair método daqui pra baixo, recebendo um href como parâmetro
        // do array acima
        
        await PageAcordeao.clickarPrimeiroAcordeao()


        Acordeao.url_jurisprudencia = await driver.getCurrentUrl();

        let id = Acordeao.url_jurisprudencia.split("/search/")[1]
        id = id.split("/")[0]
        //deixar apenas os numeros
        Acordeao.id = id.replace(/\D/g,'');
        

        const textoProcesso = await PageAcordeao.getProcesso();
        
        Acordeao.processo = textoProcesso.split('-')[0];

        //acho que nao eh necessario
        await driver.sleep(2000)
        //---------------IMPLEMNTAR A PARTE DAS PÁGINAS E MUDAR A QUANTIDADE DE PÁGINAS PELO HTML PRA 250--------------------------------------
     
       
        //parte da COLETA mudar para funçao
  
        //CHECAR SE EXISTE ELEMENTOS NA PÁGINA
        
        
       Acordeao.indexacao  = await PageAcordeao.getContentIfTextExists("Indexação", "h4")
       Acordeao.legislacao  = await PageAcordeao.getContentIfTextExists("Legislação", "h4")
       Acordeao.observacao= await PageAcordeao.getContentIfTextExists("Observação", "h4")

        let orgaoJulgadorText = await PageAcordeao.getOrgaoJulgador();
        if (orgaoJulgadorText != null){
            orgaoJulgadorText = orgaoJulgadorText.split(':')[1]
            Acordeao.orgao_julgador = orgaoJulgadorText.trim()
        }


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
        
        //TODO: Pegar  ementa
        const textoEmenta = await PageAcordeao.getContentIfTextExists("Ementa", "h4");
        
        Acordeao.ementa = PageAcordeao.cleanText(textoEmenta)

        let fullTema = await PageAcordeao.getContentIfTextExists("Tema", "h4");
        if (fullTema != null){
            Acordeao.numero_tema = fullTema.split('-')[0].trim();
            Acordeao.texto_tema = PageAcordeao.cleanText( fullTema.split('-')[1])
        }

        Acordeao.tese = await PageAcordeao.getContentIfTextExists("Tese", "h4")

        //Seção azul clara no canto superior direito
        const repercussaoGeral = await PageAcordeao.getRepercussaoGeral()
        if (repercussaoGeral != null){
            Acordeao.url_rg = repercussaoGeral.link
            try {
            // atenção: tem uma barra diferente que - , por isso uso espaços

            let textoTipoRg = repercussaoGeral.texto.split(' ')
            //o terceiro elemento é o que segue a barra
            textoTipoRg = textoTipoRg.at(3);

            Acordeao.tipo_rg = textoTipoRg.trim()
            // se nao achar ou tiver uma barra diferente, entra nesse caso aqui
            } catch (error) {
                console.error("Erro ao pegar tipo de repercussão geral")
                console.error(error)
                Acordeao.tipo_rg = repercussaoGeral.texto
            }
        }

       const ementaDados = await PageAcordeao.irAbaEmentaFulleRecuperarTexto()
       if (ementaDados != null){
        Acordeao.ementa_full = PageAcordeao.cleanText(ementaDados.ementa_full)
        Acordeao.linha_citacao = PageAcordeao.cleanText(ementaDados.linha_citacao)
       }
       
        //clicar no icone de acompanhamento processual
       await PageAcordeao.irPaginaAcompanhamentoProcessual()


        //existem alguns que o cnpj nao existem, o texto diz sem numero unico
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

        //isso demora DEMAIS por algum motivo
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