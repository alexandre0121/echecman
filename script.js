// ==================== JEU D'ÉCHECS COMPLET ====================
let board = Array(8).fill().map(() => Array(8).fill(null));
let turn = 'white';
let gameOver = false;
let winner = null;
let enPassantTarget = null;

let whiteKingMoved = false;
let whiteRookKingsideMoved = false;
let whiteRookQueensideMoved = false;
let blackKingMoved = false;
let blackRookKingsideMoved = false;
let blackRookQueensideMoved = false;

let selectedRow = null;
let selectedCol = null;
let validMovesList = [];

let flipped = false;
let capturedPieces = [];

const pieceImages = {
    'white_king': 'pieces_echec/roi_blanc.svg',
    'white_queen': 'pieces_echec/dame_blanche.svg',
    'white_rook': 'pieces_echec/tour_blanc.svg',
    'white_bishop': 'pieces_echec/foux_blanc.svg',
    'white_knight': 'pieces_echec/cavalier_blanc.svg',
    'white_pawn': 'pieces_echec/pions_blanc.svg',
    'black_king': 'pieces_echec/roi_noir.svg',
    'black_queen': 'pieces_echec/dame_noir.svg',
    'black_rook': 'pieces_echec/tour_noir.svg',
    'black_bishop': 'pieces_echec/foux_noir.svg',
    'black_knight': 'pieces_echec/cavalier_noir.svg',
    'black_pawn': 'pieces_echec/pions_noir.svg'
};

// ==================== INITIALISATION ====================
function initBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            board[i][j] = null;
        }
    }
    for (let c = 0; c < 8; c++) {
        board[6][c] = { piece: 'pawn', color: 'white' };
        board[1][c] = { piece: 'pawn', color: 'black' };
    }
    const w = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    const b = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let c = 0; c < 8; c++) {
        board[7][c] = { piece: w[c], color: 'white' };
        board[0][c] = { piece: b[c], color: 'black' };
    }
}

function resetGame() {
    initBoard();
    turn = 'white';
    gameOver = false;
    winner = null;
    enPassantTarget = null;
    whiteKingMoved = false;
    whiteRookKingsideMoved = false;
    whiteRookQueensideMoved = false;
    blackKingMoved = false;
    blackRookKingsideMoved = false;
    blackRookQueensideMoved = false;
    selectedRow = null;
    selectedCol = null;
    validMovesList = [];
    flipped = false;
    capturedPieces = [];
    renderBoard();
    updateStatusMessage();
}

function findKing(color) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j] && board[i][j].piece === 'king' && board[i][j].color === color)
                return { row: i, col: j };
        }
    }
    return null;
}

