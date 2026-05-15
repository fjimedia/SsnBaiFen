class TextReader {
    constructor() {
        this.reader = document.getElementById('textReader');
        this.popup = document.getElementById('wordPopup');

        if (this.reader) {
            this.init();
        }
    }

    init() {
        this.reader.addEventListener('click', (e) => {
            const word = e.target.closest('.text-word');
            if (word) {
                this.showPopup(word, e);
            }
        });

        document.addEventListener('click', (e) => {
            if (this.popup && !e.target.closest('.popup') && !e.target.closest('.text-word')) {
                this.hidePopup();
            }
        });

        const closeBtn = document.getElementById('closePopupBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePopup());
        }

        const saveBtn = document.getElementById('saveWordBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveWord());
        }

        const audioBtn = document.getElementById('popupAudioBtn');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                const pinyin = document.getElementById('popupPinyin').textContent;
                audioUtils.play(pinyin);
            });
        }
    }

    showPopup(word, event) {
        if (!this.popup) return;

        const char = word.dataset.char;
        const pinyin = word.dataset.pinyin;
        const translation = word.dataset.translation;
        const example = word.dataset.example;

        document.getElementById('popupChar').textContent = char;
        document.getElementById('popupPinyin').textContent = pinyin;
        document.getElementById('popupTranslation').textContent = translation;
        document.getElementById('popupExample').innerHTML = `<strong>Пример:</strong> ${example}`;

        const rect = word.getBoundingClientRect();
        this.popup.style.left = `${rect.left + rect.width / 2}px`;
        this.popup.style.top = `${rect.bottom + 10}px`;
        this.popup.classList.add('popup_active');

        this.positionPopup();
    }

    hidePopup() {
        if (this.popup) {
            this.popup.classList.remove('popup_active');
        }
    }

    positionPopup() {
        if (!this.popup) return;

        const rect = this.popup.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (rect.right > windowWidth) {
            this.popup.style.left = `${windowWidth - rect.width - 20}px`;
        }
        if (rect.bottom > windowHeight) {
            this.popup.style.top = `${windowHeight - rect.height - 20}px`;
        }
        if (rect.left < 0) {
            this.popup.style.left = '20px';
        }
        if (rect.top < 0) {
            this.popup.style.top = '20px';
        }
    }

    saveWord() {
        const char = document.getElementById('popupChar').textContent;
        const pinyin = document.getElementById('popupPinyin').textContent;
        const translation = document.getElementById('popupTranslation').textContent;

        this.showNotification(`Слово "${char}" сохранено`);
        this.hidePopup();
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification notification_active';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 1500);
    }
}