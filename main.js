import { finalizarPedido as salvarPedido } from './pedidos.js';

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('#header');
    const menuLinks = document.querySelectorAll('.menu1 a');
    const ctaPedido = document.querySelector('.pedido');
    const botoesAdicionar = document.querySelectorAll('[data-preco]');
    const btnContinuar = document.querySelector('.btn-continuar');
    const overlay = document.getElementById('overlay');
    const modal = document.getElementById('modal');
    const carrinhoEl = document.getElementById('carrinho');
    const totalEl = document.getElementById('total');

    let cart = [];
    let checkout = {};
    let step = 0;
    const STEPS = ['entrega', 'contato', 'carne', 'pagamento', 'revisao', 'confirmado'];
    const DELIVERY_FEE = 8.00;

    function money(value) {
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    }

    function cartTotal() {
        return cart.reduce((sum, item) => sum + item.preco * item.qtd, 0);
    }

    function setupHeaderScroll() {
        if (!header) return;
        function updateHeader() {
            const scrollY = window.scrollY;
            header.classList.toggle('rolagem', scrollY > 80);
        }
        updateHeader();
        window.addEventListener('scroll', updateHeader);
    }

    function setupMenuLinks() {
        if (!menuLinks.length) return;
        menuLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            link.addEventListener('click', event => {
                event.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function setupCtaPedido() {
        if (!ctaPedido) return;
        ctaPedido.addEventListener('click', () => {
            const target = document.querySelector('#cardapio');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    function updateContinueState() {
        if (btnContinuar) btnContinuar.disabled = cart.length === 0;
    }

    function renderCart() {
        if (!carrinhoEl || !totalEl) return;

        if (cart.length === 0) {
            carrinhoEl.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio. Adicione itens do cardápio acima!</p>';
        } else {
            carrinhoEl.innerHTML = cart.map(item => `
                <div class="carrinho-item">
                    <span>${item.nome} <small style="color:#ccc;">x${item.qtd}</small></span>
                    <span class="carrinho-item-preco">${money(item.preco * item.qtd)}</span>
                    <button class="remover-item" data-id="${item.id}" type="button">×</button>
                </div>
            `).join('');

            carrinhoEl.querySelectorAll('.remover-item').forEach(button => {
                button.addEventListener('click', () => {
                    const id = button.dataset.id;
                    changeQty(id, -1);
                });
            });
        }

        totalEl.textContent = money(cartTotal());
        updateContinueState();
    }

    function addItem(nome, preco) {
        if (!nome || typeof preco !== 'number' || Number.isNaN(preco)) return;
        const existing = cart.find(item => item.nome === nome);
        if (existing) {
            existing.qtd += 1;
        } else {
            cart.push({ id: `${Date.now()}-${Math.random()}`, nome, preco, qtd: 1 });
        }
        renderCart();
    }

    function changeQty(id, delta) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qtd += delta;
        if (item.qtd <= 0) cart = cart.filter(i => i.id !== id);
        renderCart();
    }

    function addCombo() {
        const comboBtn = document.querySelector('.combo-add');
        const nome = comboBtn?.dataset.nome || 'Combo Especial';
        const preco = parseFloat(comboBtn?.dataset.preco || '0');
        addItem(nome, preco);
    }

    function openCheckout() {
        if (cart.length === 0) {
            alert('Adicione itens ao carrinho antes de continuar.');
            return;
        }
        checkout = {
            entrega: null,
            nome: '',
            telefone: '',
            endereco: '',
            numero: '',
            bairro: '',
            carne: null,
            pagamento: null,
            orderId: ''
        };
        step = 0;
        overlay?.classList.add('open');
        renderStep();
    }

    function closeCheckout() {
        overlay?.classList.remove('open');
    }

    function dots(activeIndex) {
        let html = '<div class="step-dots">';
        for (let i = 0; i < 5; i += 1) {
            html += `<span class="${i <= activeIndex ? 'done' : ''}"></span>`;
        }
        html += '</div>';
        return html;
    }

    function miniSummary() {
        let html = '<div class="mini-summary">';
        cart.forEach(item => {
            html += `<div class="row"><span>${item.nome} x${item.qtd}</span><span>${money(item.preco * item.qtd)}</span></div>`;
        });
        if (checkout.entrega === 'entrega') {
            html += `<div class="row"><span>Taxa de entrega</span><span>${money(DELIVERY_FEE)}</span></div>`;
        }
        html += `<div class="row total"><span>Total</span><span>${money(cartTotal() + (checkout.entrega === 'entrega' ? DELIVERY_FEE : 0))}</span></div>`;
        html += '</div>';
        return html;
    }

    function renderStep() {
        if (!modal) return;
        const current = STEPS[step];
        if (!current) return;

        if (current === 'entrega') {
            modal.innerHTML = `
                <div class="modal-head">
                    <h2>Finalizar Pedido</h2>
                    <button class="close-modal" type="button" onclick="closeCheckout()">×</button>
                </div>
                ${dots(0)}
                ${miniSummary()}
                <div style="font-weight:700;margin-bottom:12px;">Como deseja receber?</div>
                <div class="choice ${checkout.entrega === 'entrega' ? 'selected' : ''}" onclick="selectEntrega('entrega')">
                    <div><div class="lbl">Entrega</div><div class="sub">Receber em casa</div></div>
                    <div class="radio"></div>
                </div>
                <div class="choice ${checkout.entrega === 'retirar' ? 'selected' : ''}" onclick="selectEntrega('retirar')">
                    <div><div class="lbl">Retirar no Local</div><div class="sub">Buscar na churrascaria</div></div>
                    <div class="radio"></div>
                </div>
                <button class="btn-primary" ${checkout.entrega ? '' : 'disabled'} onclick="nextStep()">Continuar</button>
                <button class="btn-ghost" onclick="closeCheckout()">Cancelar</button>
            `;
            return;
        }

        if (current === 'contato') {
            const isEntrega = checkout.entrega === 'entrega';
            modal.innerHTML = `
                <div class="modal-head">
                    <h2>${isEntrega ? 'Local de entrega' : 'Seus dados'}</h2>
                    <button class="close-modal" type="button" onclick="closeCheckout()">×</button>
                </div>
                ${dots(1)}
                ${miniSummary()}
                <div class="field"><label>Nome</label><input id="f-nome" value="${checkout.nome}" placeholder="Digite seu nome"></div>
                <div class="field"><label>Telefone</label><input id="f-telefone" value="${checkout.telefone}" placeholder="(42) 99999-9999"></div>
                ${isEntrega ? `
                    <div class="field"><label>Endereço</label><input id="f-endereco" value="${checkout.endereco}" placeholder="Rua, Av."></div>
                    <div class="row2">
                        <div class="field"><label>Número</label><input id="f-numero" value="${checkout.numero}" placeholder="Nº"></div>
                        <div class="field"><label>Bairro</label><input id="f-bairro" value="${checkout.bairro}" placeholder="Bairro"></div>
                    </div>
                ` : ''}
                <div class="field-error" id="f-error" style="display:none;">Preencha os campos obrigatórios.</div>
                <button class="btn-primary" onclick="submitContato()">Continuar</button>
                <button class="btn-ghost" onclick="prevStep()">Voltar</button>
            `;
            return;
        }

        if (current === 'carne') {
            modal.innerHTML = `
                <div class="modal-head">
                    <h2>Ponto da carne</h2>
                    <button class="close-modal" type="button" onclick="closeCheckout()">×</button>
                </div>
                ${dots(2)}
                ${miniSummary()}
                ${['mal passada', 'no ponto', 'bem passada'].map(option => `
                    <div class="choice ${checkout.carne === option ? 'selected' : ''}" onclick="selectCarne('${option}')">
                        <div class="lbl">${option.toUpperCase()}</div>
                        <div class="radio"></div>
                    </div>
                `).join('')}
                <button class="btn-primary" ${checkout.carne ? '' : 'disabled'} onclick="nextStep()">Continuar</button>
                <button class="btn-ghost" onclick="prevStep()">Voltar</button>
            `;
            return;
        }

        if (current === 'pagamento') {
            modal.innerHTML = `
                <div class="modal-head">
                    <h2>Pagamento</h2>
                    <button class="close-modal" type="button" onclick="closeCheckout()">×</button>
                </div>
                ${dots(3)}
                ${miniSummary()}
                ${['PIX', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito'].map(option => `
                    <div class="choice ${checkout.pagamento === option ? 'selected' : ''}" onclick="selectPagamento('${option}')">
                        <div class="lbl">${option}</div>
                        <div class="radio"></div>
                    </div>
                `).join('')}
                <button class="btn-primary" ${checkout.pagamento ? '' : 'disabled'} onclick="nextStep()">Continuar</button>
                <button class="btn-ghost" onclick="prevStep()">Voltar</button>
            `;
            return;
        }

        if (current === 'revisao') {
            modal.innerHTML = `
                <div class="modal-head">
                    <h2>Revisar pedido</h2>
                    <button class="close-modal" type="button" onclick="closeCheckout()">×</button>
                </div>
                ${dots(4)}
                ${miniSummary()}
                <div class="mini-summary">
                    <div class="row"><span>Cliente</span><span>${checkout.nome}</span></div>
                    <div class="row"><span>Telefone</span><span>${checkout.telefone}</span></div>
                    <div class="row"><span>${checkout.entrega === 'entrega' ? 'Entrega' : 'Retirada'}</span><span>${checkout.entrega === 'entrega' ? `${checkout.endereco}, ${checkout.numero}` : 'Buscar no local'}</span></div>
                    <div class="row"><span>Ponto</span><span>${checkout.carne?.toUpperCase() || ''}</span></div>
                    <div class="row"><span>Pagamento</span><span>${checkout.pagamento}</span></div>
                </div>
                <button class="btn-primary" onclick="finalizarPedido()">Finalizar Pedido</button>
                <button class="btn-ghost" onclick="prevStep()">Voltar</button>
            `;
            return;
        }

        if (current === 'confirmado') {
            modal.innerHTML = `
                <div class="confirm-box">
                    <div class="flame">🔥</div>
                    <h2>Pedido enviado!</h2>
                    <p>Estamos preparando sua carne.</p>
                    <div class="order-id">Pedido ${checkout.orderId || ''}</div>
                    <button class="btn-primary" onclick="finishAndReset()">Fechar</button>
                </div>
            `;
            return;
        }
    }

    function selectEntrega(value) {
        checkout.entrega = value;
        renderStep();
    }

    function selectCarne(value) {
        checkout.carne = value;
        renderStep();
    }

    function selectPagamento(value) {
        checkout.pagamento = value;
        renderStep();
    }

    function submitContato() {
        checkout.nome = document.getElementById('f-nome')?.value.trim() || '';
        checkout.telefone = document.getElementById('f-telefone')?.value.trim() || '';
        if (checkout.entrega === 'entrega') {
            checkout.endereco = document.getElementById('f-endereco')?.value.trim() || '';
            checkout.numero = document.getElementById('f-numero')?.value.trim() || '';
            checkout.bairro = document.getElementById('f-bairro')?.value.trim() || '';
        }
        const required = [checkout.nome, checkout.telefone];
        if (checkout.entrega === 'entrega') required.push(checkout.endereco, checkout.numero, checkout.bairro);
        const invalid = required.some(value => !value);
        const errorEl = document.getElementById('f-error');
        if (errorEl) errorEl.style.display = invalid ? 'block' : 'none';
        if (invalid) return;
        nextStep();
    }

    function nextStep() {
        if (step < STEPS.length - 1) step += 1;
        renderStep();
    }

    function prevStep() {
        if (step > 0) step -= 1;
        renderStep();
    }

    async function finalizarPedido() {
        if (cart.length === 0) {
            alert('Seu carrinho está vazio.');
            closeCheckout();
            return;
        }

        const total = cartTotal() + (checkout.entrega === 'entrega' ? DELIVERY_FEE : 0);
        const checkoutData = {
            nome: checkout.nome,
            telefone: checkout.telefone,
            endereco: checkout.endereco,
            numero: checkout.numero,
            bairro: checkout.bairro,
            entrega: checkout.entrega,
            pagamento: checkout.pagamento
        };

        try {
            checkout.orderId = await salvarPedido(checkoutData, cart, total) || '';
            step = STEPS.indexOf('confirmado');
            renderStep();
            cart = [];
            renderCart();
        } catch (error) {
            console.error(error);
            alert('Erro ao enviar pedido. Tente novamente.');
        }
    }

    function finishAndReset() {
        cart = [];
        renderCart();
        closeCheckout();
        step = 0;
    }

    botoesAdicionar.forEach(btn => {
        btn.addEventListener('click', () => {
            const nome = btn.dataset.nome;
            const preco = parseFloat(btn.dataset.preco);
            addItem(nome, preco);
            btn.style.transform = 'scale(1.25)';
            setTimeout(() => { btn.style.transform = 'scale(1)'; }, 120);
        });
    });

    document.querySelectorAll('.combo-add').forEach(btn => btn.addEventListener('click', addCombo));
    if (btnContinuar) btnContinuar.addEventListener('click', openCheckout);

    setupHeaderScroll();
    setupMenuLinks();
    setupCtaPedido();
    updateContinueState();

    window.openCheckout = openCheckout;
    window.closeCheckout = closeCheckout;
    window.nextStep = nextStep;
    window.prevStep = prevStep;
    window.selectEntrega = selectEntrega;
    window.selectCarne = selectCarne;
    window.selectPagamento = selectPagamento;
    window.submitContato = submitContato;
    window.finalizarPedido = finalizarPedido;
    window.finishAndReset = finishAndReset;

    renderCart();
});
