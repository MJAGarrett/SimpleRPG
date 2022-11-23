import Game from "./models/Game";
import GameController from "./controllers/GameController";

const game = new Game();
const controller = new GameController(game);

game.initialize();
controller.notify();