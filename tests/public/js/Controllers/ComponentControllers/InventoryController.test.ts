import "jsdom-global/register.js";
import { expect } from "chai";
import InventoryController from "../../../../../src/public/js/controllers/ComponentControllers/InventoryController.js";
import Player from "../../../../../src/public/js/models/Characters/Player.js";
import Sinon from "sinon";
import Sword from "../../../../../src/public/js/models/Items/Weapons/Sword.js";
import { Equipable, InventoryItem } from "../../../../../src/public/js/models/Items/Interfaces.js";
import { Breastplate, Helmet } from "../../../../../src/public/js/models/Items/Armor and Clothing/Armor.js";
import { CharacterEquipment } from "../../../../../src/public/js/models/Characters/Character.js";

describe("InventoryController class", () => {
	let player: Player = new Player();
	let controller: InventoryController = new InventoryController(player);

	afterEach(() => {
		player = new Player();
		controller = new InventoryController(player);
		document.body.replaceChildren();
	});

	describe("updateComponent()", () => {
		let stub: Sinon.SinonStub;

		beforeEach(() => {
			stub = Sinon.stub(controller, "updateInfo");
		});
		afterEach(() => {
			stub.reset();
		});
		after(() => {
			stub.restore();
		});
		
		it("it should toggle 'visible' member field between true and false", () => {
			for (let i = 0; i < 2; i++) {
				const prevState: boolean = controller.visible;

				controller.updateComponent();

				expect(controller.visible).to.not.equal(prevState);
			}
		});

		it("it should add and remove its managed component to the document body", () => {
			const componentClassList = controller.componentToUpdate.classList.toString();
			expect(document.querySelector(`.${componentClassList}`)).to.be.null;

			controller.updateComponent();

			expect(document.querySelector(`.${componentClassList}`)).to.equal(controller.componentToUpdate);

			controller.updateComponent();

			expect(document.querySelector(`.${componentClassList}`)).to.be.null;
		});

		it("it should only call updateInfo() when the inventory screen is not visible", () => {
			controller.updateComponent();

			expect(stub.calledOnce).to.be.true;

			controller.updateComponent();

			expect(stub.calledOnce).to.be.true;
		});
	});

	describe("updateInfo()", () => {
		let inventoryStub: Sinon.SinonStub;
		let equippedStub: Sinon.SinonStub;

		beforeEach(() => {
			inventoryStub = Sinon.stub(controller, "updateInventoryMap");
			equippedStub = Sinon.stub(controller, "updateEquippedMap");
		});
		afterEach(() => {
			inventoryStub.reset();
			equippedStub.reset();
		});
		after(() => {
			inventoryStub.restore();
			equippedStub.restore();
		});

		it("it should call both the 'updateInventoryMap()' and 'updateEquippedMap()' methods once", () => {
			controller.updateInfo();

			expect(inventoryStub.calledOnce).to.be.true;
			expect(equippedStub.calledOnce).to.be.true;
		});

		it("it should add an entry to the inventory item table member variable for each entry in the InventoryMap", () => {
			const sword = new Sword();
			const mapKey = createInventoryRow(sword);
			controller.inventoryMap.set(mapKey, sword);

			controller.updateInfo();
			expect(controller.invItems.querySelector(".test")).to.equal(mapKey);

			controller.inventoryMap.clear();
			for (let i = 0; i < 10; i++) {
				const newSword = new Sword();
				controller.inventoryMap.set(createInventoryRow(newSword), newSword);
			}
			controller.updateInfo();

			expect(controller.invItems.childElementCount).to.eq(10);
		});

		it("it should add a row to the equippedItem table for each entry in equippedMap", () => {
			setEquippedMap(player.equipment, controller.equippedMap);
			const equipmentSize = Object.keys(player.equipment).length;

			controller.updateInfo();

			expect(controller.equippedItems.childElementCount).to.equal(equipmentSize);

			const item = new Breastplate();
			player.equipment.shirt = item;
			setEquippedMap(player.equipment, controller.equippedMap);

			controller.updateInfo();

			expect(controller.equippedItems.childElementCount).to.equal(equipmentSize);
			expect(itemTextInANode(controller.equippedItems.children, item)).to.be.true;
		});
	});

	describe("updateInventoryMap()", () => {

		it("it should clear the current inventoryMap", () => {
			/** 
			 * Setting player inventory to an empty array to
			 * guarantee an empty map if it is cleared.
			 */
			player.inventory = [];
			const sword = new Sword();
			controller.inventoryMap.set(createInventoryRow(sword), sword);

			controller.updateInventoryMap();

			expect(controller.inventoryMap.size).to.eq(0);
		});

		it("it should set entries on the inventoryMap for each item in a player's inventory", () => {
			const items = [];
			const sword = new Sword();
			items.push(sword);

			const breastPlate = new Breastplate();
			items.push(breastPlate);

			items.forEach(item => player.addItem(item));

			controller.updateInventoryMap();
			expect(controller.inventoryMap.size).to.eq(items.length);
			
			for (const item of items) {
				let inMap: boolean = false;
				const it = controller.inventoryMap.values();

				for (const val of it) {
					if (item === val) {
						inMap = true;
						break;
					}
				}

				expect(inMap).to.be.true;
			}
		});
	});

	describe("updateEquippedMap()", () => {

		it("it should clear the current equippedItemsMap", () => {
			let slot: keyof typeof player.equipment;
			for (slot in player.equipment) {
				player.equipment[slot] = null;
			}
			const helmet = new Helmet();

			player.equipment.headwear = helmet;

			controller.updateEquippedMap();

			expect(checkForItem(controller.equippedMap.values())).to.be.true;
			expect(controller.equippedMap.size).to.be.equal(Object.keys(player.equipment).length);

			player.equipment.headwear = null;

			controller.updateEquippedMap();

			expect(checkForItem(controller.equippedMap.values())).to.be.false;
			expect(controller.equippedMap.size).to.be.equal(Object.keys(player.equipment).length);
		});

		it("it should set entries on the equippedItemsMap for each item in the player's equipment", () => {
			let slot: keyof typeof player.equipment;
			let numberOfEquipSlots = 0;

			for (slot in player.equipment) {
				numberOfEquipSlots++;
				player.equipment[slot] = null;
			}

			const helmet = new Helmet();
			const sword = new Sword();
			const breastPlate = new Breastplate();
			const items = [helmet, sword, breastPlate];

			for (const item of items) {
				player.equipment[item.equipSlot] = item;
			}

			controller.updateEquippedMap();
			const values = Array.from(controller.equippedMap.values());

			expect(checkForSeveralItems(values, ...items)).to.be.true;
			expect(countNullEquipment(values)).to.equal(numberOfEquipSlots - items.length);
		});
	});
});

