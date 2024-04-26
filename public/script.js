document.addEventListener('DOMContentLoaded', function() {
    const boardSize = 15;
    let gameBoard = createBoardArray(boardSize);
    const gameBoardDiv = document.getElementById('gameBoard');
    const startButton = document.getElementById('startButton');
    const restartButton = document.getElementById('restartButton');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    startButton.addEventListener('click', function() {
        gameBoard = createBoardArray(boardSize); // 게임 보드 배열 초기화
        drawGameBoard(gameBoardDiv, gameBoard); // 게임 보드 그리기
        this.disabled = true;
        restartButton.disabled = false;
    });

    restartButton.addEventListener('click', function() {
        gameBoard = createBoardArray(boardSize); // 게임 보드 배열 초기화
        drawGameBoard(gameBoardDiv, gameBoard); // 게임 보드 다시 그리기
    });

    sendButton.addEventListener('click', function() {
        const message = chatInput.value;
        if (message) {
            postChatMessage(message); // 채팅 메시지 서버에 전송
            addChatMessage("나", message); // 채팅창에 사용자 메시지 추가
            chatInput.value = ''; // 입력창 초기화
        }
    });

    function createBoardArray(size) {
        return Array.from({ length: size }, () => Array(size).fill('X'));
    }

    function drawGameBoard(gameBoardDiv, gameBoard) {
        gameBoardDiv.innerHTML = ''; // 게임 보드 초기화
        gameBoard.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.classList.add('cell');
                if (cell !== 'X') {
                    cellDiv.classList.add(cell === 'B' ? 'black' : 'white');
                }
                cellDiv.addEventListener('click', () => handleCellClick(rowIndex, colIndex));
                gameBoardDiv.appendChild(cellDiv);
            });
        });
    }

    function handleCellClick(row, col) {
        try {
            if (gameBoard[row][col] === 'X') {
                placeStone(row, col, 'B');
                postTurn(gameBoard); // 게임 보드 상태 서버에 전송
            }
        } catch (err) {
            placeStone(row, col, 'X');
        }
    }

    function placeStone(row, col, color) {
        gameBoard[row][col] = color;
        drawGameBoard(gameBoardDiv, gameBoard);
    }

    // 서버에 채팅 메시지 전송
    function postChatMessage(message) {
        fetch('/game/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'chat',
                message: message
            }),
        })
        .then(response => response.json())
        .then(data => {
            addChatMessage("AI", data.message); // 채팅창에 AI 메시지 추가
        })
        .catch(error => console.error('Error:', error));
    }

    function postTurn(board) {
        fetch('/game/turn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                board: board
            }),
        })
        .then(response => response.json())
        .then(data => {
            placeStone(data.row, data.col, 'W'); // AI의 수를 게임판에 그리기
            addChatMessage("AI", data.message); // 채팅창에 AI의 메시지 추가
        })
        .catch(error => {
            console.error('Error:', error)
            throw error;
        });
    }

    function addChatMessage(sender, message) {
        var chatBox = document.getElementById('chatBox');
        var newMessage = document.createElement('div');
        newMessage.textContent = `${sender}: ${message}`;
        chatBox.appendChild(newMessage);
    }
});
