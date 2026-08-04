document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;
    const header = document.querySelector("#header");
    const elementosReveal = document.querySelectorAll(".reveal");
    const cards = document.querySelectorAll(".evento-card");
    const botaoTopo = document.querySelector(".topo");
    const areaBrasas = document.querySelector(".brasas");
    const contadores = document.querySelectorAll("[data-contador]");
    const botoesWhatsApp = document.querySelectorAll(
        ".whatsapp, .btn-principal, .whatsapp-flutuante"
    );

    body.classList.add("carregado");

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
        atualizarHeader,
        { passive: true }
    );

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("ativo");
                    observer.unobserve(entry.target);

                });

            },
            {
                threshold: 0.14
            }
        );

        elementosReveal.forEach((elemento) => {
            observer.observe(elemento);
        });

    } else {

        elementosReveal.forEach((elemento) => {
            elemento.classList.add("ativo");
        });

    }

    cards.forEach((card, index) => {

        card.style.transitionDelay =
            `${Math.min(index * 90, 360)}ms`;

        card.addEventListener("mousemove", (event) => {

            if (window.innerWidth <= 900) return;

            const area = card.getBoundingClientRect();

            const x = event.clientX - area.left;
            const y = event.clientY - area.top;

            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);

            const centroX = area.width / 2;
            const centroY = area.height / 2;

            const rotacaoX =
                ((y - centroY) / centroY) * -4;

            const rotacaoY =
                ((x - centroX) / centroX) * 4;

            card.style.transform = `
                perspective(900px)
                translateY(-8px)
                rotateX(${rotacaoX}deg)
                rotateY(${rotacaoY}deg)
            `;

        });

        card.addEventListener("mouseleave", () => {

            card.style.removeProperty("--mouse-x");
            card.style.removeProperty("--mouse-y");
            card.style.transform = "";

        });

    });

    function atualizarBotaoTopo() {

        if (!botaoTopo) return;

        botaoTopo.classList.toggle(
            "visivel",
            window.scrollY > 550
        );

    }

    atualizarBotaoTopo();

    window.addEventListener(
        "scroll",
        atualizarBotaoTopo,
        { passive: true }
    );

    if (botaoTopo) {

        botaoTopo.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

    document
        .querySelectorAll('a[href^="#"]')
        .forEach((link) => {

            link.addEventListener("click", (event) => {

                const destino =
                    link.getAttribute("href");

                if (!destino || destino === "#") return;

                const elemento =
                    document.querySelector(destino);

                if (!elemento) return;

                event.preventDefault();

                elemento.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });

    botoesWhatsApp.forEach((botao) => {

        botao.addEventListener("click", () => {

            if ("vibrate" in navigator) {
                navigator.vibrate(50);
            }

        });

    });

    function criarBrasas() {

        if (!areaBrasas) return;

        const totalBrasas =
            window.innerWidth <= 700 ? 14 : 28;

        for (let i = 0; i < totalBrasas; i += 1) {

            const brasa = document.createElement("span");

            const tamanho =
                Math.random() * 4 + 2;

            const duracao =
                Math.random() * 6 + 6;

            const atraso =
                Math.random() * 8;

            brasa.style.left =
                `${Math.random() * 100}%`;

            brasa.style.width =
                `${tamanho}px`;

            brasa.style.height =
                `${tamanho}px`;

            brasa.style.animationDuration =
                `${duracao}s`;

            brasa.style.animationDelay =
                `${atraso * -1}s`;

            brasa.style.opacity =
                `${Math.random() * 0.6 + 0.35}`;

            areaBrasas.appendChild(brasa);

        }

    }

    criarBrasas();

    function animarContador(elemento) {

        const alvo =
            Number(elemento.dataset.contador);

        if (!Number.isFinite(alvo)) return;

        const duracao = 900;
        const inicio = performance.now();

        function atualizar(tempoAtual) {

            const progresso = Math.min(
                (tempoAtual - inicio) / duracao,
                1
            );

            const valor =
                Math.floor(progresso * alvo);

            elemento.textContent = valor;

            if (progresso < 1) {
                requestAnimationFrame(atualizar);
            } else {
                elemento.textContent = alvo;
            }

        }

        requestAnimationFrame(atualizar);

    }

    if ("IntersectionObserver" in window) {

        const observerContador =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) return;

                        animarContador(entry.target);
                        observerContador.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.6
                }
            );

        contadores.forEach((contador) => {
            observerContador.observe(contador);
        });

    } else {

        contadores.forEach(animarContador);

    }

});