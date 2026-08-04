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
        endereco: checkout.endereco,
        numero: checkout.numero,
        bairro: checkout.bairro,
        entrega: checkout.entrega,
        pagamento: checkout.pagamento,
        itens: cart,
        total: total,
        status: "Recebido",
        criadoEm: serverTimestamp()
    };

    await addDoc(collection(db, "pedidos"), pedido);
}
