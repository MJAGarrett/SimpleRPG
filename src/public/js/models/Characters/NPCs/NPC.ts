import Character from "../Character";
import NPCAI from "./AI/NPCAI";

abstract class NPC extends Character {
	abstract name: string;
	AI: NPCAI;
	constructor() {
		super();
		this.AI = new NPCAI(this);
	}

	generateDeathMessage(): string {
		return `${this.name} has died.`;
	}

	startTurn(): void {
		this.AI.takeTurn();
	}
}

export default NPC;