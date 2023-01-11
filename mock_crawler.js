// Creates a mock crawler that can be used for testing

process.on('message', ( message) => {
    const type = message[0]

    if (type === 'start') {
        const { timeout, percentage, callback } = message[1]

        Crawler(timeout, percentage, callback)
    }
    else if (type == 'status'){
        //mandar aqui pagina atual, etc
        process.send(['status', 'ok, pagina x'])
    }
    else if (type === 'stop') {
        process.send(['stop', 'parado na pagina x'])
        console.log("Crawler: Parando crawler..")
       
        process.exit()
       

    }


})


async function Crawler(timeout = 2, percentage = 0.4, callback) {
    

        const result = {
            success: false,
            error: null,
            stacktrace: null,
            executionTime: null,
            lastPage: null
        }

        start = new Date().getTime()
        await setTimeout(() => {
            try {
            const randInt = Math.random()
            if (randInt < percentage ) {
                throw new Error("Erro aleatorio")
            }
            result.success = true
            result.executionTime = new Date().getTime() - start
            result.lastPage = 1
            
            console.log("Crawler: Fim do crawler com sucesso")
            
        }
        catch (error) {
            result.error = error.message
            result.stacktrace = error.stack
            console.log("Crawler: Erro no crawler com pid " + process.pid)
        }
        finally{
            if (process.connected){
                process.send(['end', result])
                process.disconnect()
            }
        }

        }
            , timeout)
    
}

module.exports = Crawler