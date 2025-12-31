async function createTemp() {
	const couchDB = new CouchDB();
	await couchDB.set("users", {
		"turtle": {
			"password": "1234",
			"level": 4,
			"xp": 0,
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
				"weiche_ware"
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
				"bucket"
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
			["Schlecht, weil ...", 1]
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
					["Schlecht, weil ...", 1]
				]
			}
		],
		"start_date": "2025-12-23",
		"expire_date": "2025-02-20"
	});
}