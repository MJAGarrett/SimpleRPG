import GameController from "../controllers/GameController.js";
import Player from "./Characters/Player.js";
import Zone from "./Game Map/Zone/Zone.js";

class Game {
	currentZone: Zone;
	player: Player;
	controller?: GameController;
	constructor() {
		this.currentZone = new Zone();
		this.player = new Player();
	}

	/**
	 * A Testing method used to initialize the game area.
	 */
	initialize(): void {
		this.currentZone.placeCharacter(this.player, {row: 0, column: 0});

	}
	registerController(control: GameController): void {
		this.controller = control;
	}
	notifyController(): void {
		if (!this.controller) throw new Error("Controller not defined");
		this.controller.notify();
	}
}

export default new Game();