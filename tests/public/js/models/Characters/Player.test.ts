import { expect } from "chai";

import Player from "../../../../../src/public/js/models/Characters/Player";
import Sword from "../../../../../src/public/js/models/Items/Weapons/Sword";
import {Helmet} from "../../../../../src/public/js/models/Items/Armor and Clothing/Armor";
import Zone, { ZoneCoordinate } from "../../../../../src/public/js/models/Game Map/Zone/Zone";
import Sinon from "sinon";
import Swordsman from "../../../../../src/public/js/models/Characters/NPCs/Swordsman";
import { GameEvent } from "../../../../../src/public/js/models/Events/GameEvent";
import Game from "../../../../../src/public/js/models/Game";
import InventoryManager from "../../../../../src/public/js/models/Characters/InventoryManager";

describe("Player Class", () => {

	describe("Player Constructor", () => {
		let player: Player;
	
		before(() => {
			player = new Player();
		});
	
		it("It should initialize health stat to 100", () => {
			expect(player.health).to.exist;
			expect(player.health).to.be.a("number");
			expect(player.health).to.equal(100);
		});
	
		it("It should initialize inventory to an InventoryManager instance", () => {
			expect(player.inventory).to.exist;
			expect(player.inventory instanceof InventoryManager).to.be.true;
		});
	
		it("it should initialize level to 1", () => {
			expect(player.level).to.exist;
			expect(player.level).to.equal(1);
		});
	
		it("it should initialize experience points to 0", () => {
			expect(player.experience).to.exist;
			expect(player.experience).to.equal(0);
		});
	});
	
	describe("Player methods", () => {
	
		let player: Player;
		let zone: Zone;
	
		beforeEach(() => {
			player = new Player();
		});

		describe("equipItem()", () => {
			let invStub: Sinon.SinonStub;

			beforeEach(() => {
				invStub = Sinon.stub(player.inventory, "equipItem");
			});

			afterEach(() => {
				invStub.restore();
			});
			
			it("it should invoke the player's inventoryManager's equipItem function with the item passed", () => {
				const sword = new Sword();
				player.equipItem(sword);

				expect(invStub.calledWith(sword)).to.be.true;
			});

			it("it should call UIChange()", () => {
				const UIStub = Sinon.stub(player, "UIChange");
				player.equipItem(new Helmet());
				UIStub.restore();

				expect(UIStub.calledOnce).to.be.true;
			});

		});

		describe("unequipItem()", () => {
			let UIStub: Sinon.SinonStub;
			let invStub: Sinon.SinonStub;
			let helmet: Helmet;

			beforeEach(() => {
				UIStub = Sinon.stub(player, "UIChange");
				invStub = Sinon.stub(player.inventory, "unequipItem");
				helmet = new Helmet();
				player.equipment.headwear = helmet;
			});
			afterEach(() => {
				UIStub.reset();
				invStub.reset();
			});
			after(() => {
				UIStub.restore();
				invStub.restore();
			});

			it("it should call the player's InventoryManager's unequipItem method with the inventory slot given", () => {
				player.unequipItem("headwear");

				expect(invStub.calledWith("headwear")).to.be.true;
			});

			it("it should return the object in a character's equipment slot", () => {
				invStub.returns(helmet);
				const returned = player.unequipItem("headwear");

				expect(returned).to.equal(helmet);
			});

			it("it should call UIChange", () => {
				player.unequipItem("headwear");

				expect(UIStub.calledOnce).to.be.true;
			});

			it("it should return null if the InventoryManager's unequipItem throws", () => {
				invStub.throws();
				const returnedVal = player.unequipItem("footwear");
				expect(returnedVal).to.be.null;
			});

		});

		describe("handleInput()", () => {
			const player = new Player();
			beforeEach(() => {
				const game = new Game();
				zone = new Zone(game);
				zone.placeCharacter(player, {row: 1, column: 1});
			});

			it("it should call zone.moveCharacter() if the tile is empty", () => {
				const stub = Sinon.stub(zone, "moveCharacter");
				/**
				 * For some reason the above stub still calls zone.emitEvent() and causes 
				 * an exception as the test zone will emit to the game singleton
				 * and throw as the game instance doesn't have a controller reference.
				 * 
				 * The below stub works as expected and prevents the exception.
				 */
				const stubThatIsNecessaryForSomeReason = Sinon.stub(zone, "emitEvent");

				// Redefining coords here to avoid TypeScript thinking they could be undefined.
				player.zoneCoords = { row: 1, column: 1 };

				player.handleInput({ horizontal: "right", vertical: "up"});

				const expectedCoords: ZoneCoordinate = { 
					row: player.zoneCoords.row + 1, 
					column: player.zoneCoords.column + 1,
				};

				expect(stub.calledOnceWithExactly(player, expectedCoords));
				stub.restore();
				stubThatIsNecessaryForSomeReason.restore();
			});

			it("it should call reduceActionPoints() if player can move into tile", () => {
				const preventMovement = Sinon.stub(zone, "moveCharacter");
				const reduceFunc = Sinon.stub(player, "reduceActionPoints");

				player.handleInput({ horizontal: "right", vertical: "up"});

				expect(reduceFunc.calledOnce).to.be.true;
				preventMovement.restore();
				reduceFunc.restore();
			});

			it("it should call attack() with a character if there is one in the targeted square", () => {
				const enemy = new Swordsman();
				zone.placeCharacter(enemy, {row: 0, column: 1});

				const stub = Sinon.stub(player, "attack");
				
				player.handleInput({vertical: "up"});

				expect(stub.calledOnceWith(enemy)).to.be.true;
				stub.restore();
			});
		});

		describe("generateDeathMessage()", () => {

			it("it should return \"You have died.\"", () => {
				const actual = player.generateDeathMessage();
				expect(actual).to.equal("You have died.");
			});
		});

		describe("endTurn", () => {
			let emitEvent: Sinon.SinonStub;

			beforeEach(() => {
				emitEvent = Sinon.stub(player, "emitEvent");
			});

			afterEach(() => {
				emitEvent.restore();
			});

			it("it should call emitEvent() with a turn over event", () => {
				player.endTurn();

				expect(emitEvent.calledOnce).to.be.true;
				const [evt] = emitEvent.args[0];

				expect(evt instanceof GameEvent).to.be.true;
				expect(evt.type === "TURN_OVER").to.be.true;
			});
		});

		describe("UIChange()", () => {

			it("it should call emitEvent() with an instance of PlayerUIChangeEvent", () => {
				const emitStub = Sinon.stub(player, "emitEvent");
				const example = GameEvent.playerUIChange();
				
				player.UIChange();
				emitStub.restore();

				expect(emitStub.calledOnceWith(Sinon.match.has("type", example.type)));
			});
		});
	});

	describe("Player Setters", () => {

		let UIStub: Sinon.SinonStub;
		const player: Player = new Player();
		let callCount = 0;

		before(() => {
			UIStub = Sinon.stub(player, "UIChange");
		});
		
		after(() => {
			UIStub.restore();
		});

		it("all setters with corresponding UI components should call UIChange()", () => {
			player.health = 5;
			callCount++;
			player.actionPoints = 5;
			callCount++;
			player.speed = 20;
			callCount++;
			player.levelUp();
			callCount++;

			expect(UIStub.callCount).to.equal(callCount);
			
		});
	});

});

