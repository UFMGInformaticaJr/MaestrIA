
const router = require('express').Router()
const { fork } = require('child_process')

//create uuid
const uuid = require('uuid');


class mutex {
    constructor() {
        this.locked = false
    }

    acquire() {
        if (this.locked) {
            return false;
        }
        else {
            this.locked = true

            return true
        }
    }

    release() {
        this.locked = false
    }
}



let crawlerId = 0
let mutexOcioso = new mutex()

let child = null

let lastStatus = 'ocioso'



const createChild = () => {

    //checkar se child ainda esta conectado
    if (child != null && child.connected) {
        console.log('child ainda vivo, matando')
        child.disconnect()
    }

    child = fork('./mock_crawler.js')
    console.log("______________ nova thread ______________")
    console.log("PID do crawler recem criado: " + child.pid)


    child.on('message', ([type, message]) => {

        console.log("Master: chegou mensagem do Crawler " + crawlerId)

        console.log("Mensagem: ", message)


        if (type == 'end') {
            mutexOcioso.release()
            console.log('Crawler ' + crawlerId + ' acabou com sucesso')
        }
        //crawler vai enviar de vez em quando isso para sabermos o status dele
        else if (type == 'status') {
            lastStatus = message
        }
        //ultima pagina parseada
        else if (type == 'stop') {
            lastStatus = message
        }
    })

    child.on('error', (error) => {
        console.error("Um erro fatal aconteceu, o que nao deveria rolar ja que tenho um try catch")
        console.log(error)
        mutexOcioso.release()
    })

}
router.get('/health', (req, res) => {

    if (mutexOcioso.locked) {
        child.send(['status'])
        res.send(`Crawler ${crawlerId} ocupado. Ultimo status: ${lastStatus}`)
    }
    else {
        res.send(`Crawler ocioso`)
    }

})

router.get('/stop', async (req, res) => {

    if (!mutexOcioso.locked) {
        res.send('Crawler ocioso, nao ha nada para parar')
        return
    }

    //envia stop para filho
    child.send(['stop'])

    //indica que o crawler esta ocioso
    mutexOcioso.release()
    console.log("Crawler parado forçadamente com sucesso")

    //criar outro processo ja que o anterior foi parado nao é necessario
    res.send(`Crawler ${crawlerId} interrompido`)

})

router.post('/start', async (req, res) => {
/**
 * Envie um json no formato para o endpoint, depois colocamos os dados reais
  {
	"timeout": 8000,
	"percentage": 0.4
   }
 */



    const timeout = req.body.timeout
    const percentage = req.body.percentage


    const estaOcioso = mutexOcioso.acquire()

    if (!estaOcioso) {
        res.send(`Crawler ${crawlerId} ocupado`)
        return
    }
    //criar nova thread
    createChild()
    crawlerId = uuid.v4()


    parameters = {
        timeout: timeout ?? 3000,
        percentage: percentage ?? 0.5,
        id: crawlerId
    }
    //criar processo se o ultimo acabou, nao deve acontecer
    if (child == null || child.killed || child.exitCode != null) {
        console.warn("Crawler morreu, criando novo processo")
       
    }

    //enviar mensagem de inicio e parametros
    child.send(["start", parameters])

    //devolver uuid
    res.send(`Crawler ${crawlerId} started`)

})

module.exports = router;
