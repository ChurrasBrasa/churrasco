document.addEventListener(
    "DOMContentLoaded",
    () => {

        const header =
            document.getElementById(
                "header"
            );

        const botaoTopo =
            document.getElementById(
                "voltar-topo"
            );

        const reveals =
            document.querySelectorAll(
                ".reveal"
            );


        /* =================================================
           HEADER
        ================================================= */

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
            {
                passive:true
            }
        );


        /* =================================================
           VOLTAR AO TOPO
        ================================================= */

        function atualizarBotaoTopo() {

            if (!botaoTopo) return;

            botaoTopo.classList.toggle(
                "visivel",
                window.scrollY > 450
            );

        }


        atualizarBotaoTopo();


        window.addEventListener(
            "scroll",
            atualizarBotaoTopo,
            {
                passive:true
            }
        );


        botaoTopo?.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top:0,
                    behavior:"smooth"
                });

            }
        );


        /* =================================================
           ANIMAÇÕES
        ================================================= */

        if (
            "IntersectionObserver"
            in window
        ) {

            const observer =
                new IntersectionObserver(

                    entradas => {

                        entradas.forEach(
                            entrada => {

                                if (
                                    entrada.isIntersecting
                                ) {

                                    entrada.target
                                        .classList
                                        .add(
                                            "ativo"
                                        );

                                    observer.unobserve(
                                        entrada.target
                                    );

                                }

                            }
                        );

                    },

                    {
                        threshold:.12,

                        rootMargin:
                            "0px 0px -30px 0px"
                    }

                );


            reveals.forEach(
                elemento => {

                    observer.observe(
                        elemento
                    );

                }
            );

        }

        else {

            reveals.forEach(
                elemento => {

                    elemento.classList.add(
                        "ativo"
                    );

                }
            );

        }


        /* =================================================
           LINKS INTERNOS
        ================================================= */

        const linksInternos =
            document.querySelectorAll(
                'a[href^="#"]'
            );


        linksInternos.forEach(
            link => {

                link.addEventListener(
                    "click",
                    evento => {

                        const href =
                            link.getAttribute(
                                "href"
                            );


                        if (
                            !href ||
                            href === "#"
                        ) {
                            return;
                        }


                        const destino =
                            document.querySelector(
                                href
                            );


                        if (!destino) {
                            return;
                        }


                        evento.preventDefault();


                        destino.scrollIntoView({
                            behavior:"smooth",
                            block:"start"
                        });

                    }
                );

            }
        );

    }
);