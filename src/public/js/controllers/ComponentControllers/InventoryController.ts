import { CharacterEquipment } from "../../models/Characters/Character";
import Player from "../../models/Characters/Player";
import { GameEventTypes } from "../../models/Events/GameEvent";
import Consumable from "../../models/Items/Consumables/IConsumable";
import { Equipable, InventoryItem } from "../../models/Items/Interfaces";
import ComponentController from "../ComponentController";

/**
 * Class responsible for DOM manipulation regarding player inventory management.
 */
class InventoryController implements ComponentController {
	componentToUpdate: HTMLElement;
	invItems: HTMLTableElement;
	equippedItems: HTMLTableElement;
	inventoryMap: Map<HTMLTableRowElement, InventoryItem>;
	equippedMap: Map<HTMLTableRowElement, Equipable>;
	handleType: GameEventTypes;
	player: Player;
	visible: boolean;
	constructor(player: Player) {
		this.player = player;
		this.inventoryMap = new Map<HTMLTableRowElement, InventoryItem>();
		this.equippedMap = new Map<HTMLTableRowElement, Equipable>();
		this.visible = false;
		this.componentToUpdate = this.initializeComponent();
		this.invItems = this.componentToUpdate.querySelector(".inv-item-list tbody") as HTMLTableElement;
		this.equippedItems = this.componentToUpdate.querySelector(".inv-equipped-item-list") as HTMLTableElement;
		this.handleType = "INVENTORY_EVENT";
	}
	/**
	 * Entry point for handling player input event.
	 */
	updateComponent(): void {
		if (this.visible) {
			document.body.removeChild(this.componentToUpdate);
			this.visible = false;
		}
		else {
			this.updateInfo();
			document.body.appendChild(this.componentToUpdate);
			this.visible = true;
		}
	}

	/**
	 * Refreshes inventory UI by mapping items in player's current inventory and equipment
	 * to appropriate DOM elements and appending said DOM elements to the appropriate section
	 * of the inventory panel.
	 */
	updateInfo(): void {
		this.invItems.replaceChildren();
		this.updateInventoryMap();
		
		for (const [elem] of this.inventoryMap) {		
			this.invItems.appendChild(elem);
		}

		this.equippedItems.replaceChildren();
		this.updateEquippedMap();

		for (const [elem] of this.equippedMap) {
			this.equippedItems.appendChild(elem);
		}
	}

	updateInventoryMap(): void {
		this.inventoryMap.clear();
	
		for (const item of this.player.getInventory()) {	
			const itemTile = document.createElement("tr");
			itemTile.classList.add("item");
			itemTile.addEventListener("click", (e) => {
				e.preventDefault();
				this.player.removeItem(item);
				isEquipable(item) ? this.player.equipItem(item) : this.player.consumeItem(item as Consumable);
				this.updateInfo();
			});

			const nameTD = document.createElement("td");
			nameTD.textContent = item.getFullname();
			itemTile.appendChild(nameTD);

			const weightTD = document.createElement("td");
			weightTD.textContent = item.weight.toString();
			itemTile.appendChild(weightTD);

			this.inventoryMap.set(itemTile, item);
		}
	}

	/**
	 * Updates the member variable "equippedMap" which stores DOM elements as keys and references
	 * to the player's currently equipped items as values.
	 */
	updateEquippedMap(): void {
		const equippedItems = this.player.equipment;
		this.equippedMap.clear();

		for (const [slot, item] of Object.entries(equippedItems)) {
			const itemRow = document.createElement("tr");
			const itemSlot = document.createElement("td");
			const itemName = document.createElement("td");

			itemSlot.textContent = slot.charAt(0).toUpperCase() + slot.slice(1) + ":";

			if (!item) {
				slot === "weapon" ? itemName.textContent = "Unarmed" : itemName.textContent = "None";
			} 
			else {
				itemName.textContent = item.getFullname();
				itemRow.addEventListener("click",(e) => {
					e.preventDefault();
					this.player.unequipItem(slot as keyof CharacterEquipment);
					this.player.addItem(item);
					this.updateInfo();
				});	
			}

			itemRow.append(itemSlot, itemName);

			this.equippedMap.set(itemRow, item);
		}
	}

	initializeComponent(): HTMLElement {
		const component = document.createElement("div");
		component.classList.add("inv");

		const equippedArea = document.createElement("div");
		equippedArea.classList.add("inv-equipped");
		equippedArea.appendChild(initializeEquipmentDisplay());
		component.appendChild(equippedArea);

		const statsArea = document.createElement("div");
		statsArea.classList.add("inv-stats");
		component.appendChild(statsArea);

		const inventoryArea = document.createElement("div");
		inventoryArea.classList.add("inv-items");
		inventoryArea.appendChild(initializeTable());

		component.appendChild(inventoryArea);

		return component;
	}
}

function initializeTable(): HTMLTableElement {
	const invTable = document.createElement("table");
	invTable.classList.add("inv-item-list");

	const head = document.createElement("thead");
	const headRow = document.createElement("tr");

	const nameTH = document.createElement("th");
	nameTH.textContent = "Item";
	headRow.appendChild(nameTH);

	const weightTH = document.createElement("th");
	weightTH.textContent = "Weight";
	headRow.appendChild(weightTH);

	head.appendChild(headRow);

	invTable.append(head, document.createElement("tbody"));

	return invTable;
}

function initializeEquipmentDisplay(): HTMLTableElement {
	const table = document.createElement("table");
	table.classList.add("inv-equipped-table");

	const head = document.createElement("thead");
	const headRow = document.createElement("tr");

	const slotTH = document.createElement("th");
	slotTH.textContent = "Type";

	const itemNameTH = document.createElement("th");
	itemNameTH.textContent = "Item Name";

	headRow.append(slotTH, itemNameTH);
	head.appendChild(headRow);

	const body = document.createElement("tbody");
	body.classList.add("inv-equipped-item-list");

	table.append(head, body);

	return table;
}

function isEquipable(item: InventoryItem): item is Equipable {
	return "equipSlot" in item;
}

export default InventoryController;