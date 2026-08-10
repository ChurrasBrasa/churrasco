import { dbPedidos, authPedidos } from "./firebase.js";

import {
    collection,
    doc,
    updateDoc,
    onSnapshot,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";


/* =========================================================
   ELEMENTOS
========================================================= */

const loginArea = document.getElementById("login-area");
const adminApp = document.getElementById("admin-app");

const emailInput = document.getElementById("admin-email");
const senhaInput = document.getElementById("admin-senha");

const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const loginError = document.getElementById("login-error");

const recebidosEl = document.getElementById("pedidos-recebidos");
const preparoEl = document.getElementById("pedidos-preparo");
const entregaEl = document.getElementById("pedidos-entrega");
const finalizadosEl = document.getElementById("pedidos-finalizados");

const countRecebidos = document.getElementById("count-recebidos");
const countPreparo = document.getElementById("count-preparo");
const countEntrega = document.getElementById("count-entrega");
const countFinalizados = document.getElementById("count-finalizados");

const totalPedidosEl = document.getElementById("total-pedidos");
const totalPreparoEl = document.getElementById("total-preparo");
const totalEntreguesEl = document.getElementById("total-entregues");
const faturamentoEl = document.getElementById("faturamento-dia");

const overlay = document.getElementById("admin-overlay");
const detalhesEl = document.getElementById("pedido-detalhes");
const fecharDetalhes = document.getElementById("close-pedido");

const btnPdf = document.getElementById("btn-pdf");

let pedidosAtuais = [];
let unsubscribePedidos = null;


/* =========================================================
   UTILIDADES
========================================================= */

function dinheiro(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function formatarData(timestamp) {

    if (!timestamp) {
        return "--:--";
    }

    const data =
        timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

    return data.toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function textoEntrega(pedido) {

    if (pedido.entrega === "retirar") {
        return "Retirada no local";
    }

    return `${pedido.endereco || ""}, ${pedido.numero || ""} - ${pedido.bairro || ""}`;

}


function horarioDesejado(pedido) {

    if (!pedido.horarioSolicitado) {
        return "Não informado";
    }

    return pedido.horarioSolicitado;

}


function tempoPreparo(pedido) {

    const minutos =
        Number(pedido.tempoMinimoPreparo || 0);

    if (!minutos) {
        return "Não informado";
    }

    const horas =
        Math.floor(minutos / 60);

    const restante =
        minutos % 60;

    if (horas && restante) {
        return `${horas}h ${restante}min`;
    }

    if (horas) {
        return `${horas}h`;
    }

    return `${restante}min`;

}


/* =========================================================
   LOGIN
========================================================= */

btnLogin?.addEventListener(
    "click",
    async () => {

        loginError.textContent = "";

        const email =
            emailInput.value.trim();

        const senha =
            senhaInput.value;

        if (!email || !senha) {

            loginError.textContent =
                "Digite o e-mail e a senha.";

            return;

        }

        try {

            btnLogin.disabled = true;
            btnLogin.textContent = "Entrando...";

            await signInWithEmailAndPassword(
                authPedidos,
                email,
                senha
            );

        } catch (erro) {

            console.error(erro);

            loginError.textContent =
                "E-mail ou senha inválidos.";

        } finally {

            btnLogin.disabled = false;
            btnLogin.textContent = "Entrar";

        }

    }
);


btnLogout?.addEventListener(
    "click",
    async () => {

        await signOut(authPedidos);

    }
);


/* =========================================================
   VERIFICAR LOGIN
========================================================= */

onAuthStateChanged(
    authPedidos,
    usuario => {

        if (usuario) {

            loginArea.hidden = true;
            adminApp.hidden = false;

            iniciarPedidos();

        } else {

            loginArea.hidden = false;
            adminApp.hidden = true;

            if (unsubscribePedidos) {

                unsubscribePedidos();

                unsubscribePedidos = null;

            }

        }

    }
);


/* =========================================================
   FIRESTORE EM TEMPO REAL
========================================================= */

function iniciarPedidos() {

    if (unsubscribePedidos) {
        unsubscribePedidos();
    }

    const pedidosQuery = query(
        collection(dbPedidos, "pedidos"),
        orderBy("criadoEm", "desc")
    );

    unsubscribePedidos =
        onSnapshot(
            pedidosQuery,

            snapshot => {

                pedidosAtuais =
                    snapshot.docs.map(
                        documento => ({
                            id: documento.id,
                            ...documento.data()
                        })
                    );

                renderizarPedidos();

            },

            erro => {

                console.error(
                    "Erro ao carregar pedidos:",
                    erro
                );

            }
        );

}


/* =========================================================
   CARD DO PEDIDO
========================================================= */

function criarCard(pedido) {

    const itens =
        (pedido.itens || [])
            .map(item => `
                <div class="order-item">

                    <span>
                        ${item.quantidade}x ${item.nome}
                    </span>

                    <span>
                        ${dinheiro(item.subtotal)}
                    </span>

                </div>
            `)
            .join("");


    const card =
        document.createElement("article");

    card.className =
        "order-card";


    card.innerHTML = `

        <div class="order-card-header">

            <span class="order-card-id">
                #${pedido.id.slice(-6).toUpperCase()}
            </span>

            <span class="order-card-time">
                ${formatarData(pedido.criadoEm)}
            </span>

        </div>


        <div class="order-client">
            ${pedido.nome || "Cliente"}
        </div>


        <div class="order-phone">
            ${pedido.telefone || ""}
        </div>


        <div class="order-items">
            ${itens}
        </div>


        <div class="pedido-horario-destaque">

            ${
                pedido.entrega === "retirar"
                    ? "🕐 Retirar às"
                    : "🛵 Entregar às"
            }

            <strong>
                ${horarioDesejado(pedido)}
            </strong>

        </div>


        <div class="order-card-footer">

            <span class="order-payment">
                ${pedido.pagamento || ""}
            </span>

            <span class="order-total">
                ${dinheiro(pedido.total)}
            </span>

        </div>


        <div class="order-actions">

            ${botaoStatus(pedido)}

        </div>

    `;


    card.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    ".order-actions"
                )
            ) {
                return;
            }

            abrirDetalhes(pedido);

        }
    );


    return card;

}


