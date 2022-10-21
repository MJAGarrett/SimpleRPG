import Character from "../Character.js";

abstract class NPC extends Character {
	abstract name: string;
	constructor() {
		super();
	}

	generateDeathMessage(): string {
		return `${this.name} has died.`;
	}
}

export default NPC;