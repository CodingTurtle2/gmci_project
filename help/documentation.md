##How to import

<link rel="stylesheet" href="./lib/basic.css">
<script src="./auth.js"></script>
<script src="./lib/basic.js"></script>

##Overlays

```
//Erstelle ein element mit <overlay></overlay> in html und vergebe eine id. Um das overlay anzuzeigen, rufe showOverlay mit der id auf
function showOverlay(string id) -> void;

//Schließe das overlay mit der id
function hideOverlay(string id) -> void;

//Rufe das overlay auf
function getOverlay(string id) -> div;

```

##CouchDB

```
//Klasse zum Interagieren mit CouchDB
//Erstelle eine neue CouchDB-Klasse mit new CouchDB();
class CouchDB {
	//Überprüfe, ob CouchDB online ist. (Wird sowieso automatisch gemacht, wenn get, set oder createDB verwendet wird)
	async checkOnlineStatus() -> bool;
	
	//Erstellt die Datenbank. (Wird auch automatisch gemacht, wenn man get oder set verwendet)
	async createDB() -> void;
	
	//Bekomme das Objekt, was in der Datenbank unter der id gespeichert wurde (Gibt null zurück, wenn nicht vorhanden)
	async get(string id) -> Map|null;
	//Setze ein Objekt, was in der Datenbank gespeichert wird (Bedenke: Du musst ein Objekt angeben, alles andere (string, array) wird nicht genommen)
	async set(string id, object content, boolean replace = true) -> Map;
	//Lösche ein Objekt, was in der Datenbank gespeichert ist
	async delete(string id) -> Map;
}
```

Hinweise:
- Du brauchst eigentlich nur get oder set (weil alles andere automatisch gemacht wird)
- Wenn CouchDB offline oder online geht, während das html file läuft, musst du manuell checkOnlineStatus() aufrufen, um den Status zu aktualisieren
	-> Oder einfach die Seite neuladen :/
- Vergiss nicht auth.js einzubinden!!! sonst 💥

**Beispiel:**
```
async function main() {
	const couchDB = new CouchDB();
	await couchDB.set("login", {
		"username": "bla",
		"password": "bla"
	});

	const data = await couchDB.get("login");
	console.log(JSON.stringify(data));
	//Gibt { "username": "bla", "password": "bla" } wieder
}
main();
```

##User

```
//Gebe dir den Nutzer wieder
async function getUserData(couchDB) -> Map?;

//Setze den Nutzer, welcher unter der Variable userData verfügbar sein wird
async function setUserData(couchDB) -> bool;
```

##Nützliche CSS-Klassen
- .profile = Runde Profilbox
- overlay = Overlay
- .header_bar_1 = Headerbar
- .header_bar_1_placeholder = Platzhalter für Headerbar
- .add_button = Runder "Hinzufügen"-Knopf