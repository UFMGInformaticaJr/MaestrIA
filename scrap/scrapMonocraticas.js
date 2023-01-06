const MonocraticaObj = require('../monocraticas.js')
const PageMonocraticaClass = require('../pages/monocraticaPage');
const RequestService = require('../api/request.js');
const { randomUUID } = require('crypto');
const sleep = require('util').promisify(setTimeout);



let PageMonocratica = null;

let currentPage = 1;

let listaMonocratica = [];


const scrapingSetup = async (PageMonocratica,  paginaInicial = 1, dataInicial, dataFinal) => {
    //TODO: Isso pode ser extraido para a classe basePage
    await PageMonocratica.setUpSearchOptions();
    const novaUrl = await PageMonocratica.inserirPaginaEDatasNaUrl(paginaInicial, dataInicial, dataFinal)
    await PageMonocratica.go_to_url(novaUrl)

    return novaUrl;

};


async function scrapSingleMonocratica (PageMonocratica, linkMonocratica, Monocratica) {

    console.log("Abrindo página monocrática: " + linkMonocratica)
    
    //abrir pagina monocratica

    await PageMonocratica.openUrlAndWaitForPageLoad(linkMonocratica)
   
    await PageMonocratica.takeScreenshot('inicio.png');
    //criar novo objeto

    Monocratica.url_jurisprudencia_tribunal = linkMonocratica;


    //pegando ID da api
    // let id = await RequestService.getID();
    let id = randomUUID();
    Monocratica.id_jurisprudencia = id;

    await PageMonocratica.renderizarPagina();
  
    //CHECAR SE EXISTE ELEMENTOS NA PÁGINA
    Monocratica.indexacao = await PageMonocratica.getContentIfTextExists("Indexação", "h4")
    Monocratica.legislacao = await PageMonocratica.getContentIfTextExists("Legislação", "h4")
    Monocratica.notas_obervacoes_gerais = await PageMonocratica.getContentIfTextExists("Observação", "h4")
    

    Monocratica.processo = await PageMonocratica.getProcesso();
    Monocratica.processo = Monocratica.processo.split('-')[0]

    Monocratica.classe = await PageMonocratica.getClasse();
    Monocratica.classe = await PageMonocratica.titleCase(Monocratica.classe);
    // console.log("classe: " + Monocratica.classe)
    // await sleep(6000)

    Monocratica.relator = await PageMonocratica.getRelator()
    Monocratica.relator = Monocratica.relator?.split('.')[1].trim();
    Monocratica.relator = await PageMonocratica.titleCase(Monocratica.relator);
    

    Monocratica.data_julgamento = await PageMonocratica.getDataJulgamento();
    Monocratica.data_julgamento = Monocratica.data_julgamento.split(' ')[1];
 

    Monocratica.data_publicacao = await PageMonocratica.getDataPublicacao();
    Monocratica.data_publicacao = Monocratica.data_publicacao.split(' ')[1];

    // await sleep(3000)
    Monocratica.partes = await PageMonocratica.getPartes();
    Monocratica.partes = await PageMonocratica.cleanText(Monocratica.partes);

    
    Monocratica.inteiro_teor_puro = await PageMonocratica.getInteiroTeorPuro();
    Monocratica.inteiro_teor_puro = PageMonocratica.cleanText(Monocratica.inteiro_teor_puro);

    Monocratica.ementa = Monocratica.inteiro_teor_puro;
    await sleep(2000)  

    return Monocratica;

}

async function scrapSingleAcompanhamentoProcessual(PageMonocratica, url, Monocratica){
    console.log("Abrindo pagina acompnhamento  " + url)
    await PageMonocratica.go_to_url(url);

    await sleep(2000)

    //pegando número unico
    Monocratica.numero_unico_cnj = await PageMonocratica.getCnjCruAcompanhamentoProcessual();
    Monocratica.numero_unico_cnj = Monocratica.numero_unico_cnj.split(' ')[2];

    //esse xpath muda se for headless ou nao por conta do tamanho da janela do navegador
    await PageMonocratica.clickByXpath(PageMonocratica.inputInformacao)

    await sleep(1000)

    await PageMonocratica.takeScreenshot('teste.png');
    await PageMonocratica.clickByXpath(PageMonocratica.botaoInformacoesProcessoProcessual)

    //pegando assunto
    Monocratica.assunto = await PageMonocratica.getAssuntoAcompanhamentoProcessual();
    Monocratica.assunto = await PageMonocratica.cleanText(Monocratica.assunto);


    //pegando url do processo
    Monocratica.url_processo_tribunal = await PageMonocratica.getUrlProcessoTribunalAcompanhamentoProcessual();
  


    //pegando número de origem
    Monocratica.numeros_origem = await PageMonocratica.getNumeroOrigemAcompanhamentoProcessual();
    Monocratica.numeros_origem = await PageMonocratica.cleanText(Monocratica.numeros_origem);

    //pegando tribunal de origem
    Monocratica.tribunal_origem = await PageMonocratica.getTribunalOrigemAcompanhamentoProcessual();
    Monocratica.tribunal_origem = await PageMonocratica.cleanText(Monocratica.tribunal_origem);
    Monocratica.tribunal_origem = await PageMonocratica.titleCase(Monocratica.tribunal_origem);


}

