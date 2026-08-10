import { dbPedidos as db } from "./firebase.js";

import {
    collection,
    addDoc,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";


function gerarTokenAcompanhamento() {
    return crypto.randomUUID();
}


export async function finalizarPedido(checkout, cart, total) {

    const tokenAcompanhamento = gerarTokenAcompanhamento();


    const pedido = {

        nome: checkout.nome,

        telefone: checkout.telefone,

        endereco: checkout.endereco || "",

        numero: checkout.numero || "",

        bairro: checkout.bairro || "",

        entrega: checkout.entrega,

        horarioSolicitado:
            checkout.horarioSolicitado || "",

        tempoMinimoPreparo:
            checkout.tempoMinimoPreparo || 0,

        carne: checkout.carne,

        pagamento: checkout.pagamento,

        tokenAcompanhamento,

        itens: cart.map(item => ({

            nome: item.nome,

            preco: item.preco,

            quantidade: item.qtd,

            subtotal:
                item.preco * item.qtd

        })),

        total,

        status: "Recebido",

        criadoEm: serverTimestamp()

    };


    const docRef = await addDoc(

        collection(
            db,
            "pedidos"
        ),

        pedido

    );


    await setDoc(

        doc(
            db,
            "acompanhamento",
            tokenAcompanhamento
        ),

        {

            pedidoId: docRef.id,

            status: "Recebido",

            tipoEntrega:
                checkout.entrega,

            horarioSolicitado:
                checkout.horarioSolicitado || "",

            criadoEm:
                serverTimestamp()

        }

    );


    return {

        id: docRef.id,

        token: tokenAcompanhamento

    };

}