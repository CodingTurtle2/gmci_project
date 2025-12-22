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
async function getUserData(couchDB) {
	const username = getURLArgsMap()["user"];
	if (!username) return null;
	const res = await couchDB.get("users");
	if (!res) return null;
	const data = res[username];
	return !data ? null : {
		...data,
		"name": username
	};
}
var userData = null;
async function setUserData(couchDB) {
	const res = await getUserData(couchDB);
	if (res == null) {
		location.href = "../login.html";
		return false;
	}
	userData = res;
	return true;
}