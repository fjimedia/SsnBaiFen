class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero__slide');
        this.arrows = document.querySelectorAll('.slider__arrow');
        this.dots = document.querySelectorAll('.slider__dot');
        this.currentIndex = 0;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        this.arrows.forEach(arrow => {
            arrow.addEventListener('click', () => {
                const direction = arrow.dataset.direction;
                if (direction === 'prev') {
                    this.prev();
                } else {
                    this.next();
                }
            });
        });

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goTo(index);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') this.prev();
            if (e.key === 'ArrowDown') this.next();
        });

        let touchStartY = 0;
        const container = document.querySelector('.hero');

        container.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });

        container.addEventListener('touchend', (e) => {
            const diff = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.next();
                else this.prev();
            }
        });
    }

    goTo(index) {
        if (index === this.currentIndex || this.isTransitioning) return;

        this.isTransitioning = true;

        const currentSlide = this.slides[this.currentIndex];
        const nextSlide = this.slides[index];

        currentSlide.classList.add('hero__slide_exit');
        currentSlide.classList.remove('hero__slide_active');

        setTimeout(() => {
            currentSlide.classList.remove('hero__slide_exit');
            nextSlide.classList.add('hero__slide_active', 'hero__slide_enter');

            setTimeout(() => {
                nextSlide.classList.remove('hero__slide_enter');
                this.isTransitioning = false;
            }, 500);
        }, 300);

        this.currentIndex = index;
        this.updateControls();
    }

    next() {
        const next = (this.currentIndex + 1) % this.slides.length;
        this.goTo(next);
    }

    prev() {
        const prev = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.goTo(prev);
    }

    updateControls() {
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('slider__dot_active', i === this.currentIndex);
        });

        this.arrows.forEach(arrow => {
            arrow.disabled = false;
        });
    }
}