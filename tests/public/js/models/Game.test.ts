import { expect } from "chai";
import Sinon from "sinon";
import Game from "../../../../src/public/js/models/Game";
import GameController from "../../../../src/public/js/controllers/GameController";
import { GameEvent } from "../../../../src/public/js/models/Events/GameEvent";
import Player from "../../../../src/public/js/models/Characters/Player";
import NPC from "../../../../src/public/js/models/Characters/NPCs/NPC";
import Swordsman from "../../../../src/public/js/models/Characters/NPCs/Swordsman";

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

			it("it should call preprocessTurn for each NPC in the current zone", () => {
				const npcs: NPC[] = [];
				const stubs: Sinon.SinonStub[] = [];

				for (let i = 0; i < game.currentZone.area.length; i++) {
					const swordsman = new Swordsman();
					npcs.push(swordsman);
					stubs.push(Sinon.stub(swordsman, "preprocessTurn"));
					game.currentZone.placeCharacter(swordsman, { row: i, column: 0});
				}

				game.takeTurn();

				for (const stub of stubs) {
					stub.restore();
				}
				for (const stub of stubs) {
					expect(stub.calledOnce).to.be.true;
				}
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

			it("it should call the player's preprocessTurn() method", () => {
				const player = new Player();
				const skipSpy = Sinon.spy(player, "preprocessTurn");
				game.player = player;

				game.takeTurn();
				expect(skipSpy.called).to.be.true;
				skipSpy.restore();
			});
		});
	});
});