import { GameEventTypes } from "../models/Events/GameEvent.js";

/**
 * ComponentControllers are responsible for DOM manipulations on UI components that are
 * not part of the game area. For example, player health/level/equipment information and
 * message log.
 */
interface ComponentController {
  handleType: GameEventTypes;
  componentToUpdate: HTMLElement;
  updateComponent: Function;
}

export default ComponentController;