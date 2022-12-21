// Creates a mock crawler that can be used for testing
const scrapAcodeao = require('./scrap/scrapAcordeao')
const scrapMonocratica = require('./scrap/scrapMonocraticas')
const fs = require('fs')
let totalPaginas = 0;
let paginaInicial = 1;
let paginaAtual = 1;

let resultados = []

//registra quantos erros por pagina
let tabelaErros = {

}

const salvarArquivo = async (tipo) => {

    const nomeArquivo = tipo + '.txt'
    let shouldSerialize = true
    await fs.writeFile(nomeArquivo, tipo + '\n', (err) => {
        if (err) throw err;

    });

    //tentar serializar, se der erro, salvar sem serializar
    // isso deveria arrumar erro de referencia circular
    for(let i = 0; i < resultados.length; i++){
        let item = resultados[i]
        try {
            if (shouldSerialize){
                item = JSON.stringify(item)
            }
        }
        catch (error) {
            console.log("Erro ao serializar")
            console.log(resultados)
            console.log(item)
            shouldSerialize = false
            break;
        }
        await fs.appendFile(nomeArquivo, item + '\n', (err) => {
            if (err) throw err;
        });
    };

    if(!shouldSerialize){
        await fs.appendFile(nomeArquivo, resultados + '\n', (err) => {
            if (err) throw err;
        });
    }

    console.log('Results saved to the file');

}

process.on('message', (message) => {
    const type = message[0]

    if (type === 'start') {
        const { tribunal, tipo, dataInicial, dataFinal } = message[1]

        Crawler(tribunal, tipo, dataInicial, dataFinal)
    }
    else if (type == 'status') {
        //mandar aqui pagina atual, etc
        const statusAtual = `Crawler na pagina ${paginaAtual} de ${totalPaginas}. Erros = \n${JSON.stringify(tabelaErros)}`
        process.send(['status', statusAtual])
    }
    else if (type === 'stop') {
        process.send(['stop', 'parado na pagina x'])
        console.log("Crawler: Parando crawler..")

        process.exit()


    }


})

const enviarStatus = () => {
    const statusAtual = `Crawler na pagina ${paginaAtual} de ${totalPaginas}. Erros = \n${JSON.stringify(tabelaErros)}`
    process.send(['status', statusAtual])
}

const executarCrawlerPorTipo = async (paginaInicial, tipo, dataInicial, dataFinal, callbackTotalPaginas, callbackPassarPagina, callbackResultado) => {
    if (tipo == 'acordeao') {
        await scrapAcodeao(paginaInicial, dataInicial, dataFinal, callbackTotalPaginas, callbackPassarPagina, callbackResultado)
    }
    else if (tipo == 'monocratica') {
        await scrapMonocratica(paginaInicial, dataInicial, dataFinal, callbackTotalPaginas, callbackPassarPagina, callbackResultado)
    }

}

async function Crawler(tribunal, tipo, dataInicial, dataFinal) {

    //checkar se o tipo é valido
    if (tipo != 'acordeao' && tipo != 'monocratica') {
        throw new Error("Tipo invalido")
    }


    const result = {
        success: false,
        error: null,
        stacktrace: null,
        executionTime: null,
        lastPage: paginaAtual
    }




    //chamado no inicio, quando ele descobre quantas paginas existem na consulta
    const atualizarTotalPaginas = (total) => {
        totalPaginas = total
    }

    //chamado quando o crawler termina de processar uma pagina
    const passarDePagina = () => {
        paginaAtual += 1
    }

    const reportar_e_decidir_parar = (pagina) => {
        //primeiro erro reportado
        if (tabelaErros[pagina] == undefined) {
            tabelaErros[pagina] = 1
            paginaInicial = pagina
        }
        //menos que 3 erros, tenta de novo a mesma pagina
        else if (tabelaErros[pagina] <= 3) {
            tabelaErros[pagina] += 1
            paginaInicial = pagina
        }
        else {
            console.log("Crawler: Erro na pagina " + pagina + " mais de 3 vezes, pulando para a proxima")
            paginaInicial = pagina + 1
            return true
        }
        return false
    }

    const aconteceuErrosSucessivos = (ultimaPagina) => {
        /**
         * Verifica se aconteceram erros sucessivos na ultima pagina e nas duas anteriores
         * Se isso aconteceu é um indicio que o crawler está em um loop infinito e optamos por parar
         * Isso pode ser desabilitado em produção, é mais útil em desenvolvimento
         */
        if (ultimaPagina < 3 || tabelaErros[ultimaPagina] == undefined || tabelaErros[ultimaPagina] < 3) {
            return false
        }
        else {
            const erroPenultima = tabelaErros[ultimaPagina - 2] == 3
            const erroAnterior = tabelaErros[ultimaPagina - 1] == 3

            return erroPenultima && erroAnterior
        }
    }

    const salvarResultado = (resultado) => {
        resultados.push(...resultado)
    }


    const start = new Date().getTime()
    let finished = false
    while (!finished) {
        try {
            /*
            Cria o crawler começando da pagina atual, que é inicialmente 1
            Se for retentativa ele começa da nova pagina atual, que foi atualizada no método de reportar erro
            */

            await executarCrawlerPorTipo(paginaInicial, tipo, dataInicial, dataFinal, atualizarTotalPaginas, passarDePagina, salvarResultado)

            await salvarArquivo(tipo);
            finished = true
            result.success = true
            result.lastPage = paginaAtual
            //TODO: sinalizar encerramento com sucesso

        }
        catch (error) {
            result.error = error.message
            result.stacktrace = error.stack
            result.lastPage = paginaAtual
            console.error(result)

            enviarStatus();
            //armazenar o erro no banco de dados e ver se para
            const parar = reportar_e_decidir_parar(paginaAtual)
            if (parar) {
                //Isso aqui é regra de negócio, pode ser mudado. Eu vou usar a logica dos erros sucessivos
                if (aconteceuErrosSucessivos(paginaAtual)) {
                    console.log("Crawler: Erros sucessivos, parando crawler")
                    break
                }
                else {
                    console.log("Crawler: Erro na pagina " + paginaAtual + ", pulando pra proxima")
                }
            }

            //TODO: sinalizar erro

        }

    }
    const executionTime =  new Date().getTime() - start
    console.log("Crawler: Tempo de execução: " + executionTime)

    //Desconecta o processo filho do processo pai
    if (process.connected) {
        process.send(['end', result])
        process.disconnect()
    }


}

module.exports = Crawler