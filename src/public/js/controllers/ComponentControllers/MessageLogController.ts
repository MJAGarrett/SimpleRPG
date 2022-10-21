import { GameEventTypes, MessageEvent } from "../../models/Events/GameEvent.js";
import ComponentController from "../Controller.js";

class MessageLogController implements ComponentController {
	handleType: GameEventTypes;
	componentToUpdate: HTMLElement;
	constructor() {
		this.handleType = "MESSAGE";
		const logArea = document.querySelector(".message-container");
		if (logArea !== null) {
			this.componentToUpdate = document.querySelector(".message-container") as HTMLElement;
		}
		else throw new Error("No HTML Element to write to");
	}

	updateComponent(event: MessageEvent): void {
		const message = document.createElement("p");
		message.textContent = event.details.message;
		message.style.color = event.details.color;
		message.addEventListener("click", () => {
			this.componentToUpdate.removeChild(message);
		});
		this.componentToUpdate.appendChild(message);
	}
}

export default MessageLogController;