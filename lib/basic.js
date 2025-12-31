const getId = (id) => document.getElementById(id);

function getOverlay(id) {
	const elms = document.getElementsByName(id);
	if (elms.length == 0) return null;
	return elms[0];
}
function showOverlay(id) {
	const elm = getId(id);
	if (!elm) return;
	const overlay = document.createElement("div");
	
	const computedStyles = getComputedStyle(elm);
	const defaultStyles = getDefaultComputedStyle(elm);
	let styleString = "";
	for (let style of computedStyles) {
		if (style == "display") continue;
		const computedValue = computedStyles.getPropertyValue(style);
		const defaultValue = defaultStyles.getPropertyValue(style);
		if (computedValue == defaultValue) continue;
		styleString += `${style}: ${computedValue}; `;
	}
	
	overlay.classList.add("overlay");
	overlay.setAttribute("name", id);
	overlay.innerHTML = `
<div onclick="_onOverlayDestroy(this.parentElement);"></div>
<div class="${id}" style="${styleString}">
	<button class="close" onclick="_onOverlayDestroy(this.parentElement.parentElement);">x</button>
	${elm.innerHTML}
</div>
	`;
	document.body.appendChild(overlay);
	
	const cb = elm.getAttribute("onopen");
	if (typeof cb == "string") {
		try {
			eval(
				`const overlay = document.getElementsByClassName("${id}")[0]; ` +
				cb
			);
		} catch (err) {
			console.error(err);
		}
	}
	
	return overlay;
}
function _onOverlayDestroy(elm) {
	const ori_elm = getId(elm.getAttribute("name"));
	if (ori_elm) {
		const cb = ori_elm.getAttribute("onclose");
		if (typeof cb == "string") {
			try {
				eval(cb);
			} catch (err) {
				console.error(err);
			}
		}
	}
	elm.remove();
}
function hideOverlay(id) {
	const elms = document.getElementsByName(id);
	for (var i of elms) _onOverlayDestroy(i);
}

function refreshOverlays() {
	const elms = document.getElementsByClassName("overlay");
	for (var i of elms) {
		const id = i.getAttribute("name");
		hideOverlay(id);
		showOverlay(id);
	}
}


//----------------------------------//

function _main_events() {
	const header_bar_1 = document.querySelector(".header_bar_1");
	if (header_bar_1 != null) {
		let isFloating = false;
		window.addEventListener("load", function () {
			if (window.pageYOffset > 0) {
				header_bar_1.style.animationDuration = "0s";
				header_bar_1.classList.add("header_bar_1_undocked");
				isFloating = true;
			}
		});
		window.addEventListener("scroll", function () {
			if (window.pageYOffset > 0 && !isFloating) {
				header_bar_1.style.animationDuration = "0.5s";
				header_bar_1.classList.remove("header_bar_1_docked");
				header_bar_1.classList.add("header_bar_1_undocked");
				isFloating = true;
			} else if (window.pageYOffset === 0 && isFloating) {
				header_bar_1.style.animationDuration = "0.5s";
				header_bar_1.classList.remove("header_bar_1_undocked");
				header_bar_1.classList.add("header_bar_1_docked");
				isFloating = false;
			}
		});
	}
}
_main_events();

/* ----------- couch db ----------- */

//http://127.0.0.1:5984/_utils/#_config/couchdb@127.0.0.1
class CouchDB {
	static _default_url = "http://127.0.0.1:5984/";

	constructor() {
		this._does_auth_exists_err();
		this.request = new XMLHttpRequest();
		this.db_name = couchdb_name;
		this.is_online = 2;
	}

	//private methods

	_does_auth_exists() {
		return (
			typeof couchdb_username == "string" &&
			typeof couchdb_password == "string" &&
			typeof couchdb_name == "string"
		);
	}
	_does_auth_exists_err() {
		if (!this._does_auth_exists())
			throw 'Keine Auth vorhanden. Digga, mach mal <script src="./auth.js"></script>';
	}
	_is_error_missing_database(errReason) {
		return (
			errReason === "no_db_file" || errReason === "Database does not exist."
		);
	}
	_is_error_missing_data(errReason) {
		return errReason === "missing";
	}
	async _ping() {
		try {
			const response = await fetch(CouchDB._default_url, {
				method: "GET",
			});

			return response.ok;
		} catch (err) {
			return false;
		}
	}

