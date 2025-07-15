import React, { useState, useCallback } from 'react';

const ChessGame = () => {
  // Initial board setup
  const initialBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];

  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState('white');
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing');
  const [moveHistory, setMoveHistory] = useState([]);
  const [castlingRights, setCastlingRights] = useState({
    white: { kingside: true, queenside: true },
    black: { kingside: true, queenside: true }
  });
  const [enPassantTarget, setEnPassantTarget] = useState(null);

  // Piece symbols
  const pieceSymbols = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
    'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
  };

  const isWhitePiece = (piece) => piece && piece === piece.toUpperCase();
  const isBlackPiece = (piece) => piece && piece === piece.toLowerCase();

  const getPieceColor = (piece) => {
    if (!piece) return null;
    return isWhitePiece(piece) ? 'white' : 'black';
  };

  const isValidSquare = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;

  const findKing = (board, color) => {
    const king = color === 'white' ? 'K' : 'k';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (board[row][col] === king) {
          return [row, col];
        }
      }
    }
    return null;
  };

  const isSquareAttacked = (board, row, col, byColor) => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && getPieceColor(piece) === byColor) {
          const moves = getPossibleMoves(board, r, c, false);
          if (moves.some(([mr, mc]) => mr === row && mc === col)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const isInCheck = (board, color) => {
    const kingPos = findKing(board, color);
    if (!kingPos) return false;
    const enemyColor = color === 'white' ? 'black' : 'white';
    return isSquareAttacked(board, kingPos[0], kingPos[1], enemyColor);
  };

  const getPossibleMoves = (board, row, col, checkForCheck = true) => {
    const piece = board[row][col];
    if (!piece) return [];

    const moves = [];
    const color = getPieceColor(piece);
    const pieceType = piece.toLowerCase();

    switch (pieceType) {
      case 'p':
        // Pawn moves
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Forward move
        if (isValidSquare(row + direction, col) && !board[row + direction][col]) {
          moves.push([row + direction, col]);
          
          // Two squares forward from starting position
          if (row === startRow && !board[row + 2 * direction][col]) {
            moves.push([row + 2 * direction, col]);
          }
        }
        
        // Diagonal captures
        [-1, 1].forEach(dcol => {
          const newRow = row + direction;
          const newCol = col + dcol;
          if (isValidSquare(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (target && getPieceColor(target) !== color) {
              moves.push([newRow, newCol]);
            }
            // En passant
            if (enPassantTarget && enPassantTarget[0] === newRow && enPassantTarget[1] === newCol) {
              moves.push([newRow, newCol]);
            }
          }
        });
        break;

      case 'r':
        // Rook moves
        [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (!isValidSquare(newRow, newCol)) break;
            
            const target = board[newRow][newCol];
            if (!target) {
              moves.push([newRow, newCol]);
            } else {
              if (getPieceColor(target) !== color) {
                moves.push([newRow, newCol]);
              }
              break;
            }
          }
        });
        break;

      case 'n':
        // Knight moves
        [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => {
          const newRow = row + dr;
          const newCol = col + dc;
          if (isValidSquare(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (!target || getPieceColor(target) !== color) {
              moves.push([newRow, newCol]);
            }
          }
        });
        break;

      case 'b':
        // Bishop moves
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (!isValidSquare(newRow, newCol)) break;
            
            const target = board[newRow][newCol];
            if (!target) {
              moves.push([newRow, newCol]);
            } else {
              if (getPieceColor(target) !== color) {
                moves.push([newRow, newCol]);
              }
              break;
            }
          }
        });
        break;

      case 'q':
        // Queen moves (combination of rook and bishop)
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            const newRow = row + dr * i;
            const newCol = col + dc * i;
            if (!isValidSquare(newRow, newCol)) break;
            
            const target = board[newRow][newCol];
            if (!target) {
              moves.push([newRow, newCol]);
            } else {
              if (getPieceColor(target) !== color) {
                moves.push([newRow, newCol]);
              }
              break;
            }
          }
        });
        break;

      case 'k':
        // King moves
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => {
          const newRow = row + dr;
          const newCol = col + dc;
          if (isValidSquare(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (!target || getPieceColor(target) !== color) {
              moves.push([newRow, newCol]);
            }
          }
        });
        
        // Castling
        if (checkForCheck && !isInCheck(board, color)) {
          const castlingRow = color === 'white' ? 7 : 0;
          const rights = castlingRights[color];
          
          // Kingside castling
          if (rights.kingside && row === castlingRow && col === 4) {
            if (!board[castlingRow][5] && !board[castlingRow][6] && board[castlingRow][7] === (color === 'white' ? 'R' : 'r')) {
              if (!isSquareAttacked(board, castlingRow, 5, color === 'white' ? 'black' : 'white') &&
                  !isSquareAttacked(board, castlingRow, 6, color === 'white' ? 'black' : 'white')) {
                moves.push([castlingRow, 6]);
              }
            }
          }
          
          // Queenside castling
          if (rights.queenside && row === castlingRow && col === 4) {
            if (!board[castlingRow][3] && !board[castlingRow][2] && !board[castlingRow][1] && 
                board[castlingRow][0] === (color === 'white' ? 'R' : 'r')) {
              if (!isSquareAttacked(board, castlingRow, 3, color === 'white' ? 'black' : 'white') &&
                  !isSquareAttacked(board, castlingRow, 2, color === 'white' ? 'black' : 'white')) {
                moves.push([castlingRow, 2]);
              }
            }
          }
        }
        break;
    }

    if (!checkForCheck) return moves;

    // Filter out moves that would leave the king in check
    return moves.filter(([newRow, newCol]) => {
      const newBoard = board.map(row => [...row]);
      newBoard[newRow][newCol] = piece;
      newBoard[row][col] = null;
      return !isInCheck(newBoard, color);
    });
  };

  const makeMove = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromRow][fromCol];
    const color = getPieceColor(piece);
    const pieceType = piece.toLowerCase();
    
    let newCastlingRights = { ...castlingRights };
    let newEnPassantTarget = null;
    
    // Handle special moves
    if (pieceType === 'k') {
      // Castling
      if (Math.abs(toCol - fromCol) === 2) {
        const isKingside = toCol > fromCol;
        const rookFromCol = isKingside ? 7 : 0;
        const rookToCol = isKingside ? 5 : 3;
        const castlingRow = color === 'white' ? 7 : 0;
        
        newBoard[castlingRow][rookToCol] = newBoard[castlingRow][rookFromCol];
        newBoard[castlingRow][rookFromCol] = null;
      }
      
      // Remove castling rights for this king
      newCastlingRights[color] = { kingside: false, queenside: false };
    }
    
    if (pieceType === 'r') {
      // Remove castling rights if rook moves
      if (fromRow === (color === 'white' ? 7 : 0)) {
        if (fromCol === 0) newCastlingRights[color].queenside = false;
        if (fromCol === 7) newCastlingRights[color].kingside = false;
      }
    }
    
    if (pieceType === 'p') {
      // Pawn two-square move
      if (Math.abs(toRow - fromRow) === 2) {
        newEnPassantTarget = [fromRow + (toRow - fromRow) / 2, fromCol];
      }
      
      // En passant capture
      if (enPassantTarget && toRow === enPassantTarget[0] && toCol === enPassantTarget[1]) {
        const capturedPawnRow = color === 'white' ? toRow + 1 : toRow - 1;
        newBoard[capturedPawnRow][toCol] = null;
      }
      
      // Pawn promotion
      if (toRow === 0 || toRow === 7) {
        newBoard[toRow][toCol] = color === 'white' ? 'Q' : 'q';
      } else {
        newBoard[toRow][toCol] = piece;
      }
    } else {
      newBoard[toRow][toCol] = piece;
    }
    
    newBoard[fromRow][fromCol] = null;
    
    // Check for checkmate or stalemate
    const nextPlayer = color === 'white' ? 'black' : 'white';
    const hasLegalMoves = getAllLegalMoves(newBoard, nextPlayer).length > 0;
    const inCheck = isInCheck(newBoard, nextPlayer);
    
    let newGameStatus = 'playing';
    if (!hasLegalMoves) {
      if (inCheck) {
        newGameStatus = color === 'white' ? 'white-wins' : 'black-wins';
      } else {
        newGameStatus = 'stalemate';
      }
    }
    
    setBoard(newBoard);
    setCurrentPlayer(nextPlayer);
    setCastlingRights(newCastlingRights);
    setEnPassantTarget(newEnPassantTarget);
    setGameStatus(newGameStatus);
    setMoveHistory([...moveHistory, { from: [fromRow, fromCol], to: [toRow, toCol], piece }]);
  };

  const getAllLegalMoves = (board, color) => {
    const moves = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && getPieceColor(piece) === color) {
          const pieceMoves = getPossibleMoves(board, row, col);
          moves.push(...pieceMoves.map(([toRow, toCol]) => ({ from: [row, col], to: [toRow, toCol] })));
        }
      }
    }
    return moves;
  };

  const handleSquareClick = (row, col) => {
    if (gameStatus !== 'playing') return;
    
    const piece = board[row][col];
    
    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const selectedPiece = board[selectedRow][selectedCol];
      
      if (row === selectedRow && col === selectedCol) {
        // Clicking the same square deselects it
        setSelectedSquare(null);
        return;
      }
      
      if (piece && getPieceColor(piece) === currentPlayer) {
        // Clicking on another piece of the same color
        setSelectedSquare([row, col]);
        return;
      }
      
      // Try to make a move
      const possibleMoves = getPossibleMoves(board, selectedRow, selectedCol);
      const isValidMove = possibleMoves.some(([r, c]) => r === row && c === col);
      
      if (isValidMove) {
        makeMove(selectedRow, selectedCol, row, col);
      }
      
      setSelectedSquare(null);
    } else {
      // No square selected, select this square if it contains a piece of the current player
      if (piece && getPieceColor(piece) === currentPlayer) {
        setSelectedSquare([row, col]);
      }
    }
  };

  const resetGame = () => {
    setBoard(initialBoard);
    setCurrentPlayer('white');
    setSelectedSquare(null);
    setGameStatus('playing');
    setMoveHistory([]);
    setCastlingRights({
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    });
    setEnPassantTarget(null);
  };

  const getSquareHighlight = (row, col) => {
    if (selectedSquare && selectedSquare[0] === row && selectedSquare[1] === col) {
      return 'selected';
    }
    
    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const possibleMoves = getPossibleMoves(board, selectedRow, selectedCol);
      const isValidMove = possibleMoves.some(([r, c]) => r === row && c === col);
      
      if (isValidMove) {
        return board[row][col] ? 'capture' : 'valid';
      }
    }
    
    return '';
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'white-wins':
        return 'Checkmate! White wins!';
      case 'black-wins':
        return 'Checkmate! Black wins!';
      case 'stalemate':
        return 'Stalemate! The game is a draw.';
      default:
        const inCheck = isInCheck(board, currentPlayer);
        return `${currentPlayer === 'white' ? 'White' : 'Black'} to move${inCheck ? ' (Check!)' : ''}`;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #fef7cd 0%, #fed7aa 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '24px',
        maxWidth: '512px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '30px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '24px',
          color: '#1f2937'
        }}>
          ♔ Chess Game ♛
        </h1>

        <div style={{
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            {getStatusMessage()}
          </div>
          <button
            onClick={resetGame}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              fontWeight: 'bold',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            New Game
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 1fr)',
          gap: '0',
          border: '4px solid #1f2937',
          background: '#1f2937',
          margin: '0 auto',
          width: 'fit-content'
        }}>
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const highlight = getSquareHighlight(rowIndex, colIndex);
              
              let boxShadow = '';
              if (highlight === 'selected') {
                boxShadow = 'inset 0 0 0 4px #60a5fa';
              } else if (highlight === 'valid') {
                boxShadow = 'inset 0 0 0 2px #34d399';
              } else if (highlight === 'capture') {
                boxShadow = 'inset 0 0 0 2px #f87171';
              }
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    backgroundColor: isLight ? '#fef3c7' : '#92400e',
                    transition: 'all 0.2s',
                    boxShadow: boxShadow
                  }}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  onMouseOver={(e) => e.target.style.filter = 'brightness(1.1)'}
                  onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
                >
                  {piece && (
                    <span
                      style={{
                        userSelect: 'none',
                        color: isWhitePiece(piece) ? 'white' : 'black',
                        textShadow: isWhitePiece(piece) ? '2px 2px 4px rgba(0, 0, 0, 0.5)' : 'none'
                      }}
                    >
                      {pieceSymbols[piece]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#4b5563'
        }}>
          <p style={{ marginBottom: '4px' }}>
            Click a piece to select it, then click a highlighted square to move.
          </p>
          <p>
            Blue highlight = selected piece, Green = valid move, Red = capture
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;