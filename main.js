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
                e.preventDefault();
                menuLinks.forEach(l => {
                    l.classList.remove('selected');
                    l.removeAttribute('aria-current');
                });
                this.classList.add('selected');
                this.setAttribute('aria-current', 'page');
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



let total = 0;

function adicionar(nome,preco){

let carrinho =
document.getElementById("carrinho");


let item = document.createElement("p");

item.innerHTML =
nome + " = R$" + preco;

carrinho.appendChild(item);

total += preco;

document.getElementById("total")
.innerHTML =
"R$ "+ total.toFixed(2);

}








