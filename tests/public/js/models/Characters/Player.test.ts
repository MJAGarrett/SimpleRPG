import chai, { expect } from "chai";

import Player from "../../../../../src/js/models/Characters/Player.js";
import Sword from "../../../../../src/js/models/Items/Weapons/Sword.js";
import WeaponBuilder from "../../../../../src/js/models/Items/Weapons/WeaponBuilder.js";
import {Helmet} from "../../../../../src/js/models/Items/Armor and Clothing/Armor.js";
import {EquipSlot} from "../../../../../src/js/models/Items/Interfaces";

// const should = chai.should();
describe("Player Class", () => {

	describe("Player Constructor", () => {
		let player: Player;
	
		before(() => {
			player = new Player();
		});
	
		it("It should initialize health stat to 100", () => {
			chai.expect(player.health).to.exist;
			chai.expect(player.health).to.be.a("number");
			chai.expect(player.health).to.equal(100);
		});
	
		it("It should initialize inventory to an empty array", () => {
			chai.expect(player.inventory).to.exist;
			chai.expect(player.inventory).to.be.an("array");
		});
	
		it("it should initialize level to 1", () => {
			chai.expect(player.level).to.exist;
			chai.expect(player.level).to.equal(1);
		});
	
		it("it should initialize experience points to 0", () => {
			chai.expect(player.experience).to.exist;
			chai.expect(player.experience).to.equal(0);
		});

		it("it should initialize equipment to an empty object", () => {
			const stuff = player.equipment;
			chai.expect(stuff).to.have.all.keys("headwear", "shirt", "footwear", "pants", "weapon");
			const equipSlots: EquipSlot[] = Object.keys(stuff) as EquipSlot[];
			for (const slot of equipSlots) {
				expect(stuff[slot]).to.be.null;
			}
		});
	});
	
	describe("Player methods", () => {
	
		let player: Player;
		let swordBuilder: WeaponBuilder<Sword>;
	
		before(() => {
			player = new Player();
			swordBuilder = new WeaponBuilder(Sword);
		});
	
		describe("addItem", () => {
			it("It should add an inventory item to the player's inventory", () => {
				chai.expect(player.getInventory().length).to.be.equal(0);
	
				const newSword = swordBuilder.build();
				player.addItem(newSword);
	
				chai.expect(player.inventory.length).to.be.equal(1);
				chai.expect(player.inventory[0]).to.be.equal(newSword);
			});
		});
	
		describe("getInventory", () => {
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
	
		describe("reduceHealth()", () => {
			it("should reduce the player's health by an input", () => {
				const previousHealth = player.health;
	
				player.reduceHealth(20);
	
				expect(player.health).to.equal(previousHealth - 20);
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
	});

});

