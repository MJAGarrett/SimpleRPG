import "jsdom-global/register";
import { expect } from "chai";
import Sinon from "sinon";
import GameController from "../../../../src/public/js/controllers/GameController";
import Game from "../../../../src/public/js/models/Game";
import { GameEvent } from "../../../../src/public/js/models/Events/GameEvent";
import MessageLogController from "../../../../src/public/js/controllers/ComponentControllers/MessageLogController";
import Zone from "../../../../src/public/js/models/Game Map/Zone/Zone";
import Tile from "../../../../src/public/js/models/Game Map/Tile/Tile";
import Swordsman from "../../../../src/public/js/models/Characters/NPCs/Swordsman";
import Sword from "../../../../src/public/js/models/Items/Weapons/Sword";
import { Helmet } from "../../../../src/public/js/models/Items/Armor and Clothing/Armor";
import { setupPlayerInfoDiv } from "./helpers";

describe("GameController Class", () => {
	let controller: GameController;
	let game: Game;	

	beforeEach(() => {
		setupDOM();
		game = new Game();
		controller = new GameController(game);
	});

	after(() => {
		document.body.replaceChildren();
	});

	describe("Initialization", () => {

		it("it should set event handlers for player movement on the window object", () => {
			// Tests the existence of the event handlers by dispatching synthetic events.

			const keydowns = [
				"KeyA", 
				"KeyS", 
				"KeyW", 
				"KeyD", 
				"Numpad1", 
				"Numpad2", 
				"Numpad3", 
				"Numpad4",
				"Numpad5", 
				"Numpad6",
				"Numpad7", 
				"Numpad8", 
				"Numpad9",
			];
			
			// Stub the methods that will be invoked via the event handlers.
			const movementStub = Sinon.stub(game.player, "handleInput");
			const waitStub = Sinon.stub(game.player, "endTurn");

			for (const key of keydowns) {
				const event = new KeyboardEvent("keydown", {
					code: key,
				});
				expect(window.dispatchEvent(event)).to.be.true;
			}
			movementStub.restore();
			waitStub.restore();

			// 12 total movement keys and 1 end turn key.
			expect(movementStub.callCount).to.equal(keydowns.length - 1);
			expect(waitStub.calledOnce).to.be.true;
		});
	});

	describe("notify()", () => {

		it("it should call renderZone()", () => {
			// Casts "renderZone" as any to stub a private method.
			const stub = Sinon.stub(controller, "renderZone" as any);
			controller.notify();
			stub.restore();

			expect(stub.calledOnce).to.be.true;
		});

	});

	describe("handleGameEvents()", () => {

		let notifyStub: Sinon.SinonStub;
		let messageController: MessageLogController;
		let messageStub: Sinon.SinonStub;
		const message = GameEvent.messageEvent({
			color: "white",
			message: "testing",
		});

		beforeEach(() => {
			messageController = new MessageLogController();
			controller.components = [messageController];
			notifyStub = Sinon.stub(controller, "notify");
			messageStub = Sinon.stub(messageController, "updateComponent");
		});

		it("it should route events to their appropriate controllers", () => {
			controller.handleGameEvents(message);
			expect(messageStub.calledOnceWith(message)).to.be.true;
		});

		it("it should call it's notify() method", () => {
			controller.handleGameEvents(message);
			expect(notifyStub.calledOnce).to.be.true;
		});
	});

	describe("renderZone()", () => {
		beforeEach(() => {
			// Sets up an area to render.
			game.initialize();
		});

		it("it should call renderTile() for each tile in the game zone", () => {
			const stub = Sinon.stub(controller, "renderTile" as any);
			
			const zone: Zone = game.currentZone as Zone;
			// Assuming non-jagged array.
			const expectedCalls = zone.area.length * zone.area[0].length;

			controller.renderZone(zone);
			stub.restore();

			expect(stub.callCount).to.equal(expectedCalls);
		});

		it("it should append divs created by renderTile() to the game-area div", () => {
			controller.gameArea?.replaceChildren();
			expect(controller.gameArea?.childElementCount).to.equal(0);

			const zone: Zone = game.currentZone as Zone;
			controller.renderZone(zone);

			expect(controller.gameArea?.childElementCount).to.equal(100);
		});
	});

	describe("renderTile()", () => {
		const tileWithChar = new Tile("empty");
		const character = new Swordsman();
		tileWithChar.addCharacter(character);

		const emptyTile = new Tile("empty");

		const tileWithItem = new Tile("empty");
		const sword = new Sword();
		const helmet = new Helmet();
		tileWithItem.addItem(sword);
		tileWithItem.addItem(helmet);

		const tileWithTestSprite = new Tile("test");

		it("it should add the sprite info onto the div's class list for each tile div", () => {
			const empty = controller.renderTile(emptyTile);
			const test = controller.renderTile(tileWithTestSprite);

			expect(empty.classList.contains("empty")).to.be.true;
			expect(test.classList.contains("test")).to.be.true;
		});

		it("it should append a span with character info if a tile has a character in it", () => {
			const charTile = controller.renderTile(tileWithChar);
			const charSpan = charTile.querySelector("span");

			expect(charSpan).not.to.be.null;
			expect(charSpan?.textContent).to.equal(character.name.charAt(0).toUpperCase());
		});

		it("it should append a span with item info for each item in the tile", () => {
			const itemTile = controller.renderTile(tileWithItem);
			const itemSpans = itemTile.querySelectorAll("span");
			let hasSword = false;
			let hasHelmet = false;

			expect(itemSpans?.length).to.equal(2);

			itemSpans?.forEach((node) => {
				if (node.textContent === sword.type) hasSword = true;
				else if (node.textContent === helmet.type) hasHelmet = true;
			});

			expect(hasHelmet && hasSword).to.be.true;
		});

		it("it should not append any spans if the tile has no items nor characters in it", () => {
			const empty = controller.renderTile(emptyTile);
			expect(empty.querySelector("span")).to.be.null;
		});
	});
});

/**
 * Helper function to set up the basic DOM nodes needed for the GameController to
 * instantiate. Clears the document's body after each call for a clean setup.
 */
function setupDOM() {
	document.body.replaceChildren();
	const gameArea = document.createElement("div");
	gameArea.classList.add("game-area");
	document.body.appendChild(gameArea);

	const playerInfo = setupPlayerInfoDiv();
	document.body.appendChild(playerInfo); 

	const messageContainer = document.createElement("div");
	messageContainer.classList.add("message-container");
	document.body.appendChild(messageContainer);
}