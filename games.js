document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('gameModal');
    const gameCards = document.querySelectorAll('.game-card');
    const closeButton = modal?.querySelector('.game-modal__close');
    const overlay = modal?.querySelector('.game-modal__overlay');
    const gameTitle = document.getElementById('gameTitle');
    const gameCanvas = document.getElementById('gameCanvas');
    const gameScore = document.getElementById('gameScore');
    const restartButton = document.querySelector('.game-modal__restart');
    
    let currentGame = null;
    let gameInterval = null;
    let score = 0;
    let canvas = null;
    let ctx = null;

    const gameNames = {
        pong: 'Пинг-понг',
        snake: 'Змейка',
        tetris: 'Тетрис'
    };

    function openGame(gameType) {
        if (modal) {
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            currentGame = gameType;
            gameTitle.textContent = gameNames[gameType] || 'Игра';
            score = 0;
            if (gameScore) gameScore.textContent = score;
            startGame(gameType);
        }
    }

    function closeGame() {
        if (modal) {
            modal.classList.remove('is-open');
            document.body.style.overflow = '';
            stopGame();
            if (gameCanvas) gameCanvas.innerHTML = '';
        }
    }

    function stopGame() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
        canvas = null;
        ctx = null;
    }

    function startGame(gameType) {
        if (!gameCanvas) return;
        
        gameCanvas.innerHTML = '';
        
        canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.background = '#1a2a33';
        canvas.style.borderRadius = '8px';
        canvas.style.display = 'block';
        gameCanvas.appendChild(canvas);
        
        ctx = canvas.getContext('2d');
        
        switch(gameType) {
            case 'pong':
                startPong();
                break;
            case 'snake':
                startSnake();
                break;
            case 'tetris':
                startTetris();
                break;
            case 'doom':  
                startDoom();
                break;
            default:
                gameCanvas.innerHTML = '<p style="opacity: 0.7; text-align: center; margin-top: 100px;">Игра в разработке</p>';
        }
    }

    // === ПИНГ-ПОНГ ===
