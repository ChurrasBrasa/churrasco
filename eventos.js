// Fade ao carregar
window.addEventListener("load",()=>{

    document.body.classList.add("carregado");

});

// Reveal
const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("ativo");

        }

    });

},{
    threshold:.2
});

reveals.forEach(item=>observer.observe(item));

// Cards
const cards=document.querySelectorAll(".card");

cards.forEach((card,index)=>{

    card.style.opacity="0";
    card.style.transform="translateY(40px)";

    setTimeout(()=>{

        card.style.transition=".8s";
        card.style.opacity="1";
        card.style.transform="translateY(0)";

    },300+(index*180));

});

// WhatsApp
const whats=document.querySelector(".whatsapp");

const textoOriginal=whats.innerHTML;

whats.addEventListener("mouseenter",()=>{

    whats.innerHTML=`
        <img src="img/whatsapp.png">
        Solicitar orçamento agora
    `;

});

whats.addEventListener("mouseleave",()=>{

    whats.innerHTML=textoOriginal;

});