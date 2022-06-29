enum tpProfissao {
    Atriz,
    Padeiro
}

class Humano {
    nome: string;
    idade: number;
    profissao: tpProfissao;
    constructor (nome: string, idade: number, profissao: tpProfissao) {
        this.nome = nome;
        this.idade = idade;
        this.profissao = profissao;
    }
}

let pessoa1 = new Humano('maria', 29, tpProfissao.Atriz);
let pessoa2 = new Humano('roberto', 19, tpProfissao.Padeiro);
let pessoa3 = new Humano('laura', 35, tpProfissao.Atriz);
let pessoa4 = new Humano('carlos', 19, tpProfissao.Padeiro);