// ==================== DÉPLACEMENTS ====================
function getPseudoLegalMoves(row, col, ignoreKingSafety = false) {
    const piece = board[row][col];
    if (!piece) return [];
    const moves = [];
    const color = piece.color;

    if (piece.piece === 'rook') {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        for (let [dr,dc] of dirs) {
            for (let step = 1; step <= 7; step++) {
                const nr = row + dr*step, nc = col + dc*step;
                if (nr<0 || nr>7 || nc<0 || nc>7) break;
                const target = board[nr][nc];
                if (!target) moves.push({row:nr, col:nc});
                else { if (target.color !== color) moves.push({row:nr, col:nc}); break; }
            }
        }
    }
    else if (piece.piece === 'bishop') {
        const dirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
        for (let [dr,dc] of dirs) {
            for (let step = 1; step <= 7; step++) {
                const nr = row + dr*step, nc = col + dc*step;
                if (nr<0 || nr>7 || nc<0 || nc>7) break;
                const target = board[nr][nc];
                if (!target) moves.push({row:nr, col:nc});
                else { if (target.color !== color) moves.push({row:nr, col:nc}); break; }
            }
        }
    }
    else if (piece.piece === 'queen') {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
        for (let [dr,dc] of dirs) {
            for (let step = 1; step <= 7; step++) {
                const nr = row + dr*step, nc = col + dc*step;
                if (nr<0 || nr>7 || nc<0 || nc>7) break;
                const target = board[nr][nc];
                if (!target) moves.push({row:nr, col:nc});
                else { if (target.color !== color) moves.push({row:nr, col:nc}); break; }
            }
        }
    }
    else if (piece.piece === 'knight') {
        const offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for (let [dr,dc] of offsets) {
            const nr = row+dr, nc = col+dc;
            if (nr>=0 && nr<8 && nc>=0 && nc<8) {
                const target = board[nr][nc];
                if (!target || target.color !== color) moves.push({row:nr, col:nc});
            }
        }
    }
    else if (piece.piece === 'king') {
        for (let dr=-1; dr<=1; dr++) {
            for (let dc=-1; dc<=1; dc++) {
                if (dr===0 && dc===0) continue;
                const nr = row+dr, nc = col+dc;
                if (nr>=0 && nr<8 && nc>=0 && nc<8) {
                    const target = board[nr][nc];
                    if (!target || target.color !== color) moves.push({row:nr, col:nc});
                }
            }
        }
        if (!ignoreKingSafety) {
            const kingMoved = (color === 'white') ? whiteKingMoved : blackKingMoved;
            if (!kingMoved && !isSquareAttacked(row, col, color)) {
                const rookCol = 7;
                const rookMoved = (color === 'white') ? whiteRookKingsideMoved : blackRookKingsideMoved;
                const rook = board[row][rookCol];
                if (!rookMoved && rook && rook.piece === 'rook' && rook.color === color) {
                    if (!board[row][5] && !board[row][6] &&
                        !isSquareAttacked(row,5,color) && !isSquareAttacked(row,6,color))
                        moves.push({row:row, col:6});
                }
                const rookColLeft = 0;
                const rookMovedLeft = (color === 'white') ? whiteRookQueensideMoved : blackRookQueensideMoved;
                const rookLeft = board[row][rookColLeft];
                if (!rookMovedLeft && rookLeft && rookLeft.piece === 'rook' && rookLeft.color === color) {
                    if (!board[row][1] && !board[row][2] && !board[row][3] &&
                        !isSquareAttacked(row,2,color) && !isSquareAttacked(row,3,color))
                        moves.push({row:row, col:2});
                }
            }
        }
    }
    else if (piece.piece === 'pawn') {
        const dir = (color === 'white') ? -1 : 1;
        const startRow = (color === 'white') ? 6 : 1;
        const nr1 = row + dir;
        if (nr1>=0 && nr1<8 && !board[nr1][col]) {
            moves.push({row:nr1, col:col});
            if (row === startRow && nr1+dir>=0 && nr1+dir<8 && !board[nr1+dir][col])
                moves.push({row:nr1+dir, col:col});
        }
        for (let dc of [-1,1]) {
            const nr = row+dir, nc = col+dc;
            if (nr>=0 && nr<8 && nc>=0 && nc<8) {
                const target = board[nr][nc];
                if (target && target.color !== color) moves.push({row:nr, col:nc});
            }
        }
        if (enPassantTarget) {
            const epRow = enPassantTarget.row;
            const epCol = enPassantTarget.col;
            if (epRow === row + dir && Math.abs(epCol - col) === 1)
                moves.push({row: epRow, col: epCol});
        }
    }
    return moves;
}

function isSquareAttacked(row, col, defenderColor) {
    const attackerColor = defenderColor === 'white' ? 'black' : 'white';
    for (let i=0; i<8; i++) {
        for (let j=0; j<8; j++) {
            const piece = board[i][j];
            if (piece && piece.color === attackerColor) {
                const moves = getPseudoLegalMoves(i, j, true);
                if (moves.some(m => m.row === row && m.col === col)) return true;
            }
        }
    }
    return false;
}

function getLegalMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    const pseudoMoves = getPseudoLegalMoves(row, col, false);
    const legalMoves = [];
    const color = piece.color;

    for (let move of pseudoMoves) {
        const savedBoard = JSON.parse(JSON.stringify(board));
        const savedEnPassant = enPassantTarget;
        const savedWhiteKingMoved = whiteKingMoved;
        const savedWhiteRookKingside = whiteRookKingsideMoved;
        const savedWhiteRookQueenside = whiteRookQueensideMoved;
        const savedBlackKingMoved = blackKingMoved;
        const savedBlackRookKingside = blackRookKingsideMoved;
        const savedBlackRookQueenside = blackRookQueensideMoved;

        const fromPiece = board[row][col];
        let enPassantCapture = false;
        let capturedPawnPos = null;
        if (piece.piece === 'pawn' && enPassantTarget &&
            move.row === enPassantTarget.row && move.col === enPassantTarget.col) {
            enPassantCapture = true;
            capturedPawnPos = { row: row, col: move.col };
        }
        board[move.row][move.col] = fromPiece;
        board[row][col] = null;
        if (enPassantCapture && capturedPawnPos) board[capturedPawnPos.row][capturedPawnPos.col] = null;
        if (piece.piece === 'king' && Math.abs(move.col - col) === 2) {
            const rookFromCol = (move.col === 6) ? 7 : 0;
            const rookToCol = (move.col === 6) ? 5 : 3;
            const rook = board[row][rookFromCol];
            if (rook && rook.piece === 'rook') {
                board[row][rookToCol] = rook;
                board[row][rookFromCol] = null;
            }
        }
        const kingPos = findKing(color);
        let kingInCheck = false;
        if (kingPos) kingInCheck = isSquareAttacked(kingPos.row, kingPos.col, color);
        if (!kingInCheck) legalMoves.push(move);

        board = savedBoard;
        enPassantTarget = savedEnPassant;
        whiteKingMoved = savedWhiteKingMoved;
        whiteRookKingsideMoved = savedWhiteRookKingside;
        whiteRookQueensideMoved = savedWhiteRookQueenside;
        blackKingMoved = savedBlackKingMoved;
        blackRookKingsideMoved = savedBlackRookKingside;
        blackRookQueensideMoved = savedBlackRookQueenside;
    }
    return legalMoves;
}

// ==================== EXÉCUTION D'UN MOUVEMENT ====================
function executeMove(fromRow, fromCol, toRow, toCol, promotionPiece = 'queen') {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;
    const color = piece.color;

    let capturedTarget = board[toRow][toCol];
    let enPassantCapture = false;
    let capturedPawnPos = null;
    if (piece.piece === 'pawn' && enPassantTarget &&
        toRow === enPassantTarget.row && toCol === enPassantTarget.col) {
        enPassantCapture = true;
        capturedPawnPos = { row: fromRow, col: toCol };
        capturedTarget = board[capturedPawnPos.row][capturedPawnPos.col];
    }

    let isCastling = false;
    if (piece.piece === 'king' && Math.abs(toCol - fromCol) === 2) {
        isCastling = true;
        const rookFromCol = (toCol === 6) ? 7 : 0;
        const rookToCol = (toCol === 6) ? 5 : 3;
        const rook = board[fromRow][rookFromCol];
        if (rook && rook.piece === 'rook') {
            board[fromRow][rookToCol] = rook;
            board[fromRow][rookFromCol] = null;
        }
        if (color === 'white') whiteKingMoved = true;
        else blackKingMoved = true;
    }

    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    if (enPassantCapture && capturedPawnPos) {
        board[capturedPawnPos.row][capturedPawnPos.col] = null;
    }

    if (capturedTarget) {
        capturedPieces.push({
            color: capturedTarget.color,
            piece: capturedTarget.piece
        });
    }

    if (piece.piece === 'rook') {
        if (color === 'white') {
            if (fromCol === 0) whiteRookQueensideMoved = true;
            if (fromCol === 7) whiteRookKingsideMoved = true;
        } else {
            if (fromCol === 0) blackRookQueensideMoved = true;
            if (fromCol === 7) blackRookKingsideMoved = true;
        }
    }
    if (piece.piece === 'king' && !isCastling) {
        if (color === 'white') whiteKingMoved = true;
        else blackKingMoved = true;
    }

    if (piece.piece === 'pawn') {
        const promoRow = (color === 'white') ? 0 : 7;
        if (toRow === promoRow) {
            board[toRow][toCol] = { piece: promotionPiece, color: color };
        }
    }

    enPassantTarget = null;
    if (piece.piece === 'pawn' && Math.abs(toRow - fromRow) === 2) {
        const midRow = (fromRow + toRow) / 2;
        enPassantTarget = { row: midRow, col: toCol };
    }
    return true;
}

