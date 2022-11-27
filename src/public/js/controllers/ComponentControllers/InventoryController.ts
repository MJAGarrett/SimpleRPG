import { CharacterEquipment } from "../../models/Characters/Character";
import Player from "../../models/Characters/Player";
import { GameEventTypes } from "../../models/Events/GameEvent";
import { Armor } from "../../models/Items/Armor and Clothing/Armor";
import Consumable from "../../models/Items/Consumables/IConsumable";
import { Equipable, InventoryItem } from "../../models/Items/Interfaces";
import { Weapon } from "../../models/Items/Weapons/Weapons";
import ComponentController from "../ComponentController";

/**
 * Class responsible for DOM manipulation regarding player inventory management.
 */
class InventoryController implements ComponentController {
	componentToUpdate: HTMLElement;
	invItems: HTMLTableElement;
	equippedItems: HTMLTableElement;
	moneyAndWeightSpans: {
		money: HTMLSpanElement,
		weight: HTMLSpanElement,
	};
	inventoryMap: Map<HTMLTableRowElement, InventoryItem>;
	equippedMap: Map<HTMLTableRowElement, Equipable>;
	statsSet: Set<HTMLSpanElement>;
	handleType: GameEventTypes;
	player: Player;
	visible: boolean;
	constructor(player: Player) {
		this.player = player;
		this.inventoryMap = new Map<HTMLTableRowElement, InventoryItem>();
		this.equippedMap = new Map<HTMLTableRowElement, Equipable>();
		this.statsSet = new Set<HTMLTableCellElement>;
		this.visible = false;
		this.componentToUpdate = this.initializeComponent();
		this.invItems = this.componentToUpdate.querySelector(".inv-item-list tbody") as HTMLTableElement;
		this.equippedItems = this.componentToUpdate.querySelector(".inv-equipped-item-list") as HTMLTableElement;
		this.moneyAndWeightSpans = {
			money: this.componentToUpdate.querySelector(".inv-items #money") as HTMLSpanElement,
			weight: this.componentToUpdate.querySelector(".inv-items #weight") as HTMLSpanElement,
		};
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

		for (const stat of this.statsSet) {
			stat.dataset.offense === "true"
				? stat.textContent = this.player.calcDamage().toString() 
				: stat.textContent = this.player.calcDefense().toString();
		}
		
		this.moneyAndWeightSpans.money.textContent = `Gold: ${this.player.money}`;
		this.moneyAndWeightSpans.weight.textContent = `Carry Weight: ${this.player.inventory.currentWeight} / ${this.player.inventory.maxCarryWeight}`;
	}

