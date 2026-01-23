// ==================== КОНФИГУРАЦИЯ ====================
const CONFIG = {
    SCENE: {
        FOV: 75,
        NEAR: 0.1,
        FAR: 1000,
        BACKGROUND_COLOR: 0x0a0a0f
    },
    COLORS: {
        RED: 0xff2e2e,
        BLUE: 0x3366ff,
        GREEN: 0x33ff99,
        GOLD: 0xffd700
    },
    ANIMATION: {
        DURATION: 0.5,
        EASE: "power2.out"
    }
};

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let scene, camera, renderer, controls;
let logoScene, cardsScene, audioScene, constructorScene;
let currentSection = 'cards';
let audioContext, analyser, audioSource;
let particles = [];
let draggedObject = null;

// ==================== ИНИЦИАЛИЗАЦИЯ 3D ====================
function initThreeJS() {
    // Инициализация всех сцен
    initLogoScene();
    initCardsScene();
    initAudioScene();
    initConstructorScene();
    
    // Настройка ресайза
    window.addEventListener('resize', onWindowResize);
    
    // Запуск рендера
    animate();
}

// ==================== СЦЕНА ЛОГОТИПА ====================
function initLogoScene() {
    const canvas = document.getElementById('logoCanvas');
    logoScene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    camera.position.z = 3;
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true, 
        antialias: true 
    });
    renderer.setSize(80, 80);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Создание 3D логотипа
    const geometry = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16);
    const material = new THREE.MeshStandardMaterial({
        color: CONFIG.COLORS.RED,
        metalness: 0.7,
        roughness: 0.2,
        emissive: CONFIG.COLORS.RED,
        emissiveIntensity: 0.3
    });
    
    const logo = new THREE.Mesh(geometry, material);
    logoScene.add(logo);
    
    // Добавление света
    const light1 = new THREE.PointLight(CONFIG.COLORS.RED, 2, 10);
    light1.position.set(2, 2, 2);
    logoScene.add(light1);
    
    const light2 = new THREE.PointLight(CONFIG.COLORS.BLUE, 2, 10);
    light2.position.set(-2, -2, 2);
    logoScene.add(light2);
    
    // Анимация логотипа
    function animateLogo() {
        requestAnimationFrame(animateLogo);
        
        logo.rotation.x += 0.01;
        logo.rotation.y += 0.005;
        
        const time = Date.now() * 0.001;
        light1.position.x = Math.sin(time) * 2;
        light1.position.y = Math.cos(time) * 2;
        
        renderer.render(logoScene, camera);
    }
    
    animateLogo();
}

// ==================== СЦЕНА КАРТОЧЕК ====================
function initCardsScene() {
    const canvas = document.getElementById('cards3dCanvas');
    cardsScene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 15;
    
    renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // OrbitControls для вращения сцены
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Добавление света
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    cardsScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    cardsScene.add(directionalLight);
    
    // Создание карточек
    createCards3D();
    
    // Анимация частиц
    createParticles();
}

function createCards3D() {
    const cardData = [
        { word: "你好", pinyin: "nǐ hǎo", meaning: "Привет", color: CONFIG.COLORS.RED },
        { word: "谢谢", pinyin: "xiè xiè", meaning: "Спасибо", color: CONFIG.COLORS.BLUE },
        { word: "爱", pinyin: "ài", meaning: "Любовь", color: CONFIG.COLORS.GREEN },
        { word: "学习", pinyin: "xué xí", meaning: "Учиться", color: CONFIG.COLORS.GOLD }
    ];
    
    const cardSpacing = 4;
    
    cardData.forEach((card, index) => {
        // Создание карточки как плоскости
        const geometry = new THREE.PlaneGeometry(3, 4);
        const material = new THREE.MeshStandardMaterial({
            color: card.color,
            side: THREE.DoubleSide,
            metalness: 0.3,
            roughness: 0.4
        });
        
        const cardMesh = new THREE.Mesh(geometry, material);
        cardMesh.position.x = (index - (cardData.length - 1) / 2) * cardSpacing;
        cardMesh.position.y = Math.sin(index) * 2;
        cardMesh.userData = card;
        
        // Добавление текста на карточку
        addTextToCard(cardMesh, card);
        
        cardsScene.add(cardMesh);
        
        // Анимация вращения
        cardMesh.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02
        };
        
        // Добавление интерактивности
        cardMesh.userData.originalPosition = cardMesh.position.clone();
        cardMesh.userData.originalRotation = cardMesh.rotation.clone();
        
        // События мыши
        cardMesh.userData.hovered = false;
        
        // Raycaster для взаимодействия
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        function onMouseMove(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(cardMesh);
            
            if (intersects.length > 0 && !cardMesh.userData.hovered) {
                cardMesh.userData.hovered = true;
                gsap.to(cardMesh.scale, {
                    x: 1.2,
                    y: 1.2,
                    z: 1.2,
                    duration: 0.3
                });
            } else if (intersects.length === 0 && cardMesh.userData.hovered) {
                cardMesh.userData.hovered = false;
                gsap.to(cardMesh.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.3
                });
            }
        }
        
        window.addEventListener('mousemove', onMouseMove);
    });
}