	_send_db_request(method, url, body = null, errorHandling = true) {
		return new Promise(async (resolve, reject) => {
			if (this.is_online == 2) {
				await this.checkOnlineStatus();
			}
			if (this.is_online != 1) {
				reject("CouchDB is not online!");
				return;
			}

			const dburl = CouchDB._default_url + this.db_name + "/" + url;
			const request = this.request;

			this.request.onreadystatechange = () => {
				if (request.readyState != 4) return;

				try {
					if (request.status == 200 || request.status == 201) {
						var response = JSON.parse(request.responseText);
						resolve(response);
					}
					//errors
					else if (request.status == 404) {
						var json = JSON.parse(request.responseText);
						if (this._is_error_missing_data(json.reason)) {
							resolve(null);
						} else if (
							errorHandling &&
							this._is_error_missing_database(json.reason)
						) {
							this.createDB()
								.then((value) => {
									this._send_db_request(method, url, body, false)
										.then((value) => {
											resolve(value);
										})
										.catch((err) => {
											reject(err);
										});
								})
								.catch((err) => {
									reject(err);
								});
						} else {
							reject(
								`Database not found: ${request.status} (Reason: ${reason.json})`,
							);
						}
					} else {
						reject(
							`Unexpected status: ${request.status} (Response: ${
								request.responseText
							})`,
						);
					}
				} catch (err) {
					reject("Unexpected error: " + err);
				}
			};

			this.request.open(method, dburl, true);

			this.request.setRequestHeader(
				"Authorization",
				"Basic " + btoa(couchdb_username + ":" + couchdb_password),
			);
			this.request.setRequestHeader("Content-type", "application/json");

			this.request.send(body);
		});
	}
	async _get_db_data(id) {
		return await this._send_db_request("GET", id);
	}

	//public methods

	async checkOnlineStatus() {
		const res = await this._ping();

		if (res === true) {
			this.is_online = 1;
		} else {
			this.is_online = 0;
		}

		return res;
	}
	async createDB() {
		await this._send_db_request("PUT", "", null, false);
	}
	async get(id) {
		const res = await this._get_db_data(id);
		if (res == null) return null;
		delete res["_id"];
		delete res["_rev"];
		return res;
	}
	async set(id, content, replace = true) {
		try {
			if (typeof content != "object")
				throw (
					"basic.js - CouchDB->set: content is not from type object (type = " +
					typeof content +
					")"
				);

			let existingDoc;
			try {
				existingDoc = await this._get_db_data(id);
			} catch (err) {
				existingDoc = null;
			}

			if (existingDoc) {
				if (replace) {
					content = {
						...content,
						_id: existingDoc._id,
						_rev: existingDoc._rev,
					};
				} else {
					content = {
						...existingDoc,
						...content,
						_rev: existingDoc._rev,
					};
				}
			}
			const res = await this._send_db_request(
				"PUT",
				id,
				JSON.stringify(content),
			);
			return {
				type: "success",
				message: res,
			};
		} catch (err) {
			console.error(err);
			return {
				type: "error",
				message: err,
			};
		}
	}
	async delete(id) {
		try {
			var existingDoc = null;
			try {
				existingDoc = await this._get_db_data(id);
			} catch (err) {}
			if (!existingDoc) return {
				type: "error",
				message: "Not found!",
			};
			
			const res = await this._send_db_request(
				"DELETE",
				`${id}?rev=${existingDoc._rev}`
			);
			return {
				type: "success",
				message: res,
			};
		} catch (err) {
			console.error(err);
			return {
				type: "error",
				message: err,
			};
		}
	}
}


//getuser