/* =========================================================
   BOTÕES DE STATUS
========================================================= */

function botaoStatus(pedido) {

    const status =
        pedido.status || "Recebido";


    if (status === "Recebido") {

        return `
            <button
                class="btn-accept"
                data-status="Em preparo"
                data-id="${pedido.id}">
                Aceitar pedido
            </button>
        `;

    }


    if (status === "Em preparo") {

        if (pedido.entrega === "retirar") {

            return `
                <button
                    class="btn-next"
                    data-status="Pronto para retirada"
                    data-id="${pedido.id}">
                    Pronto para retirada
                </button>
            `;

        }

        return `
            <button
                class="btn-next"
                data-status="Saiu para entrega"
                data-id="${pedido.id}">
                Saiu para entrega
            </button>
        `;

    }


    if (
        status === "Saiu para entrega" ||
        status === "Pronto para retirada"
    ) {

        return `
            <button
                class="btn-finish"
                data-status="Finalizado"
                data-id="${pedido.id}">
                Finalizar
            </button>
        `;

    }


    return `
        <span>
            ✓ Finalizado
        </span>
    `;

}


/* =========================================================
   ATUALIZAR STATUS
========================================================= */

async function atualizarStatus(pedidoId, novoStatus) {

    try {

        const pedido = pedidosAtuais.find(
            item => item.id === pedidoId
        );

        if (!pedido) {
            console.error("Pedido não encontrado.");
            return;
        }

        /* ATUALIZA O PEDIDO COMPLETO */

        await updateDoc(
            doc(
                dbPedidos,
                "pedidos",
                pedidoId
            ),
            {
                status: novoStatus
            }
        );


        /* ATUALIZA O ACOMPANHAMENTO DO CLIENTE */

        if (pedido.tokenAcompanhamento) {

            await updateDoc(
                doc(
                    dbPedidos,
                    "acompanhamento",
                    pedido.tokenAcompanhamento
                ),
                {
                    status: novoStatus
                }
            );

        }

        console.log(
            "Status atualizado:",
            novoStatus
        );

    } catch (erro) {

        console.error(
            "Erro ao alterar status:",
            erro
        );

        alert(
            "Não foi possível alterar o status."
        );

    }

}

    try {

        await updateDoc(
            doc(
                dbPedidos,
                "pedidos",
                pedidoId
            ),
            {
                status: novoStatus
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao alterar status:",
            erro
        );

        alert(
            "Não foi possível alterar o status."
        );

    }






function renderizarPedidos() {

    recebidosEl.innerHTML = "";
    preparoEl.innerHTML = "";
    entregaEl.innerHTML = "";
    finalizadosEl.innerHTML = "";


    let recebidos = 0;
    let preparo = 0;
    let entrega = 0;
    let finalizados = 0;

    let faturamento = 0;


    pedidosAtuais.forEach(
        pedido => {

            faturamento +=
                Number(pedido.total || 0);

            const card =
                criarCard(pedido);


            switch (pedido.status) {

                case "Recebido":

                    recebidos++;
                    recebidosEl.appendChild(card);

                    break;


                case "Em preparo":

                    preparo++;
                    preparoEl.appendChild(card);

                    break;


                case "Saiu para entrega":

                case "Pronto para retirada":

                    entrega++;
                    entregaEl.appendChild(card);

                    break;


                case "Finalizado":

                    finalizados++;
                    finalizadosEl.appendChild(card);

                    break;


                default:

                    recebidos++;
                    recebidosEl.appendChild(card);

            }

        }
    );


    colocarVazio(
        recebidosEl,
        "Nenhum pedido novo."
    );

    colocarVazio(
        preparoEl,
        "Nenhum pedido em preparo."
    );

    colocarVazio(
        entregaEl,
        "Nenhum pedido aguardando entrega/retirada."
    );

    colocarVazio(
        finalizadosEl,
        "Nenhum pedido finalizado."
    );


    countRecebidos.textContent =
        recebidos;

    countPreparo.textContent =
        preparo;

    countEntrega.textContent =
        entrega;

    countFinalizados.textContent =
        finalizados;


    totalPedidosEl.textContent =
        pedidosAtuais.length;

    totalPreparoEl.textContent =
        preparo;

    totalEntreguesEl.textContent =
        finalizados;

    faturamentoEl.textContent =
        dinheiro(faturamento);


    document
        .querySelectorAll(
            "[data-status][data-id]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    async event => {

                        event.stopPropagation();

                        botao.disabled = true;

                        await atualizarStatus(
                            botao.dataset.id,
                            botao.dataset.status
                        );

                    }
                );

            }
        );

}


