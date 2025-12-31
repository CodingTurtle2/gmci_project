//=> use showSkillTree() -> void;
//=> use playLevelSound() -> void;
//=> use playXPSound() -> void;

var aSkillPoints = 0;

function showSkillTree() {
	var elm = getId("skill_tree_overlay");
	if (!elm) {
		elm = document.createElement("overlay");
		elm.setAttribute("id", "skill_tree_overlay");
		document.body.appendChild(elm);
	}
	
	elm.innerHTML = ``;
	
	const div = document.createElement("div");
	div.style = `
display: inline-block;
width: 100%;
height: 100%;
overflow: auto;
margin-top: 20px;
text-align: center;
color: black;
	`;
	
	var res = generateSkillTree(getSkillTree(), userData.abilities)
	
	div.appendChild(res[0]);
	aSkillPoints = userData.level - res[1];
	
	elm.appendChild(div);
	
	const div2 = document.createElement("div");
	div2.style = `
display: inline-block;
width: 100%;
text-align: center;
margin-top: 20px;
	`;
	div2.innerHTML = `
<div style="padding: 10px 30px; background: rgba(255, 255, 255, 0.6); border-radius: var(--border-radius); display: inline-block;" class="do-not-color-me">
Skill-Points: <span class="aSkillPoints">${aSkillPoints}</span>
</div>
	`;
	
	elm.appendChild(div2);
	
	showOverlay("skill_tree_overlay");
}

function _getRect(parent, data) {
	var elm = getId("skill_tree_details_overlay");
	if (!elm) {
		elm = document.createElement("overlay");
		elm.setAttribute("id", "skill_tree_details_overlay");
		document.body.appendChild(elm);
	}
	
	const isEnabled = userData.abilities.includes(data.id);
	
	elm.innerHTML = '';
	const div = document.createElement("div");
	div.style = `display: inline-block; width: 100%; min-width: 300px; text-align: center; color: black;`;
	div.innerHTML = `
<b style="display: inline-block; margin-top: 5px;">${data.text}</b><br><br>
<span>${data.description}</span><br><br>
<span style="display: inline-block; border: 1px solid black; background: rgba(255, 255, 255, 0.3); width: 100%; border-radius: var(--border-radius); padding: 10px;">${isEnabled ? 
	"<span style='color: green;'>Im Besitz</span>":
	"<span style='color: red;'>Noch nicht freigeschaltet</span>"
}</span><br><br>
	`;
	
	const bttnStyle = `display: inline-block; width: 100%; border-radius: var(--border-radius); padding: 10px; font-size: 18px; font-weight: normal; background: rgba(255, 255, 255, 0.3);`;
	const bttnStyleDisabled = bttnStyle + `border: 1px solid black; opacity: 0.7;`;
	
	if (isEnabled) {
		const eAblities = userData.enabled_abilities ??= [];
		const isEnabled = eAblities.includes(data.id);
		
		div.innerHTML += `
<button onclick='activateSkill(this, ${JSON.stringify(data)})' style="${bttnStyle}">${isEnabled ? "Deaktivieren": "Aktivieren"}</button>
		`;
	} else {
		const isParentEnabled = parent.id == "root" || userData.abilities.includes(parent.id);
		const allowBuy = aSkillPoints > 0 && isParentEnabled;
		
		div.innerHTML += `
<button onclick='_buySkill(${JSON.stringify(data)})' style="${allowBuy ? bttnStyle: bttnStyleDisabled}" ${allowBuy ? "": "disabled"}>Kaufen</button>
		`;
	}
	
	elm.appendChild(div);
	
	showOverlay("skill_tree_details_overlay");
}
async function activateSkill(elm, data) {
	const elms = document.getElementsByClassName("skill_" + data.id);
	const eAblities = userData.enabled_abilities ??= [];
	const isEnabled = eAblities.includes(data.id);
	
	if (isEnabled) {
		//disabled
		userData.enabled_abilities = eAblities.filter((val) => val != data.id);
		for (var elm of elms) {
			elm.setAttribute("fill", "rgb(187, 243, 183)");
		}
	} else {
		//enabled
		const coll = data.collision ??= [];
		userData.enabled_abilities = eAblities.filter((val) => !coll.includes(val));
		userData.enabled_abilities.push(data.id);
		for (var elm of elms) {
			elm.setAttribute("fill", "lightgreen");
		}
		for (var i of coll) {
			if (!(userData["abilities"] ??= []).includes(i)) continue;
			exeSkill(i, false);
			for (var elm of document.getElementsByClassName("skill_" + i)) {
				elm.setAttribute("fill", "rgb(187, 243, 183)");
			}
		}
	}
	
	elm.innerText = !isEnabled ? "Deaktivieren" : "Aktivieren";
	
	getOverlay("skill_tree_details_overlay").innerHTML = "";
	await updateUserData(new CouchDB(), userData);
	hideOverlay("skill_tree_details_overlay");
	
	if (!isEnabled) {
		if (typeof(data.call) == "string") {
			try { eval(data.call); } catch (err) { console.error(err); }
		}
	}
	exeSkill(data.id, !isEnabled);
	if (isEnabled) {
		if (typeof(data.call_unset) == "string") {
			try { eval(data.call_unset); } catch (err) { console.error(err); }
		}
	}
	updateEverything();
}
async function _buySkill(data) {
	const elms = document.getElementsByClassName("skill_" + data.id);
	if (elms.length == 0) return;
	for (var elm of elms) {
		elm.setAttribute("fill", "rgb(187, 243, 183)");
	}
	
	aSkillPoints--;
	const aSkillPoints_elms = document.getElementsByClassName("aSkillPoints");
	for (var i of aSkillPoints_elms) {
		i.innerText = aSkillPoints;
	}
	
	userData.abilities.push(data.id);
	
	playXPSound();
	
	getOverlay("skill_tree_details_overlay").innerHTML = "";
	await updateUserData(new CouchDB(), userData);
	
	hideOverlay("skill_tree_details_overlay");
}