function addTextToCard(cardMesh, card) {
    // Здесь можно добавить 3D текст
    // Для простоты используем спрайты или создаем текстуру
}

function createParticles() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    
    const particles = new THREE.Points(geometry, material);
    cardsScene.add(particles);
}

// ==================== АУДИО СЦЕНА ====================
function initAudioScene() {
    const canvas = document.getElementById('audio3dCanvas');
    audioScene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Создание аудио контекста
    initAudioContext();
    
    // Создание визуализации
    createAudioVisualization();
    
    // Анимация сцены
    function animateAudioScene() {
        requestAnimationFrame(animateAudioScene);
        
        if (analyser) {
            updateAudioVisualization();
        }
        
        renderer.render(audioScene, camera);
    }
    
    animateAudioScene();
}

function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    // Создание тестового аудио
    createTestAudio();
}

function createTestAudio() {
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // oscillator.start();
    // oscillator.stop(audioContext.currentTime + 2);
}

function createAudioVisualization() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Создание сетки для визуализации
    const geometry = new THREE.PlaneGeometry(20, 10, bufferLength / 2, 10);
    const material = new THREE.MeshBasicMaterial({
        color: CONFIG.COLORS.BLUE,
        wireframe: true,
        transparent: true,
        opacity: 0.7
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    audioScene.add(mesh);
    
    // Функция обновления визуализации
    function updateAudioVisualization() {
        analyser.getByteFrequencyData(dataArray);
        
        const positions = geometry.attributes.position.array;
        
        for (let i = 0; i < bufferLength / 2; i++) {
            const value = dataArray[i] / 128.0;
            
            for (let j = 0; j < 11; j++) {
                const index = (i * 11 + j) * 3 + 2; // Z координата
                positions[index] = value * 5;
            }
        }
        
        geometry.attributes.position.needsUpdate = true;
    }
}

// ==================== КОНСТРУКТОР СЦЕНА ====================
function initConstructorScene() {
    const canvas = document.getElementById('constructorCanvas');
    constructorScene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 10, 20);
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Добавление сетки
    const gridHelper = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
    constructorScene.add(gridHelper);
    
    // Добавление осей
    const axesHelper = new THREE.AxesHelper(10);
    constructorScene.add(axesHelper);
    
    // Свет
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    constructorScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    constructorScene.add(directionalLight);
    
    // Анимация
    function animateConstructor() {
        requestAnimationFrame(animateConstructor);
        renderer.render(constructorScene, camera);
    }
    
    animateConstructor();
}

// ==================== ИНТЕРАКТИВНЫЕ КАРТОЧКИ ====================
class Card3D {
    constructor(word, pinyin, translation, audioUrl = null) {
        this.word = word;
        this.pinyin = pinyin;
        this.translation = translation;
        this.audioUrl = audioUrl;
        this.isFlipped = false;
        this.mesh = null;
        
        this.init();
    }
    