function colocarVazio(
    elemento,
    mensagem
) {

    if (!elemento.children.length) {

        elemento.innerHTML = `
            <div class="empty-orders">
                ${mensagem}
            </div>
        `;

    }

}


/* =========================================================
   DETALHES COMPLETOS
========================================================= */

function abrirDetalhes(pedido) {

    const itens =
        (pedido.itens || [])
            .map(
                item => `
                    <div class="detail-row">

                        <span>
                            ${item.quantidade}x
                            ${item.nome}
                        </span>

                        <span>
                            ${dinheiro(item.subtotal)}
                        </span>

                    </div>
                `
            )
            .join("");


    detalhesEl.innerHTML = `

        <h2>
            Pedido #${pedido.id.slice(-6).toUpperCase()}
        </h2>


        <div class="detail-row">
            <span>Cliente</span>
            <span>${pedido.nome || "-"}</span>
        </div>


        <div class="detail-row">
            <span>Telefone</span>
            <span>${pedido.telefone || "-"}</span>
        </div>


        <div class="detail-row">
            <span>Tipo</span>
            <span>
                ${
                    pedido.entrega === "retirar"
                        ? "Retirada no local"
                        : "Entrega"
                }
            </span>
        </div>


        <div class="detail-row">
            <span>Endereço</span>
            <span>
                ${textoEntrega(pedido)}
            </span>
        </div>


        <div class="detail-row">
            <span>Ponto da carne</span>
            <span>
                ${
                    pedido.carne
                        ? pedido.carne.toUpperCase()
                        : "-"
                }
            </span>
        </div>


        <div class="detail-row">
            <span>
                ${
                    pedido.entrega === "retirar"
                        ? "Horário de retirada"
                        : "Horário de entrega"
                }
            </span>

            <span>
                ${horarioDesejado(pedido)}
            </span>
        </div>


        <div class="detail-row">
            <span>Tempo mínimo</span>
            <span>
                ${tempoPreparo(pedido)}
            </span>
        </div>


        <div class="detail-row">
            <span>Pagamento</span>
            <span>
                ${pedido.pagamento || "-"}
            </span>
        </div>


        <div class="detail-row">
            <span>Status</span>
            <span>
                ${pedido.status || "Recebido"}
            </span>
        </div>


        <div class="detail-row">
            <span>Pedido feito às</span>
            <span>
                ${formatarData(pedido.criadoEm)}
            </span>
        </div>


        <h3 style="margin-top:25px;">
            Produtos
        </h3>

        ${itens}


        <div class="detail-row detail-total">

            <span>Total</span>

            <span>
                ${dinheiro(pedido.total)}
            </span>

        </div>

    `;


    overlay.classList.add("open");

}


