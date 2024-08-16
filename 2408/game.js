// DOMContentLoaded文档加载完成后立即触发函数
document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const size = 4;
    let cells = [];//数组是管理游戏棋盘状态的核心数据结构，它使得能够高效地操作和管理游戏中的每个单元格
    let score = 0;//得分

    /**
 * 创建游戏棋盘
 * 该函数通过循环创建足够数量的单元格，以形成游戏棋盘
 * 单元格是通过添加'div'元素并应用'cell'类来创建的
 * 所有创建的单元格都会被添加到一个全局数组cells中，以便后续操作
 * 在棋盘创建完成后，会调用addNumber函数两次，以初始化游戏数值
 */
    function createBoard() {
        // 循环创建足够数量的单元格，以形成size * size的游戏棋盘
        for (let i = 0; i < size * size; i++) {
            // 创建一个新的'div'元素，并为其添加'cell'类
            const cell = document.createElement('div');
            cell.classList.add('cell');
            // 将创建的单元格添加到游戏棋盘中
            gameBoard.appendChild(cell);
            // 将创建的单元格添加到cells数组中，以便后续可以通过数组访问每个单元格
            cells.push(cell);
        }
        // 调用addNumber函数两次，以在棋盘上初始化两个随机数值，这是游戏的起始数值
        addNumber();
        addNumber();
    }

    /**
 * 随机在空单元格中添加数字2或4
 * 
 * 该函数首先找出所有空的单元格，然后随机选择一个空单元格
 * 在大多数情况下（90%的概率），会在选中的空单元格中添加数字2
 * 在较少的情况下（10%的概率），会在选中的空单元格中添加数字4
 * 添加的数字通过innerText设置，并且会给单元格添加相应的class，以便样式化
 * 
 * @returns {void} 如果没有空单元格，则函数不执行任何操作
 */
    function addNumber() {
        // 找出所有空的单元格
        let nullCells = cells.filter(cell => cell.innerText === '');
        // 如果没有空单元格，直接返回
        if (nullCells.length === 0) return;
        // 随机选择一个空单元格
        let randomCell = nullCells[Math.floor(Math.random() * nullCells.length)];
        // 随机决定在选中的空单元格中添加2还是4
        randomCell.innerText = Math.random() > 0.1 ? 2 : 4;
        // 给单元格添加相应的class
        randomCell.classList.add(`cell-${randomCell.innerText}`);
    }

    /**
 * 根据指定方向移动游戏盘面
 * @param {string} direction - 移动方向，可以是'left'、'right'、'up'、'down'之一
 */
    function move(direction) {
        // 初始化移动标志，用于判断是否发生了移动
        let hasMoved = false;
        // 遍历每一行或每一列
        for (let i = 0; i < size; i++) {
            // 临时存储一行或一列的单元格数据
            let rowOrCol = [];
            // 遍历每个单元格，根据移动方向收集单元格数据
            for (let j = 0; j < size; j++) {
                // 根据移动方向计算单元格索引
                let index = direction === 'left' || direction === 'right' ? i * size + j : j * size + i;
                // 将单元格数据添加到临时数组中
                rowOrCol.push(cells[index]);
            }
            // 如果是向右或向下移动，需要将数组反转以便后续处理
            if (direction === 'right' || direction === 'down') rowOrCol.reverse();
            // 对收集到的一行或一列数据进行滑动处理
            let newRowOrCol = slide(rowOrCol);
            // 如果是向右或向下移动，处理后需要再次反转数组
            if (direction === 'right' || direction === 'down') newRowOrCol.reverse();
            // 将处理后的数据更新回单元格，并检查是否发生了移动
            for (let j = 0; j < size; j++) {
                // 根据移动方向计算单元格索引
                let index = direction === 'left' || direction === 'right' ? i * size + j : j * size + i;
                // 如果单元格内容发生变化，则标记为已移动
                if (cells[index].innerText !== newRowOrCol[j].innerText) hasMoved = true;
                // 更新单元格内容和类名
                cells[index].innerText = newRowOrCol[j].innerText;
                cells[index].className = 'cell';
                // 根据单元格内容添加相应的类名
                if (cells[index].innerText !== '') cells[index].classList.add(`cell-${cells[index].innerText}`);
            }
        }
        // 如果发生了移动，则添加新数字、更新得分，并检查游戏是否结束
        if (hasMoved) {
            addNumber();
            updateScore();
            if (checkGameOver()) {
                setTimeout(() => alert('游戏结束!'), 100);
            }
        }
    }

    /**
 * 执行滑动操作，对给定的行或列进行合并计算
 * @param {Array} rowOrCol 一个包含单元格（div元素）的数组，代表一行或一列
 * @returns {Array} 返回一个更新后的行或列，包含合并后的结果
 */
    function slide(rowOrCol) {
        // 过滤出所有非空的单元格，并将单元格内的文本转换为整数
        let arr = rowOrCol.filter(cell => cell.innerText !== '').map(cell => parseInt(cell.innerText));

        // 遍历数组，对相邻相等的元素进行合并
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2; // 合并元素，分数翻倍
                score += arr[i];  // 更新分数
                arr.splice(i + 1, 1); // 移除下一个元素，因为已经合并了
            }
        }

        // 当数组长度小于设定的大小时，用空字符串填充数组末尾
        while (arr.length < size) arr.push('');

        // 根据合并结果创建新的单元格数组
        return arr.map(num => {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.innerText = num;
            return cell;
        });
    }

    /**
 * 处理键盘事件的函数
 * 根据按下的键执行相应的移动操作
 * 
 * @param {KeyboardEvent} e - 键盘事件对象
 * 该函数通过事件对象的key属性来判断用户按下的具体键
 */
    function handleKey(e) {
        // 根据不同的箭头键执行相应的移动操作
        switch (e.key) {
            case 'ArrowUp':
                move('up');
                break;
            case 'ArrowDown':
                move('down');
                break;
            case 'ArrowLeft':
                move('left');
                break;
            case 'ArrowRight':
                move('right');
                break;
        }
    }

    /**
 * 更新得分显示
 * 
 * 此函数的作用是将当前得分更新到页面上的得分显示元素中
 * 它通过修改元素的innerText属性来实现得分的更新
 * 
 * @returns {void} 该函数没有返回值
 */
    function updateScore() {
        scoreElement.innerText = score;
    }

    /**
 * 检查游戏是否结束
 * 该函数通过检查棋盘上的所有位置，判断游戏是否已经结束
 * 棋盘被表示为一维数组，数组的长度为size的平方
 * 每个位置上可能有游戏元素的文本内容，或者为空字符串
 * 
 * @returns {boolean} 返回一个布尔值，表示游戏是否已经结束
 * 如果棋盘上还有空位置，或者有相邻的相同元素，则游戏尚未结束，返回false
 * 否则，游戏结束，返回true
 */
    function checkGameOver() {
        // 遍历棋盘上的每个位置
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // 计算当前位置在数组中的索引
                let index = i * size + j;
                // 检查当前位置是否为空，如果为空，则游戏尚未结束
                if (cells[index].innerText === '') return false;
                // 检查当前位置的右边是否有相同的元素，如果有，则游戏尚未结束
                if (j < size - 1 && cells[index].innerText === cells[index + 1].innerText) return false;
                // 检查当前位置的下边是否有相同的元素，如果有，则游戏尚未结束
                if (i < size - 1 && cells[index].innerText === cells[index + size].innerText) return false;
            }
        }
        // 如果所有位置都填满且没有相邻的相同元素，则游戏结束
        return true;
    }

    createBoard();
    document.addEventListener('keydown', handleKey);
});

