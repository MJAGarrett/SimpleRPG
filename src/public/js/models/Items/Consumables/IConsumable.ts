import { InventoryItem } from "../Interfaces";
import StatusEffect from "./StatusEffect";

interface Consumable extends InventoryItem{ 
  effect: StatusEffect, 
  consume(): StatusEffect; 
}

export default Consumable;