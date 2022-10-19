import { CharacterEquipment } from "../Characters/Character.js";

type EquipSlot = keyof CharacterEquipment;
type ArmorSlot = Exclude<EquipSlot, "weapon">;
type WeaponSlot = Extract<EquipSlot, "weapon">

interface Equipable extends InventoryItem {
  equipSlot: WeaponSlot | EquipSlot;
}

type ItemQuality = {
	effectivenessMult: number,
	prefix: string,
}

interface InventoryItem {
	weight: number,
	type: string,
	quality: ItemQuality
}

export { Equipable, ArmorSlot, EquipSlot, WeaponSlot, InventoryItem, ItemQuality };