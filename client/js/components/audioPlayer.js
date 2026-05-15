class AudioPlayer {
    constructor() {
        this.canvas = document.getElementById('audioCanvas');
        this.isPlaying = false;
        this.animationId = null;
        this.time = 0;

        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    start() {
        if (!this.canvas || this.isPlaying) return;
        this.isPlaying = true;
        this.draw();
    }

    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    draw() {
        if (!this.isPlaying || !this.ctx) return;

        const ctx = this.ctx;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const waveCount = 8;

        for (let i = 0; i < waveCount; i++) {
            const radius = 50 + i * 20;
            const amplitude = 10 * Math.sin(this.time * 2 + i * 0.5);

            ctx.beginPath();
            ctx.strokeStyle = `rgba(150, 40, 39, ${0.3 - i * 0.03})`;
            ctx.lineWidth = 2;

            for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
                const x = centerX + (radius + amplitude * Math.sin(this.time * 3 + angle * 5)) * Math.cos(angle);
                const y = centerY + (radius + amplitude * Math.sin(this.time * 3 + angle * 5)) * Math.sin(angle);

                if (angle === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.closePath();
            ctx.stroke();
        }

        this.time += 0.01;
        this.animationId = requestAnimationFrame(() => this.draw());
    }
}