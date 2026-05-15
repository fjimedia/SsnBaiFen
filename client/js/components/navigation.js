class Navigation {
    constructor() {
        this.navPanel = document.querySelector('.nav__panel');
        this.navTrigger = document.querySelector('.nav__trigger');
        this.navItems = document.querySelectorAll('.nav__item');
        this.isOpen = false;

        this.init();
    }

    init() {
        this.navTrigger.addEventListener('click', () => this.toggle());

        this.navItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const href = item.dataset.href;
                if (href === '/') {
                    this.scrollToTop();
                } else {
                    this.navigate(href);
                }
                this.close();
            });
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.nav') && !e.target.closest('.nav__trigger')) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.navPanel.classList.add('nav__panel_open');
        this.navTrigger.style.opacity = '0';
        this.navTrigger.style.pointerEvents = 'none';
        this.isOpen = true;
    }

    close() {
        this.navPanel.classList.remove('nav__panel_open');
        this.navTrigger.style.opacity = '1';
        this.navTrigger.style.pointerEvents = 'all';
        this.isOpen = false;
    }

    setActive(index) {
        this.navItems.forEach(item => item.classList.remove('nav__item_active'));
        if (this.navItems[index]) {
            this.navItems[index].classList.add('nav__item_active');
        }
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navigate(href) {
        window.location.href = href;
    }
}