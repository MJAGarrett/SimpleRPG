import { expect } from "chai";
import InventoryManager from "../../../../../src/public/js/models/Characters/InventoryManager";
import { Breastplate, Helmet } from "../../../../../src/public/js/models/Items/Armor and Clothing/Armor";
import { InventoryItem } from "../../../../../src/public/js/models/Items/Interfaces";
import Sword from "../../../../../src/public/js/models/Items/Weapons/Sword";

describe("InventoryManager class", () => {
	let invManager: InventoryManager;

	beforeEach(() => {
		invManager = new InventoryManager();
	});

	describe("getInventory()", () => {

		it("it should return an array of the current inventory items", () => {
			const sword = new Sword();
			const breastplate = new Breastplate();

			invManager.inventory = [];
			let inv: InventoryItem[] = invManager.getInventory();
			expect(inv).to.be.an("array");
			expect(inv.length === 0).to.be.true;

			invManager.inventory = [sword, breastplate];
			inv = invManager.getInventory();
			expect(inv.includes(sword) && inv.includes(breastplate)).to.be.true;
		});
	});

	describe("addItem()", () => {

		beforeEach(() => {
			invManager.currentWeight = 0;
			invManager.maxCarryWeight = 200;
		});

		it("it should throw an error if the item's added weight would go over the max carry weight", () => {
			invManager.maxCarryWeight = 10;
			invManager.currentWeight = 5;
			const lighterSword = new Sword();
			lighterSword.weight = 5;
			const heavierSword = new Sword();
			heavierSword.weight = 20;

			expect(() => invManager.addItem(heavierSword)).to.throw();
			expect(() => invManager.addItem(lighterSword)).not.to.throw();
		});

		it("it should push an item into the inventory array", () => {
			const sword = new Sword();
			invManager.inventory = [];

			invManager.addItem(sword);
			expect(invManager.inventory.includes(sword)).to.be.true;
		});

		it("it should increment the currentWeight by the item's weight", () => {
			const beforeWeight = invManager.currentWeight;
			const sword = new Sword();

			invManager.addItem(sword);
			expect(invManager.currentWeight).to.equal(beforeWeight + sword.weight);
		});
	});

	describe("removeItem()", () => {

		it("it should filter an item from the inventory array if the array stores the item", () => {
			const sword = new Sword();
			const breastplate = new Breastplate();
			const sword2 = new Sword();
			invManager.inventory = [sword, breastplate, sword2];

			invManager.removeItem(sword);

			expect(invManager.inventory.includes(sword)).to.be.false;
			expect(invManager.inventory.length).to.equal(2);
		});

		it("it should throw an error if the item is not in the array", () => {
			invManager.inventory = [];
			const sword = new Sword();

			expect(() => invManager.removeItem(sword)).to.throw();
		});
	});

	describe("equipItem()", () => {

		it("it should add an item the inventory array if there is already one in a slot", () => {
			const equippedHelm = new Helmet();
			const toBeEquippedHelm = new Helmet();
			invManager.equippedItems[equippedHelm.equipSlot] = equippedHelm;

			invManager.equipItem(toBeEquippedHelm);
			expect(invManager.inventory.includes(equippedHelm)).to.be.true;
		});

		it("it should add an item to the appropriate equip slot", () => {
			const helm = new Helmet();

			invManager.equipItem(helm);

			expect(invManager.equippedItems[helm.equipSlot]).to.equal(helm);
		});

		it("it should remove the newly equipped item from the inventory, if it exists in the inventory", () => {
			const helm = new Helmet();
			invManager.inventory = [helm];

			invManager.equipItem(helm);

			expect(invManager.inventory.includes(helm)).to.be.false;
		});
	});

	describe("unequipItem()", () => {

		it("it should throw an error if there is no item in the equipSlot", () => {
			invManager.equippedItems.headwear = null;

			expect(() => invManager.unequipItem("headwear")).to.throw();
		});

		it("it should remove an item from the specified equipSlot", () => {
			invManager.equippedItems.headwear = new Helmet();
			invManager.unequipItem("headwear");
			
			expect(invManager.equippedItems.headwear).to.be.null;
		});

		it("it should return the item that was in the specified equipSlot", () => {
			const helmet = new Helmet();
			invManager.equippedItems.headwear = helmet;
			const returned = invManager.unequipItem("headwear");

			expect(returned).to.equal(helmet);

		});
	});

	describe("addCurrency()", () => {

		it("it should increment the currentCurrency by the amount given", () => {
			let previous = invManager.currentCurrency;
			const increase1 = 1000;

			invManager.addCurrency(increase1);
			expect(invManager.currentCurrency).to.equal(previous + increase1);

			previous = invManager.currentCurrency;
			const increase2 = 150;

			invManager.addCurrency(increase2);
			expect(invManager.currentCurrency).to.equal(previous + increase2);
		});
	});

	describe("reduceCurrency", () => {

		it("it should throw an error if currentCurrency would be reduced below 0", () => {
			invManager.currentCurrency = 0;

			expect(() => invManager.reduceCurrency(100)).to.throw();
		});

		it("it should decrement currentCurrency by the given amount", () => {
			const current = 1000;
			const reduction = 100;
			const remainder = current - reduction;

			invManager.currentCurrency = current;
			invManager.reduceCurrency(reduction);

			expect(invManager.currentCurrency).to.equal(remainder);
		});
	});
});