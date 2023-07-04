import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import { BoardState } from './BoardState';
import { PieceRules } from './PieceRules';

@ccclass('Bot')
export class Bot extends Component {
    @property
    private color: number = 0;

    onLoad() {
        if (this.color == 1) {
            BoardState.flipped = true;
        }
    }

    chooseMove(): number[][][] {
        let moves: number[][] = [];
        let aftMoves: number[][] = [];
        for (let i: number = 0; i < 8; i++) {
            for (let j: number = 0; j < 8; j++) {
                if (BoardState.board[i][j] * BoardState.turn > 0) {
                    for (let aft_i: number = 0; aft_i < 8; aft_i++) {
                        for (let aft_j: number = 0; aft_j < 8; aft_j++) {
                            if (BoardState.isValidMove(BoardState.board[i][j], 
                                BoardState.convertUIPosition([i, j]), BoardState.convertUIPosition([aft_i, aft_j]))) {
                                moves.push([i, j]);
                                aftMoves.push([aft_i, aft_j]);
                            }
                        }
                    }
                }
            }
        }
        return [moves, aftMoves];
    }

    openingFilter(moves: number[][], aftMoves: number[][]): number[][][] {
        if (BoardState.moves > 6) {
            return [moves, aftMoves];
        }
        let filMoves: number[][] = [];
        let aftFilMoves: number[][] = [];
        for (let i: number = 0; i < moves.length; i++) {
            if (BoardState.board[moves[i][0]][moves[i][1]] == -1) {
                if (aftMoves[i][1] == 2 || aftMoves[i][1] == 3 || aftMoves[i][1] == 4) {
                    filMoves.push(moves[i]);
                    aftFilMoves.push(aftMoves[i]);
                }
            }
            else if (BoardState.board[moves[i][0]][moves[i][1]] == 1) {
                if (aftMoves[i][1] == 5 || aftMoves[i][1] == 3 || aftMoves[i][1] == 4) {
                    filMoves.push(moves[i]);
                    aftFilMoves.push(aftMoves[i]);
                }
            }
            else if (Math.abs(BoardState.board[moves[i][0]][moves[i][1]]) == 2) {
                if (aftMoves[i][1] >= 2 && aftMoves[i][1] <= 5) {
                    filMoves.push(moves[i]);
                    aftFilMoves.push(aftMoves[i]);
                }
            }
            else {
                if (Math.abs(BoardState.board[moves[i][0]][moves[i][1]]) != 9 && Math.abs(BoardState.board[moves[i][0]][moves[i][1]]) != 5) {
                    filMoves.push(moves[i]);
                    aftFilMoves.push(aftMoves[i]);
                }
            }
        }
        return [filMoves, aftFilMoves];
    }

    basicMaterialFilter(moves: number[][], aftMoves: number[][]) {
        let filMoves: number[][] = [];
        let aftFilMoves: number[][] = [];
        let possibleAdv: number[] = [];
        let optimizedAdv: number = 0;
        for (let i: number = 0; i < moves.length; i++) {
            let originalBoard: number[][] = [];
            for (let rank = 0; rank < 8; rank++) {
                originalBoard.push(BoardState.board[rank]);
            }
            BoardState.turn *= -1;
            BoardState.board = PieceRules.pseudoBoard(BoardState.board, moves[i], aftMoves[i]);
            if (Math.abs(originalBoard[moves[i][0]][moves[i][1]]) == 1 && Math.abs(aftMoves[i][1] - moves[i][1]) == 1
            && originalBoard[aftMoves[i][0]][aftMoves[i][1]] == 0) {
                BoardState.board[aftMoves[i][0] + 1][aftMoves[i][1]] = 0;
            }
            let nextOpponentMoves = this.chooseMove();
            let advantage: number = 0;
            for (let j: number = 0; j < nextOpponentMoves[0].length; j++) {
                if (this.color == -1) {
                    if (j == 0) {
                        advantage = -1000;
                    }
                    advantage = Math.max(advantage, BoardState.materialDifference
                        (PieceRules.pseudoBoard(BoardState.board, nextOpponentMoves[0][j], nextOpponentMoves[1][j])));
                }
                else {
                    if (j == 0) {
                        advantage = 1000;
                    }
                    advantage = Math.min(advantage, BoardState.materialDifference
                        (PieceRules.pseudoBoard(BoardState.board, nextOpponentMoves[0][j], nextOpponentMoves[1][j])));
                }
            }
            possibleAdv.push(advantage);
            if (this.color == -1) {
                if (i == 0) {
                    optimizedAdv = 1000;
                }
                optimizedAdv = Math.min(optimizedAdv, advantage);
            }
            else {
                if (i == 0) {
                    optimizedAdv = -1000;
                }
                optimizedAdv = Math.max(optimizedAdv, advantage);
            }
            BoardState.turn *= -1;
            BoardState.board = originalBoard;
        }
        for (let i: number = 0; i < moves.length; i++) {
            if (possibleAdv[i] == optimizedAdv) {
                filMoves.push(moves[i]);
                aftFilMoves.push(aftMoves[i]);
            }
        }
        return [filMoves, aftFilMoves];
    }