function generateSkillTree(skillTree, abilities) {
	const NS = "http://www.w3.org/2000/svg";
	const nWidth = 120;
	const nHeight = 40;
	const lvlGap = 100;
	const borderRadius = getComputedStyle(document.documentElement).getPropertyValue('--border-radius').trim();
	const siblingGap = 40;
	
	/* -------- calc layout -------- */
	
	function measure_tree(data) {
		data.children ??= [];
		if (data.children.length === 0) {
			data._width = nWidth;
		} else {
			data._width =
				data.children.reduce((sum, c) => sum + measure_tree(c), 0) +
				siblingGap * (data.children.length - 1);
		}
		return data._width;
	}
	measure_tree(skillTree);

	function calc_tree(data, x, y) {
		data._x = x;
		data._y = y;
		data.enabled = data.id == "root" || abilities.includes(data.id);

		let childX = x - data._width / 2;
		data.children.forEach(child => {
			const cx = childX + child._width / 2;
			const cy = y + lvlGap;
			calc_tree(child, cx, cy);
			childX += child._width + siblingGap;
		});
	}

	calc_tree(skillTree, 0, 0);

	/* -------- bounding-stuff -------- */
	
	let minX = Infinity, maxX = -Infinity, maxY = -Infinity;

	function bounds(data) {
		minX = Math.min(minX, data._x - nWidth / 2);
		maxX = Math.max(maxX, data._x + nWidth / 2);
		maxY = Math.max(maxY, data._y + nHeight);
		data.children.forEach(bounds);
	}
	bounds(skillTree);

	const padding = 20;
	const width = maxX - minX + padding * 2;
	const height = maxY + padding * 2;

	/* -------- other -------- */
	
	const svg = document.createElementNS(NS, "svg");
	svg.setAttribute("width", width);
	svg.setAttribute("height", height);
	svg.setAttribute(
		"viewBox",
		`${minX - padding} ${-padding} ${width} ${height}`
	);

	function drawLine(parent, data) {
		const line = document.createElementNS(NS, "line");
		line.setAttribute("x1", parent._x);
		line.setAttribute("y1", parent._y + nHeight);
		line.setAttribute("x2", data._x);
		line.setAttribute("y2", data._y);
		line.setAttribute("stroke", "#555");
		svg.appendChild(line);
	}
	
	var levelCount = 0;
	
	function drawNode(parent, data) {
		data.children.forEach(child => {
			drawLine(data, child);
			drawNode(data, child);
		});
		
		const elmA = document.createElementNS(NS, "rect");
		elmA.setAttribute("x", data._x - nWidth / 2);
		elmA.setAttribute("y", data._y);
		elmA.setAttribute("width", nWidth);
		elmA.setAttribute("height", nHeight);
		elmA.setAttribute("rx", borderRadius);
		elmA.classList.add("skill_" + data.id);
		elmA.setAttribute(
			"fill", data.id == "root" ? "lightblue"
				: (data.enabled ? (
					userData.enabled_abilities.includes(data.id) ? "lightgreen": "rgb(187, 243, 183)"
				): "lightgray")
		);
		elmA.setAttribute("stroke", "#333");

		const elmB = document.createElementNS(NS, "text");
		elmB.setAttribute("x", data._x);
		elmB.setAttribute("y", data._y + nHeight / 2 + 5);
		elmB.setAttribute("text-anchor", "middle");
		elmB.setAttribute("font-size", "14");
		elmB.textContent = data.text;

		if (data.id != "root") {
			if (data.enabled) levelCount++;
			
			const js = `_getRect(${JSON.stringify(parent)}, ${JSON.stringify(data)})`;
			elmA.setAttribute("onclick", js);
			elmB.setAttribute("onclick", js);
		}
		
		svg.appendChild(elmA);
		svg.appendChild(elmB);
	}

	drawNode(null, skillTree);
	return [svg, levelCount];
}

async function playLevelSound() {
	await playSound("../audio/levelup2.mp3");
}
async function playXPSound() {
	await playSound("../audio/levelup1.mp3");
}