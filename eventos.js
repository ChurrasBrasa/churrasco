document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;
    const header = document.querySelector("#header");
    const elementosReveal = document.querySelectorAll(".reveal");
    const cards = document.querySelectorAll(".card");
    const botaoWhatsApp = document.querySelector(".whatsapp");
    const botaoTopo = document.querySelector(".voltar-topo");

    // Entrada suave da página
    window.addEventListener("load", () => {
        body.classList.add("carregado");
    });

    // Header escuro ao rolar
    function atualizarHeader() {
        if (!header) return;

        header.classList.toggle(
            "rolagem",
            window.scrollY > 70
        );
    }

    atualizarHeader();

    window.addEventListener(
        "scroll",
        atualizarHeader
    );

    // Animação das seções ao aparecerem na tela
    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("ativo");

                    observer.unobserve(entry.target);
                }

            });

        },
        {
            threshold: 0.15
        }
    );

    elementosReveal.forEach((elemento) => {
        observer.observe(elemento);
    });

    // Cards aparecendo um de cada vez
    cards.forEach((card, index) => {

        card.style.setProperty(
            "--delay",
            `${index * 120}ms`
        );

    });

    // Efeito de brilho seguindo o mouse nos cards
    cards.forEach((card) => {

        card.addEventListener(
            "mousemove",
            (event) => {

                const area = card.getBoundingClientRect();

                const x = event.clientX - area.left;
                const y = event.clientY - area.top;

                card.style.setProperty(
                    "--mouse-x",
                    `${x}px`
                );

                card.style.setProperty(
                    "--mouse-y",
                    `${y}px`
                );

            }
        );

        card.addEventListener(
            "mouseleave",
            () => {

                card.style.removeProperty("--mouse-x");
                card.style.removeProperty("--mouse-y");

            }
        );

    });

    // Efeito 3D suave nos cards
    cards.forEach((card) => {

        card.addEventListener(
            "mousemove",
            (event) => {

                if (window.innerWidth <= 900) return;

                const area = card.getBoundingClientRect();

                const centroX = area.width / 2;
                const centroY = area.height / 2;

                const mouseX =
                    event.clientX - area.left;

                const mouseY =
                    event.clientY - area.top;

                const rotacaoX =
                    ((mouseY - centroY) / centroY) * -4;

                const rotacaoY =
                    ((mouseX - centroX) / centroX) * 4;

                card.style.transform = `
                    perspective(900px)
                    translateY(-8px)
                    rotateX(${rotacaoX}deg)
                    rotateY(${rotacaoY}deg)
                `;

            }
        );

        card.addEventListener(
            "mouseleave",
            () => {

                card.style.transform = "";

            }
        );

    });

    // Texto do WhatsApp ao passar o mouse
    if (botaoWhatsApp) {

        const texto =
            botaoWhatsApp.querySelector("span");

        const textoOriginal =
            texto?.textContent ||
            "Solicitar orçamento pelo WhatsApp";

        botaoWhatsApp.addEventListener(
            "mouseenter",
            () => {

                if (texto) {
                    texto.textContent =
                        "Vamos organizar seu evento!";
                }

            }
        );

        botaoWhatsApp.addEventListener(
            "mouseleave",
            () => {

                if (texto) {
                    texto.textContent =
                        textoOriginal;
                }

            }
        );

        // Pequena vibração no celular
        botaoWhatsApp.addEventListener(
            "click",
            () => {

                if ("vibrate" in navigator) {
                    navigator.vibrate(60);
                }

            }
        );

    }

    // Botão voltar ao topo
    function atualizarBotaoTopo() {

        if (!botaoTopo) return;

        botaoTopo.classList.toggle(
            "visivel",
            window.scrollY > 500
        );

    }

    atualizarBotaoTopo();

    window.addEventListener(
        "scroll",
        atualizarBotaoTopo
    );

    if (botaoTopo) {

        botaoTopo.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }

    // Rolagem suave para links internos
    const linksInternos =
        document.querySelectorAll('a[href^="#"]');

    linksInternos.forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const destino =
                    link.getAttribute("href");

                if (!destino || destino === "#") {
                    return;
                }

                const elemento =
                    document.querySelector(destino);

                if (!elemento) return;

                event.preventDefault();

                elemento.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });

});