function getURLArgsMap() {
	let spl = location.href.split("?");
	if (spl.length != 2) return {};
	let _1 = spl[1].split(",");
	const res = {};
	for (var i of _1) {
		let _2 = i.split("=");
		if (_2.length == 2) {
			res[_2[0]] = _2[1];
		} else {
			res[i] = null;
		}
	}
	return res;
}


function form1(string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
}


async function getUserData(couchDB) {
	let username = getURLArgsMap()["user"];
	if (!username) {
		if (typeof (debug_username) == "string") {
			username = debug_username;
		} else {
			return null;
		}
	}
	const res = await couchDB.get("users");
	if (!res) return null;
	const data = res[username];
	return !data ? null : {
		...data,
		"name": username
	};
}

var userData = null;
const userDataListener = [];

async function setUserData(couchDB) {
	const user = await getUserData(couchDB);
	if (user == null) {
		location.href = "../login.html";
		return false;
	}
	userData = user;
	updateAllProfiles(user);
	_constructProfile(user);
	await checkUserCourses(couchDB, user);
	
	while (userDataListener.length > 0) {
		const call = userDataListener[userDataListener.length - 1];
		userDataListener.pop();
		try { call(); } catch(err) { console.error(err); }
	}
	
	return true;
}
async function updateUserData(couchDB, user = userData) {
	const res = await couchDB.get("users");
	if (res == null) return {"type":"error", "message": "CouchDB failed"};
	
	const name = user["name"];
	if (!name) return {"type":"error", "message": "Incorrect UserData was presented"};
	
	const u = { ...user };
	delete u["name"];
	res[name] = u;
	
	return await couchDB.set("users", res);
}


function updateAllProfiles(user) {
	const features = user.enabled_abilities ??= [];
	const hasProfilAbility = features.includes("profile_pic");
	
	const profiles = document.getElementsByClassName("profile");
	for (var i of profiles) {
		if (hasProfilAbility && user.avatar) {
			i.style.backgroundImage = `url("${user.avatar}")`;
		} else {
			if (features.includes("pink_mode")) {
				i.style.backgroundImage = `url("https://static.turtle-coding-gbr.de/gmci/rosa_profil.png")`;
			} else {
				i.style.backgroundImage = `url("https://static.turtle-coding-gbr.de/gmci/standart_profil.png")`;
			}
		}
		i.onclick = _onProfileClick;
	}
}
async function checkUserCourses(couchDB, userData) {
	for (var cName of userData.courses) {
		const course = await couchDB.get("course:" + cName);
		if (!course || !course.expire_date) continue;
		
		const expire_date = new Date(course.expire_date);
		if (expire_date < new Date()) {
			course.result_history ??= [];
			course.questions ??= [];
			course.result ??= [];
			
			if (course.questions.length == 0 || course.result.length == 0) continue;
			
			course.result_history.push({
				"date": course.start_date ?? expire_date,
				"questions": course.questions,
				"result": course.result
			});
			course.questions = [];
			course.result = [];
			
			await couchDB.set("course:" + cName, course);
			
			console.log(`Course ${cName} expired`);
		}
	}
}

