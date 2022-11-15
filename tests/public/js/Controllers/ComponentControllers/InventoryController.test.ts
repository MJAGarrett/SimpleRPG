import "jsdom-global/register.js";
import { expect } from "chai";
import InventoryController from "../../../../../src/public/js/controllers/ComponentControllers/InventoryController.js";
import Player from "../../../../../src/public/js/models/Characters/Player.js";
import Sinon from "sinon";
import Sword from "../../../../../src/public/js/models/Items/Weapons/Sword.js";
import { InventoryItem } from "../../../../../src/public/js/models/Items/Interfaces.js";
import { Breastplate } from "../../../../../src/public/js/models/Items/Armor and Clothing/Armor.js";

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

		// Pending UI rework for equipped items.
		it("it should handle logic for equipped items UI");
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

	// Pending rework of equipped item UI section.
	describe("updateEquippedMap()", () => {

		it("it should clear the current equippedItemsMap");

		it("it should set entries on the equippedItemsMap for each item in the player's equipment");
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