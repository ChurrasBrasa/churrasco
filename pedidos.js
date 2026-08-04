import { dbPedidos as db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

export async function finalizarPedido(checkout, cart, total) {
    const pedido = {
        nome: checkout.nome,
        telefone: checkout.telefone,
        endereco: checkout.endereco || "",
        numero: checkout.numero || "",
        bairro: checkout.bairro || "",
        entrega: checkout.entrega,
        carne: checkout.carne,
        pagamento: checkout.pagamento,

        itens: cart.map(item => ({
            nome: item.nome,
            preco: item.preco,
            quantidade: item.qtd,
            subtotal: item.preco * item.qtd
        })),

        total,
        status: "Recebido",
        criadoEm: serverTimestamp()
    };

    const docRef = await addDoc(
        collection(db, "pedidos"),
        pedido
    );

    return docRef.id;
}