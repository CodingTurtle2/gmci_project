<?php
require_once './utils/url_handler.php';
require_once './utils/couch.php';


$path_info = new TurtlePathInfo();
$path_info->content = "./files/";
	
$url_obj = TurtleURLObject::create_from_server(false, false);

if (str_starts_with($url_obj->url, "couchdb")) {
	$couchDB = new CouchDB("./data/couchdb.json", "./data/def_data.json", $url_obj);
	$couchDB->execute();
} else {
	$url_obj->handle_request($path_info);
}