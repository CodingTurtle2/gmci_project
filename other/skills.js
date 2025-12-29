const getSkillTree = () => ({
	id: "root",
	text: "Skill-Tree",
	children: [
		{
			text: "Dark-Mode",
			id: "dark_mode",
			description: "Ändert das Aussehen zu einem dunklen Design!",
			collision: ["pink_mode"],
			children: [
				{
					text: "Pink-Mode",
					description: "Ändert das Aussehen zu einem pinken Design!",
					id: "pink_mode",
					collision: ["dark_mode"],
				},
				{
					text: "Accent-Color",
					description: "Verändere die Primärfarbe",
					id: "accent_color",
					call: `chooseAccentColor();`,
					call_unset: `unsetAccentColor()`
				}
			]
		},
		{
			text: "Profilbild",
			id: "profile_pic",
			description: "Erlange die Fähigkeit, das Profilbild zu ändern",
			children: [
				{
					text: "Einfacher Rahmen",
					id: "simple_border",
					description: "Ein einfacher Rahmen, der sich um das Profilbild legt",
					collision: ["gold_border", "epic_border"],
					children: [
						{
							text: "Gold-Rahmen",
							id: "gold_border",
							description: "Ein goldener Rahmen, der sich um das Profilbild legt",
							collision: ["simple_border", "epic_border"],
							children: []
						},
						{
							text: "Epic-Rahmen",
							id: "epic_border",
							description: "Ein epischer Rahmen, der sich um das Profilbild legt",
							collision: ["simple_border", "gold_border"],
							children: [
								{
									text: "Ehren-Titel",
									id: "title_of_honor",
									description: "Kriege den Ehrentitel \"Sir\" verliehen"
								}
							]
						}
					]
				}
			],
		}
	]
});

const _skillCb = {
	"dark_mode": function() {
		document.body.style = "background: black; color: white;";
	},
	"dark_mode_unset": function() {
		document.body.style = "background: unset; color: unset;";
	},
	"pink_mode": function() {
		document.body.style = `background: rgba(242, 199, 252, 1); color: #5a076d;`;
	},
	"pink_mode_unset": function() {
		_skillCb.dark_mode_unset();
	},
	"accent_color": function() {
		const storage = (userData.skillStorage ??= {})["accent_color"];
		if (!storage) return;
		
		const rgb = storage.join(",");
		
		setRootStyle("--accent_color_fg", `rgba(${rgb}, 1)`);
		setRootStyle("--accent_color_fg_o", `rgba(${rgb}, 0.5)`);
		
		setRootStyle("--accent_color_bg", `rgba(${rgb}, 1)`);
		setRootStyle("--accent_color_bg_o", `rgba(${rgb}, 0.5)`);
		setRootStyle("--accent_color_bg_o2", `rgba(${rgb}, 0.25)`);
	},
	"accent_color_unset": function() {
		removeRootStyle("--accent_color_fg");
		removeRootStyle("--accent_color_fg_o");
		
		removeRootStyle("--accent_color_bg");
		removeRootStyle("--accent_color_bg_o");
		removeRootStyle("--accent_color_bg_o2");
	},
	"simple_border": function() {
		setProfileBorder("../imgs/simple_border.png", 8);
	},
	"unset_simple_border": () => unsetProfileBorder(),
	"gold_border": function() {
		setProfileBorder("../imgs/gold_border.png", 8);
	},
	"unset_gold_border": () => unsetProfileBorder(),
	"epic_border": function() {
		setProfileBorder("../imgs/epic_border.png", 8);
	},
	"unset_epic_border": () => unsetProfileBorder(),
	"title_of_honor": function() {},
	"profile_pic": () => updateAllProfiles(userData)
};

function chooseAccentColor() {
	var elm = getId("skill_chooseAccentColor");
	if (!elm) {
		elm = document.createElement("overlay");
		elm.setAttribute("id", "skill_chooseAccentColor");
		elm.innerHTML = `
<div class="overlay_title">Wähle eine Farbe:</div><br>
<input type="color" style="width: 100%; border-radius: var(--border-radius);"><br><br>
<button onclick="setAccentColor(this)" style="width: 100%; border-radius: var(--border-radius); font-size: 18px; padding: 10px; background: rgba(255, 255, 255, 0.5);">Bestätigen</button>
		`;
		document.body.appendChild(elm);
	}
	
	setTimeout(() => showOverlay("skill_chooseAccentColor"), 1);
}
function unsetAccentColor() {
	userData.skillStorage ??= {};
	userData.skillStorage["accent_color"] = null;
	updateUserData(new CouchDB());
}
function setAccentColor(elm) {
	const input = elm.parentElement.querySelector("input");
	const rgba = hexToRGBA(input.value);
	
	userData.skillStorage ??= {};
	userData.skillStorage["accent_color"] = rgba;
	
	updateUserData(new CouchDB());
	
	hideOverlay("skill_chooseAccentColor");
	_skillCb.accent_color();
	refreshOverlays();
}



//--------------------------------------------//

function unsetProfileBorder() {
	const elms = document.getElementsByClassName("profile");
	for (var i of elms) i.innerHTML = '';
}
function setProfileBorder(src, x) {
	const elms = document.getElementsByClassName("profile");
	
	const style1 = `
width: 67px;
height: 67px;
border-radius: 50%;
border: none;
background-size: 67px 67px;
position: absolute;
background-image: url('${src}');
transform: translate(-${x}px, calc(-50%));
	`;
	
	for (var i of elms) {
		i.innerHTML = `<div class="border" style="${style1}"></div>`;
	}
	
	const style2 = `
width: 160px;
height: 160px;
border-radius: 50%;
border: none;
background-size: 160px 160px;
position: absolute;
background-image: url('${src}');
transform: translate(-${x*1.2}px, -8px);
	`;
	
	const profilPic = getId("profile-pic");
	if (profilPic) {
		profilPic.innerHTML = `<div class="border" style="${style2}"></div>`;
	}
}
function setRootStyle(key, value) {
	document.documentElement.style.setProperty(key, value);
}
function removeRootStyle(key) {
	document.documentElement.style.removeProperty(key);
}
function exeSkill(id, activate = true) {
	const cb = _skillCb[activate ? id: id+"_unset"];
	if (typeof(cb) != "function") return;
	try { cb(); } catch(err) { console.error(err); }
}
var globalSkills = [];
async function runSkills() {
	const skills = userData.enabled_abilities;
	globalSkills = skills;
	for (var i of skills) exeSkill(i, true);
}
userDataListener.push(runSkills);