function startPong() {
    let ball = { x: 200, y: 200, dx: 3, dy: 3, radius: 8 };
    let paddle1 = { x: 10, y: 160, width: 10, height: 80 };
    let paddle2 = { x: 380, y: 160, width: 10, height: 80 };
    let keys = {};

    document.addEventListener('keydown', (e) => { keys[e.code] = true; });
    document.addEventListener('keyup', (e) => { keys[e.code] = false; });

    function draw() {
        if (!ctx || !canvas) return;
        
        ctx.fillStyle = '#1a2a33';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(200, 0);
        ctx.lineTo(200, 400);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#e28395';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
        ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
        
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy *= -1;
        }
        
        if (ball.x - ball.radius < paddle1.x + paddle1.width && 
            ball.x > paddle1.x && ball.y > paddle1.y && ball.y < paddle1.y + paddle1.height && ball.dx < 0) {
            ball.dx = Math.abs(ball.dx);
            if (Math.abs(ball.dx) < 8) ball.dx *= 1.05;
        }
        
        if (ball.x + ball.radius > paddle2.x && 
            ball.x < paddle2.x + paddle2.width && ball.y > paddle2.y && ball.y < paddle2.y + paddle2.height && ball.dx > 0) {
            ball.dx = -Math.abs(ball.dx);
        }
        
        if (ball.x < 0) {
            score = 0;
            if (gameScore) gameScore.textContent = score;
            ball.x = 200; ball.y = 200; ball.dx = 3; ball.dy = 3 * (Math.random() > 0.5 ? 1 : -1);
        }
        
        if (ball.x > canvas.width) {
            score++;
            if (gameScore) gameScore.textContent = score;
            ball.x = 200; ball.y = 200; ball.dx = -3; ball.dy = 3 * (Math.random() > 0.5 ? 1 : -1);
        }
        
        // === УЛУЧШЕННЫЙ ИИ ===
        let paddle2Center = paddle2.y + paddle2.height / 2;
        
        // Если мяч движется к ИИ (вправо)
        if (ball.dx > 0) {
            // Предсказываем позицию мяча
            let timeToReach = (paddle2.x - ball.x) / ball.dx;
            let predictedY = ball.y + ball.dy * timeToReach;
            
            // Учитываем отскоки от стен
            while (predictedY < 0 || predictedY > canvas.height) {
                if (predictedY < 0) predictedY = -predictedY;
                if (predictedY > canvas.height) predictedY = 2 * canvas.height - predictedY;
            }
            
            // Быстрое движение к предсказанной позиции
            let diff = predictedY - paddle2Center;
            let aiSpeed = 6; // Увеличенная скорость
            
            if (Math.abs(diff) > 10) {
                if (diff > 0) {
                    paddle2.y += aiSpeed;
                } else {
                    paddle2.y -= aiSpeed;
                }
            }
        } else {
            // Если мяч летит от ИИ, медленно возвращаемся в центр
            let centerDiff = (canvas.height / 2) - paddle2Center;
            if (Math.abs(centerDiff) > 20) {
                paddle2.y += centerDiff > 0 ? 2 : -2;
            }
        }
        
        // Ограничения для ИИ
        paddle2.y = Math.max(0, Math.min(canvas.height - paddle2.height, paddle2.y));
        
        if ((keys['ArrowUp'] || keys['KeyW']) && paddle1.y > 0) paddle1.y -= 10;
        if ((keys['ArrowDown'] || keys['KeyS']) && paddle1.y < canvas.height - paddle1.height) paddle1.y += 10;
    }

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(draw, 1000 / 60);
    
    const instructions = document.createElement('p');
    instructions.className = 'game-modal__instructions';
    instructions.style.cssText = 'margin-top: 16px; opacity: 0.6; font-size: 14px; text-align: center;';
    instructions.textContent = 'Управление: W/S или ↑/↓ | Забивай голы ИИ!';
    gameCanvas.appendChild(instructions);
}
    // === ЗМЕЙКА (ИСПРАВЛЕННАЯ - ВНУТРИ DOMContentLoaded) ===
    function startSnake() {
        if (!canvas || !ctx) return;
        
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        let food = { x: 15, y: 15 };
        let dx = 1, dy = 0;
        let changingDirection = false;

        function createFood() {
            let newFood;
            do {
                newFood = {
                    x: Math.floor(Math.random() * tileCount),
                    y: Math.floor(Math.random() * tileCount)
                };
            } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
            return newFood;
        }

        function changeDirection(event) {
            if (changingDirection) return;
            changingDirection = true;
            
            const key = event.keyCode;
            const goingUp = dy === -1, goingDown = dy === 1;
            const goingLeft = dx === -1, goingRight = dx === 1;

            if ((key === 37 || key === 65) && !goingRight) { dx = -1; dy = 0; }
            if ((key === 38 || key === 87) && !goingDown) { dx = 0; dy = -1; }
            if ((key === 39 || key === 68) && !goingLeft) { dx = 1; dy = 0; }
            if ((key === 40 || key === 83) && !goingUp) { dx = 0; dy = 1; }
        }

        function drawSnake() {
            if (!ctx || !canvas) return;
            
            ctx.fillStyle = '#1a2a33';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount ||
                snake.some(s => s.x === head.x && s.y === head.y)) {
                resetGame();
                return;
            }
            
            snake.unshift(head);
            
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                if (gameScore) gameScore.textContent = score;
                food = createFood();
            } else {
                snake.pop();
            }
            
            snake.forEach((seg, i) => {
                ctx.fillStyle = i === 0 ? '#e28395' : '#fff';
                ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
            });
            
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);
            
            changingDirection = false;
        }

        function resetGame() {
            snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
            dx = 1; dy = 0;
            score = 0;
            if (gameScore) gameScore.textContent = score;
            food = createFood();
        }

        document.addEventListener('keydown', changeDirection);
        
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(drawSnake, 100);
        
        const instructions = document.createElement('p');
        instructions.className = 'game-modal__instructions';
        instructions.style.cssText = 'margin-top: 16px; opacity: 0.6; font-size: 14px; text-align: center;';
        instructions.textContent = 'Управление: Стрелки или WASD';
        gameCanvas.appendChild(instructions);
        
        drawSnake();
    }

    // === ТЕТРИС ===
    function startTetris() {
        if (!canvas || !ctx) return;
        
        const cols = 10, rows = 20, blockSize = 20, offsetX = 100, offsetY = 0;
        const pieces = [[[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]]];
        const colors = ['#00f5ff','#ffeb3b','#e28395','#ff9800','#2196f3','#4caf50','#f44336'];
        
        let board = Array(rows).fill().map(() => Array(cols).fill(0));
        let currentPiece = null, currentColor = null, currentX = 0, currentY = 0;
        let dropCounter = 0, dropInterval = 1000, lastTime = 0;

        function createPiece() {
            const idx = Math.floor(Math.random() * pieces.length);
            currentPiece = pieces[idx];
            currentColor = colors[idx];
            currentX = Math.floor((cols - currentPiece[0].length) / 2);
            currentY = 0;
            if (collide(board, currentPiece, currentX, currentY)) resetGame();
        }

        function collide(board, piece, ox, oy) {
            for (let y = 0; y < piece.length; y++) {
                for (let x = 0; x < piece[y].length; x++) {
                    if (piece[y][x] !== 0) {
                        const nx = x + ox, ny = y + oy;
                        if (nx < 0 || nx >= cols || ny >= rows) return true;
                        if (ny >= 0 && board[ny][nx] !== 0) return true;
                    }
                }
            }
            return false;
        }

        function merge(board, piece, ox, oy, color) {
            for (let y = 0; y < piece.length; y++) {
                for (let x = 0; x < piece[y].length; x++) {
                    if (piece[y][x] !== 0) {
                        const ny = y + oy, nx = x + ox;
                        if (ny >= 0) board[ny][nx] = color;
                    }
                }
            }
        }

        function rotate(piece) {
            return piece[0].map((_, i) => piece.map(row => row[i]).reverse());
        }

        function playerRotate() {
            const r = rotate(currentPiece);
            if (!collide(board, r, currentX, currentY)) currentPiece = r;
        }

        function playerDrop() {
            if (!collide(board, currentPiece, currentX, currentY + 1)) {
                currentY++;
            } else {
                merge(board, currentPiece, currentX, currentY, currentColor);
                arenaSweep();
                createPiece();
            }
            dropCounter = 0;
        }

        function playerMove(dir) {
            if (!collide(board, currentPiece, currentX + dir, currentY)) currentX += dir;
        }

        function arenaSweep() {
            let cnt = 0;
            outer: for (let y = rows - 1; y > 0; y--) {
                for (let x = 0; x < cols; x++) {
                    if (board[y][x] === 0) continue outer;
                }
                board.splice(y, 1);
                board.unshift(Array(cols).fill(0));
                y++; cnt++;
            }
            if (cnt > 0) { score += cnt * 100; if (gameScore) gameScore.textContent = score; }
        }

        function draw() {
            if (!ctx || !canvas) return;
            ctx.fillStyle = '#1a2a33';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(offsetX - 2, offsetY - 2, cols * blockSize + 4, rows * blockSize + 4);
            
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    if (board[y][x] !== 0) {
                        ctx.fillStyle = board[y][x];
                        ctx.fillRect(offsetX + x * blockSize + 1, offsetY + y * blockSize + 1, blockSize - 2, blockSize - 2);
                    }
                }
            }
            if (currentPiece) {
                ctx.fillStyle = currentColor;
                for (let y = 0; y < currentPiece.length; y++) {
                    for (let x = 0; x < currentPiece[y].length; x++) {
                        if (currentPiece[y][x] !== 0) {
                            ctx.fillRect(offsetX + (x + currentX) * blockSize + 1, offsetY + (y + currentY) * blockSize + 1, blockSize - 2, blockSize - 2);
                        }
                    }
                }
            }
        }

        function update(time = 0) {
            if (!modal || !modal.classList.contains('is-open')) return;
            const dt = time - lastTime; lastTime = time;
            dropCounter += dt;
            if (dropCounter > dropInterval) playerDrop();
            draw();
            gameInterval = requestAnimationFrame(update);
        }

        function resetGame() {
            board = Array(rows).fill().map(() => Array(cols).fill(0));
            score = 0; if (gameScore) gameScore.textContent = score;
            dropInterval = 1000; createPiece();
        }

        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 37 || e.keyCode === 65) playerMove(-1);
            else if (e.keyCode === 39 || e.keyCode === 68) playerMove(1);
            else if (e.keyCode === 40 || e.keyCode === 83) playerDrop();
            else if (e.keyCode === 38 || e.keyCode === 87) playerRotate();
        });

        createPiece();
        update();
        
        const instructions = document.createElement('p');
        instructions.className = 'game-modal__instructions';
        instructions.style.cssText = 'margin-top: 16px; opacity: 0.6; font-size: 14px; text-align: center;';
        instructions.textContent = '← → / A D: движение | ↑ / W: поворот | ↓ / S: вниз';
        gameCanvas.appendChild(instructions);
    }

    // === DOOM-STYLE SHOOTER ===
