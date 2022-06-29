let botaoAtualizar = document.getElementById('btn-atualizar')! as HTMLButtonElement;
let botaoLimpar = document.getElementById('btn-limpar')! as HTMLButtonElement;
let campoValor = document.getElementById('campo-valor')! as HTMLInputElement;
let campoSaldo = document.getElementById('campo-saldo')! as HTMLInputElement;

let saldoAtual: number;

function somarAoSaldo(soma: number) {
    saldoAtual += soma;
    mostrarSaldoAtual();    
    campoValor.value = '';    
}

function limparSaldo() {
    saldoAtual = 0;
    campoValor.value = '';    
    mostrarSaldoAtual();    
}

function mostrarSaldoAtual() {   
    campoSaldo.value = saldoAtual.toString();    
    campoValor.focus();
}

botaoAtualizar.addEventListener('click', () => somarAoSaldo(Number(campoValor.value)));
botaoLimpar.addEventListener('click', () => limparSaldo());

limparSaldo();