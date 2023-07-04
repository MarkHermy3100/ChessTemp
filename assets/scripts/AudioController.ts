import { _decorator, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
import { BoardState } from './BoardState';

@ccclass('AudioController')
export class AudioController extends Component {
    @property(AudioSource)
    private move: AudioSource = null;
    @property(AudioSource)
    private capture: AudioSource = null;
    @property(AudioSource)
    private castle: AudioSource = null;
    @property(AudioSource)
    private promote: AudioSource = null;
    @property(AudioSource)
    private check: AudioSource = null;

    start() {

    }

    update(deltaTime: number) {
        if (!BoardState.disable) {
            if (BoardState.justMoved && BoardState.promoting.x == -1000) {
                if (BoardState.justChecked) {
                    BoardState.justChecked = false;
                    BoardState.justFortressed = false;
                    BoardState.justCaptured = false;
                    BoardState.justPromoted = false;
                    this.check.play();
                }
                else if (BoardState.justFortressed) {
                    BoardState.justFortressed = false;
                    this.castle.play();
                }
                else if (BoardState.justCaptured) {
                    BoardState.justCaptured = false;
                    BoardState.justPromoted = false;
                    this.capture.play();
                }
                else if (BoardState.justPromoted) {
                    BoardState.justPromoted = false;
                    this.promote.play();
                }
                else {
                    this.move.play();
                }
            }
            else if (BoardState.justPromoted) {
                if (BoardState.justChecked) {
                    BoardState.justChecked = false;
                    BoardState.justCaptured = false;
                    BoardState.justPromoted = false;
                    this.check.play();
                }
                else if (BoardState.justCaptured) {
                    BoardState.justCaptured = false;
                    BoardState.justPromoted = false;
                    this.capture.play();
                }
                else {
                    BoardState.justPromoted = false;
                    this.promote.play();
                }
            }
        }
    }
}