	updateInventoryMap(): void {
		this.inventoryMap.clear();
	
		for (const item of this.player.getInventory()) {	
			const itemTile = document.createElement("tr");
			itemTile.classList.add("item");
			itemTile.addEventListener("click", (e) => {
				e.preventDefault();
				isEquipable(item) ? this.player.equipItem(item) : this.player.consumeItem(item as Consumable);
				this.updateInfo();
			});

			if (isEquipable(item)) {
				if (item instanceof Weapon) {

					itemTile.addEventListener("mouseenter", () => {
						const change = document.querySelector(".stat-change.off") as HTMLSpanElement;
						const diff = item.getDamage() - this.player.getBaseWeaponDamage();

						if (diff >= 0) {
							change.textContent = `(+${diff.toString()})`;
							diff === 0 ? change.style.color = "gray" : change.style.color = "green";
						}
						else {
							change.textContent = `(${diff.toString()})`;
							change.style.color = "red";
						}

						change.style.opacity = "1";
					});

					itemTile.addEventListener("mouseleave", () => {
						const change = document.querySelector(".stat-change.off") as HTMLSpanElement;
						change.style.opacity = "0";
					});
					itemTile.addEventListener("click", () => {
						const change = document.querySelector(".stat-change.off") as HTMLSpanElement;
						change.style.opacity = "0";
					});
				}
				else if (item instanceof Armor) {
					itemTile.addEventListener("mouseenter", () => {
						const change = document.querySelector(".stat-change.def") as HTMLSpanElement;
						const equipped = this.player.equipment[item.equipSlot] as Armor;
						let diff: number;

						// Equipped could still be null. Check it here.
						equipped !== null ? diff = item.armorValue - equipped.armorValue : diff = item.armorValue;

						if (diff >= 0) {
							change.textContent = `(+${diff.toString()})`;
							diff === 0 ? change.style.color = "gray" : change.style.color = "green";
						}
						else {
							change.textContent = `(${diff.toString()})`;
							change.style.color = "red";
						}
						change.style.opacity = "1";
					});

					itemTile.addEventListener("mouseleave", () => {
						const change = document.querySelector(".stat-change.def") as HTMLSpanElement;
						change.style.opacity = "0";
					});
					itemTile.addEventListener("click", () => {
						const change = document.querySelector(".stat-change.def") as HTMLSpanElement;
						change.style.opacity = "0";
					});
				}
			}

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

				if (item instanceof Weapon) {
					itemRow.addEventListener("mouseenter", () => {
						const change = document.querySelector(".stat-change.off") as HTMLSpanElement;
						change.innerText = `(${20 - item.getDamage()})`;
						change.style.color = "red";
						change.style.opacity = "1";
					});

					itemRow.addEventListener("mouseleave", () => {
						const change = document.querySelector(".stat-change.off") as HTMLSpanElement;
						change.style.opacity = "0";
					});

					itemRow.addEventListener("click", () => {
						const change = document.querySelector(".stat-change.off") as HTMLSpanElement;
						change.style.opacity = "0";
					});
				}
				else if (item instanceof Armor) {
					itemRow.addEventListener("mouseenter", () => {
						const change = document.querySelector(".stat-change.def") as HTMLSpanElement;
						change.innerText = `(-${item.armorValue})`;
						change.style.color = "red";
						change.style.opacity = "1";
					});

					itemRow.addEventListener("mouseleave", () => {
						const change = document.querySelector(".stat-change.def") as HTMLSpanElement;
						change.style.opacity = "0";
					});

					itemRow.addEventListener("click", () => {
						const change = document.querySelector(".stat-change.def") as HTMLSpanElement;
						change.style.opacity = "0";
					});
				}
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
		const equippedHeader = document.createElement("h3");
		equippedHeader.textContent = "Equipped Items";
		equippedArea.appendChild(equippedHeader);
		equippedArea.appendChild(initializeEquipmentDisplay());
		component.appendChild(equippedArea);

		const statsArea = document.createElement("div");
		statsArea.classList.add("inv-stats");
		const statsHeader = document.createElement("h3");
		statsHeader.textContent = "Player Stats";
		statsArea.append(statsHeader, initializeStatsTable(this));
		component.appendChild(statsArea);

		const inventoryArea = document.createElement("div");
		inventoryArea.classList.add("inv-items");
		const inventoryHeader = document.createElement("h3");
		inventoryHeader.textContent = "Inventory";
		
		inventoryArea.append(inventoryHeader, initializeItemTable(), initMoneyAndWeightDiv());

		component.appendChild(inventoryArea);

		return component;
	}
}

function initializeItemTable(): HTMLDivElement {
	const tableWrapper = document.createElement("div");
	tableWrapper.classList.add("inv-table-wrapper");
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
	tableWrapper.appendChild(invTable);

	return tableWrapper;
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

function initializeStatsTable(componentRef: InventoryController): HTMLTableElement {
	const statsTable = document.createElement("table");
	statsTable.classList.add("stats-table");

	const colGroup = document.createElement("colgroup");
	const offCol = document.createElement("col");
	offCol.setAttribute("span", "2");
	const defCol = document.createElement("col");
	defCol.setAttribute("span", "2");
	colGroup.append(offCol, defCol);
	statsTable.appendChild(colGroup);

	const tableHead = document.createElement("thead");
	const headRow = document.createElement("tr");

	const offenseHeader = document.createElement("th");
	offenseHeader.textContent = "Offense";
	offenseHeader.setAttribute("colspan", "2");
	headRow.appendChild(offenseHeader);

	const defenseHeader = document.createElement("th");
	defenseHeader.textContent = "Defense";
	defenseHeader.setAttribute("colspan", "2");
	headRow.appendChild(defenseHeader);

	tableHead.appendChild(headRow);
	statsTable.appendChild(tableHead);

	const body = document.createElement("tbody");

	const rawDamLabel = document.createElement("td");
	rawDamLabel.textContent = "Base Damage";

	const damTD = document.createElement("td");

	const rawDam = document.createElement("span");
	rawDam.textContent = "0";
	rawDam.dataset.offense = "true";
	componentRef.statsSet.add(rawDam);

	const damChange = document.createElement("span");
	damChange.classList.add("stat-change", "off");
	damChange.style.opacity = "0";
	damChange.innerText = "0";
	damTD.append(rawDam, damChange);

	const rawDefLabel = document.createElement("td");
	rawDefLabel.textContent = "Defense";

	const defTD = document.createElement("td");

	const rawDef = document.createElement("span");
	rawDef.textContent = "0";
	rawDef.dataset.defense = "true";
	componentRef.statsSet.add(rawDef);

	const defChange = document.createElement("span");
	defChange.classList.add("stat-change", "def");
	defChange.innerText = "0";
	defChange.style.opacity = "0";
	defTD.append(rawDef, defChange);

	const statRow = document.createElement("tr");
	statRow.append(rawDamLabel, damTD, rawDefLabel, defTD);

	body.append(statRow);
	statsTable.appendChild(body);

	return statsTable;
}

function initMoneyAndWeightDiv(): HTMLDivElement {
	const div = document.createElement("div");
	div.classList.add("money-and-weight");
	const weightSpan = document.createElement("span");
	weightSpan.id = "weight";
	const moneySpan = document.createElement("span");
	moneySpan.id = "money";

	div.append(weightSpan, moneySpan);

	return div;
}

export default InventoryController;