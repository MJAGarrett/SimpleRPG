import Game from "../models/Game";
import Tile from "../models/Game Map/Tile/Tile";
import Zone from "../models/Game Map/Zone/Zone";
import { MovementCommand } from "../models/Characters/Player";
import { GameEvent } from "../models/Events/GameEvent";
import ComponentController from "./ComponentController";
import MessageLogController from "./ComponentControllers/MessageLogController";
import PlayerInfoController from "./ComponentControllers/PlayerInfoController";
import InventoryController from "./ComponentControllers/InventoryController";

class GameController {
	gameModel: Game;
	components: ComponentController[];
	gameArea: HTMLElement | null;
	constructor(game: Game) {
		this.components = [];
		this.gameModel = game;
		game.registerController(this);
		this.gameArea = document.querySelector(".game-area");
		this.initializeEventHandlers();
		this.initializeComponents();
	}
	notify(): void {
		this.renderZone(this.gameModel.currentZone as Zone);
	}

	handleGameEvents(event: GameEvent): void {
		for (const component of this.components) {
			if (component.handleType === event.type) {
				component.updateComponent(event);
			}
			this.notify();
		}
	}

	renderZone(zone: Zone): void {
		const areaTiles: HTMLElement[] = [];
	
		for (const row of zone.area) {
			for (const column of row) {
				const tile = this.renderTile(column);
				areaTiles.push(tile);
			}
		}
		this.gameArea?.replaceChildren(...areaTiles);
	}

	renderTile(tile: Tile): HTMLElement {
		const tileDiv = document.createElement("div");
		// add sprite style info here once sprites are in
		tileDiv.classList.add(tile.sprite);

		if (tile.character) {
			const charSpan  = document.createElement("span");
			charSpan.textContent = tile.character.name.charAt(0).toUpperCase();
			tileDiv.append(charSpan);
		}

		for (const item of tile.items) {
			const itemSpan = document.createElement("span");
			itemSpan.textContent = item.type;
			tileDiv.append(itemSpan);
		}

		return tileDiv;
	}

	private initializeEventHandlers() {
		this.setUpPlayerMovementHandler();
		window.addEventListener("keypress", (e) => {
			if (e.code === "KeyI") {
				e.preventDefault();
				this.handleGameEvents(GameEvent.inventoryEvent());
			}
		});
	}

	private setUpPlayerMovementHandler() {
		window.addEventListener("keydown", (e) => {
			const movement: MovementCommand = {};
			const code = e.code;
			if (code === "Space" || code === "Numpad5") this.gameModel.player.endTurn();
			switch (true) {
			case code === "KeyA" || code === "Numpad4":
				e.preventDefault();
				movement.horizontal = "left";
				break;
			case code === "KeyD" || code === "Numpad6":
				e.preventDefault();
				movement.horizontal = "right";
				break;
			case code === "KeyW" || code === "Numpad8":
				e.preventDefault();
				movement.vertical = "up";
				break;
			case code === "KeyS" || code === "Numpad2":
				e.preventDefault();
				movement.vertical = "down";
				break;
			case code === "Numpad9":
				e.preventDefault();
				movement.vertical = "up";
				movement.horizontal = "right";
				break;
			case code === "Numpad7":
				e.preventDefault();
				movement.vertical = "up";
				movement.horizontal = "left";
				break;
			case code === "Numpad3":
				e.preventDefault();
				movement.vertical = "down";
				movement.horizontal = "right";
				break;
			case code === "Numpad1":
				e.preventDefault();
				movement.vertical = "down";
				movement.horizontal = "left";
				break;
			}
			if (Object.keys(movement).length > 0) {
				this.gameModel.player.handleInput(movement);
			}
		});
	}

	private initializeComponents(): void {
		const playerUI = new PlayerInfoController(this.gameModel.player);
		playerUI.updateComponent();

		const messages = new MessageLogController();
		messages.updateComponent(GameEvent.messageEvent({
			message: "Welcome to the Game!",
			color: "white",
		}));

		const inventory = new InventoryController(this.gameModel.player);

		this.components.push(messages, playerUI, inventory);

	}
}

export default GameController;