import { expect } from "chai";
import { GameEvent, MessageEvent } from "../../../../../src/public/js/models/Events/GameEvent.js";

describe("MessageEvent Class", () => {

	describe("Constructor", () => {
		let messageEvent: MessageEvent;
		const messageContent = "Test message";
		const messageColor = "white";

		before(() => {
			messageEvent = GameEvent.messageEvent({
				color: messageColor,
				message: messageContent,
			});
		});
		
		it("it should initialize a MessageEvent/GameEvent object of type \"MESSAGE\"", () => {
			expect(messageEvent.type === "MESSAGE").to.be.true;
		});

		it("it should initialize a the color and message props to values specified in the constructor", () => {
			expect(messageEvent.details.color === messageColor).to.be.true;
			expect(messageEvent.details.message === messageContent).to.be.true;
		});
	});
});