function isCheck(color) {
    const kingPos = findKing(color);
    if (!kingPos) return false;
    return isSquareAttacked(kingPos.row, kingPos.col, color);
}

function getGameStatus() {
    let hasLegalMove = false;
    for (let i=0; i<8; i++) {
        for (let j=0; j<8; j++) {
            const piece = board[i][j];
            if (piece && piece.color === turn) {
                if (getLegalMoves(i,j).length > 0) { hasLegalMove = true; break; }
            }
        }
    }
    if (!hasLegalMove) {
        if (isCheck(turn)) return { isOver: true, winner: turn === 'white' ? 'black' : 'white' };
        else return { isOver: true, winner: null };
    }
    return { isOver: false, winner: null };
}

// ==================== PROMOTION MODALE ====================
function showPromotionModal(color) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999;`;
        const modal = document.createElement('div');
        modal.style.cssText = `background:#f0d9b5;border-radius:12px;padding:24px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.5);`;
        modal.innerHTML = `<h2 style="margin:0 0 16px;font-family:sans-serif">Promotion ! Choisissez une pièce :</h2>`;
        const pieces = [
            { key: 'queen',  label: '♛ Dame' },
            { key: 'rook',   label: '♜ Tour' },
            { key: 'bishop', label: '♝ Fou'  },
            { key: 'knight', label: '♞ Cavalier' }
        ];
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:12px;justify-content:center;flex-wrap:wrap;';
        pieces.forEach(p => {
            const btn = document.createElement('button');
            btn.textContent = p.label;
            btn.style.cssText = `font-size:22px;padding:10px 18px;cursor:pointer;border-radius:8px;border:2px solid #b58863;background:${color==='white'?'#fff':'#333'};color:${color==='white'?'#000':'#fff'};`;
            btn.addEventListener('click', () => { document.body.removeChild(overlay); resolve(p.key); });
            btnRow.appendChild(btn);
        });
        modal.appendChild(btnRow);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
}

