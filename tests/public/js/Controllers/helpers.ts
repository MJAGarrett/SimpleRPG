/**
 * Helper functions to set up the JSDom structure to test DOM manipulations.
 */

/**
 * 
 */
export function setupPlayerInfoDiv(): HTMLElement {
	const elem = document.createElement("div");
	elem.classList.add("player-info");

	const nameSpan = document.createElement("p");
	nameSpan.classList.add("name");
	elem.appendChild(nameSpan);

	const level = document.createElement("p");
	level.textContent = "Level: ";
	const levelSpan = document.createElement("span");
	levelSpan.classList.add("level");
	level.appendChild(levelSpan);
	elem.appendChild(levelSpan);

	const health = document.createElement("p");
	health.textContent = "Health: ";
	const healthSpan = document.createElement("span");
	healthSpan.classList.add("health");
	health.appendChild(healthSpan);
	elem.appendChild(health);

	const weaponPara = document.createElement("p");
	weaponPara.textContent = "Weapon: ";
	const weaponNameSpan = document.createElement("span");
	weaponNameSpan.classList.add("weapon");
	weaponPara.appendChild(weaponNameSpan);
	elem.appendChild(weaponPara);

	const armorDiv = document.createElement("div");
	armorDiv.classList.add("armor");
	const armorTypes = setupArmorSpans();
	armorTypes.forEach(elem => armorDiv.appendChild(elem));
	elem.appendChild(armorDiv);

	const speed = document.createElement("p");
	speed.textContent = "Speed: ";
	const speedSpan = document.createElement("span");
	speedSpan.classList.add("speed");
	speed.appendChild(speedSpan);
	elem.appendChild(speed);

	const AP = document.createElement("p");
	AP.textContent = "Action Points: ";
	const APSpan = document.createElement("span");
	APSpan.classList.add("actionPoints");
	AP.appendChild(APSpan);
	elem.appendChild(AP);

	return elem;
}

export function setupArmorSpans(): HTMLParagraphElement[] {
	const elems = [];

	const headwear = document.createElement("p");
	headwear.textContent = "Head: ";
	const headwearSpan = document.createElement("span");
	headwearSpan.classList.add("headwear");
	headwear.appendChild(headwearSpan);
	elems.push(headwear);

	const torso = document.createElement("p");
	torso.textContent = "Torso: ";
	const torsoSpan = document.createElement("span");
	torsoSpan.classList.add("shirt");
	torso.appendChild(torsoSpan);
	elems.push(torso);

	const legs = document.createElement("p");
	legs.textContent = "Legs: ";
	const legsSpan = document.createElement("span");
	legsSpan.classList.add("pants");
	legs.appendChild(legsSpan);
	elems.push(legs);

	const footwear = document.createElement("p");
	footwear.textContent = "Footwear: ";
	const footwearSpan = document.createElement("span");
	footwearSpan.classList.add("footwear");
	footwear.appendChild(footwearSpan);
	elems.push(footwear);

	return elems;
}