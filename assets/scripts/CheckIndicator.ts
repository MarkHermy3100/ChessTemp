import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import { BoardState } from './BoardState';

@ccclass('CheckIndicator')
export class CheckIndicator extends Component {
    start() {

    }

    update(deltaTime: number) {
        this.node.setPosition(BoardState.checkPosition);
    }
}
