import { expect } from "chai";
import Sinon from "sinon";

import game from "../../../../src/public/js/models/Game.js";
import GameController from "../../../../src/public/js/controllers/GameController.js";
import { GameEvent } from "../../../../src/public/js/models/Events/GameEvent.js";

/**
 * Fake object created to allow for testing the controller outside of a browser environment.
 * The constructor of the real GameController needs access to the DOM.
 */
class ControllerFake {
	constructor() {}
	notify(): void {
	}
	// eslint-disable-next-line no-unused-vars
	handleGameEvents(evt: GameEvent): void {}
}

describe("Game Class", () => {
	let controller: GameController;

	beforeEach(() => {
		controller = new ControllerFake() as GameController;
		game.controller = controller;
	});

	after(() => {
		game.controller = undefined;
	});

	describe("Methods", () => {
		describe("notifyController()", () => {

			it("it should throw an error if there is no controller registered with the game", () => {
				game.controller = undefined;

				expect(game.notifyController).to.throw();
			});

			it("it should call the notify() method of its controller once", () => {
				const spy = Sinon.spy(controller, "notify");

				game.notifyController();
				expect(spy.calledOnce).to.be.true;
			});
		});

		describe("handleEvent()", () => {

			it("it should recieve an event and pass it on to the controller", () => {
				const message = GameEvent.messageEvent({
					color: "red",
					message: "test",
				});
				const spy = Sinon.spy(controller, "handleGameEvents");

				game.handleEvent(message);
				expect(spy.calledOnceWith(message)).to.be.true;
			});
		});
	});
});