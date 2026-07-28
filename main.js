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