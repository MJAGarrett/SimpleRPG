import GameController from "../controllers/GameController";
import NPCGenerator from "./Characters/NPCs/NPCGenerator";
import Player from "./Characters/Player";
import { GameEvent } from "./Events/GameEvent";
import Zone from "./Game Map/Zone/Zone";
import { Breastplate } from "./Items/Armor and Clothing/Armor";
import HealthPotion from "./Items/Consumables/Potions/HealthPotion";
import Sword from "./Items/Weapons/Sword";

class Game {
	currentZone: Zone;
	player: Player;
	controller?: GameController;
	constructor() {
		this.player = new Player();
		this.currentZone = new Zone(this);
	}

	/**
	 * A Testing method used to initialize the game area.
	 */
	initialize(): void {
		this.currentZone = new Zone(this);
		this.currentZone.placeCharacter(this.player, {row: 0, column: 0});
		this.currentZone.placeCharacter(NPCGenerator.swordsman(), {row: 4, column: 2});

		this.player.name = "Testerman";
		this.player.health = 50;
		const potion = new HealthPotion(5,5);
		this.player.addItem(potion);
		this.player.addItem(new Sword());
		window.addEventListener("keydown", (e) => {
			if (e.code === "NumpadAdd") {
				e.preventDefault();
				// if (this.player.inventory.includes(potion)) {
				// 	this.player.consumeItem(potion);
				// }
				// else {
				// 	console.log("No potion to drink");
				// }
				for (let i = 0; i < 10; i++) {
					this.player.addItem(new Sword());
				}
			}
			else if (e.code === "KeyM") {
				e.preventDefault();
				this.player.equipItem(new Sword());
				console.log(this.player.inventory);
			}
			else if (e.code === "KeyB") {
				e.preventDefault();
				this.player.equipItem(new Breastplate());
			}
			else if (e.code === "KeyE") {
				e.preventDefault();
				console.log(this.player.health);
			} 
			else if (e.code === "KeyR") {
				e.preventDefault();
				console.log("inv");		
				console.log(this.player.inventory);
				console.log("effects");
				console.log(this.player.statusEffects);
				console.log(`Current AP = ${this.player.stats.actionPoints}`);
					
			}
		});
	}
	registerController(control: GameController): void {
		this.controller = control;
	}
	notifyController(): void {
		if (!this.controller) throw new Error("Controller not defined");
		this.controller.notify();
	}

	handleEvent(evt: GameEvent): void {
		if (evt.type === "TURN_OVER") {
			this.takeTurn();
		} 
		else this.controller?.handleGameEvents(evt);
	}

	takeTurn(): void {
		for (const npc of this.currentZone.npcs) {	
			npc.preprocessTurn();
		}
		this.player.preprocessTurn();
		this.notifyController();
	}
}

export default Game;