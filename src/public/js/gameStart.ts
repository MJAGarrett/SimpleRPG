import Game from "./models/Game.js";
import GameController from "./controllers/GameController.js";

const game = new Game();
const controller = new GameController(game);

game.initialize();
controller.notify();