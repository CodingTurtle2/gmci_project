async function createTemp() {
	const couchDB = new CouchDB();
	await couchDB.set("users", {
		"turtle": {
			"password": "1234",
			"level": 3,
			"xp": 2,
			"avatar": null,
			"abilities": [],
			"enabled_abilities": [],
			"role": "student",
			"courses": [
				"weiche_ware",
				"bucket"
			]
		},
		"dumble-door": {
			"password": "bla",
			"level": 10,
			"xp": 0,
			"avatar": "https://static.turtle-coding-gbr.de/gmci/profile-pic.png",
			"abilities": [
			],
			"enabled_abilities": [
			],
			"role": "professor",
			"courses": [
				"weiche_ware", "algebra", "geometrie"
			]
		},
		"narrator": {
			"password": "stanley",
			"level": 10,
			"xp": 0,
			"avatar": "https://static.turtle-coding-gbr.de/gmci/st",
			"abilities": [
				"dark_mode",
				"accent_color",
				"pink_mode",
				"profile_pic",
				"simple_border",
				"gold_border",
				"epic_border",
				"title_of_honor"
			],
			"enabled_abilities": [
			],
			"role": "professor",
			"courses": [
				"bucket", "statistik"
			]
		}
	});
	await couchDB.set("course:bucket", {
		"title": "Bucket",
		"description": "The end is never the end is never the end is never",
		"owner": "narrator",
		"questions": [
			{
				"title": "What is comedic timing?",
				"type": "text"
			},
			{
				"title": "How does it work?",
				"type": "text"
			},
			{
				"title": "How long should it last?",
				"type": "scala"
			},
			{
				"title": "How can it be used to effectively silence your political enemies?",
				"type": "emoji"
			}
		],
		"result": [
			["YES", "YES", 5, 2],
			["YES", "YES", 1, 3]
		],
		"result_history": [
			{
				"date": "2025-12-27",
				"questions": [
					{ "title": "Wie war die Vorlesung?", "type": "text" },
					{ "title": "Wie war der Professor?", "type": "scala" }
				],
				"result": [
					["Gut, weil ...", 5],
					["Schlecht, weil ...", 1]
				]
			}
		],
		"start_date": "2025-12-23",
		"expire_date": "2026-02-20"
	});
	await couchDB.set("course:weiche_ware", {
		"title": "Weiche Ware",
		"description": "blabering",
		"owner": "dumble-door",
		"questions": [
			{
				"title": "Wie fanden Sie die Vorlesung?",
				"type": "text"
			},
			{
				"title": "Finden Sie, dass man Zauberei an lebendigen Schülern praktizieren sollte?",
				"type": "scala"
			}
		],
		"result": [
			["Gut, weil ...", 5],
			["Schlecht, weil ...", 1],
			["Lorem ipsum dolor sit amet", 2],
			["consetetur sadipscing elitr, sed diam ", 3],
			[" nonumy eirmod tempor invidunt ut labore ", 4],
			["et dolore magna aliquyam erat, sed diam", 5],
			[" voluptua. At vero eos et accusam et justo duo", 1],
			["the end", 5]
		],
		"result_history": [
			{
				"date": "2025-12-27",
				"questions": [
					{ "title": "1", "type": "text" },
					{ "title": "2", "type": "scala" }
				],
				"result": [
					["Gut, weil ...", 5],
					["Schlecht, weil ...", 1],
					["Lorem ipsum dolor sit amet", 2],
					["consetetur sadipscing elitr, sed diam ", 3],
					[" nonumy eirmod tempor invidunt ut labore ", 4],
					["et dolore magna aliquyam erat, sed diam", 5],
					[" voluptua. At vero eos et accusam et justo duo", 1],
					["the end", 5]
				]
			}
		],
		"start_date": "2025-12-23",
		"expire_date": "2026-02-20"
	});
	
	
	await couchDB.set("course:algebra", { "title": "Algebra", "description": "Grundlagen der algebraischen Konzepte.", "owner": "math-wizard", "questions": [ { "title": "Wie gut verstehen Sie die Grundlagen der Algebra?", "type": "text" }, { "title": "Bewerten Sie die Schwierigkeit algebraischer Aufgaben.", "type": "scala" } ], "result": [ ["Einfach, weil ...", 5], ["Schwierig, weil ...", 1] ], "result_history": [ { "date": "2025-12-28", "questions": [ { "title": "1", "type": "text" }, { "title": "2", "type": "scala" } ], "result": [ ["Einfach, weil ...", 5], ["Schwierig, weil ...", 1] ] } ], "start_date": "2025-12-26", "expire_date": "2025-02-25" });
	await couchDB.set("course:geometrie", { "title": "Geometrie", "description": "Erforschung geometrischer Figuren und Konzepte.", "owner": "geo-genius", "questions": [ { "title": "Wie sicher sind Sie im Umgang mit geometrischen Formen?", "type": "text" }, { "title": "Bewerten Sie die Komplexität geometrischer Aufgaben.", "type": "scala" } ], "result": [ ["Einfach, weil ...", 5], ["Schwierig, weil ...", 1] ], "result_history": [ { "date": "2025-12-29", "questions": [ { "title": "1", "type": "text" }, { "title": "2", "type": "scala" } ], "result": [ ["Einfach, weil ...", 5], ["Schwierig, weil ...", 1] ] } ], "start_date": "2025-12-24", "expire_date": "2025-03-15" });
	await couchDB.set("course:statistik", { "title": "Statistik", "description": "Grundlagen der statistischen Analyse und Interpretation.", "owner": "data-analyst", "questions": [ { "title": "Wie gut verstehen Sie statistische Methoden?", "type": "text" }, { "title": "Bewerten Sie die Schwierigkeit statistischer Analysen.", "type": "scala" } ], "result": [ ["Einfach, weil ...", 5], ["Schwierig, weil ...", 1] ], "result_history": [ { "date": "2025-12-30", "questions": [ { "title": "1", "type": "text" }, { "title": "2", "type": "scala" } ], "result": [ ["Einfach, weil ...", 5], ["Schwierig, weil ...", 1] ] } ], "start_date": "2025-12-25", "expire_date": "2025-04-10" });

}