async function tryMove(fromRow, fromCol, toRow, toCol) {
    if (gameOver) return false;
    const piece = board[fromRow][fromCol];
    if (!piece || piece.color !== turn) return false;
    const legalMoves = getLegalMoves(fromRow, fromCol);
    if (!legalMoves.some(m => m.row === toRow && m.col === toCol)) return false;

    const savedBoard = JSON.parse(JSON.stringify(board));
    const savedEnPassant = enPassantTarget;
    const savedWhiteKingMoved = whiteKingMoved;
    const savedWhiteRookKingside = whiteRookKingsideMoved;
    const savedWhiteRookQueenside = whiteRookQueensideMoved;
    const savedBlackKingMoved = blackKingMoved;
    const savedBlackRookKingside = blackRookKingsideMoved;
    const savedBlackRookQueenside = blackRookQueensideMoved;

    const pieceMoving = board[fromRow][fromCol];
    const promoRow = (pieceMoving.color === 'white') ? 0 : 7;
    const isPromotion = (pieceMoving.piece === 'pawn' && toRow === promoRow);
    let promotionChoice = 'queen';
    if (isPromotion) {
        promotionChoice = await showPromotionModal(pieceMoving.color);
    }

    const success = executeMove(fromRow, fromCol, toRow, toCol, promotionChoice);
    if (!success) return false;

    if (isCheck(turn)) {
        board = savedBoard;
        enPassantTarget = savedEnPassant;
        whiteKingMoved = savedWhiteKingMoved;
        whiteRookKingsideMoved = savedWhiteRookKingside;
        whiteRookQueensideMoved = savedWhiteRookQueenside;
        blackKingMoved = savedBlackKingMoved;
        blackRookKingsideMoved = savedBlackRookKingside;
        blackRookQueensideMoved = savedBlackRookQueenside;
        return false;
    }

    turn = (turn === 'white') ? 'black' : 'white';
    const status = getGameStatus();
    if (status.isOver) { gameOver = true; winner = status.winner; }
    renderBoard();
    updateStatusMessage();
    return true;
}

// ==================== AFFICHAGE DES CAPTURES AVEC MULTIPLICATEUR ====================
function renderCapturedPieces() {
    const oldLeft = document.getElementById('capturedLeft');
    const oldRight = document.getElementById('capturedRight');
    if (oldLeft) oldLeft.remove();
    if (oldRight) oldRight.remove();

    const wrapper = document.getElementById('boardWrapper');
    if (!wrapper) return;

    // Compter les pièces par type et couleur
    const counts = {};
    capturedPieces.forEach(p => {
        const key = p.color + '_' + p.piece;
        counts[key] = (counts[key] || 0) + 1;
    });

    function createColumn(color, label, sideId) {
        const div = document.createElement('div');
        div.id = sideId;
        div.className = 'captured-side';

        const relevant = Object.keys(counts).filter(k => k.startsWith(color + '_'));
        if (relevant.length > 0) {
            const labelEl = document.createElement('div');
            labelEl.className = 'side-label';
            labelEl.textContent = label;
            div.appendChild(labelEl);

            relevant.forEach(key => {
                const pieceType = key.split('_')[1];
                const count = counts[key];
                const item = document.createElement('div');
                item.className = 'capture-item';
                const img = document.createElement('img');
                img.src = pieceImages[`${color}_${pieceType}`];
                img.title = `Pièce ${color} ${pieceType}`;
                img.style.width = '32px';
                img.style.height = '32px';
                item.appendChild(img);
                if (count > 1) {
                    const mult = document.createElement('span');
                    mult.textContent = '×' + count;
                    item.appendChild(mult);
                }
                div.appendChild(item);
            });
        } else {
            div.textContent = label === '♚ Noirs' ? '♚' : '♔';
            div.style.cssText += 'font-size:1.5rem;opacity:0.3;display:flex;align-items:center;justify-content:center;';
        }
        return div;
    }

    const leftDiv = createColumn('white', '♚ Noirs', 'capturedLeft');
    const rightDiv = createColumn('black', '♔ Blancs', 'capturedRight');

    wrapper.insertBefore(leftDiv, wrapper.firstChild);
    wrapper.appendChild(rightDiv);
}

