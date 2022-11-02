import "jsdom-global/register.js";
import { expect } from "chai";
import ComponentController from "../../../../../src/public/js/controllers/ComponentController.js";
import PlayerInfoController from "../../../../../src/public/js/controllers/ComponentControllers/PlayerInfoController.js";
import Player from "../../../../../src/public/js/models/Characters/Player.js";
import { Breastplate } from "../../../../../src/public/js/models/Items/Armor and Clothing/Armor.js";
import { setupPlayerInfoDiv } from "../helpers.js";

describe("PlayerInfoController Class", () => {
	let controller: ComponentController;
	let component: HTMLElement;
	const player = new Player();
	before(() => {
		component = setupPlayerInfoDiv();
		document.body.appendChild(component);
		controller = new PlayerInfoController(player);
	});

	after(() => {
		document.body.replaceChildren();
	});

	beforeEach(() => {
		player.stats = {
			health: {
				current: 100,
				max: 100,
			},
			actionPoints: 100,
			speed: {
				current: 100,
				base: 100,
			},
			level: 1,
			experience: 0,
		};

		player.equipment = {
			weapon: null,
			headwear: null,
			shirt: null,
			pants: null,
			footwear: null,
		};
	});

	describe("Methods", () => {

		describe("updateComponent()", () => {

			it("it should update the player's health information on a change", () => {
				player.health = 50;
				controller.updateComponent();

				expect(component.querySelector(".health")?.textContent).to.equal(player.health.toString());
			});

			it("it should update the player's current equipment on change", () => {
				player.equipment.shirt = new Breastplate();
				controller.updateComponent();

				expect(component.querySelector(".shirt")?.textContent).to.equal(player.equipment.shirt.type);
				
			});

			it("it should display the character's name", () => {
				const name = "Testy McTesterman";
				player.name = name;
				controller.updateComponent();

				expect(component.querySelector(".name")?.textContent).to.equal(name);
			});

			it("it should display the character's level", () => {
				const level = player.level;
				player.levelUp();
				controller.updateComponent();

				expect(component.querySelector(".level")?.textContent).to.equal((level + 1).toString());
			});

			it("it should show the character's current speed", () => {
				const testSpeed = 50;
				player.stats.speed.current = testSpeed;

				controller.updateComponent();

				expect(component.querySelector(".speed")?.textContent).to.equal(testSpeed.toString());
			});

			it("it should show the character's AP", () => {
				const testAP = 25;
				player.actionPoints = testAP;

				controller.updateComponent();

				expect(component.querySelector(".actionPoints")?.textContent).to.equal(testAP.toString());
			});

		});
	});
});