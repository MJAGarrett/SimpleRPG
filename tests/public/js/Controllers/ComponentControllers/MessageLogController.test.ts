import "jsdom-global/register";
import { expect } from "chai";
import MessageLogController from "../../../../../src/public/js/controllers/ComponentControllers/MessageLogController";
import { GameEvent } from "../../../../../src/public/js/models/Events/GameEvent";

describe("GameController Class", () => {

	let controller: MessageLogController;
	let messageContainer: HTMLElement;
	before(() => {
		messageContainer = document.createElement("div");
		messageContainer.classList.add("message-container");
		document.body.appendChild(messageContainer);
		controller = new MessageLogController();
	});

	beforeEach(() => {
		messageContainer.replaceChildren();
	});

	describe("updateComponent()", () => {

		it("it should create and append a message to the message-container from a message event", () => {
			const message = GameEvent.messageEvent({
				color: "yellow",
				message: "Test message",
			});
			controller.updateComponent(message);
			const appendedChild = messageContainer.querySelector("p");

			expect(appendedChild).not.to.be.null;
			expect(appendedChild?.textContent).to.equal(message.details.message);
			expect(appendedChild?.style.color).to.equal(message.details.color);
		});

		it("it should add an event listener that deletes the message on click to the message", () => {
			const message = GameEvent.messageEvent({
				color: "yellow",
				message: "Test message",
			});
			controller.updateComponent(message);

			expect(controller.componentToUpdate.childElementCount).to.equal(1);

			const messagePara = controller.componentToUpdate.querySelector("p");
			const clickEvt = new MouseEvent("click");
			messagePara?.dispatchEvent(clickEvt);

			expect(controller.componentToUpdate.childElementCount).to.equal(0);
		});
	});
});