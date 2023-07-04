import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;
import { BoardState } from './BoardState';

@ccclass('GameOver')
export class GameOver extends Component {
    @property(Label)
    private gameOver: Label = null;
    start() {

    }

    update(deltaTime: number) {
        if (BoardState.justMoved) {
            this.schedule(function() {
                if (BoardState.turn == 1) {
                    if (BoardState.isCheckmate(BoardState.whiteKing)) {
                        BoardState.gameOver = true;
                        this.gameOver.string = "Black Won";
                    }
                    if (BoardState.isStalemate(BoardState.whiteKing)) {
                        BoardState.gameOver = true;
                        this.gameOver.string = "Draw";
                    }
                }
                else if (BoardState.turn == -1) {
                    if (BoardState.isCheckmate(BoardState.blackKing)) {
                        BoardState.gameOver = true;
                        this.gameOver.string = "White Won";
                    }
                    if (BoardState.isStalemate(BoardState.blackKing)) {
                        BoardState.gameOver = true;
                        this.gameOver.string = "Draw";
                    }
                }
                if (BoardState.isInsufficient()) {
                    BoardState.gameOver = true;
                    this.gameOver.string = "Draw";
                }
            }, 0, 6000, 0.1);
            BoardState.justMoved = false;
        }
        if (BoardState.moves > 0 && BoardState.gameOver) {
            if (BoardState.isInsufficient()) {
                this.gameOver.string = "Draw";
            }
            else if (BoardState.turn == 1) {
                this.gameOver.string = "Black Won";
            }
            else if (BoardState.turn == -1) {
                this.gameOver.string = "White Won";
            }
        }
        else {
            this.gameOver.string = "";
        }
    }
}
