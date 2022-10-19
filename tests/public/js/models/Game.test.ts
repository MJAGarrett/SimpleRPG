import { expect } from "chai";
import Sinon from "sinon";

import game from "../../../../src/public/js/models/Game.js";
import GameController from "../../../../src/public/js/controllers/GameController.js";

/**
 * Fake object created to allow for testing the controller outside of a browser environment.
 * The constructor of the real GameController needs access to the DOM.
 */
class ControllerFake {
	constructor() {}
	notify(): void {
	}
}

describe("Game Class", () => {
	const controller: GameController = new ControllerFake() as GameController;

	describe("Methods", () => {
		describe("notifyController()", () => {
			beforeEach(() => {
				game.controller = controller;
			});

			after(() => {
				game.controller = undefined;
			});

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
	});
});