    init() {
        // Создание карточки
        const geometry = new THREE.BoxGeometry(3, 4, 0.1);
        const material = new THREE.MeshStandardMaterial({
            color: this.getRandomColor(),
            metalness: 0.3,
            roughness: 0.4
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Добавление текста
        this.addText();
        
        // Добавление интерактивности
        this.addInteractivity();
    }
    
    getRandomColor() {
        const colors = [CONFIG.COLORS.RED, CONFIG.COLORS.BLUE, CONFIG.COLORS.GREEN, CONFIG.COLORS.GOLD];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    addText() {
        // Создание текстуры с текстом
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.word, 256, 150);
        
        ctx.font = '30px Arial';
        ctx.fillText(this.pinyin, 256, 250);
        
        ctx.font = '25px Arial';
        ctx.fillText(this.translation, 256, 350);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        
        // Создание плоскости для текста
        const textGeometry = new THREE.PlaneGeometry(2.8, 3.8);
        const textMesh = new THREE.Mesh(textGeometry, material);
        textMesh.position.z = 0.06;
        
        this.mesh.add(textMesh);
    }
    
    addInteractivity() {
        this.mesh.userData.card = this;
        
        // Добавление hover эффекта
        this.mesh.userData.originalScale = this.mesh.scale.clone();
        
        // Raycasting для взаимодействия
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.mesh.onMouseOver = () => {
            gsap.to(this.mesh.scale, {
                x: 1.2,
                y: 1.2,
                z: 1.2,
                duration: 0.3
            });
            
            // Добавление свечения
            this.mesh.material.emissive = new THREE.Color(0x333333);
            this.mesh.material.emissiveIntensity = 0.5;
        };
        
        this.mesh.onMouseOut = () => {
            gsap.to(this.mesh.scale, {
                x: 1,
                y: 1,
                z: 1,
                duration: 0.3
            });
            
            this.mesh.material.emissiveIntensity = 0;
        };
        
        this.mesh.onClick = () => {
            this.flip();
            
            // Воспроизведение аудио
            if (this.audioUrl) {
                this.playAudio();
            }
        };
    }
    
    flip() {
        this.isFlipped = !this.isFlipped;
        
        gsap.to(this.mesh.rotation, {
            y: this.isFlipped ? Math.PI : 0,
            duration: 0.6,
            ease: "power2.inOut"
        });
    }
    
    playAudio() {
        if (!this.audioUrl) return;
        
        const audio = new Audio(this.audioUrl);
        audio.play().catch(e => console.log("Audio play failed:", e));
    }
    
    setPosition(x, y, z) {
        this.mesh.position.set(x, y, z);
    }
    
    addToScene(scene) {
        scene.add(this.mesh);
    }
}

// ==================== АУДИО ПЛЕЙЕР ====================
class AudioPlayer3D {
    constructor() {
        this.isPlaying = false;
        this.currentAudio = null;
        this.sources = [];
        this.pannerNodes = [];
        
        this.init();
    }
    
    init() {
        // Инициализация Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        
        // Создание источников звука
        this.createSoundSources();
    }
    
    createSoundSources() {
        const sourceElements = document.querySelectorAll('.sound-source');
        
        sourceElements.forEach((element, index) => {
            const source = {
                element: element,
                audioBuffer: null,
                sourceNode: null,
                pannerNode: null
            };
            
            // Создание PannerNode для 3D позиционирования
            source.pannerNode = this.audioContext.createPanner();
            source.pannerNode.panningModel = 'HRTF';
            source.pannerNode.distanceModel = 'inverse';
            source.pannerNode.maxDistance = 10000;
            source.pannerNode.refDistance = 1;
            source.pannerNode.rolloffFactor = 1;
            source.pannerNode.connect(this.masterGain);
            
            // Установка позиции в 3D пространстве
            const position = element.getAttribute('data-position');
            this.setSourcePosition(source, position);
            
            // Добавление drag & drop
            this.makeDraggable(element, source);
            
            this.sources.push(source);
        });
    }
    
    setSourcePosition(source, position) {
        const positions = {
            'left': { x: -5, y: 0, z: 0 },
            'center': { x: 0, y: 0, z: 0 },
            'right': { x: 5, y: 0, z: 0 }
        };
        
        const pos = positions[position] || positions.center;
        source.pannerNode.positionX.value = pos.x;
        source.pannerNode.positionY.value = pos.y;
        source.pannerNode.positionZ.value = pos.z;
    }
    
    makeDraggable(element, source) {
        let isDragging = false;
        let startX, startY;
        
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // Обновление позиции в 3D пространстве
            const x = (deltaX / window.innerWidth) * 20 - 10;
            const z = (deltaY / window.innerHeight) * 20 - 10;
            
            source.pannerNode.positionX.value = x;
            source.pannerNode.positionZ.value = z;
            
            // Обновление позиции элемента
            element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        };
        
        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }
    
    async loadAudio(url, sourceIndex) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.sources[sourceIndex].audioBuffer = audioBuffer;
            return audioBuffer;
        } catch (error) {
            console.error('Error loading audio:', error);
            return null;
        }
    }
    
    playSource(sourceIndex, loop = false) {
        const source = this.sources[sourceIndex];
        if (!source.audioBuffer) return;
        
        if (source.sourceNode) {
            source.sourceNode.stop();
        }
        
        source.sourceNode = this.audioContext.createBufferSource();
        source.sourceNode.buffer = source.audioBuffer;
        source.sourceNode.loop = loop;
        source.sourceNode.connect(source.pannerNode);
        source.sourceNode.start();
    }
    
    stopSource(sourceIndex) {
        const source = this.sources[sourceIndex];
        if (source.sourceNode) {
            source.sourceNode.stop();
            source.sourceNode = null;
        }
    }
    
    setVolume(volume) {
        this.masterGain.gain.value = volume;
    }
}

