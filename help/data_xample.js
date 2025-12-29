async function createTemp() {
	const couchDB = new CouchDB();
	await couchDB.set("users", {
		"turtle": {
			"password": "1234",
			"level": 1,
			"avatar": null,
			"abilities": [
			],
			"enabled_abilities": [
			],
			"role": "student",
			"courses": [
				"weiche_ware",
				"bucket"
			]
		},
		"dumble-door": {
			"password": "bla",
			"level": 4,
			"avatar": "https://static.turtle-coding-gbr.de/profile-pic.png",
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
			"level": 4,
			"avatar": "https://static.turtle-coding-gbr.de/st",
			"abilities": [
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
					{ "title": "1", "type": "text" },
					{ "title": "2", "type": "scala" }
				],
				"result": [
					["Gut, aber ...", 5],
					["Schlecht", 1]
				]
			}
		],
		"start_date": "2025-12-23",
		"expire_date": "2025-12-27"
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
			["Gut, aber ...", 5],
			["Schlecht", 1]
		],
		"result_history": [
			{
				"date": "2025-12-27",
				"questions": [
					{ "title": "1", "type": "text" },
					{ "title": "2", "type": "scala" }
				],
				"result": [
					["Gut, aber ...", 5],
					["Schlecht", 1]
				]
			}
		],
		"start_date": "2025-12-23",
		"expire_date": "2025-12-27"
	});
}