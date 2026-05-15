const audioUtils = {
    play(text, lang = 'zh-CN') {
        if (!('speechSynthesis' in window)) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.8;
        utterance.pitch = 1;

        const voices = speechSynthesis.getVoices();
        const voice = voices.find(v =>
            v.lang.includes(lang.split('-')[0])
        );

        if (voice) {
            utterance.voice = voice;
        }

        speechSynthesis.speak(utterance);
    },

    stop() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
    }
};