function createInventoryRow(item: InventoryItem): HTMLTableRowElement {
	const row = document.createElement("tr");
	row.classList.add("test");

	const nameTD = document.createElement("td");
	nameTD.textContent = item.type.charAt(0).toUpperCase() + item.type.slice(1);
	row.appendChild(nameTD);

	const weightTD = document.createElement("td");
	weightTD.textContent = item.weight.toString();
	row.appendChild(weightTD);

	return row;
}

function setEquippedMap(items: CharacterEquipment, mapToSet: Map<HTMLTableRowElement, Equipable>): void {
	mapToSet.clear();

	for (const [slot, item] of Object.entries(items)) {
		const row = document.createElement("tr");

		const slotTD = document.createElement("td");
		slotTD.textContent = slot.charAt(0).toUpperCase() + slot.slice(1);
		row.appendChild(slotTD);

		const nameTD = document.createElement("td");

		if (!item) slot === "weapon" ? nameTD.textContent = "Unarmed" : nameTD.textContent = "None";
		else nameTD.textContent = item.getFullname();
		
		row.appendChild(nameTD);

		mapToSet.set(row, item);
	}
}

/**
 * Checks if any of the values in an equippedMap have items.
 * @param iterator An iterator of EquippedMap.values();
 * @returns 
 */
function checkForItem(iterator: IterableIterator<Equipable>): boolean {
	for (const value of iterator) {
		if (value !== null) return true;
	}
	return false;
}

/**
 * Iterates through an equippedMap values iterator and returns true if all of the items specified 
 * are included.
 * @param iterator 
 * @param items
 * @returns 
 */
function checkForSeveralItems(values: Array<Equipable>, ...items: Array<Equipable>): boolean {

	for (const item of items) {
		if (!values.some(val => val === item)) return false;
	}
	
	return true;
}

/**
 * Iterates through an equippedMap and counts the number of null item references. Returns count.
 * @param iterator 
 * @returns Number of null item references.
 */
function countNullEquipment(values: Array<Equipable>): number {
	let count: number = 0;

	for (const val of values) {
		console.log(val);
		
		if (val === null) count += 1;
	}
	return count;
}

function itemTextInANode(children: HTMLCollection, item: Equipable): boolean {
	const rows = Array.from(children);

	for (const row of rows) {
		const childTDs = Array.from(row.children);
		if (childTDs.some(node => node.textContent === item.getFullname())) return true;
	}

	return false;
}
