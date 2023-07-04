import { Vec3, isValid } from 'cc'
import { PieceRules } from './PieceRules';

var BoardState = {
    turn: 1,
    tileSize: 80,
    board: new Array<Array<number>>,
    boardHistory: new Array<Array<Array<number>>>,
    whiteKing: new Array<number>,
    blackKing: new Array<number>,
    topEdge: 280,
    bottomEdge: -280,
    leftEdge: -120,
    rightEdge: 440,
    boardCenter: 0,
    moves: 0,
    previousPosition: new Vec3(-1000, -1000, 0),
    currentMove: new Vec3(-1000, -1000, 0),
    checkPosition: new Vec3(-1000, -1000, 0),
    justMoved: false,
    justCaptured: false,
    justFortressed: false,
    justPromoted: false,
    justChecked: false,
    flipped: false,
    castlingRights: new Array<boolean>,
    justCastled: new Array<boolean>,
    enPassant: [-1, -1],
    justPassed: [-1, -1],
    promoting: new Vec3(-1000, -1000, 0),
    piecePromoted: 0,
    nextBotMove: [[-1, -1], [-1, -1]],
    gameOver: false,
    disable: false,

    initialize(): void {
        for (let i: number = 0; i < 8; i++) {
            let line: number[] = []
            for (let j: number = 0; j < 8; j++) {
                line.push(0);
            }
            this.board.push(line);
        }
        for (let i: number = 0; i < 4; i++) {
            this.castlingRights.push(true);
            this.justCastled.push(false);
        }
    },

    convertCoordinates(position: Vec3): number[] {
        return [(this.topEdge - position.y) / this.tileSize, (position.x - this.leftEdge) / this.tileSize];
    },

    convertUIPosition(coor: number[]): Vec3 {
        return new Vec3(this.leftEdge + this.tileSize * coor[1], this.topEdge - this.tileSize * coor[0], 0);
    },

    setBoard(piece: number, position: Vec3): void {
        if (position.x == 0) {
            return;
        }
        this.board[this.convertCoordinates(position)[0]][this.convertCoordinates(position)[1]] = piece;
    },

    newBoard(): void {
        this.turn = 1;
        this.board[0] = [-5,-2,-3,-8,-9,-3,-2,-5];
        this.board[1] = [-1,-1,-1,-1,-1,-1,-1,-1];
        for (let i: number = 2; i < 6; i++) {
            this.board[i] = [0,0,0,0,0,0,0,0];
        }
        this.board[6] = [ 1, 1, 1, 1, 1, 1, 1, 1];
        this.board[7] = [ 5, 2, 3, 8, 9, 3, 2, 5];
        this.whiteKing = [7, 4];
        this.blackKing = [0, 4];
        this.previousPosition = new Vec3(-1000, -1000, 0);
        this.currentMove = new Vec3(-1000, -1000, 0);
        this.checkPosition = new Vec3(-1000, -1000, 0);
        this.flipped = false;
        this.justMoved = false;
        this.justCaptured = false;
        this.justFortressed = false;
        this.justPromoted = false;
        this.justChecked = false;
        this.castlingRights = [true, true, true, true];
        this.justCastled = [false, false, false, false];
        this.enPassant = [-1, -1];
        this.justPassed = [-1, -1];
        this.promoting = new Vec3(-1000, -1000, 0);
        this.piecePromoted = 0;
        this.moves = 0;
        this.gameOver = false;
        this.nextBotMove = [[-1, -1], [-1, -1]];
    },

    newFlippedBoard(): void {
        this.turn = 1;
        this.board[7] = [-5,-2,-3,-9,-8,-3,-2,-5];
        this.board[6] = [-1,-1,-1,-1,-1,-1,-1,-1];
        for (let i: number = 2; i < 6; i++) {
            this.board[i] = [0,0,0,0,0,0,0,0];
        }
        this.board[1] = [ 1, 1, 1, 1, 1, 1, 1, 1];
        this.board[0] = [ 5, 2, 3, 9, 8, 3, 2, 5];
        this.whiteKing = [0, 3];
        this.blackKing = [7, 3];
        this.previousPosition = new Vec3(-1000, -1000, 0);
        this.currentMove = new Vec3(-1000, -1000, 0);
        this.checkPosition = new Vec3(-1000, -1000, 0);
        this.flipped = true;
        this.justMoved = false;
        this.justCaptured = false;
        this.justFortressed = false;
        this.justPromoted = false;
        this.justChecked = false;
        this.castlingRights = [true, true, true, true];
        this.justCastled = [false, false, false, false];
        this.enPassant = [-1, -1];
        this.justPassed = [-1, -1];
        this.promoting = new Vec3(-1000, -1000, 0);
        this.piecePromoted = 0;
        this.moves = 0;
        this.gameOver = false;
        this.nextBotMove = [[-1, -1], [-1, -1]];
    },

    flipBoard(): void {
        for (let i: number = 0; i < 4; i++) {
            [this.board[i], this.board[7 - i]] = [this.board[7 - i], this.board[i]];
            this.board[i].reverse();
            this.board[7 - i].reverse();
        }
        this.whiteKing[0] = 7 - this.whiteKing[0];
        this.whiteKing[1] = 7 - this.whiteKing[1];
        this.blackKing[0] = 7 - this.blackKing[0];
        this.blackKing[1] = 7 - this.blackKing[1];
        if (this.enPassant[0] > -1) {
            this.enPassant[0] = 7 - this.enPassant[0];
            this.enPassant[1] = 7 - this.enPassant[1];
        }
        this.flipped = !this.flipped;
        this.previousPosition.x = this.leftEdge + this.rightEdge - this.previousPosition.x;
        this.previousPosition.y = this.topEdge + this.bottomEdge - this.previousPosition.y;
        this.currentMove.x = this.leftEdge + this.rightEdge - this.currentMove.x;
        this.currentMove.y = this.topEdge + this.bottomEdge - this.currentMove.y;
        this.checkPosition.x = this.leftEdge + this.rightEdge - this.checkPosition.x;
        this.checkPosition.y = this.topEdge + this.bottomEdge - this.checkPosition.y;
    },

    isValidMove(piece: number, position: Vec3, aftPosition: Vec3): boolean {
        if (aftPosition.x < this.leftEdge || aftPosition.x > this.rightEdge) {
            return false;
        }
        if (aftPosition.y < this.bottomEdge || aftPosition.y > this.topEdge) {
            return false;
        }
        if (position.x == aftPosition.x && position.y == aftPosition.y) {
            return false;
        }
        if (this.turn * piece < 0) {
            return false;
        }
        if (this.board[this.convertCoordinates(aftPosition)[0]][this.convertCoordinates(aftPosition)[1]] * piece > 0) {
            return false;
        }
        switch (Math.abs(piece)) {
            case 9:
                if (!PieceRules.isReachableByKing(this.board, this.convertCoordinates(position), 
                this.convertCoordinates(aftPosition), this.castlingRights, this.flipped)) {
                    return false;
                }
                break;
            case 8:
                if (!PieceRules.isReachableByQueen(this.board, this.convertCoordinates(position), 
                this.convertCoordinates(aftPosition))) {
                    return false;
                }
                break;
            case 5:
                if (!PieceRules.isReachableByRook(this.board, this.convertCoordinates(position), 
                this.convertCoordinates(aftPosition))) {
                    return false;
                }
                break;
            case 3:
                if (!PieceRules.isReachableByBishop(this.board, this.convertCoordinates(position), 
                this.convertCoordinates(aftPosition))) {
                    return false;
                }
                break;
            case 2:
                if (!PieceRules.isReachableByKnight(this.convertCoordinates(position), this.convertCoordinates(aftPosition))) {
                    return false;
                }
                break;
            case 1:
                if (!PieceRules.isReachableByPawn(this.board, this.convertCoordinates(position), 
                this.convertCoordinates(aftPosition), this.flipped)) {
                    if (!this.flipped) {
                        if (Math.abs(this.convertCoordinates(position)[1] - this.convertCoordinates(aftPosition)[1]) != 1) {
                            return false;
                        }
                        if (this.convertCoordinates(position)[0] - piece != this.convertCoordinates(aftPosition)[0]) {
                            return false;
                        }
                        if (this.convertCoordinates(aftPosition)[0] + piece != this.enPassant[0] || 
                        this.convertCoordinates(aftPosition)[1] != this.enPassant[1]) {
                            return false;
                        }
                    }
                    else {
                        if (Math.abs(this.convertCoordinates(position)[1] - this.convertCoordinates(aftPosition)[1]) != 1) {
                            return false;
                        }
                        if (this.convertCoordinates(position)[0] + piece != this.convertCoordinates(aftPosition)[0]) {
                            return false;
                        }
                        if (this.convertCoordinates(aftPosition)[0] - piece != this.enPassant[0] || 
                        this.convertCoordinates(aftPosition)[1] != this.enPassant[1]) {
                            return false;
                        }
                    }
                    this.board[this.enPassant[0]][this.enPassant[1]] = 0;
                    if (piece > 0) {
                        if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, this.convertCoordinates(position), 
                        this.convertCoordinates(aftPosition)), this.whiteKing, this.flipped)) {
                            this.board[this.enPassant[0]][this.enPassant[1]] = -piece;
                            return false;
                        }
                    }
                    else {
                        if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, this.convertCoordinates(position), 
                        this.convertCoordinates(aftPosition)), this.blackKing, this.flipped)) {
                            this.board[this.enPassant[0]][this.enPassant[1]] = -piece;
                            return false;
                        }
                    }
                    this.board[this.enPassant[0]][this.enPassant[1]] = -piece;
                }
                break;
            default:
                return false;
        }
        if (piece > 0) {
            if (piece < 9) {
                if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, this.convertCoordinates(position), 
                this.convertCoordinates(aftPosition)), this.whiteKing, this.flipped)) {
                    return false;
                }
            }
            else {
                if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, this.convertCoordinates(position), 
                this.convertCoordinates(aftPosition)), this.convertCoordinates(aftPosition), this.flipped)) {
                    return false;
                }
            }
        }
        else {
            if (piece > -9) {
                if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, this.convertCoordinates(position), 
                this.convertCoordinates(aftPosition)), this.blackKing, this.flipped)) {
                    return false;
                }
            }
            else {
                if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, this.convertCoordinates(position), 
                this.convertCoordinates(aftPosition)), this.convertCoordinates(aftPosition), this.flipped)) {
                    return false;
                }
            }
        }
        return true;
    },

    isValidMoveStatic(turn: number, piece: number, board: number[][], whiteKing: number[], blackKing: number[],
        position: number[], aftPosition: number[], castlingRights: boolean[], enPassant: number[]): boolean {
        if (aftPosition[0] < 0 || aftPosition[0] > 7) {
            return false;
        }
        if (aftPosition[1] < 0 || aftPosition[1] > 7) {
            return false;
        }
        if (position[0] == aftPosition[0] && position[1] == aftPosition[1]) {
            return false;
        }
        if (turn * piece < 0) {
            return false;
        }
        if (board[aftPosition[0]][aftPosition[1]] * piece > 0) {
            return false;
        }
        switch (Math.abs(piece)) {
            case 9:
                if (!PieceRules.isReachableByKing(board, position, aftPosition, castlingRights, false)) {
                    return false;
                }
                break;
            case 8:
                if (!PieceRules.isReachableByQueen(board, position, aftPosition)) {
                    return false;
                }
                break;
            case 5:
                if (!PieceRules.isReachableByRook(board, position, aftPosition)) {
                    return false;
                }
                break;
            case 3:
                if (!PieceRules.isReachableByBishop(board, position, aftPosition)) {
                    return false;
                }
                break;
            case 2:
                if (!PieceRules.isReachableByKnight(position, aftPosition)) {
                    return false;
                }
                break;
            case 1:
                if (!PieceRules.isReachableByPawn(board, position, aftPosition, false)) {
                    if (Math.abs(position[1] - aftPosition[1]) != 1) {
                        return false;
                    }
                    if (position[0] - piece != aftPosition[0]) {
                        return false;
                    }
                    if (aftPosition[0] + piece != enPassant[0] || aftPosition[1] != enPassant[1]) {
                        return false;
                    }
                    board[enPassant[0]][enPassant[1]] = 0;
                    if (piece > 0) {
                        if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(board, position, aftPosition), whiteKing, false)) {
                            board[enPassant[0]][enPassant[1]] = -piece;
                            return false;
                        }
                    }
                    else {
                        if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(board, position, aftPosition), blackKing, false)) {
                            board[enPassant[0]][enPassant[1]] = -piece;
                            return false;
                        }
                    }
                    board[enPassant[0]][enPassant[1]] = -piece;
                }
                break;
            default:
                return false;
        }
        if (piece > 0) {
            if (piece < 9) {
                if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(board, position, aftPosition), whiteKing, false)) {
                    return false;
                }
            }
            else {
                if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(board, position, aftPosition), aftPosition, false)) {
                    return false;
                }
            }
        }
        else {
            if (piece > -9) {
                if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(board, position, aftPosition), blackKing, false)) {
                    return false;
                }
            }
            else {
                if (!PieceRules.isKingSafe(PieceRules.pseudoBoard(board, position, aftPosition), aftPosition, false)) {
                    return false;
                }
            }
        }
        return true;
    },

    materialDifference(board: number[][]): number {
        let diff: number = 0;
        for (let i: number = 0; i < 8; i++) {
            for (let j: number = 0; j < 8; j++) {
                let piece: number = board[i][j]
                diff += piece;
                if (Math.abs(piece) == 9) {
                    diff -= piece;
                }
                else if (Math.abs(piece) == 8 || Math.abs(piece) == 2) {
                    diff += Math.sign(piece);
                }
            }
        }
        return diff;
    },

    advancedEvaluation(color: number, board: number[][]): number {
        let evalScore: number = 0;
        let kingEval = [[-30,-40,-40,-50,-50,-40,-40,-30],
                        [-30,-40,-40,-50,-50,-40,-40,-30],
                        [-30,-40,-40,-50,-50,-40,-40,-30],
                        [-30,-40,-40,-50,-50,-40,-40,-30],
                        [-20,-30,-30,-40,-40,-30,-30,-20],
                        [-10,-20,-20,-20,-20,-20,-20,-10],
                        [ 20, 20,  0,  0,  0,  0, 20, 20],
                        [ 20, 30, 10,  0,  0, 10, 30, 20]];/*
                        -20,-10,-10,-10,-10,-10,-10,-20,
                        -10,  0,  0,  0,  0,  0,  0,-10,
                        -10,  0,  5, 10, 10,  5,  0,-10,
                        -10,  5,  5, 10, 10,  5,  5,-10,
                        -10,  0, 10, 10, 10, 10,  0,-10,
                        -10, 10, 10, 10, 10, 10, 10,-10,
                        -10,  5,  0,  0,  0,  0,  5,-10,
                        -20,-10,-10,-10,-10,-10,-10,-20*/
        let remainingMaterial = 0;
        let queenEval = [[-20,-10,-10, -5, -5,-10,-10,-20],
                        [-10,  0,  0,  0,  0,  0,  0,-10],
                        [-10,  0,  5,  5,  5,  5,  0,-10],
                        [ -5,  0,  5,  5,  5,  5,  0, -5],
                        [  0,  0,  5,  5,  5,  5,  0, -5],
                        [-10,  5,  5,  5,  5,  5,  0,-10],
                        [-10,  0,  5,  0,  0,  0,  0,-10],
                        [-20,-10,-10, -5, -5,-10,-10,-20]];
        let rookEval = [[  0,  0,  0,  0,  0,  0,  0,  0],
                        [  5, 10, 10, 10, 10, 10, 10,  5],
                        [ -5,  0,  0,  0,  0,  0,  0, -5],
                        [ -5,  0,  0,  0,  0,  0,  0, -5],
                        [ -5,  0,  0,  0,  0,  0,  0, -5],
                        [ -5,  0,  0,  0,  0,  0,  0, -5],
                        [ -5,  0,  0,  0,  0,  0,  0, -5],
                        [  0,  0,  0,  5,  5,  0,  0,  0]];
        let bishopEval = [[-20,-10,-10,-10,-10,-10,-10,-20],
                        [-10,  0,  0,  0,  0,  0,  0,-10],
                        [-10,  0,  5, 10, 10,  5,  0,-10],
                        [-10,  5,  5, 10, 10,  5,  5,-10],
                        [-10,  0, 10, 10, 10, 10,  0,-10],
                        [-10, 10, 10, 10, 10, 10, 10,-10],
                        [-10,  5,  0,  0,  0,  0,  5,-10],
                        [-20,-10,-10,-10,-10,-10,-10,-20]];
        let knightEval = [[-50,-40,-30,-30,-30,-30,-40,-50],
                        [-40,-20,  0,  0,  0,  0,-20,-40],
                        [-30,  0, 10, 15, 15, 10,  0,-30],
                        [-30,  5, 15, 20, 20, 15,  5,-30],
                        [-30,  0, 15, 20, 20, 15,  0,-30],
                        [-30,  5, 10, 15, 15, 10,  5,-30],
                        [-40,-20,  0,  5,  5,  0,-20,-40],
                        [-50,-40,-30,-30,-30,-30,-40,-50]];
        let pawnEval = [[ 0,  0,  0,  0,  0,  0,  0,  0],
                        [50, 50, 50, 50, 50, 50, 50, 50],
                        [10, 10, 20, 30, 30, 20, 10, 10],
                        [ 5,  5, 10, 25, 25, 10,  5,  5],
                        [ 0,  0,  0, 20, 20,  0,  0,  0],
                        [ 5, -5,-10,  0,  0,-10, -5,  5],
                        [ 5, 10, 10,-20,-20, 10, 10,  5],
                        [ 0,  0,  0,  0,  0,  0,  0,  0]];
        for (let i: number = 0; i < 8; i++) {
            for (let j: number = 0; j < 8; j++) {
                let rank = i;
                let file = j;
                if (color == -1) {
                    rank = 7 - i;
                    file = 7 - j;
                }
                let piece = board[i][j];
                if (color * piece > 0) {
                    switch(Math.abs(piece)) {
                        case 9:
                            evalScore += 20000 * kingEval[rank][file];
                            break;
                        case 8:
                            evalScore += 900 * queenEval[rank][file];
                            break;
                        case 5:
                            evalScore += 500 * rookEval[rank][file];
                            break;
                        case 3:
                            evalScore += 330 * bishopEval[rank][file];
                            break;
                        case 2:
                            evalScore += 320 * knightEval[rank][file];
                            break;
                        case 1:
                            evalScore += 100 * pawnEval[rank][file];
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        return evalScore;
    },

    isInCheck(): boolean {
        if (this.turn == 1 && !PieceRules.isKingSafe(this.board, this.whiteKing, this.flipped)) {
            this.checkPosition.x = this.convertUIPosition(this.whiteKing).x;
            this.checkPosition.y = this.convertUIPosition(this.whiteKing).y;
            return true;
        }
        if (this.turn == -1 && !PieceRules.isKingSafe(this.board, this.blackKing, this.flipped)) {
            this.checkPosition.x = this.convertUIPosition(this.blackKing).x;
            this.checkPosition.y = this.convertUIPosition(this.blackKing).y;
            return true;
        }
        this.checkPosition.x = -1000;
        this.checkPosition.y = -1000;
        return false;
    },

    isCheckmate(position: number[]): boolean {
        for (let i: number = 0; i < 8; i++) {
            for (let j: number = 0; j < 8; j++) {
                if (this.board[i][j] * this.board[position[0]][position[1]] > 0) {
                    for (let aft_i: number = 0; aft_i < 8; aft_i++) {
                        for (let aft_j: number = 0; aft_j < 8; aft_j++) {
                            if (Math.abs(this.board[i][j]) < 9 && this.isValidMove(this.board[i][j], 
                                this.convertUIPosition([i, j]), this.convertUIPosition([aft_i, aft_j]))
                                && PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, [i, j], [aft_i, aft_j]), position, this.flipped)) {
                                return false;
                            }
                            if (Math.abs(this.board[i][j]) == 9 && this.isValidMove(this.board[i][j], 
                                this.convertUIPosition([i, j]), this.convertUIPosition([aft_i, aft_j]))
                                && PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, [i, j], [aft_i, aft_j]), [aft_i, aft_j], this.flipped)) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return !PieceRules.isKingSafe(this.board, position, this.flipped);
    },

    isStalemate(position: number[]): boolean {
        for (let i: number = 0; i < 8; i++) {
            for (let j: number = 0; j < 8; j++) {
                if (this.board[i][j] * this.board[position[0]][position[1]] > 0) {
                    for (let aft_i: number = 0; aft_i < 8; aft_i++) {
                        for (let aft_j: number = 0; aft_j < 8; aft_j++) {
                            if (Math.abs(this.board[i][j]) < 9 && this.isValidMove(this.board[i][j], 
                                this.convertUIPosition([i, j]), this.convertUIPosition([aft_i, aft_j]))
                                && PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, [i, j], [aft_i, aft_j]), position, this.flipped)) {
                                return false;
                            }
                            if (Math.abs(this.board[i][j]) == 9 && this.isValidMove(this.board[i][j], 
                                this.convertUIPosition([i, j]), this.convertUIPosition([aft_i, aft_j]))
                                && PieceRules.isKingSafe(PieceRules.pseudoBoard(this.board, [i, j], [aft_i, aft_j]), [aft_i, aft_j], this.flipped)) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return PieceRules.isKingSafe(this.board, position, this.flipped);
    },

    isInsufficient(): boolean {
        let remains: number[] = [];
        for (let i: number = 0; i < 8; i++) {
            for (let j: number = 0; j < 8; j++) {
                let piece = this.board[i][j];
                if (Math.abs(piece) == 1 || Math.abs(piece) == 5 || Math.abs(piece) == 8) {
                    return false;
                }
                if (piece != 0 && Math.abs(piece) != 9) {
                    remains.push(piece);
                }
            }
        }
        if (remains.length > 2) {
            return false;
        }
        if (remains.length == 2) {
            if (remains[0] * remains[1] > 4) {
                return false;
            }
        }
        return true;
    },

    print(): void {
        for (let i: number = 0; i < 8; i++) {
            console.log(this.board[i]);
        }
        console.log("\n");
    }
};

BoardState.initialize();
export { BoardState };