// ==================== AFFICHAGE DU PLATEAU ====================
function renderBoard() {
    const oldTable = document.querySelector('table');
    let wrapper = document.getElementById('boardWrapper');

    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'boardWrapper';
        wrapper.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:16px;margin:20px auto;max-width:fit-content;';
        if (oldTable) oldTable.parentNode.insertBefore(wrapper, oldTable);
    }

    const LABELS = ['A','B','C','D','E','F','G','H'];
    const LABELS_FLIPPED = ['H','G','F','E','D','C','B','A'];
    const labels = flipped ? LABELS_FLIPPED : LABELS;

    function makeCorner() {
        const td = document.createElement('td');
        td.style.cssText = 'width:32px;height:32px;background:#d1a679;';
        return td;
    }

    function makeLetterRow() {
        const tr = document.createElement('tr');
        tr.appendChild(makeCorner());
        for (let colIdx = 0; colIdx < 8; colIdx++) {
            const td = document.createElement('td');
            td.textContent = labels[colIdx];
            td.style.cssText = 'width:60px;height:32px;text-align:center;font-weight:bold;background:#d1a679;font-family:sans-serif;font-size:14px;';
            tr.appendChild(td);
        }
        tr.appendChild(makeCorner());
        return tr;
    }

    const newTable = document.createElement('table');
    newTable.style.cssText = 'border-collapse:collapse;border:3px solid #4a2e1e;';
    newTable.appendChild(makeLetterRow());

    const rowIndices = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
    const colIndices = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

    for (let displayRow = 0; displayRow < 8; displayRow++) {
        const tr = document.createElement('tr');
        const r = rowIndices[displayRow];
        const numL = document.createElement('td');
        numL.textContent = 8 - r;
        numL.style.cssText = 'width:32px;height:60px;text-align:center;font-weight:bold;background:#d1a679;font-family:sans-serif;font-size:14px;';
        tr.appendChild(numL);

        for (let displayCol = 0; displayCol < 8; displayCol++) {
            const c = colIndices[displayCol];
            const td = document.createElement('td');
            td.style.cssText = 'width:60px;height:60px;text-align:center;vertical-align:middle;cursor:pointer;position:relative;box-sizing:border-box;border:1px solid #4a2e1e;';

            const piece = board[r][c];
            const isDark = (r + c) % 2 === 1;
            const isSelected = (selectedRow === r && selectedCol === c);
            const isValidMove = validMovesList.some(mv => mv.row === r && mv.col === c);
            const isKingInCheck = piece && piece.piece === 'king' && isCheck(piece.color);

            let bg;
            if (isKingInCheck)      bg = '#ff4444';
            else if (isSelected)    bg = '#f6f669';
            else if (isValidMove)   bg = isDark ? '#cdd26a' : '#aaa23a';
            else                    bg = isDark ? '#b58863' : '#f0d9b5';
            td.style.backgroundColor = bg;

            if (piece) {
                const src = pieceImages[`${piece.color}_${piece.piece}`];
                if (src) {
                    const img = document.createElement('img');
                    img.src = src;
                    img.style.cssText = 'width:48px;height:48px;display:block;margin:auto;pointer-events:none;';
                    td.appendChild(img);
                }
            }

            if (isValidMove && !piece) {
                const dot = document.createElement('div');
                dot.style.cssText = 'width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,0.25);position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;';
                td.appendChild(dot);
            }

            td.addEventListener('click', () => onSquareClick(r, c));
            tr.appendChild(td);
        }

        const numR = document.createElement('td');
        numR.textContent = 8 - r;
        numR.style.cssText = 'width:32px;height:60px;text-align:center;font-weight:bold;background:#d1a679;font-family:sans-serif;font-size:14px;';
        tr.appendChild(numR);
        newTable.appendChild(tr);
    }
    newTable.appendChild(makeLetterRow());

    if (oldTable) wrapper.replaceChild(newTable, oldTable);
    else wrapper.appendChild(newTable);

    addButtonsUnderBoard();
    renderCapturedPieces();
}

