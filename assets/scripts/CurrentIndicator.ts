import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import { BoardState } from './BoardState';

@ccclass('Indicator1')
export class Indicator1 extends Component {
    start() {

    }

    update(deltaTime: number) {
        this.node.setPosition(BoardState.currentMove);
    }
}
