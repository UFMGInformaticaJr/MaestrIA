let Acordeao = {
    id_jurisprudencia : "",
    tipo_publicacao : 'ACORDAO',
    tipo_jurisdicao : 'INSTANCIA',
    sigla_tribunal : 'TJMS',
    cod_cnj_tj: '812',
    url_jurisprudencia_tribunal : "",
    processo : "",
    classe : "",
    relator : "",
    data_julgamento : "",
    data_publicacao : "",
    //deve ser limpa sem tag html
    ementa: "",
    //esta na parte ementa sem formatacao
    ementa_full: "",
    linha_citacao: "", 
    partes: "",
    //pode, nao existir, tem que checkar
    decisao_jurisprudencia : "",
    numero_tema : "",
    texto_tema : "",
    tese : "",
    //texto repercusao geral no canto superior direito, salvar link
    url_rg: "",
    tipo_rg: "",
    //fim dos campos opcionais
    indexacao : "",
    legislacao : "",
    orgao_julgador: "",
    notas_obervacoes_gerais: "",
    url_inteiro_teor : "",
    url_processo_tribunal : "",
    //esta em outra pagina
    assunto : "",
    numeros_origem : "",
    tribunal_origem: "",
    numero_unico_cnj : "",
}

module.exports = Acordeao