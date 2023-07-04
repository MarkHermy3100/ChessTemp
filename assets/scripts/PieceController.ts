import { _decorator, Component, Node, Vec3, EventMouse, EventTouch, input, Input, Sprite, SpriteFrame, resources, UITransform, Script} from 'cc';
const { ccclass, property } = _decorator;
import { BoardState } from './BoardState';

@ccclass('PieceController')
export class PieceController extends Component {
    /*
    Properties that describe what a piece is, where it is and where it was
        Positive numbers are white. Negative numbers are black
        9 = King
        8 = Queen
        5 = Rook
        3 = Bishop
        2 = Knight
        1 = Pawn
        0 = Empty
    */
    @property
    private pieceName: number = 0;
    private prePieceName: number = 0;
    private piecePosition: Vec3 = new Vec3();
    private prePiecePosition: Vec3 = new Vec3();
    private zerothPosition: Vec3 = new Vec3();
    private piecePositionHistory: Array<Vec3> = new Array<Vec3>;
    private clickPosition: Vec3 = new Vec3(-1000, -1000, 0);
    private cursorPosition: Vec3 = new Vec3();
    private isDragged: boolean = false;
    private isReleased: boolean = false;

    onLoad() {
        this.piecePositionHistory.push(this.node.getPosition());
        this.node.getPosition(this.prePiecePosition);
        this.node.getPosition(this.zerothPosition);
        BoardState.setBoard(this.pieceName, this.piecePositionHistory[0]);
        if (this.pieceName == 9) {
            BoardState.whiteKing.push(BoardState.convertCoordinates(this.piecePositionHistory[0])[0]);
            BoardState.whiteKing.push(BoardState.convertCoordinates(this.piecePositionHistory[0])[1]);
        }
        else if (this.pieceName == -9) {
            BoardState.blackKing.push(BoardState.convertCoordinates(this.piecePositionHistory[0])[0]);
            BoardState.blackKing.push(BoardState.convertCoordinates(this.piecePositionHistory[0])[1]);
        }
    }

