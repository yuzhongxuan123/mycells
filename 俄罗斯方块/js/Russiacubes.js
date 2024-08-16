const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");
const modal = document.getElementById("myModal");
const instructionsButton = document.getElementById("instructions");
const span = document.getElementsByClassName("close")[0];

context.scale(20, 20);

// 按钮功能
startButton.addEventListener("click", () => {
    update();
});

resetButton.addEventListener("click", () => {
    location.reload();
});

// 展示操作说明文档
instructionsButton.addEventListener("click", () => {
    modal.style.display = "block";
});

span.addEventListener("click", () => {
    modal.style.display = "none";
});

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// 当方块发生碰撞后，停止掉落
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                    y + offset.y,
                    1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    // 高度和宽度已经在 HTML
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

// 确保方块进行左右移动时，仍在场内
function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
        (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// 设置方块跌落速度
let dropCounter = 0;
let dropInterval = 1000; // 1000 毫秒 = 1 秒，方块每秒掉落一格

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        playerRotate(1);
    }
});

let colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];
colors = colors.map((value, index) => {
    return index != 0 ? getRandomColor() : null
})

const arena = createMatrix(12, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
};

playerReset();
updateScore();
//update();



/*

arenaSweep：检查游戏区域中是否有完整的行，如果有，则清除这些行，并根据清除的行数计算得分。
collide：判断方块是否与游戏区域发生碰撞。
createMatrix：创建一个指定宽度和高度的矩阵，并初始化为 0。
createPiece：根据给定的类型创建不同形状的方块矩阵。
drawMatrix：根据矩阵和偏移量在画布上绘制方块。
draw：绘制游戏画面，包括游戏区域和当前方块。
merge：将当前方块合并到游戏区域中。
rotate：旋转方块矩阵。
playerDrop：使方块下落，如果下落过程中发生碰撞，则进行相应的处理，如合并方块、重置方块位置、清除行和更新得分。
playerMove：使方块左右移动，如果移动过程中发生碰撞，则将方块移动回原来的位置。
playerReset：重置方块的位置和形状。
playerRotate：旋转方块，如果旋转过程中发生碰撞，则尝试调整方块的位置，直到不发生碰撞为止。
update：游戏的核心更新函数，根据时间间隔控制方块的下落，并不断绘制游戏画面。
updateScore：更新得分显示。
document.addEventListener('keydown', event => {...})：监听键盘事件，根据按键控制方块的移动和旋转。
colors：定义了不同方块的颜色。
arena：创建游戏区域的矩阵。
player：包含方块的位置、矩阵和得分等信息。

*/