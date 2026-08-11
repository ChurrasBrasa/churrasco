document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    const botaoTopo = document.querySelector(".topo");
    const reveals = document.querySelectorAll(".reveal");

    function atualizarHeader() {
        if (!header) return;
        header.classList.toggle("rolagem", window.scrollY > 70);
    }

    function atualizarBotaoTopo() {
        if (!botaoTopo) return;
        botaoTopo.classList.toggle("visivel", window.scrollY > 450);
    }

    atualizarHeader();
    atualizarBotaoTopo();

    window.addEventListener("scroll", atualizarHeader, { passive: true });
    window.addEventListener("scroll", atualizarBotaoTopo, { passive: true });

    botaoTopo?.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            entradas => {
                entradas.forEach(entrada => {
                    if (!entrada.isIntersecting) return;

                    entrada.target.classList.add("ativo");
                    observer.unobserve(entrada.target);
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -30px 0px"
            }
        );

        reveals.forEach(elemento => observer.observe(elemento));
    } else {
        reveals.forEach(elemento => elemento.classList.add("ativo"));
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", evento => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            const destino = document.querySelector(href);
            if (!destino) return;

            evento.preventDefault();
            destino.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });
});
