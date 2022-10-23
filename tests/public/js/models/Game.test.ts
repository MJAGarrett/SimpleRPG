import { expect } from "chai";
import Sinon from "sinon";
import Game from "../../../../src/public/js/models/Game.js";
import GameController from "../../../../src/public/js/controllers/GameController.js";
import { GameEvent } from "../../../../src/public/js/models/Events/GameEvent.js";
import Player from "../../../../src/public/js/models/Characters/Player.js";

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
	let game: Game;

	beforeEach(() => {
		game = new Game();
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

			it("it should receive an event and pass it on to the controller if appropriate", () => {
				const message = GameEvent.messageEvent({
					color: "red",
					message: "test",
				});
				const spy = Sinon.spy(controller, "handleGameEvents");

				game.handleEvent(message);
				expect(spy.calledOnceWith(message)).to.be.true;
			});

			it("it should call takeTurn() on an end turn event", () => {
				const stubbedTurn = Sinon.stub(game, "takeTurn");
				game.handleEvent(GameEvent.endTurnEvent());

				expect(stubbedTurn.calledOnce).to.be.true;
				stubbedTurn.restore();
			});
		});

		describe("takeTurn()", () => {
			let spy: Sinon.SinonSpy;

			beforeEach(() => {
				spy = Sinon.spy(game, "takeTurn");
			});

			afterEach(() => {
				spy.restore();
			});

			// TODO: it should make the AI take their turns.

			it("it should call itself only once if the player has > 0 AP at the start of the turn", () => {
				game.player = new Player();
				game.takeTurn();

				expect(spy.calledOnce).to.be.true;
			});

			it("it should call notifycontroller() on each turn", () => {
				const stub = Sinon.stub(game, "notifyController");
				game.takeTurn();
				
				expect(stub.calledOnce).to.be.true;
				stub.reset();
				
				const expectedCalls = 10;
				for (let i = 0; i < expectedCalls; i++) {
					game.takeTurn();
				}
				expect(stub.callCount).to.equal(expectedCalls);
				stub.restore();
			});

			it("it should call itself enough times for the player to regain their AP if the player has <= 0 AP at the start of their turn", () => {
				/**
				 * Call counts are 1 higher than in practice, as the Player's endTurn() method will automatically
				 * increase AP by its speed stat once.
				 */

				// Default character speed of 100.
				game.player = new Player();
				game.player.actionPoints = -200;
				game.takeTurn();

				expect(spy.callCount).to.equal(4);
				spy.resetHistory();

				// Character speed at 50.
				game.player.speed = 50;
				game.player.actionPoints = -200;
				game.takeTurn();

				expect(spy.callCount).to.equal(6);
			});

			it("it should call the player's restoreAP() method if their AP is <= 0 at the start of the turn", () => {
				const player = new Player();
				const skipSpy = Sinon.spy(player, "restoreAP");
				player.actionPoints = 0;
				game.player = player;

				game.takeTurn();
				expect(skipSpy.called).to.be.true;
				skipSpy.restore();
			});
		});
	});
});