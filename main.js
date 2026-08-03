document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('#header');
    if (header) {
        window.addEventListener("scroll", function(){
            header.classList.toggle('rolagem', window.scrollY > 80);
        });
    }
    const menuLinks = document.querySelectorAll('.menu1 a');
    if (menuLinks.length) {
        menuLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');

                menuLinks.forEach(l => {
                    l.classList.remove('selected');
                    l.removeAttribute('aria-current');
                });
                this.classList.add('selected');
                this.setAttribute('aria-current', 'page');

                if (href === '#') {
                    // "Home": sobe suavemente pro topo
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (href && href.startsWith('#')) {
                    // Âncora de verdade (ex: #cardapio): rola até a seção
                    e.preventDefault();
                    const alvo = document.querySelector(href);
                    if (alvo) alvo.scrollIntoView({ behavior: 'smooth' });
                }
                
            });
        });
    }
});



/*agr nois usa isso aq*/
const cards = document.querySelectorAll(".card-info");

cards.forEach((card) =>{

    card.addEventListener("click",()=>{

        card.style.transform = "scale(0.9)";

        setTimeout(()=>{
            card.style.transform = "scale(1)";
        },150);

    });

});




const botoesAdicionar = document.querySelectorAll('[data-preco]');
botoesAdicionar.forEach((btn) => {
    btn.addEventListener('click', () => {
        const nome = btn.dataset.nome;
        const preco = parseFloat(btn.dataset.preco);
        adicionar(nome, preco);

      
        btn.style.transform = "scale(1.25)";
        setTimeout(() => { btn.style.transform = "scale(1)"; }, 120);
    });
});

let total = 0;

function atualizarTotal() {
    document.getElementById("total").innerHTML =
        "R$ " + total.toFixed(2).replace('.', ',');
}

function mostrarVazioSeNecessario() {
    const carrinho = document.getElementById("carrinho");
    if (carrinho.children.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "carrinho-vazio";
        vazio.textContent = "Seu carrinho está vazio. Adicione itens do cardápio acima!";
        carrinho.appendChild(vazio);
    }
}

function adicionar(nome, preco) {

    let carrinho = document.getElementById("carrinho");

    // remove a mensagem 
    const vazio = carrinho.querySelector(".carrinho-vazio");
    if (vazio) vazio.remove();

    let item = document.createElement("div");
    item.className = "carrinho-item";
    item.dataset.preco = preco;
    item.innerHTML = `
        <span>${nome}</span>
        <span class="carrinho-item-preco">R$ ${preco.toFixed(2).replace('.', ',')}</span>
        <button class="remover-item" aria-label="Remover ${nome}" title="Remover">×</button>
    `;

    // remove o treco do carrinho e do total ao pra arrancar fora
    item.querySelector(".remover-item").addEventListener("click", () => {
        total -= parseFloat(item.dataset.preco);
        item.remove();
        atualizarTotal();
        mostrarVazioSeNecessario();
    });

    carrinho.appendChild(item);

    total += preco;
    atualizarTotal();

}




