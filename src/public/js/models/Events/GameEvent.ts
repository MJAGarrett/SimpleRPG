import Character from "../Characters/Character";

abstract class GameEvent {
	abstract type: GameEventTypes;
	abstract details?: object;
	static messageEvent(details: MessageDetails): MessageEvent {
		return new MessageEvent(details);
	}
	static attackMessage(details: {attacker: Character, defender: Character, damage: number} ): MessageEvent {
		const {attacker, defender, damage} = details;
		const playerIsAttacker = attacker.name === "Player";
		const fullMessage: MessageDetails = {
			color: defender.name === "Player" ? "red" : "white",
			message: `${playerIsAttacker ? "You deal" : attacker.name + " deals"} ${damage} damage to ${defender.name === "Player" ? "you" : defender.name}.`,
		};
		return new MessageEvent(fullMessage);
	}
	static endTurnEvent(): TurnOverEvent {
		return new TurnOverEvent();
	}
	static moveEvent(details: object): MoveEvent {
		return new MoveEvent(details);
	}
	static playerUIChange(): PlayerUIChangeEvent {
		return new PlayerUIChangeEvent();
	}
	static inventoryEvent(): InventoryEvent {
		return new InventoryEvent();
	}
}

type GameEventTypes = "MESSAGE" | "MOVE" | "TURN_OVER" | "PLAYER_UI_CHANGE" | "INVENTORY_EVENT";

interface MessageDetails {
	color: string,
	message: string,
}

class MessageEvent extends GameEvent {
	type: GameEventTypes;
	details: MessageDetails;
	constructor(details: MessageDetails) {
		super();
		this.type = "MESSAGE";
		this.details = details;
	}
}

class MoveEvent extends GameEvent {
	type: GameEventTypes;
	details: object;
	constructor(details: object) {
		super();
		this.type = "MOVE";
		this.details = details;
	}
}

class TurnOverEvent extends GameEvent {
	type: GameEventTypes;
	details: object;
	constructor() {
		super();
		this.type = "TURN_OVER";
		this.details = {};
	}
}

class PlayerUIChangeEvent extends GameEvent {
	type: GameEventTypes;
	details?: object;
	constructor() {
		super();
		this.type = "PLAYER_UI_CHANGE";
	}
}

class InventoryEvent extends GameEvent {
	type: GameEventTypes;
	details?: object;
	constructor() {
		super();
		this.type = "INVENTORY_EVENT";
	}
}

export { GameEvent, GameEventTypes, MessageEvent };