function startDoom() {
    if (!canvas || !ctx) return;
    
    canvas.width = 600;
    canvas.height = 500;
    
    // Игрок
    const player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 15,
        speed: 3,
        angle: 0,
        health: 100
    };
    
    // Пули
    let bullets = [];
    
    // Враги
    let enemies = [];
    let enemySpawnTimer = 0;
    let enemySpawnInterval = 120; // Кадров между появлением врагов
    
    // Мышь
    let mouseX = canvas.width / 2;
    let mouseY = 0;
    let mouseDown = false;
    
    // Клавиши
    let keys = {};
    
    // Счёт
    let kills = 0;
    let wave = 1;
    
    // Частицы (кровь, взрывы)
    let particles = [];

    // Отслеживание мыши
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    
    canvas.addEventListener('mousedown', () => mouseDown = true);
    canvas.addEventListener('mouseup', () => mouseDown = false);
    
    document.addEventListener('keydown', (e) => keys[e.code] = true);
    document.addEventListener('keyup', (e) => keys[e.code] = false);

    function spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: x = Math.random() * canvas.width; y = -30; break;
            case 1: x = canvas.width + 30; y = Math.random() * canvas.height; break;
            case 2: x = Math.random() * canvas.width; y = canvas.height + 30; break;
            case 3: x = -30; y = Math.random() * canvas.height; break;
        }
        
        enemies.push({
            x: x,
            y: y,
            radius: 18,
            speed: 1 + Math.random() * 1.5 + (wave * 0.2),
            health: 20 + (wave * 5)
        });
    }

    function createParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 8,
                dy: (Math.random() - 0.5) * 8,
                life: 1,
                color: color
            });
        }
    }

    function update() {
        // Движение игрока
        if ((keys['KeyW'] || keys['ArrowUp']) && player.y > player.radius) {
            player.y -= player.speed;
        }
        if ((keys['KeyS'] || keys['ArrowDown']) && player.y < canvas.height - player.radius) {
            player.y += player.speed;
        }
        if ((keys['KeyA'] || keys['ArrowLeft']) && player.x > player.radius) {
            player.x -= player.speed;
        }
        if ((keys['KeyD'] || keys['ArrowRight']) && player.x < canvas.width - player.radius) {
            player.x += player.speed;
        }
        
        // Угол поворота к мыши
        player.angle = Math.atan2(mouseY - player.y, mouseX - player.x);
        
        // Стрельба
        if (mouseDown && bullets.length < 5) {
            bullets.push({
                x: player.x + Math.cos(player.angle) * 20,
                y: player.y + Math.sin(player.angle) * 20,
                dx: Math.cos(player.angle) * 10,
                dy: Math.sin(player.angle) * 10,
                radius: 4
            });
            mouseDown = false; // Полуавтомат
        }
        
        // Обновление пуль
        bullets = bullets.filter(bullet => {
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
            
            // Удаление пуль за экраном
            return bullet.x > 0 && bullet.x < canvas.width && 
                   bullet.y > 0 && bullet.y < canvas.height;
        });
        
        // Спавн врагов
        enemySpawnTimer++;
        if (enemySpawnTimer >= enemySpawnInterval) {
            spawnEnemy();
            enemySpawnTimer = 0;
            // Усложнение
            if (enemySpawnInterval > 40) enemySpawnInterval -= 2;
        }
        
        // Обновление врагов
        enemies = enemies.filter(enemy => {
            // Движение к игроку
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.x += Math.cos(angle) * enemy.speed;
            enemy.y += Math.sin(angle) * enemy.speed;
            
            // Столкновение с игроком
            const distToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            if (distToPlayer < player.radius + enemy.radius) {
                player.health -= 10;
                createParticles(enemy.x, enemy.y, '#ff0000', 10);
                return false;
            }
            
            // Столкновение с пулями
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                const distToBullet = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
                
                if (distToBullet < enemy.radius + bullet.radius) {
                    enemy.health -= 10;
                    createParticles(enemy.x, enemy.y, '#8b0000', 5);
                    bullets.splice(i, 1);
                    
                    if (enemy.health <= 0) {
                        kills++;
                        score = kills * 100;
                        if (gameScore) gameScore.textContent = score;
                        createParticles(enemy.x, enemy.y, '#e28395', 15);
                        return false;
                    }
                }
            }
            
            return true;
        });
        
        // Обновление частиц
        particles = particles.filter(p => {
            p.x += p.dx;
            p.y += p.dy;
            p.life -= 0.02;
            p.dx *= 0.98;
            p.dy *= 0.98;
            return p.life > 0;
        });
        
        // Проверка конца игры
        if (player.health <= 0) {
            resetGame();
        }
        
        // Увеличение волны
        wave = Math.floor(kills / 10) + 1;
    }

    function draw() {
        // Очистка с тёмным фоном
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Сетка на полу (эффект 3D)
        ctx.strokeStyle = 'rgba(226, 131, 149, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
        
        // Частицы
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Пули
        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        bullets.forEach(bullet => {
            ctx.beginPath();
            ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
        
        // Враги (демоны)
        enemies.forEach(enemy => {
            // Тело
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Глаза
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(enemy.x - 6, enemy.y - 4, 4, 0, Math.PI * 2);
            ctx.arc(enemy.x + 6, enemy.y - 4, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Полоска здоровья
            const barWidth = 30;
            const barHeight = 4;
            ctx.fillStyle = '#333';
            ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.radius - 10, barWidth, barHeight);
            ctx.fillStyle = '#e28395';
            ctx.fillRect(enemy.x - barWidth/2, enemy.y - enemy.radius - 10, 
                        barWidth * (enemy.health / (20 + wave * 5)), barHeight);
        });
        
        // Игрок (космодесантник)
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);
        
        // Тело
        ctx.fillStyle = '#4a6fa5';
        ctx.beginPath();
        ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Пушка
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, -6, 25, 12);
        
        ctx.restore();
        
        // Интерфейс
        // Здоровье
        ctx.fillStyle = '#333';
        ctx.fillRect(10, 10, 200, 25);
        ctx.fillStyle = player.health > 30 ? '#e28395' : '#ff0000';
        ctx.fillRect(10, 10, player.health * 2, 25);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 200, 25);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`HEALTH: ${Math.max(0, player.health)}%`, 20, 27);
        
        // Волна
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.fillText(`WAVE: ${wave}`, canvas.width - 80, 27);
        
        // Прицел
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mouseX - 10, mouseY);
        ctx.lineTo(mouseX + 10, mouseY);
        ctx.moveTo(mouseX, mouseY - 10);
        ctx.lineTo(mouseX, mouseY + 10);
        ctx.stroke();
    }

    function resetGame() {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.health = 100;
        bullets = [];
        enemies = [];
        particles = [];
        kills = 0;
        wave = 1;
        enemySpawnInterval = 120;
        score = 0;
        if (gameScore) gameScore.textContent = score;
    }

    function gameLoop() {
        if (!modal || !modal.classList.contains('is-open')) return;
        update();
        draw();
        gameInterval = requestAnimationFrame(gameLoop);
    }

    // Добавляем инструкцию
    const instructions = document.createElement('p');
    instructions.className = 'game-modal__instructions';
    instructions.style.cssText = 'margin-top: 16px; opacity: 0.6; font-size: 14px; text-align: center;';
    instructions.textContent = 'WASD: движение | Мышь: прицел | Клик: стрельба';
    gameCanvas.appendChild(instructions);
    
    gameLoop();
}   

    // Обработчики событий
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameType = card.getAttribute('data-game');
            openGame(gameType);
        });
    });

    if (closeButton) closeButton.addEventListener('click', closeGame);
    if (overlay) overlay.addEventListener('click', closeGame);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeGame();
    });
    if (restartButton) restartButton.addEventListener('click', () => {
        if (currentGame) startGame(currentGame);
    });

    
});

