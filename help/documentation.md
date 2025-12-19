##How to import

<link rel="stylesheet" href="./lib/basic.css">
<script src="./auth.js"></script>
<script src="./lib/basic.js"></script>

##Overlays

```
//Erstelle ein element mit <overlay></overla> in html und vergebe eine id. Um das overlay anzuzeigen, rufe showOverlay mit der id auf
function showOverlay(string id);

//Schließe das overlay mit der id
function hideOverlay(string id);
```

##CouchDB

```
//Klasse zum Interagieren mit CouchDB
//Erstelle eine neue CouchDB-Klasse mit new CouchDB();
class CouchDB {
	//Überprüfe, ob CouchDB online ist. (Wird sowieso automatisch gemacht, wenn get, set oder createDB verwendet wird)
	async checkOnlineStatus();
	
	//Erstellt die Datenbank. (Wird auch automatisch gemacht, wenn man get oder set verwendet)
	async createDB();
	
	//Bekomme das Objekt, was in der Datenbank unter der id gespeichert wurde
	async get(string id);
	//Setze ein Objekt, was in der Datenbank gespeichert wird (Bedenke: Du musst ein Objekt angeben, alles andere (string, array) wird nicht genommen)
	async set(string id, object content, boolean replace = true);
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
