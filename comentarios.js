import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

// ELEMENTOS DA PÁGINA
const nome = document.getElementById("nome");
const mensagem = document.getElementById("mensagem");
const lista = document.getElementById("listaComentarios");
const botao = document.getElementById("btnEnviar");

// ESTRELAS
let avaliacao = 0;

const estrelas = document.querySelectorAll(".estrela");

estrelas.forEach((estrela) => {

    estrela.addEventListener("click", () => {

        avaliacao = Number(estrela.dataset.value);

        estrelas.forEach((s) => {

            if (Number(s.dataset.value) <= avaliacao) {

                s.classList.add("ativa");

            } else {

                s.classList.remove("ativa");

            }

        });

    });

});


botao.addEventListener("click", enviarComentario);

async function enviarComentario() {

    if (nome.value.trim() === "" || mensagem.value.trim() === "") {

        alert("Preencha todos os campos!");
        return;

    }

    if (avaliacao === 0) {

        alert("Escolha uma avaliação!");
        return;

    }

    try {

        await addDoc(collection(db, "comentarios"), {

            nome: nome.value.trim(),
            mensagem: mensagem.value.trim(),
            estrelas: avaliacao,
            curtidas: 0,
            data: serverTimestamp()

        });

        nome.value = "";
        mensagem.value = "";
        avaliacao = 0;

        estrelas.forEach((estrela) => {
            estrela.classList.remove("ativa");
        });

    } catch (erro) {

        console.error(erro);
        alert("Erro ao enviar comentário.");

    }

}


const consulta = query(
    collection(db, "comentarios"),
    orderBy("data", "desc")
);

onSnapshot(consulta, (snapshot) => {

    lista.innerHTML = "";

    snapshot.forEach((documento) => {

        const dados = documento.data();

        const comentario = document.createElement("div");

        comentario.className = "comentario fade-in";

        comentario.innerHTML = `

            <div class="nome">
                👤 ${dados.nome}
            </div>

            <div class="estrelas">
                ${"⭐".repeat(dados.estrelas || 0)}
            </div>

            <div class="texto">
                ${dados.mensagem}
            </div>

            <small>
                ${
                    dados.data
                    ? new Date(dados.data.seconds * 1000).toLocaleString("pt-BR")
                    : "Agora mesmo"
                }
            </small>

            <button class="like-btn" data-id="${documento.id}">
                ❤️ ${dados.curtidas}
            </button>

        `;

        lista.appendChild(comentario);

    });

    document.querySelectorAll(".like-btn").forEach((botaoCurtir) => {

        botaoCurtir.addEventListener("click", async () => {

            const referencia = doc(
                db,
                "comentarios",
                botaoCurtir.dataset.id
            );

            await updateDoc(referencia, {
                curtidas: increment(1)
            });

        });

    });

});