function addButtonsUnderBoard() {
    const oldContainer = document.getElementById('buttonContainer');
    if (oldContainer) oldContainer.remove();

    const wrapper = document.getElementById('boardWrapper');
    if (!wrapper) return;

    const container = document.createElement('div');
    container.id = 'buttonContainer';
    container.style.cssText = 'text-align:center;margin-top:15px;';

    const replayBtn = document.createElement('button');
    replayBtn.textContent = '⟳ Rejouer';
    replayBtn.style.cssText = 'font-size:18px;padding:10px 25px;background-color:#4CAF50;color:white;border:none;border-radius:8px;cursor:pointer;margin:0 8px;';
    replayBtn.addEventListener('click', resetGame);

    const flipBtn = document.createElement('button');
    flipBtn.textContent = '🔄 Retourner';
    flipBtn.style.cssText = 'font-size:18px;padding:10px 25px;background-color:#2196F3;color:white;border:none;border-radius:8px;cursor:pointer;margin:0 8px;';
    flipBtn.addEventListener('click', () => {
        flipped = !flipped;
        selectedRow = null;
        selectedCol = null;
        validMovesList = [];
        renderBoard();
    });

    container.appendChild(replayBtn);
    container.appendChild(flipBtn);
    wrapper.parentNode.insertBefore(container, wrapper.nextSibling);
}

function updateStatusMessage() {
    let statusDiv = document.getElementById('gameStatus');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'gameStatus';
        statusDiv.style.margin = '20px auto';
        statusDiv.style.fontSize = '1.3rem';
        statusDiv.style.fontWeight = 'bold';
        statusDiv.style.textAlign = 'center';
        statusDiv.style.padding = '10px 20px';
        statusDiv.style.borderRadius = '10px';
        statusDiv.style.backgroundColor = '#d1a679';
        statusDiv.style.display = 'inline-block';
        const wrapper = document.getElementById('boardWrapper');
        if (wrapper) {
            const div = document.createElement('div');
            div.style.textAlign = 'center';
            div.appendChild(statusDiv);
            wrapper.parentNode.insertBefore(div, wrapper.nextSibling);
        }
    }
    if (gameOver) {
        if (winner === 'white') {
            statusDiv.innerHTML = '🏆 ÉCHEC ET MAT ! Les Blancs gagnent ! 🏆';
            statusDiv.style.backgroundColor = '#90EE90';
        } else if (winner === 'black') {
            statusDiv.innerHTML = '🏆 ÉCHEC ET MAT ! Les Noirs gagnent ! 🏆';
            statusDiv.style.backgroundColor = '#90EE90';
        } else {
            statusDiv.innerHTML = '♟️ PAT ! Match nul ♟️';
            statusDiv.style.backgroundColor = '#FFD700';
        }
    } else {
        const checkMsg = isCheck(turn) ? ' ⚠️ ÉCHEC ! ⚠️' : '';
        statusDiv.innerHTML = `${turn === 'white' ? '♔ Blancs' : '♚ Noirs'} doivent jouer${checkMsg}`;
        statusDiv.style.backgroundColor = '#d1a679';
    }
}

function onSquareClick(row, col) {
    if (gameOver) return;
    if (selectedRow === null) {
        const piece = board[row][col];
        if (piece && piece.color === turn) {
            selectedRow = row;
            selectedCol = col;
            validMovesList = getLegalMoves(row, col);
            renderBoard();
        }
    } else {
        if (selectedRow === row && selectedCol === col) {
            selectedRow = null;
            selectedCol = null;
            validMovesList = [];
            renderBoard();
            return;
        }
        const piece = board[row][col];
        if (piece && piece.color === turn) {
            selectedRow = row;
            selectedCol = col;
            validMovesList = getLegalMoves(row, col);
            renderBoard();
            return;
        }
        const fromRow = selectedRow;
        const fromCol = selectedCol;
        selectedRow = null;
        selectedCol = null;
        validMovesList = [];
        tryMove(fromRow, fromCol, row, col);
        renderBoard();
    }
}

function initGame() {
    initBoard();
    renderBoard();
    updateStatusMessage();
}

let clickCount = 0;
function lep() {
    const btn = document.getElementById("button");
    if (btn) {
        if (clickCount % 2 === 0) {
            btn.style.backgroundColor = "blue";
            alert("Je change de couleur");
        } else {
            btn.style.backgroundColor = "red";
            alert("Je suis rouge");
        }
        clickCount++;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

window.lep = lep;