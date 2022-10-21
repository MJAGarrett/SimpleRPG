abstract class GameEvent {
	abstract type: GameEventTypes;
	abstract details: object;
	static messageEvent(details: MessageDetails) {
		return new MessageEvent(details);
	}
}

type GameEventTypes = "MESSAGE";

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

export { GameEvent, GameEventTypes, MessageEvent };