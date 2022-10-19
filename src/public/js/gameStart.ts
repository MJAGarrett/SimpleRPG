import game from "./models/Game.js";
import GameController from "./controllers/GameController.js";

const controller = new GameController(game);

game.initialize();
controller.notify();