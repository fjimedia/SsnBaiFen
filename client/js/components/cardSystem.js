class CardSystem {
    constructor() {
        this.cards = document.querySelectorAll('.cards__item');

        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('click', () => this.flip(card));

            const audioBtn = card.querySelector('.cards__audio');
            if (audioBtn) {
                audioBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const pinyin = card.querySelector('.cards__pinyin').textContent;
                    this.playAudio(pinyin);
                });
            }
        });
    }

    flip(card) {
        card.classList.toggle('cards__item_flipped');
    }

    playAudio(text) {
        audioUtils.play(text);
    }

    addCard(data) {
        const container = document.querySelector('.cards');
        if (!container) return;

        const card = document.createElement('div');
        card.className = 'cards__item';

        card.innerHTML = `
            <div class="cards__front">
                <div class="cards__character">${data.chinese}</div>
                <div class="cards__pinyin">${data.pinyin}</div>
                <div class="cards__meaning">${data.translation}</div>
            </div>
            <div class="cards__back">
                <div class="cards__character">${data.chinese}</div>
                <div class="cards__pinyin">${data.pinyin}</div>
                <div class="cards__meaning">${data.translation}</div>
                <div class="cards__example">${data.example || ''}</div>
                <button class="cards__audio">
                    <span>🔊</span>
                </button>
            </div>
        `;

        card.addEventListener('click', () => this.flip(card));
        const audioBtn = card.querySelector('.cards__audio');
        if (audioBtn) {
            audioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playAudio(data.pinyin);
            });
        }

        container.appendChild(card);
    }

    loadCards(cardsData) {
        const container = document.querySelector('.cards');
        if (!container) return;

        container.innerHTML = '';
        cardsData.forEach(data => this.addCard(data));
    }
}