    start() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.TOUCH_START, this.onTouchDown, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchUp, this);
    }

    onMouseDown(event: EventMouse) {
        if (event.getButton() == EventMouse.BUTTON_LEFT) {
            this.clickPosition.x = event.getUILocation().x - BoardState.tileSize * 6;
            this.clickPosition.y = event.getUILocation().y - BoardState.boardCenter;
            this.clickPosition.z = 0;
        }
    }

    onMouseMove(event: EventMouse) {
        if (event.getButton() == EventMouse.BUTTON_LEFT) {
            this.cursorPosition.x = event.getUILocation().x - BoardState.tileSize * 6;
            this.cursorPosition.y = event.getUILocation().y - BoardState.boardCenter;
            this.cursorPosition.z = 0;
            if (Math.abs(this.clickPosition.x - this.piecePosition.x) < BoardState.tileSize / 2 
            && Math.abs(this.clickPosition.y - this.piecePosition.y) < BoardState.tileSize / 2) {
                this.isDragged = true;
            }
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() == EventMouse.BUTTON_LEFT) {
            this.isReleased = true;
        }
    }

    onTouchDown(event: EventTouch) {
        if (event.getType() == "touch-start") {
            this.clickPosition.x = event.getUILocation().x - BoardState.tileSize * 6;
            this.clickPosition.y = event.getUILocation().y - BoardState.boardCenter;
            this.clickPosition.z = 0;
        }
    }

    onTouchMove(event: EventTouch) {
        if (event.getType() == "touch-move") {
            this.cursorPosition.x = event.getUILocation().x - BoardState.tileSize * 6;
            this.cursorPosition.y = event.getUILocation().y - BoardState.boardCenter;
            this.cursorPosition.z = 0;
            if (Math.abs(this.clickPosition.x - this.piecePosition.x) < BoardState.tileSize / 2 
            && Math.abs(this.clickPosition.y - this.piecePosition.y) < BoardState.tileSize / 2) {
                this.isDragged = true;
            }
        }
    }

    onTouchUp(event: EventTouch) {
        if (event.getType() == "touch-end") {
            this.isReleased = true;
        }
    }

    newPiece() {
        if (this.prePieceName == 1) {
            resources.load('art/whitepawn/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                this.getComponent(Sprite).spriteFrame = spriteFrame;
            });
            this.getComponent(UITransform).width = 44;
            this.getComponent(UITransform).height = 56;
            this.pieceName = 1;
        }
        else if (this.prePieceName == -1) {
            resources.load('art/blackpawn/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                this.getComponent(Sprite).spriteFrame = spriteFrame;
            });
            this.getComponent(UITransform).width = 44;
            this.getComponent(UITransform).height = 56;
            this.pieceName = -1;
        }
        this.prePieceName = 0;
        this.node.setPosition(this.zerothPosition);
        this.node.getPosition(this.piecePosition);
        this.node.getPosition(this.prePiecePosition);
    }

    flipPiece() {
        if (this.piecePosition.x > -1000) {
            this.node.setPosition(BoardState.leftEdge + BoardState.rightEdge - this.piecePosition.x, 
            BoardState.topEdge + BoardState.bottomEdge - this.piecePosition.y, 0);
        }
        this.node.getPosition(this.piecePosition);
        this.node.getPosition(this.prePiecePosition);
        for (let i: number = 0; i < this.piecePositionHistory.length; i++) {
            if (this.piecePositionHistory[i].x > -1000) {
                this.piecePositionHistory[i].x = BoardState.leftEdge + BoardState.rightEdge - this.piecePositionHistory[i].x;
                this.piecePositionHistory[i].y = BoardState.topEdge + BoardState.bottomEdge - this.piecePositionHistory[i].y;
            }
        }
    }

    adjustCoordinate(piece: Vec3) {
        piece.x = Math.floor(piece.x / BoardState.tileSize) * BoardState.tileSize + BoardState.tileSize / 2;
        piece.y = Math.floor(piece.y / BoardState.tileSize) * BoardState.tileSize + BoardState.tileSize / 2;
    }

    capturedPiece() {
        if (BoardState.board[BoardState.convertCoordinates(this.piecePosition)[0]]
        [BoardState.convertCoordinates(this.piecePosition)[1]] != this.pieceName 
        && BoardState.board[BoardState.convertCoordinates(this.piecePosition)[0]]
        [BoardState.convertCoordinates(this.piecePosition)[1]] != 0) {
            this.node.setPosition(-1000, -1000, 0);
        }
        if (Math.abs(this.pieceName) == 1) {
            if (BoardState.justPassed[0] > -1 && BoardState.board[BoardState.convertCoordinates(this.piecePosition)[0]]
            [BoardState.convertCoordinates(this.piecePosition)[1]] == 0) {
                this.piecePosition.x = -1000;
                this.piecePosition.y = -1000;
                this.node.setPosition(this.piecePosition);
                this.node.getPosition(this.prePiecePosition);
                BoardState.justPassed = [-1, -1];
            }
        }
    }

    castlingKing() {
        if (this.pieceName == 9) {
            BoardState.castlingRights[0] = false;
            BoardState.castlingRights[2] = false;
            BoardState.whiteKing[0] = BoardState.convertCoordinates(this.piecePosition)[0];
            BoardState.whiteKing[1] = BoardState.convertCoordinates(this.piecePosition)[1];
            if (this.piecePosition.x - this.prePiecePosition.x == BoardState.tileSize * 2) {
                if (!BoardState.flipped) {
                    BoardState.justCastled[0] = true;
                    BoardState.setBoard(0, new Vec3(BoardState.rightEdge, BoardState.bottomEdge, 0));
                    BoardState.setBoard(5, new Vec3(BoardState.rightEdge - BoardState.tileSize * 2, BoardState.bottomEdge, 0));
                }
                else {
                    BoardState.justCastled[2] = true;
                    BoardState.setBoard(0, new Vec3(BoardState.rightEdge, BoardState.topEdge, 0));
                    BoardState.setBoard(5, new Vec3(BoardState.rightEdge - BoardState.tileSize * 3, BoardState.topEdge, 0));
                }
                BoardState.justFortressed = true;
            }
            if (this.prePiecePosition.x - this.piecePosition.x == BoardState.tileSize * 2) {
                if (!BoardState.flipped) {
                    BoardState.justCastled[2] = true;
                    BoardState.setBoard(0, new Vec3(BoardState.leftEdge, BoardState.bottomEdge, 0));
                    BoardState.setBoard(5, new Vec3(BoardState.leftEdge + BoardState.tileSize * 3, BoardState.bottomEdge, 0));
                }
                else {
                    BoardState.justCastled[0] = true;
                    BoardState.setBoard(0, new Vec3(BoardState.leftEdge, BoardState.topEdge, 0));
                    BoardState.setBoard(5, new Vec3(BoardState.leftEdge + BoardState.tileSize * 2, BoardState.topEdge, 0));
                }
                BoardState.justFortressed = true;
            }
        }
        else if (this.pieceName == -9) {
            BoardState.castlingRights[1] = false;
            BoardState.castlingRights[3] = false;
            BoardState.blackKing[0] = BoardState.convertCoordinates(this.piecePosition)[0];
            BoardState.blackKing[1] = BoardState.convertCoordinates(this.piecePosition)[1];
            if (this.piecePosition.x - this.prePiecePosition.x == BoardState.tileSize * 2) {
                if (!BoardState.flipped) {
                    BoardState.justCastled[1] = true;
                    BoardState.setBoard(0, new Vec3(BoardState.rightEdge, BoardState.topEdge, 0));
                    BoardState.setBoard(-5, new Vec3(BoardState.rightEdge - BoardState.tileSize * 2, BoardState.topEdge, 0));
                }
                else {
                    BoardState.justCastled[3] = true;
                    BoardState.setBoard(0, new Vec3(BoardState.leftEdge, BoardState.topEdge, 0));
                    BoardState.setBoard(-5, new Vec3(BoardState.leftEdge + BoardState.tileSize * 3, BoardState.topEdge, 0));
                }
                BoardState.justFortressed = true;
            }
            if (this.prePiecePosition.x - this.piecePosition.x == BoardState.tileSize * 2) {
                if (!BoardState.flipped) {
                    BoardState.justCastled[3] = true;
                    BoardState.setBoard(0, new Vec3(BoardState.rightEdge, BoardState.bottomEdge, 0));
                    BoardState.setBoard(-5, new Vec3(BoardState.rightEdge - BoardState.tileSize * 3, BoardState.bottomEdge, 0));
                }
                else {
                    BoardState.justCastled[1] = true;
                    BoardState.setBoard(0, new Vec3(BoardState.leftEdge, BoardState.bottomEdge, 0));
                    BoardState.setBoard(-5, new Vec3(BoardState.leftEdge + BoardState.tileSize * 2, BoardState.bottomEdge, 0));
                }
                BoardState.justFortressed = true;
            }
        }

        if (this.pieceName == 5) {
            if ((!BoardState.flipped && this.piecePosition.x == BoardState.rightEdge && this.piecePosition.y == BoardState.bottomEdge) 
            || (BoardState.flipped && this.piecePosition.x == BoardState.leftEdge && this.piecePosition.y == BoardState.topEdge)) {
                BoardState.castlingRights[0] = false;
            }
            else if ((!BoardState.flipped && this.piecePosition.x == BoardState.leftEdge && this.piecePosition.y == BoardState.bottomEdge) 
            || (BoardState.flipped && this.piecePosition.x == BoardState.rightEdge && this.piecePosition.y == BoardState.topEdge)) {
                BoardState.castlingRights[2] = false;
            }
        }
        else if (this.pieceName == -5) {
            if ((!BoardState.flipped && this.piecePosition.x == BoardState.rightEdge && this.piecePosition.y == BoardState.topEdge) 
            || (BoardState.flipped && this.piecePosition.x == BoardState.leftEdge && this.piecePosition.y == BoardState.bottomEdge)) {
                BoardState.castlingRights[1] = false;
            }
            else if ((!BoardState.flipped && this.piecePosition.x == BoardState.leftEdge && this.piecePosition.y == BoardState.topEdge) 
            || (BoardState.flipped && this.piecePosition.x == BoardState.rightEdge && this.piecePosition.y == BoardState.bottomEdge)) {
                BoardState.castlingRights[3] = false;
            }
        }
    }

    castlingRook() {
        if (!BoardState.flipped) {
            if (this.pieceName == 5) {
                if (BoardState.justCastled[0] && this.prePiecePosition.x == BoardState.rightEdge) {
                    this.node.setPosition(BoardState.rightEdge - BoardState.tileSize * 2, BoardState.bottomEdge, 0);
                    this.node.getPosition(this.prePiecePosition);
                    BoardState.justCastled[0] = false;
                }
                if (BoardState.justCastled[2] && this.prePiecePosition.x == BoardState.leftEdge) {
                    this.node.setPosition(BoardState.leftEdge + BoardState.tileSize * 3, BoardState.bottomEdge, 0);
                    this.node.getPosition(this.prePiecePosition);
                    BoardState.justCastled[2] = false;
                }
            }
            else if (this.pieceName == -5) {
                if (BoardState.justCastled[1] && this.prePiecePosition.x == BoardState.rightEdge) {
                    this.node.setPosition(BoardState.rightEdge - BoardState.tileSize * 2, BoardState.topEdge, 0);
                    this.node.getPosition(this.prePiecePosition);
                    BoardState.justCastled[1] = false;
                }
                if (BoardState.justCastled[3] && this.prePiecePosition.x == BoardState.leftEdge) {
                    this.node.setPosition(BoardState.leftEdge + BoardState.tileSize * 3, BoardState.topEdge, 0);
                    this.node.getPosition(this.prePiecePosition);
                    BoardState.justCastled[3] = false;
                }
            }
        }
        else {
            if (this.pieceName == 5) {
                if (BoardState.justCastled[0] && this.prePiecePosition.x == BoardState.leftEdge) {
                    this.node.setPosition(BoardState.leftEdge + BoardState.tileSize * 2, BoardState.topEdge, 0);
                    this.node.getPosition(this.prePiecePosition);
                    BoardState.justCastled[0] = false;
                }
                if (BoardState.justCastled[2] && this.prePiecePosition.x == BoardState.rightEdge) {
                    this.node.setPosition(BoardState.rightEdge - BoardState.tileSize * 3, BoardState.topEdge, 0);
                    this.node.getPosition(this.prePiecePosition);
                    BoardState.justCastled[2] = false;
                }
            }
            else if (this.pieceName == -5) {
                if (BoardState.justCastled[1] && this.prePiecePosition.x == BoardState.leftEdge) {
                    this.node.setPosition(BoardState.leftEdge + BoardState.tileSize * 2, BoardState.bottomEdge, 0);
                    this.node.getPosition(this.prePiecePosition);
                    BoardState.justCastled[1] = false;
                }
                if (BoardState.justCastled[3] && this.prePiecePosition.x == BoardState.rightEdge) {
                    this.node.setPosition(BoardState.rightEdge - BoardState.tileSize * 3, BoardState.bottomEdge, 0);
                    this.node.getPosition(this.prePiecePosition);
                    BoardState.justCastled[3] = false;
                }
            }
        }
    }

    updatingPawn() {
        if (Math.abs(this.piecePosition.y - this.prePiecePosition.y) == BoardState.tileSize * 2) {
            BoardState.enPassant = BoardState.convertCoordinates(this.piecePosition);
        }
        else {
            if ((!BoardState.flipped && BoardState.convertCoordinates(this.piecePosition)[0] + this.pieceName == BoardState.enPassant[0] 
            && BoardState.convertCoordinates(this.piecePosition)[1] == BoardState.enPassant[1]) 
            || (BoardState.flipped && BoardState.convertCoordinates(this.piecePosition)[0] - this.pieceName == BoardState.enPassant[0] 
            && BoardState.convertCoordinates(this.piecePosition)[1] == BoardState.enPassant[1])) {
                BoardState.justPassed[0] = BoardState.enPassant[0];
                BoardState.justPassed[1] = BoardState.enPassant[1];
                BoardState.justCaptured = true;
                BoardState.setBoard(0, BoardState.convertUIPosition(BoardState.enPassant));
            }
            BoardState.enPassant = [-1, -1];
        }
    }

    promotingPawn() {
        if (BoardState.piecePromoted != 0) {
            BoardState.justPromoted = true;
            if (BoardState.piecePromoted == 8) {
                resources.load('art/whitequeen/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                    this.getComponent(Sprite).spriteFrame = spriteFrame;
                });
                this.getComponent(UITransform).width = 65;
                this.getComponent(UITransform).height = 65;
            }
            else if (BoardState.piecePromoted == -8) {
                resources.load('art/blackqueen/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                    this.getComponent(Sprite).spriteFrame = spriteFrame;
                });
                this.getComponent(UITransform).width = 65;
                this.getComponent(UITransform).height = 65;
            }
            else if (BoardState.piecePromoted == 5) {
                resources.load('art/whiterook/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                    this.getComponent(Sprite).spriteFrame = spriteFrame;
                });
                this.getComponent(UITransform).width = 48;
                this.getComponent(UITransform).height = 61;
            }
            else if (BoardState.piecePromoted == -5) {
                resources.load('art/blackrook/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                    this.getComponent(Sprite).spriteFrame = spriteFrame;
                });
                this.getComponent(UITransform).width = 48;
                this.getComponent(UITransform).height = 61;
            }
            else if (BoardState.piecePromoted == 3) {
                resources.load('art/whitebishop/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                    this.getComponent(Sprite).spriteFrame = spriteFrame;
                });
                this.getComponent(UITransform).width = 49;
                this.getComponent(UITransform).height = 67;
            }
            else if (BoardState.piecePromoted == -3) {
                resources.load('art/blackbishop/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                    this.getComponent(Sprite).spriteFrame = spriteFrame;
                });
                this.getComponent(UITransform).width = 49;
                this.getComponent(UITransform).height = 67;
            }
            else if (BoardState.piecePromoted == 2) {
                resources.load('art/whiteknight/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                    this.getComponent(Sprite).spriteFrame = spriteFrame;
                });
                this.getComponent(UITransform).width = 56;
                this.getComponent(UITransform).height = 65;
            }
            else if (BoardState.piecePromoted == -2) {
                resources.load('art/blackknight/spriteFrame', SpriteFrame, (err: any, spriteFrame) => {
                    this.getComponent(Sprite).spriteFrame = spriteFrame;
                });
                this.getComponent(UITransform).width = 56;
                this.getComponent(UITransform).height = 65;
            }
            BoardState.promoting = new Vec3(-1000, -1000, 0);
            this.prePieceName = this.pieceName;
            this.pieceName = BoardState.piecePromoted;
            BoardState.setBoard(this.pieceName, this.piecePosition);
            BoardState.piecePromoted = 0;
            if (BoardState.isInCheck()) {
                BoardState.justChecked = true;
            }
            if (Math.abs(this.piecePosition.x - this.prePiecePosition.x) == BoardState.tileSize) {
                BoardState.justCaptured = true;
            }
            this.unschedule(this.promotingPawn);
        }
    }

    update(deltaTime: number) {
        this.node.getPosition(this.piecePosition);
        if (this.piecePosition.x == -1000) {
            return;
        }
        if (BoardState.promoting.x > -1000) {
            return;
        }
        if (Math.abs(this.piecePosition.x) % BoardState.tileSize == BoardState.tileSize / 2
         && Math.abs(this.piecePosition.y) % BoardState.tileSize == BoardState.tileSize / 2) {
            this.capturedPiece();
            this.castlingRook();
        }
        if (BoardState.boardHistory.length == this.piecePositionHistory.length) {
            this.piecePositionHistory.push(new Vec3(this.piecePosition));
        }
        if (BoardState.gameOver) {
            return;
        }
        if (this.isDragged) {
            this.node.setPosition(this.cursorPosition);
            if (this.isReleased) {
                this.isDragged = false;
            }
        }
        if (this.isReleased) {
            this.adjustCoordinate(this.piecePosition);
            if (BoardState.isValidMove(this.pieceName, this.prePiecePosition, this.piecePosition)) {
                BoardState.moves += 1;
                BoardState.justMoved = true;
                if (BoardState.board[BoardState.convertCoordinates(this.piecePosition)[0]][BoardState.convertCoordinates(this.piecePosition)[1]] != 0) {
                    BoardState.justCaptured = true;
                }
                BoardState.setBoard(0, this.prePiecePosition);
                BoardState.setBoard(this.pieceName, this.piecePosition);
                BoardState.turn *= -1;
                this.castlingKing();
                if (BoardState.isInCheck()) {
                    BoardState.justChecked = true;
                }
                if (Math.abs(this.pieceName) == 1) {
                    this.updatingPawn();
                    if (BoardState.convertCoordinates(this.piecePosition)[0] == 0 
                    || BoardState.convertCoordinates(this.piecePosition)[0] == 7) {
                        BoardState.promoting.x = this.piecePosition.x;
                        BoardState.promoting.y = this.piecePosition.y;
                        this.schedule(this.promotingPawn, deltaTime, 2000000000);
                    }
                    else {
                        BoardState.promoting.x = -1000;
                        BoardState.promoting.y = -1000;
                    }
                }
                else {
                    BoardState.enPassant = [-1, -1];
                    BoardState.promoting.x = -1000;
                    BoardState.promoting.y = -1000;
                }
                let boardCopy: number[][] = [];
                for (let i = 0; i < 8; i++) {
                    let line = [];
                    for (let j = 0; j < 8; j++) {
                        line.push(BoardState.board[i][j]);
                    }
                    boardCopy.push(line);
                }
                BoardState.boardHistory.push(boardCopy);
                BoardState.previousPosition.x = this.prePiecePosition.x;
                BoardState.previousPosition.y = this.prePiecePosition.y;
                BoardState.currentMove.x = this.piecePosition.x;
                BoardState.currentMove.y = this.piecePosition.y;
                this.node.setPosition(this.piecePosition);
                this.node.getPosition(this.prePiecePosition);
            }
            else {
                this.node.setPosition(this.prePiecePosition);
            }
            this.isReleased = false;
        }
    }
}