// ==================== КОНСТРУКТОР ====================
class Constructor3D {
    constructor() {
        this.objects = [];
        this.selectedObject = null;
        this.tools = {};
        
        this.init();
    }
    
    init() {
        this.initTools();
        this.initEventListeners();
        this.initPropertiesPanel();
    }
    
    initTools() {
        this.tools = {
            text: {
                name: 'Text',
                icon: 'fas fa-font',
                create: () => this.createTextObject()
            },
            image: {
                name: 'Image',
                icon: 'fas fa-image',
                create: () => this.createImageObject()
            },
            model: {
                name: '3D Model',
                icon: 'fas fa-cube',
                create: () => this.createModelObject()
            },
            audio: {
                name: 'Audio',
                icon: 'fas fa-volume-up',
                create: () => this.createAudioObject()
            },
            quiz: {
                name: 'Quiz',
                icon: 'fas fa-question-circle',
                create: () => this.createQuizObject()
            }
        };
        
        // Инициализация кнопок инструментов
        Object.keys(this.tools).forEach(toolId => {
            const toolBtn = document.querySelector(`[data-tool="${toolId}"]`);
            if (toolBtn) {
                toolBtn.addEventListener('click', () => {
                    this.selectTool(toolId);
                    this.tools[toolId].create();
                });
            }
        });
    }
    
