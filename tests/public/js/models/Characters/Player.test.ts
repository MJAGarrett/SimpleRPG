import { expect } from "chai";

import Player from "../../../../../src/public/js/models/Characters/Player.js";
import Sword from "../../../../../src/public/js/models/Items/Weapons/Sword.js";
import WeaponBuilder from "../../../../../src/public/js/models/Items/Weapons/WeaponBuilder.js";
import {Helmet} from "../../../../../src/public/js/models/Items/Armor and Clothing/Armor.js";
import {EquipSlot} from "../../../../../src/public/js/models/Items/Interfaces";
import Zone, { ZoneCoordinate } from "../../../../../src/public/js/models/Game Map/Zone/Zone.js";
import Sinon from "sinon";
import Swordsman from "../../../../../src/public/js/models/Characters/NPCs/Swordsman.js";
import { GameEvent } from "../../../../../src/public/js/models/Events/GameEvent.js";
import Game from "../../../../../src/public/js/models/Game.js";

// const should = chai.should();
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
	
		it("It should initialize inventory to an empty array", () => {
			expect(player.inventory).to.exist;
			expect(player.inventory).to.be.an("array");
		});
	
		it("it should initialize level to 1", () => {
			expect(player.level).to.exist;
			expect(player.level).to.equal(1);
		});
	
		it("it should initialize experience points to 0", () => {
			expect(player.experience).to.exist;
			expect(player.experience).to.equal(0);
		});

		it("it should initialize equipment to an empty object", () => {
			const stuff = player.equipment;
			expect(stuff).to.have.all.keys("headwear", "shirt", "footwear", "pants", "weapon");
			const equipSlots: EquipSlot[] = Object.keys(stuff) as EquipSlot[];
			for (const slot of equipSlots) {
				expect(stuff[slot]).to.be.null;
			}
		});
	});
	
	describe("Player methods", () => {
	
		let player: Player;
		let swordBuilder: WeaponBuilder<Sword>;
		let zone: Zone;
	
		beforeEach(() => {
			player = new Player();
			swordBuilder = new WeaponBuilder(Sword);
		});
	
		describe("addItem()", () => {
			it("It should add an inventory item to the player's inventory", () => {
				expect(player.getInventory().length).to.be.equal(0);
	
				const newSword = swordBuilder.build();
				player.addItem(newSword);
	
				expect(player.inventory.length).to.be.equal(1);
				expect(player.inventory[0]).to.be.equal(newSword);
			});
		});
	
		describe("getInventory()", () => {
			it("It should return an array of all items in the player's inventory", () => {
				player.inventory = [];
				for (let i = 0; i < 10; i++) {
					player.addItem(swordBuilder.build());
				}
				const inventory = player.getInventory();
				expect(inventory).to.be.an("array");
				expect(inventory.length).to.equal(10);
	
				inventory.forEach((item) => {
					expect(item instanceof Sword).to.be.true;
				});
				
			});
		});

		describe("equipItem()", () => {

			beforeEach(() => {
				player.equipment = {
					weapon: null,
					headwear: null,
					shirt: null,
					pants: null,
					footwear: null,
				};
				player.inventory = [];
			});
			
			it("it should equip an item onto the player", () => {
				expect(player.equipment.weapon).to.be.null;
				const sword = swordBuilder.build();
				player.equipItem(sword);

				expect(player.equipment.weapon).to.equal(sword);
			});

			it("it should appropriately place weapons and armor onto the correct equipment slot", () => {
				expect(player.equipment.weapon).to.be.null;
				expect(player.equipment.headwear).to.be.null;

				const sword = swordBuilder.build();
				player.equipItem(sword);

				expect(player.equipment.weapon).to.equal(sword);

				const helmet = new Helmet();
				player.equipItem(helmet);

				expect(player.equipment.headwear).to.equal(helmet);

				// TODO: Add more Armor types to test all equipment slots.
			});

			it("it should remove currently equipped items before equipping new ones and place the old \
			items in the player's inventory", () => {
				const oldSword = swordBuilder.setDamage(50).setQuality("fine").build();
				player.equipItem(oldSword);

				const newSword = swordBuilder.setDamage(12).setQuality("low").build();
				player.equipItem(newSword);

				expect(player.equipment.weapon).to.equal(newSword);
				expect(player.inventory).to.include(oldSword);
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
			let restoreAP: Sinon.SinonStub;
			let emitEvent: Sinon.SinonStub;

			beforeEach(() => {
				restoreAP = Sinon.stub(player, "restoreAP");
				emitEvent = Sinon.stub(player, "emitEvent");
			});

			afterEach(() => {
				restoreAP.restore();
				emitEvent.restore();
			});

			it("it should call the player's restoreAP() method", () => {
				player.endTurn();

				expect(restoreAP.calledOnce).to.be.true;
			});

			it("it should call emitEvent() with a turn over event", () => {
				player.endTurn();

				expect(emitEvent.calledOnce).to.be.true;
				const [evt] = emitEvent.args[0];

				expect(evt instanceof GameEvent).to.be.true;
				expect(evt.type === "TURN_OVER").to.be.true;
			});
		});
	});

});

