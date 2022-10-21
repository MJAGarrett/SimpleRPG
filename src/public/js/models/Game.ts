import GameController from "../controllers/GameController.js";
import NPCGenerator from "./Characters/NPCs/NPCGenerator.js";
import Player from "./Characters/Player.js";
import { GameEvent } from "./Events/GameEvent.js";
import Zone from "./Game Map/Zone/Zone.js";

class Game {
	currentZone?: Zone;
	player: Player;
	controller?: GameController;
	constructor() {
		this.player = new Player();
	}

	/**
	 * A Testing method used to initialize the game area.
	 */
	initialize(): void {
		this.currentZone = new Zone();
		this.currentZone.placeCharacter(this.player, {row: 0, column: 0});
		this.currentZone.placeCharacter(NPCGenerator.swordsman(), {row: 4, column: 2});
	}
	registerController(control: GameController): void {
		this.controller = control;
	}
	notifyController(): void {
		if (!this.controller) throw new Error("Controller not defined");
		this.controller.notify();
	}

	handleEvent(evt: GameEvent): void {
		this.controller?.handleGameEvents(evt);
	}
}

export default new Game();