async function scrapDocumentoInteiro (PageMonocratica, Monocratica, linkProcesso, linkAcompanhamento, linkPDF){
    await scrapSingleMonocratica(PageMonocratica, linkProcesso, Monocratica);

    await sleep(1000);
    await scrapSingleAcompanhamentoProcessual(PageMonocratica, linkAcompanhamento, Monocratica);

    Monocratica.url_pdf = linkPDF;
    console.log("Pagina PDF " + linkPDF)
}


async function antiga(paginaInicial, dataInicial, dataFinal, callbackTotalPaginas, callbackPassarPagina, callbackResultado) {
    try {
        PageMonocratica = new PageMonocraticaClass();
        await PageMonocratica.init();

       
        var linkInicial = await scrapingSetup(PageMonocratica, paginaInicial, dataInicial, dataFinal);
        PageMonocratica.setUrlInicial(linkInicial);

        let totalPaginas =  await PageMonocratica.getTotalPaginas();
        totalPaginas = 1;
        totalPaginas = Number(totalPaginas);
        callbackTotalPaginas(totalPaginas);
        console.log("Total de Paginas " + totalPaginas)


        console.log("Página " + currentPage + " de " + totalPaginas )
        //se o total paginas for 0, não tem nada para fazer
        while (currentPage <= totalPaginas) {
            const monocraticaPage = await PageMonocratica.scrapAllDocumentsInPage(scrapSingleMonocratica);
            listaMonocratica.push(...monocraticaPage);
            callbackResultado(listaMonocratica);
            currentPage++;
            
            if(currentPage != totalPaginas){
                console.log("Página " + currentPage + " de " + totalPaginas )
                callbackPassarPagina(currentPage);
                await PageMonocratica.goToNextPage(currentPage);
            }
          
        }

        console.log(listaMonocratica);

        return listaMonocratica;
    }catch (error ){
        console.log(error)
    }
    
}


//TODO: integrar com controlador e ajustar a logica de ir pra proxima pagina. quando tiver tudo certo apagar essa funçao e jogar pra la de cima
async function scrapMonocratica (paginaInicial, dataInicial, dataFinal, callbackTotalPaginas, callbackPassarPagina, callbackResultado){
    
    const MAX_ELEMENTS_IN_PAGE = 10;
    
    const PageMonocratica = new PageMonocraticaClass();
    await PageMonocratica.init();

    const ArrayMonocratica = []

    var Monocratica = { ...MonocraticaObj };

    var linkInicial = await scrapingSetup (PageMonocratica, paginaInicial, dataInicial, dataFinal);
    
    
    const returnToSearchResults = async () => {
        await PageMonocratica.go_to_url(linkInicial);
    
    }
    
    PageMonocratica.setUrlInicial(linkInicial);

    let totalPaginas =  await PageMonocratica.getTotalPaginas();
    console.log("Total de Paginas " + totalPaginas)
    
    totalPaginas = Number(totalPaginas);
    callbackTotalPaginas(totalPaginas);


    while (currentPage <= totalPaginas) {

        for(let i = 1; i <= MAX_ELEMENTS_IN_PAGE; i++){

            Monocratica = { ...MonocraticaObj };

            console.log("Monocratica " + i + " de 10")
            let urls = await PageMonocratica.getUrls(i);


            let linkProcesso = urls[0];
            let linkAcompanhamento = urls[1];
            let linkPDF = urls[2];
            await scrapDocumentoInteiro(PageMonocratica, Monocratica, linkProcesso, linkAcompanhamento, linkPDF);
            await sleep(1000);

            ArrayMonocratica.push(Monocratica);

            callbackResultado(Monocratica);


            //TODO - deixar esse link sempre variavel e na parte de ir pra proxima pagina trocar o link
            await returnToSearchResults();
        }

        currentPage++;
        console.log("Passando de pagina!")

        if(currentPage != totalPaginas){
            callbackPassarPagina(currentPage);
            //mudar de pagina e salvar seu novo link
            linkInicial = await PageMonocratica.goToNextPage(currentPage);
        }

    }


    return ArrayMonocratica;


}


module.exports = scrapMonocratica;