fecharDetalhes?.addEventListener(
    "click",
    () => {

        overlay.classList.remove("open");

    }
);


overlay?.addEventListener(
    "click",
    event => {

        if (event.target === overlay) {

            overlay.classList.remove("open");

        }

    }
);


/* =========================================================
   RELATÓRIO / PDF
========================================================= */

btnPdf?.addEventListener(
    "click",
    () => {

        gerarRelatorio();

    }
);


function gerarRelatorio() {

    const hoje =
        new Date()
            .toLocaleDateString(
                "pt-BR"
            );


    let html = `

        <html>

        <head>

            <title>
                Pedidos ${hoje}
            </title>

            <style>

                body {
                    font-family: Arial;
                    padding: 30px;
                    color: #111;
                }

                h1 {
                    margin-bottom: 5px;
                }

                .pedido {
                    border-bottom:
                        1px solid #ccc;

                    padding:
                        18px 0;
                }

                .linha {
                    margin:
                        5px 0;
                }

                .total {
                    font-size: 20px;
                    font-weight: bold;
                }

            </style>

        </head>

        <body>

            <h1>
                Churrasco na Brasa
            </h1>

            <p>
                Relatório de pedidos
                ${hoje}
            </p>

    `;


    pedidosAtuais.forEach(
        pedido => {

            html += `

                <div class="pedido">

                    <strong>
                        Pedido
                        #${pedido.id.slice(-6).toUpperCase()}
                    </strong>

                    <div class="linha">
                        Cliente:
                        ${pedido.nome}
                    </div>

                    <div class="linha">
                        ${
                            pedido.entrega === "retirar"
                                ? "Retirada"
                                : "Entrega"
                        }:
                        ${pedido.horarioSolicitado || "-"}
                    </div>

                    <div class="linha">
                        Pagamento:
                        ${pedido.pagamento}
                    </div>

                    <div class="linha">
                        Status:
                        ${pedido.status}
                    </div>

                    <div class="linha">
                        Total:
                        ${dinheiro(pedido.total)}
                    </div>

                </div>

            `;

        }
    );


    const total =
        pedidosAtuais.reduce(
            (soma, pedido) =>
                soma +
                Number(pedido.total || 0),
            0
        );


    html += `

            <p class="total">
                Total do dia:
                ${dinheiro(total)}
            </p>

        </body>

        </html>

    `;


    const janela =
        window.open(
            "",
            "_blank"
        );


    janela.document.write(html);

    janela.document.close();


    setTimeout(
        () => {

            janela.print();

        },
        300
    );

}