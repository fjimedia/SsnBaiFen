const API_URL = 'http://localhost:3000/api';

const SLIDES = [
    {
        id: 'cards',
        title: 'Интерактивные карточки',
        chinese: '汉字学习',
        description: 'Изучайте иероглифы через SRS-систему повторений с аудио произношением и контекстными примерами'
    },
    {
        id: 'audio',
        title: 'Иммерсивное аудирование',
        chinese: '沉浸式听力训练',
        description: 'Тренируйте восприятие китайской речи через пространственное аудио и адаптированные диалоги'
    },
    {
        id: 'texts',
        title: 'Адаптированные тексты',
        chinese: '分级阅读文本',
        description: 'Читайте китайские тексты с синхронным аудио, интерактивным словарем и заданиями на понимание'
    }
];

const NAV_ITEMS = [
    { label: 'Главная', href: '/', slide: 0 },
    { label: 'Карточки', href: '/learn/cards', slide: 1 },
    { label: 'Аудирование', href: '/learn/audio', slide: 2 },
    { label: 'Тексты', href: '/learn/texts', slide: 3 },
    { label: 'Игры', href: '/games' },
    { label: 'Прогресс', href: '/profile/progress' },
    { label: 'Войти', href: '/auth/login' }
];

const HSK_LEVELS = [
    { value: 1, label: 'HSK 1' },
    { value: 2, label: 'HSK 2' },
    { value: 3, label: 'HSK 3' },
    { value: 4, label: 'HSK 4' },
    { value: 5, label: 'HSK 5' },
    { value: 6, label: 'HSK 6' },
    { value: 7, label: 'HSK 7' },
    { value: 8, label: 'HSK 8' },
    { value: 9, label: 'HSK 9' }
];