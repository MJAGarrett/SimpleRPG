import Character from "../Character";

abstract class NPC extends Character {
	abstract name: string;
	constructor() {
		super();
	}

	generateDeathMessage(): string {
		return `${this.name} has died.`;
	}

	endTurn(): void {
		// TODO: implement when AI system is created.
	}
}

export default NPC;