    initEventListeners() {
        // События для канваса конструктора
        const canvas = document.getElementById('constructorCanvas');
        
        canvas.addEventListener('click', (e) => this.onCanvasClick(e));
        canvas.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e));
        
        // События для свойств
        document.getElementById('posX').addEventListener('input', (e) => this.updateObjectPosition('x', e.target.value));
        document.getElementById('posY').addEventListener('input', (e) => this.updateObjectPosition('y', e.target.value));
        document.getElementById('posZ').addEventListener('input', (e) => this.updateObjectPosition('z', e.target.value));
        document.getElementById('rotation').addEventListener('input', (e) => this.updateObjectRotation(e.target.value));
        document.getElementById('scale').addEventListener('input', (e) => this.updateObjectScale(e.target.value / 100));
        document.getElementById('animationType').addEventListener('change', (e) => this.updateObjectAnimation(e.target.value));
        
        // Кнопка сохранения
        document.getElementById('saveProject').addEventListener('click', () => this.saveProject());
    }
    
    initPropertiesPanel() {
        // Инициализация панели свойств
    }
    
    selectTool(toolId) {
        // Сброс выделения всех инструментов
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Выделение выбранного инструмента
        const toolBtn = document.querySelector(`[data-tool="${toolId}"]`);
        if (toolBtn) {
            toolBtn.classList.add('active');
        }
        
        console.log(`Tool selected: ${toolId}`);
    }
    
    createTextObject() {
        const text = prompt('Введите текст:', '你好');
        if (!text) return;
        
        // Создание 3D текста
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, 256, 80);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true
        });
        
        const geometry = new THREE.PlaneGeometry(5, 1.25);
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            0
        );
        
        mesh.userData = {
            type: 'text',
            content: text,
            editable: true
        };
        
        constructorScene.add(mesh);
        this.objects.push(mesh);
        this.selectObject(mesh);
        
        this.showNotification(`Текст "${text}" добавлен`);
    }
    
    createImageObject() {
        // Создание имитации загрузки изображения
        const geometry = new THREE.PlaneGeometry(4, 3);
        const material = new THREE.MeshBasicMaterial({
            color: Math.random() * 0xffffff,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            0
        );
        
        mesh.userData = {
            type: 'image',
            editable: true
        };
        
        constructorScene.add(mesh);
        this.objects.push(mesh);
        this.selectObject(mesh);
        
        this.showNotification('Изображение добавлено');
    }
    
    createModelObject() {
        // Создание простой 3D модели
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({
            color: Math.random() * 0xffffff,
            metalness: 0.5,
            roughness: 0.5
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            0
        );
        
        mesh.userData = {
            type: 'model',
            editable: true
        };
        
        constructorScene.add(mesh);
        this.objects.push(mesh);
        this.selectObject(mesh);
        
        this.showNotification('3D модель добавлена');
    }
    
    createAudioObject() {
        // Создание аудио объекта
        const geometry = new THREE.SphereGeometry(1, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x3366ff,
            transparent: true,
            opacity: 0.7
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            0
        );
        
        // Добавление пульсации
        mesh.userData = {
            type: 'audio',
            audioUrl: null,
            isPlaying: false,
            pulseSpeed: 0.05
        };
        
        constructorScene.add(mesh);
        this.objects.push(mesh);
        this.selectObject(mesh);
        
        this.showNotification('Аудио объект добавлен');
    }
    
    createQuizObject() {
        // Создание интерактивного вопроса
        const geometry = new THREE.TetrahedronGeometry(1.5);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff3366,
            wireframe: true
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            0
        );
        
        mesh.userData = {
            type: 'quiz',
            question: 'Что означает "你好"?',
            options: ['Привет', 'Спасибо', 'Пока'],
            answer: 0
        };
        
        constructorScene.add(mesh);
        this.objects.push(mesh);
        this.selectObject(mesh);
        
        this.showNotification('Вопрос добавлен');
    }
    
    selectObject(object) {
        // Сброс предыдущего выделения
        if (this.selectedObject) {
            this.selectedObject.material.emissive.setHex(0x000000);
        }
        
        // Выделение нового объекта
        this.selectedObject = object;
        
        if (object.material.emissive) {
            object.material.emissive.setHex(0x333333);
        }
        
        // Обновление панели свойств
        this.updatePropertiesPanel(object);
    }
    
    updatePropertiesPanel(object) {
        if (!object) return;
        
        document.getElementById('posX').value = object.position.x;
        document.getElementById('posY').value = object.position.y;
        document.getElementById('posZ').value = object.position.z;
        document.getElementById('rotation').value = object.rotation.y * (180 / Math.PI);
        document.getElementById('scale').value = object.scale.x * 100;
    }
    
    updateObjectPosition(axis, value) {
        if (!this.selectedObject) return;
        
        const numValue = parseFloat(value);
        
        switch (axis) {
            case 'x':
                this.selectedObject.position.x = numValue;
                break;
            case 'y':
                this.selectedObject.position.y = numValue;
                break;
            case 'z':
                this.selectedObject.position.z = numValue;
                break;
        }
    }
    
    updateObjectRotation(value) {
        if (!this.selectedObject) return;
        
        const radians = parseFloat(value) * (Math.PI / 180);
        this.selectedObject.rotation.y = radians;
    }
    
    updateObjectScale(value) {
        if (!this.selectedObject) return;
        
        this.selectedObject.scale.set(value, value, value);
    }
    
    updateObjectAnimation(type) {
        if (!this.selectedObject) return;
        
        // Удаляем предыдущую анимацию
        gsap.killTweensOf(this.selectedObject.position);
        gsap.killTweensOf(this.selectedObject.rotation);
        
        switch (type) {
            case 'float':
                gsap.to(this.selectedObject.position, {
                    y: this.selectedObject.position.y + 2,
                    duration: 2,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });
                break;
                
            case 'rotate':
                gsap.to(this.selectedObject.rotation, {
                    y: Math.PI * 2,
                    duration: 4,
                    repeat: -1,
                    ease: "none"
                });
                break;
                
            case 'pulse':
                gsap.to(this.selectedObject.scale, {
                    x: this.selectedObject.scale.x * 1.5,
                    y: this.selectedObject.scale.y * 1.5,
                    z: this.selectedObject.scale.z * 1.5,
                    duration: 1,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });
                break;
        }
    }
    
    onCanvasClick(e) {
        // Raycasting для выбора объектов
        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const camera = constructorScene.children.find(child => child instanceof THREE.PerspectiveCamera);
        if (!camera) return;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(this.objects);
        
        if (intersects.length > 0) {
            this.selectObject(intersects[0].object);
        } else {
            this.selectObject(null);
        }
    }
    
    onCanvasMouseDown(e) {
        // Начало перетаскивания
        if (this.selectedObject) {
            draggedObject = this.selectedObject;
        }
    }
    
    onCanvasMouseMove(e) {
        // Перетаскивание объекта
        if (draggedObject) {
            const canvas = e.target;
            const rect = canvas.getBoundingClientRect();
            
            const x = ((e.clientX - rect.left) / rect.width) * 20 - 10;
            const y = -((e.clientY - rect.top) / rect.height) * 20 + 10;
            
            gsap.to(draggedObject.position, {
                x: x,
                y: y,
                duration: 0.1
            });
        }
    }
    
    onCanvasMouseUp(e) {
        // Конец перетаскивания
        draggedObject = null;
    }
    
    saveProject() {
        const project = {
            objects: this.objects.map(obj => ({
                type: obj.userData.type,
                position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                rotation: obj.rotation.y,
                scale: obj.scale.x,
                userData: obj.userData
            })),
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(project, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `hanzi-project-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Проект сохранен!');
    }
    
    showNotification(message) {
        // Создание временного уведомления
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-icon">✨</div>
            <div class="notification-content">
                <div class="notification-title">Конструктор</div>
                <div class="notification-text">${message}</div>
            </div>
        `;
        
        const notificationCenter = document.getElementById('notificationCenter');
        notificationCenter.appendChild(notification);
        
        // Автоматическое удаление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.5s ease reverse';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ====================
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация 3D
    initThreeJS();
    
    // Инициализация конструктора
    const constructor = new Constructor3D();
    
    // Инициализация аудио плеера
    const audioPlayer = new AudioPlayer3D();
    
    // Навигация по секциям
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            
            // Обновление активного элемента навигации
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Переключение секций
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionId}Section`) {
                    section.classList.add('active');
                }
            });
            
            currentSection = sectionId;
            
            // Анимация перехода
            gsap.fromTo(`#${sectionId}Section`, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 }
            );
        });
    });
    
    // Управление карточками
    document.getElementById('shuffleCards').addEventListener('click', function() {
        // Анимация перемешивания карточек
        gsap.to('.card-3d', {
            x: () => Math.random() * 100 - 50,
            y: () => Math.random() * 100 - 50,
            rotation: () => Math.random() * Math.PI * 2,
            duration: 1,
            stagger: 0.1,
            ease: "back.out(1.7)"
        });
    });
    
    document.getElementById('flipAll').addEventListener('click', function() {
        // Переворот всех карточек
        const cards = document.querySelectorAll('.card-3d');
        cards.forEach(card => {
            card.classList.toggle('flipped');
        });
    });
    
    document.getElementById('newCard').addEventListener('click', function() {
        // Создание новой карточки
        const card = new Card3D(
            "新词", 
            "xīn cí", 
            "Новое слово"
        );
        
        card.setPosition(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            0
        );
        
        card.addToScene(cardsScene);
    });
    
    // Анимация социальных сфер
    const socialSpheres = document.querySelectorAll('.social-sphere');
    
    socialSpheres.forEach(sphere => {
        sphere.addEventListener('mouseenter', function() {
            gsap.to(this, {
                scale: 1.2,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });
        
        sphere.addEventListener('mouseleave', function() {
            gsap.to(this, {
                scale: 1,
                duration: 0.3,
                ease: "back.out(1.7)"
            });
        });
        
        sphere.addEventListener('click', function() {
            const social = this.getAttribute('data-social');
            const urls = {
                vk: 'https://vk.com',
                tg: 'https://telegram.org',
                yt: 'https://youtube.com',
                ig: 'https://instagram.com'
            };
            
            window.open(urls[social], '_blank');
        });
    });
    
    // Анимация поиска
    const searchInput = document.getElementById('searchInput');
    const searchWave = document.querySelector('.search-wave');
    
    searchInput.addEventListener('focus', function() {
        gsap.to(searchWave, {
            scale: 1.5,
            duration: 0.5,
            repeat: -1,
            yoyo: true
        });
    });
    
    searchInput.addEventListener('blur', function() {
        gsap.killTweensOf(searchWave);
        gsap.to(searchWave, {
            scale: 1,
            duration: 0.3
        });
    });
    
    // 3D аватар пользователя
    function initAvatar3D() {
        const canvas = document.getElementById('avatarCanvas');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
        camera.position.z = 2;
        
        const renderer = new THREE.WebGLRenderer({ 
            canvas, 
            alpha: true,
            antialias: true 
        });
        renderer.setSize(40, 40);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Создание геометрической сферы для аватара
        const geometry = new THREE.IcosahedronGeometry(1, 2);
        const material = new THREE.MeshStandardMaterial({
            color: CONFIG.COLORS.GOLD,
            metalness: 0.7,
            roughness: 0.2,
            emissive: CONFIG.COLORS.GOLD,
            emissiveIntensity: 0.2
        });
        
        const avatar = new THREE.Mesh(geometry, material);
        scene.add(avatar);
        
        // Добавление света
        const light = new THREE.PointLight(0xffffff, 1, 10);
        light.position.set(2, 2, 2);
        scene.add(light);
        
        // Анимация
        function animateAvatar() {
            requestAnimationFrame(animateAvatar);
            
            avatar.rotation.x += 0.01;
            avatar.rotation.y += 0.005;
            
            renderer.render(scene, camera);
        }
        
        animateAvatar();
    }
    
    initAvatar3D();
    
    // Плавная анимация появления всех элементов
    gsap.from('.left-panel, .top-nav, .content-section', {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out"
    });
    
    // Показ приветственного уведомления
    setTimeout(() => {
        const welcomeNotification = document.getElementById('welcomeNotification');
        gsap.fromTo(welcomeNotification,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
        );
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(() => {
            gsap.to(welcomeNotification, {
                x: 100,
                opacity: 0,
                duration: 0.5,
                onComplete: () => welcomeNotification.remove()
            });
        }, 5000);
    }, 1000);
});

// ==================== УТИЛИТЫ ====================
function onWindowResize() {
    // Обновление размеров всех канвасов
    const canvases = [
        'cards3dCanvas',
        'audio3dCanvas', 
        'constructorCanvas',
        'logoCanvas',
        'avatarCanvas'
    ];
    
    canvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        if (canvas && renderer) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    // Анимация текущей сцены
    if (currentSection === 'cards' && controls) {
        controls.update();
        
        // Анимация карточек
        cardsScene.children.forEach(child => {
            if (child.userData && child.userData.rotationSpeed) {
                child.rotation.x += child.userData.rotationSpeed.x;
                child.rotation.y += child.userData.rotationSpeed.y;
            }
        });
        
        renderer.render(cardsScene, camera);
    }
}