<?php
require_once './utils/url_handler.php';
require_once './utils/couch.php';
require_once './utils/real_server.php';

function main() {
	if (!server_check()) {
		echo 'Access denied';
		return;
	}
	
	$path_info = new TurtlePathInfo();
	$path_info->filesDir = "./files/";
	$path_info->contentDir = "./files/";
	$path_info->homeFile = "./files/START.html";
	$path_info->notFoundFile = "./files/NOT-FOUND.html";
	
	
	$url_obj = TurtleURLObject::create_from_server(false, false);
	$couchDB = new CouchDB("./data/couchdb.json", "./data/def_data.json", $url_obj);
	
	if (str_starts_with($url_obj->url, "couchdb")) {
		$couchDB->execute();
	} else if ($url_obj->url == "reset") {
		$url_obj->url = "";
		$couchDB->resetFile();
		$url_obj->handle_request($path_info);
	} else {
		$url_obj->handle_request($path_info);
	}
}

main();