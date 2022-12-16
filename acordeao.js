let Acordeao = {
    id : null,
    url_jurisprudencia : null,
    processo : null,
    classe : null,
    relator : null,
    data_julgamento : null,
    data_publicacao : null,
    //deve ser limpa sem tag html
    ementa: null,
    //esta na parte ementa sem formatacao
    ementa_full: null,
    linha_citacao: null,
  
    partes: null,
    //pode, nao existir, tem que checkar
    decisao_jurisprudencia : null,
    numero_tema : null,
    texto_tema : null,
    tese : null,
    //texto repercusao geral no canto superior direito, salvar link
    url_rg: null,
    tipo_rg: null,
    //fim dos campos opcionais
    indexacao : null,
    legislacao : null,
    orgao_julgador: null,
    observacao: null,
    url_inteiro_teor : null,
    url_processo_tribunal : null,
    //esta em outra pagina
    assunto : null,
    numero_origem : null,
    tribunal_origem: null,
    numero_unico_cnpj : null,
   
}



module.exports = Acordeao