function _onProfileClick(event) {
	var buttonRect = this.getBoundingClientRect();
	
	var dropdown = document.createElement("dropdown");
	dropdown.addEventListener("click", dropdown.remove);
	
	var bg = document.createElement("div");
	dropdown.appendChild(bg);
	
	var div = document.createElement("div");
	
	const _1 = window.innerHeight - buttonRect.y - 200;
	if (_1 < 0) {
		div.style.transform = "translate(calc(-100% + 58px), calc(-100% - 30px))";
	}
	
	div.style.top = (buttonRect.bottom) + 'px';
	div.style.left = (buttonRect.left) + 'px';
	div.innerHTML = `
<label><b>${form1(userData.name)}</b></label>
<button onclick='_onProfilClickOnProfil()'>Profil</button>
<button onclick='showSkillTree()'>Skill-Tree</button>
<button onclick='location.href = "../login.html";'>Abmelden</button>
	`;
	dropdown.appendChild(div);
	
	document.body.appendChild(dropdown);
}
function _onProfilClickOnProfil() {
	if (typeof(showProfile) == "function") {
		showProfile(userData);
	} else {
		_showProfile(userData);
	}
}
function _constructProfile(user) {
	const elm = document.createElement("overlay");
	elm.setAttribute("id", "profile_overlay");
	document.body.appendChild(elm);
	elm.innerHTML = `
<div class="overlay_title">Profil-Übersicht</div>
<span style="display: inline-block; width: 100%; text-align: center;">
<div style="border-radius: 50%; width: 140px; height: 140px; display: inline-block; margin-bottom: 10px; background-color: var(--accent_color_bg); background-size: 140px 140px; background-image: url('');" id="profile-pic" class="profile-pic"></div>
<br>
<u style="font-size: 22px;"></u>
<br><br>
</span>
<span class="selectable">
Level: <label></label><br>
Rolle: <label></label>
</span><br>
<span class="avatar-inp">Avatar: <input style="" value=""><br></span><br>
<button style="font-size: 18px; width: 100%; border-radius: var(--border-radius); font-weight: normal; color: black; padding: 5px; background: rgba(255,255,255,0.5);" onclick="_showProfileSave(this);">Speichern</button>
	`;
}
function _showProfile(user) {
	let elm = getId("profile_overlay");
	
	const hasProfilAbility = user.enabled_abilities.includes("profile_pic");
	
	const avatarInp = elm.querySelector(".avatar-inp");
	if (hasProfilAbility) {
		elm.querySelector(".profile-pic").style.setProperty("background-image", `url('${user.avatar}')`);
		elm.querySelector("input").setAttribute("value", user.avatar);
		avatarInp.style.display = "unset";
	} else {
		avatarInp.style.display = "none";
	}
	elm.querySelector("u").innerText = getUserDisplayName(user);
	
	const labels = elm.getElementsByTagName("label");
	labels[0].innerText = user.level ?? 0;
	labels[1].innerText = form1(user.role ?? "Student");
	
	showOverlay("profile_overlay");
}
async function _showProfileSave(elm) {
	if (!userData) return;
	
	let couchDB = new CouchDB();
	const res = await couchDB.get("users");
	
	const avatar = elm.parentElement.querySelector("input");
	
	userData.avatar = avatar.value;
	
	const user = {...userData};
	delete user["name"];
	res[userData.name] = user;
	
	await couchDB.set("users", res);
	
	updateAllProfiles(userData);
	
	hideOverlay("profile_overlay");
}

async function playSound(src) {
	const elm = document.createElement("audio");
	elm.innerHTML = `
<source src="${src}" type="audio/mpeg"></source>
	`;
	try {
		await elm.play();
	} catch(err) {
		console.log("Error playing audio:", err);
	}
}

function hexToRGBA(hex) {
	let r = 0, g = 0, b = 0;
	if (hex.length === 7) {
		r = parseInt(hex.slice(1, 3), 16);
		g = parseInt(hex.slice(3, 5), 16);
		b = parseInt(hex.slice(5, 7), 16);
	}
	return [r, g, b];
}

function getUserDisplayName(user) {
	const hasHonor = (user.enabled_abilities ??= []).includes("title_of_honor");
	const title_of_honor = hasHonor ? "(Sir) " : "";
	return `${title_of_honor}${ !user.title ? "" : user.title + " " }${ form1(user.name) }`;
}

async function levelUpXP(couchDB, user = userData, xp = 1) {
	var resLevelUp = false;
	
	userData.xp ??= 0;
	userData.level ??= 0;
	
	userData.xp += xp;
	while (userData.xp >= userData.level+1) {
		userData.xp -= (userData.level + 1);
		userData.level++;
		resLevelUp = true;
	}
	
	if (userData.xp < 0) {
		console.error("UserData-XP was below zero!");
		userData.xp = 0;
	}
	
	await updateUserData(couchDB, user);
	return resLevelUp;
}