import { finalizarPedido as salvarPedido } from './pedidos.js';

document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('#header');
    if (header) {
        window.addEventListener('scroll', function () {
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
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const alvo = document.querySelector(href);
                    if (alvo) alvo.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    const cards = document.querySelectorAll('.card-info');
    cards.forEach((card) => {
        card.addEventListener('click', () => {
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 150);
        });
    });

    const botoesAdicionar = document.querySelectorAll('[data-preco]');
    const btnContinuar = document.querySelector('.btn-continuar');
    const overlay = document.getElementById('overlay');
    const choices = document.querySelectorAll('.choice[data-group]');
    const resumo = document.querySelector('.mini-summary');

    let cart = [];
    let total = 0;

    function atualizarTotal() {
        const totalEl = document.getElementById('total');
        if (totalEl) {
            totalEl.innerHTML = 'R$ ' + total.toFixed(2).replace('.', ',');
        }
    }

    function mostrarVazioSeNecessario() {
        const carrinho = document.getElementById('carrinho');
        if (!carrinho) return;
        if (carrinho.children.length === 0) {
            const vazio = document.createElement('p');
            vazio.className = 'carrinho-vazio';
            vazio.textContent = 'Seu carrinho está vazio. Adicione itens do cardápio acima!';
            carrinho.appendChild(vazio);
        }
    }

    function atualizarResumo() {
        if (!resumo) return;
        resumo.innerHTML = '';

        if (cart.length === 0) {
            resumo.innerHTML = '<p>Seu carrinho está vazio.</p>';
            return;
        }

        cart.forEach(item => {
            const row = document.createElement('div');
            row.className = 'row';
            row.innerHTML = `
                <span>${item.nome}</span>
                <span>R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
            `;
            resumo.appendChild(row);
        });

        const totalRow = document.createElement('div');
        totalRow.className = 'row total';
        totalRow.innerHTML = `
            <span>Total</span>
            <span>R$ ${total.toFixed(2).replace('.', ',')}</span>
        `;
        resumo.appendChild(totalRow);
    }

    function getSelectedChoice(group) {
        const selected = document.querySelector(`.choice[data-group="${group}"].selected`);
        return selected ? selected.querySelector('.lbl')?.textContent.trim() : '';
    }

    function adicionar(nome, preco) {
        const carrinho = document.getElementById('carrinho');
        if (!carrinho) return;

        const vazio = carrinho.querySelector('.carrinho-vazio');
        if (vazio) vazio.remove();

        const itemData = {
            id: `${Date.now()}-${Math.random()}`,
            nome,
            preco
        };

        cart.push(itemData);

        const item = document.createElement('div');
        item.className = 'carrinho-item';
        item.dataset.id = itemData.id;
        item.innerHTML = `
            <span>${nome}</span>
            <span class="carrinho-item-preco">R$ ${preco.toFixed(2).replace('.', ',')}</span>
            <button class="remover-item" aria-label="Remover ${nome}" title="Remover">×</button>
        `;

        item.querySelector('.remover-item').addEventListener('click', () => {
            total -= itemData.preco;
            cart = cart.filter(i => i.id !== itemData.id);
            item.remove();
            atualizarTotal();
            if (cart.length === 0) mostrarVazioSeNecessario();
        });

        carrinho.appendChild(item);
        total += preco;
        atualizarTotal();
    }

    function abrirCheckout() {
        overlay?.classList.add('open');
        atualizarResumo();
    }

    function fecharCheckout() {
        overlay?.classList.remove('open');
    }

    botoesAdicionar.forEach((btn) => {
        btn.addEventListener('click', () => {
            const nome = btn.dataset.nome;
            const preco = parseFloat(btn.dataset.preco);
            adicionar(nome, preco);
            btn.style.transform = 'scale(1.25)';
            setTimeout(() => { btn.style.transform = 'scale(1)'; }, 120);
        });
    });

    btnContinuar?.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Adicione itens ao carrinho antes de continuar.');
            return;
        }
        abrirCheckout();
    });

    choices.forEach(choice => {
        choice.addEventListener('click', () => {
            const group = choice.dataset.group;
            if (!group) return;
            document.querySelectorAll(`.choice[data-group="${group}"]`).forEach((item) => {
                item.classList.remove('selected');
            });
            choice.classList.add('selected');
        });
    });

    async function finalizarPedido() {
        const nome = document.getElementById('nome')?.value.trim();
        const telefone = document.getElementById('telefone')?.value.trim();
        const endereco = document.getElementById('endereco')?.value.trim();
        const numero = document.getElementById('numero')?.value.trim();
        const bairro = document.getElementById('bairro')?.value.trim();
        const entrega = getSelectedChoice('entrega');
        const pagamento = getSelectedChoice('pagamento');

        if (!nome || !telefone || !endereco || !numero || !bairro) {
            alert('Preencha todos os campos do pedido.');
            return;
        }

        if (cart.length === 0) {
            alert('Seu carrinho está vazio. Adicione itens antes de finalizar.');
            fecharCheckout();
            return;
        }

        const checkout = { nome, telefone, endereco, numero, bairro, entrega, pagamento };

        try {
            await salvarPedido(checkout, cart, total);
            alert('Pedido enviado com sucesso!');
            cart = [];
            total = 0;
            const carrinho = document.getElementById('carrinho');
            if (carrinho) carrinho.innerHTML = '';
            mostrarVazioSeNecessario();
            atualizarTotal();
            fecharCheckout();
        } catch (erro) {
            console.error(erro);
            alert('Erro ao enviar pedido. Tente novamente.');
        }
    }

    window.closeCheckout = fecharCheckout;
    window.finalizarPedido = finalizarPedido;
});