    basicMateFilter(moves: number[][], aftMoves: number[][]) {
        let filMoves: number[][] = [];
        let aftFilMoves: number[][] = [];
        for (let i: number = 0; i < moves.length; i++) {
            let originalBoard: number[][] = [];
            for (let rank = 0; rank < 8; rank++) {
                originalBoard.push(BoardState.board[rank]);
            }
            BoardState.turn *= -1;
            BoardState.board = PieceRules.pseudoBoard(BoardState.board, moves[i], aftMoves[i]);
            if ((BoardState.turn == 1 && BoardState.isCheckmate(BoardState.whiteKing))
            || (BoardState.turn == -1 && BoardState.isCheckmate(BoardState.blackKing))) {
                filMoves.push(moves[i]);
                aftFilMoves.push(aftMoves[i]);
            }
            BoardState.turn *= -1;
            BoardState.board = originalBoard;
        }
        if (filMoves.length > 0) {
            return [filMoves, aftFilMoves];
        }
        for (let i: number = 0; i < moves.length; i++) {
            let originalBoard: number[][] = [];
            for (let rank = 0; rank < 8; rank++) {
                originalBoard.push(BoardState.board[rank]);
            }
            BoardState.turn *= -1;
            BoardState.board = PieceRules.pseudoBoard(BoardState.board, moves[i], aftMoves[i]);
            if (Math.abs(originalBoard[moves[i][0]][moves[i][1]]) == 1 && Math.abs(aftMoves[i][1] - moves[i][1]) == 1
            && originalBoard[aftMoves[i][0]][aftMoves[i][1]] == 0) {
                BoardState.board[aftMoves[i][0] + 1][aftMoves[i][1]] = 0;
            }
            let nextOpponentMoves = this.chooseMove();
            let mateThreat = false;
            for (let j: number = 0; j < nextOpponentMoves[0].length; j++) {
                if (this.color == -1) {
                    if (originalBoard[moves[i][0]][moves[i][1]] == -9 && BoardState.isCheckmate(aftMoves[i])) {
                        mateThreat = true;
                    }
                }
                else {
                }
            }
            if (mateThreat) {
                continue;
            }
            filMoves.push(moves[i]);
            aftFilMoves.push(aftMoves[i]);
            BoardState.turn *= -1;
            BoardState.board = originalBoard;
        }
        if (filMoves.length == 0) {
            return [moves, aftMoves];
        }
        return [filMoves, aftFilMoves];
    }

    specialMovesFilter(moves: number[][], aftMoves: number[][]) {
        let filMoves: number[][] = [];
        let aftFilMoves: number[][] = [];
        for (let i: number = 0; i < moves.length; i++) {
            if (Math.abs(BoardState.board[moves[i][0]][moves[i][1]]) == 9) {
                if (Math.abs(aftMoves[i][1] - moves[i][1]) == 2) {
                    filMoves.push(moves[i]);
                    aftFilMoves.push(aftMoves[i]);
                }
            }
            else if (Math.abs(BoardState.board[moves[i][0]][moves[i][1]]) == 1) {
                if (aftMoves[i][0] == 0 || aftMoves[i][0] == 7) {
                    filMoves.push(moves[i]);
                    aftFilMoves.push(aftMoves[i]);
                }
            }
        }
        if (filMoves.length > 0) {
            return [filMoves, aftFilMoves];
        }
        return [moves, aftMoves];
    }

    update (deltaTime: number) {
        if (BoardState.gameOver) {
            return;
        }
        if (BoardState.turn == this.color && BoardState.promoting.x == -1000) {
            if (BoardState.nextBotMove[0][0] == -1) {
                let moveList = this.chooseMove();
                moveList = this.basicMateFilter(moveList[0], moveList[1]);
                moveList = this.openingFilter(moveList[0], moveList[1]);
                moveList = this.basicMaterialFilter(moveList[0], moveList[1]);
                moveList = this.specialMovesFilter(moveList[0], moveList[1]);
                if (moveList[0].length == 0) {
                    BoardState.gameOver = true;
                    return;
                }
                let roll: number = Math.floor(Math.random() * moveList[0].length);
                BoardState.nextBotMove[0] = moveList[0][roll];
                BoardState.nextBotMove[1] = moveList[1][roll];
                this.schedule(function() {
                    BoardState.turn *= -1;
                    BoardState.moves += 1;
                    BoardState.justMoved = true;
                }, 0, 0, 4);
            }
                   
        }
    }
}
