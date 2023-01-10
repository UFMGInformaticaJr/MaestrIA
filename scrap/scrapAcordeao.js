const AcordeaoObj = require('../objects/acordeao')
const PageAcordeaoClass = require('../pages/acordeaoPage')
const { NoSuchElementError } = require('selenium-webdriver/lib/error');
const RequestService = require('../api/request.js');
const { randomUUID } = require('crypto');
const sleep = require('util').promisify(setTimeout);

let PageAcordeao = null;

let currentPage = 1;

let listaAcordeao = [];

const scrapingSetup = async (PageAcordeao, paginaInicial = 1, dataInicial, dataFinal) => {

    //Refatorado pra nao buscar
    const urlBase = await PageAcordeao.newSetupOptions();

    const novaUrl = await PageAcordeao.inserirPaginaEDatasNaUrl(paginaInicial, dataInicial, dataFinal, urlBase)
    await PageAcordeao.go_to_url(novaUrl)

    return novaUrl;

}

const scrapSingleAcordeao = async (PageAcordeao, linkAcordeao, Acordeao) => {

    //teste de sanidade
    if (!linkAcordeao instanceof String) {
        console.error("linkAcordeao nao eh uma string. Foi passado: ", linkAcordeao)
        throw new Error("linkAcordeao nao eh uma string. Foi passado: ", linkAcordeao)
    }

    //abrir pagina do acordeao
    await PageAcordeao.openUrlAndWaitForPageLoad(linkAcordeao)

    await PageAcordeao.takeScreenshot('inicioA.png');

    Acordeao.url_jurisprudencia_tribunal = linkAcordeao;

    // let id = await RequestService.getID();
    let id = randomUUID();
    Acordeao.id_jurisprudencia = id;

    await PageAcordeao.renderizarPagina();


    const textoProcesso = await PageAcordeao.getProcesso();

    Acordeao.processo = textoProcesso.split('-')[0];


    Acordeao.indexacao = await PageAcordeao.getContentIfTextExists("Indexação", "h4")
    Acordeao.legislacao = await PageAcordeao.getContentIfTextExists("Legislação", "h4")
    Acordeao.notas_obervacoes_gerais = await PageAcordeao.getContentIfTextExists("Observação", "h4")

    let orgaoJulgadorText = await PageAcordeao.getOrgaoJulgador();
    if (orgaoJulgadorText != null) {
        orgaoJulgadorText = orgaoJulgadorText.split(':')[1]
        Acordeao.orgao_julgador = orgaoJulgadorText.trim()
    }

    const textoClasse = await PageAcordeao.getClasse();
    Acordeao.classe = textoClasse.split(' ')[0];
    Acordeao.classe = await PageAcordeao.titleCase(Acordeao.classe)

    const textoRelator = await PageAcordeao.getRelator();
    Acordeao.relator = textoRelator.split('.')[1];

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
    if (fullTema != null) {
        Acordeao.numero_tema = fullTema.split('-')[0].trim();
        Acordeao.texto_tema = PageAcordeao.cleanText(fullTema.split('-')[1])
    }

    Acordeao.tese = await PageAcordeao.getContentIfTextExists("Tese", "h4")

    //Seção azul clara no canto superior direito
    const repercussaoGeral = await PageAcordeao.getRepercussaoGeral()
    if (repercussaoGeral != null) {
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
    if (ementaDados != null) {
        Acordeao.ementa_full = PageAcordeao.cleanText(ementaDados.ementa_full)
        Acordeao.linha_citacao = PageAcordeao.cleanText(ementaDados.linha_citacao)
    }

    return listaAcordeao;
}

const scrapSingleAcompanhamentoProcessual = async (PageAcordeao, url, Acordeao) => {

    let pularAcompanhemento = false
    try {
        await PageAcordeao.go_to_url(url);
    await sleep(2000)
        
    }
    catch (error) {
        if (error instanceof NoSuchElementError) {
            pularAcompanhemento = true
            console.log("Acompanhamento não presente!")
        }
    }

    await PageAcordeao.takeScreenshot("acompanhamentoProcessual.png")

    if (!pularAcompanhemento) {
        //existem alguns que o cnj nao existem, o texto diz sem numero unico
        const textpCnpj = await PageAcordeao.getCnjCruAcompanhamentoProcessual()
        Acordeao.numero_unico_cnj = textpCnpj.split('-')[0];


        //necessario clickar aqui pra mudar a aba visivel
        await PageAcordeao.clickByXpath(PageAcordeao.inputInformacao)


        await PageAcordeao.takeScreenshot('acompanhamentoProcessual2.png');
        await PageAcordeao.clickByXpath(PageAcordeao.botaoInformacoesProcessoProcessual)
    
        //pegando assunto
        Acordeao.assunto = await PageAcordeao.getAssuntoAcompanhamentoProcessual()
        Acordeao.assunto = PageAcordeao.cleanText(Acordeao.assunto)

        //pegando url do processo
        Acordeao.url_processo_tribunal = await PageAcordeao.getUrlProcessoTribunalAcompanhamentoProcessual()

        //pegando número de origem
        Acordeao.numeros_origem = await PageAcordeao.getNumeroOrigemAcompanhamentoProcessual()
        Acordeao.numeros_origem = PageAcordeao.cleanText(Acordeao.numero_origem)

        //pegando tribunal de origem
        Acordeao.tribunal_origem = await PageAcordeao.getTribunalOrigemAcompanhamentoProcessual()
        Acordeao.tribunal_origem = PageAcordeao.cleanText(Acordeao.tribunal_origem)
        Acordeao.tribunal_origem = await PageAcordeao.titleCase(Acordeao.tribunal_origem)
    }
}


const scrapingAcordeao = async (paginaInicial = 1, dataInicial, dataFinal, callbackTotalPaginas, callbackMudancaDePagina, callbackResultado) => {
    //const driver = await new Builder().forBrowser('chrome').build(); //
    //driver.manage().window().maximize();


    //checar se os callbacks foram passados
    if (callbackTotalPaginas == null) {
        throw new Error("callbackTotalPaginas não foi passado")
    }
    else if (callbackMudancaDePagina == null) {
        throw new Error("callbackMudancaDePagina não foi passado")
    }
    else if (callbackResultado == null) {
        throw new Error("callbackResultado não foi passado")
    }



    try {
        PageAcordeao = new PageAcordeaoClass();


        var linkkInicial = await scrapingSetup(PageAcordeao, paginaInicial, dataInicial, dataFinal);
        currentPage = paginaInicial;
        //TODO: verificar aqui se acabou a coleta, isto é, pagina inicial > limite paginas
        // da pra saber isso vendo o html

        PageAcordeao.setUrlInicial(linkkInicial);

        await PageAcordeao.renderizarPagina();

        let totalPaginas = await PageAcordeao.getTotalPaginas();
        totalPaginas = Number(totalPaginas);

        callbackTotalPaginas(totalPaginas);

        console.log("Total de páginas: " + totalPaginas)

        //inicio loop

        //totalPaginas = 2;

        while (currentPage <= totalPaginas) {
            if (currentPage > 1) {
                console.log("Estou na pagina ", currentPage);
            }
            const acordeaoPaginas = await PageAcordeao.scrapAllDocumentsInPage(scrapSingleAcordeao)

            listaAcordeao.push(...acordeaoPaginas);
            currentPage++;
            callbackResultado(listaAcordeao);


            if (currentPage <= totalPaginas) {
                console.log("Página " + currentPage + " de " + totalPaginas)
                callbackMudancaDePagina()
                await PageAcordeao.goToNextPage(currentPage);
            }
        }

        // console.log(listaAcordeao)

        //TODO: ir para nova página raiz, com o offset de página lida adicionado
        //fim loop

    } catch (error) {
        console.log("Salvando screenshot")
        PageAcordeao.takeScreenshot();


        throw error;
    } 

    return listaAcordeao;

}


async function scrapDocumentoInteiro (PageAcordeao, Acordeao, linkProcesso, linkAcompanhamento, linkPDF){
    await scrapSingleAcordeao(PageAcordeao, linkProcesso, Acordeao);

    await sleep(1000);
    await scrapSingleAcompanhamentoProcessual(PageAcordeao, linkAcompanhamento, Acordeao);

    Acordeao.url_pdf = linkPDF;
    console.log("Pagina PDF " + linkPDF)
}

const teste = async (paginaInicial = 1, dataInicial, dataFinal, callbackTotalPaginas, callbackMudancaDePagina, callbackResultado) => {
    //checar se os callbacks foram passados
    if (callbackTotalPaginas == null) {
        throw new Error("callbackTotalPaginas não foi passado")
    }
    else if (callbackMudancaDePagina == null) {
        throw new Error("callbackMudancaDePagina não foi passado")
    }
    else if (callbackResultado == null) {
        throw new Error("callbackResultado não foi passado")
    }



    try {

        PageAcordeao = new PageAcordeaoClass();
        await PageAcordeao.init();

        const arrayAcordeao = []

        let Acordeao = {...AcordeaoObj}

        var linkkInicial = await scrapingSetup(PageAcordeao, paginaInicial, dataInicial, dataFinal);
        currentPage = paginaInicial;
        //TODO: verificar aqui se acabou a coleta, isto é, pagina inicial > limite paginas
        // da pra saber isso vendo o html

        const returnToSearchResults = async () => {
            await PageAcordeao.go_to_url(linkInicial);
        
        }

        PageAcordeao.setUrlInicial(linkkInicial);

        let totalPaginas = await PageAcordeao.getTotalPaginas();
        totalPaginas = Number(totalPaginas);

        callbackTotalPaginas(totalPaginas);

        console.log("Total de páginas: " + totalPaginas)

        //inicio loop

        //totalPaginas = 2;

        const TOTAL_ACORDEOES_PAGINA = 10;

        while (currentPage <= totalPaginas) {
            if (currentPage > 1) {
                console.log("Estou na pagina ", currentPage);
            }
            // isso vai de 1 até exatamente 10 pq n existe div 0
            for(let i = 1; i <= TOTAL_ACORDEOES_PAGINA; i++){
                Acordeao = { ...AcordeaoObj };

                console.log(`Acordeao ${i}/10 e pagina ${currentPage}/${totalPaginas}`)

                PageAcordeao.takeScreenshot(`teste.png`);

            
                let urls = await PageAcordeao.getUrls(i, true);
    
                //TODO: verificar se acabou os elementos na pagina e, se tiver, sair
    
                let linkProcesso = urls[0];
                let linkAcompanhamento = urls[1];
                let linkPDF = urls[2];

                await scrapDocumentoInteiro(PageAcordeao, Acordeao, linkProcesso, linkAcompanhamento, linkPDF);

                await sleep(1000);

                arrayAcordeao.push(Acordeao);

                callbackResultado(Acordeao)

                await returnToSearchResults();
            }

            currentPage++;
            
            if (currentPage <= totalPaginas) {
                console.log("Trocando de pagina..");
                callbackMudancaDePagina()
                //colocar a nova pagina na url
                linkkInicial = await PageAcordeao.goToNextPage(currentPage);
            }
        }

        // console.log(listaAcordeao)

        //fim loop

    } catch (error) {
        const nome = "momentoErro.png"
        console.log("Salvando screenshot", nome)
        PageAcordeao.takeScreenshot(nome);

        throw error;
    }


    return listaAcordeao;
}



module.exports = teste 