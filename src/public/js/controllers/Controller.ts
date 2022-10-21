import { GameEventTypes } from "../models/Events/GameEvent.js";

interface ComponentController {
  handleType: GameEventTypes;
  componentToUpdate: HTMLElement;
  updateComponent: Function;
}

export default ComponentController;