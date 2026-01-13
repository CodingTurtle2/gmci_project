<?php

class CouchDB {
	public string $db_file;
	public string $def_db_file;
	public TurtleURLObject $url_obj;

	public function __construct(string $db_file, string $def_db_file, TurtleURLObject $url_obj) {
		$this->db_file = $db_file;
		$this->def_db_file = $def_db_file;
		$this->url_obj = $url_obj;
	}

	public function getFile(): object {
		if (file_exists($this->db_file)) {
			$content = json_decode(file_get_contents($this->db_file));
			if (json_last_error() === JSON_ERROR_NONE) {
				return $content;
			}
		}

		if (file_exists($this->def_db_file)) {
			$content = json_decode(file_get_contents($this->def_db_file));
			if (json_last_error() === JSON_ERROR_NONE) {
				return $content;
			}
		}

		return (object) [];
	}

	public function setFile(object $content): void {
		file_put_contents($this->db_file, str_replace("    ", "\t", json_encode($content, JSON_PRETTY_PRINT)));
	}
	
	public function resetFile() {
		if (file_exists($this->db_file)) {
			unlink($this->db_file);
		}
		$this->setFile($this->getFile());
	}
	
	public function sendError(string $msg, int $code = 404) :bool {
		http_response_code($code);
		$this->url_obj->send_json(["ok" => false, "reason" => $msg]);
		return false;
	}
	public function sendData(object $data = new stdClass()) :bool {
		$data->ok = true;
		$this->url_obj->send_json($data);
		return true;
	}

	public function execute(): bool {
		$method = strtoupper($this->url_obj->method);
		$args = $this->url_obj->args;

		//path
		$pathParts = explode("/", trim($this->url_obj->url ?? "", "/"));
		if (!empty($pathParts) && strtolower($pathParts[0]) == "couchdb") {
			array_splice($pathParts, 0, 1);
		}
		
		if (empty($pathParts)) return $this->sendData();
		
		$dbName = $pathParts[0] ?? null;
		$docId = null;
		if (sizeof($pathParts) > 1) $docId = $pathParts[1] ?? null;
		
		if (!$dbName) return $this->sendError("wrong_usage");
		
		//data
		$db_obj = $this->getFile();
		$jsonBody = null;
		$rawBody = $this->url_obj->get_body_text();
		if ($rawBody !== "") {
			$jsonBody = json_decode($rawBody, true);
			if (!is_array($jsonBody) && !is_object($jsonBody)) $jsonBody = null;
			else $jsonBody = (object) $jsonBody;
		}
				
		//get data
		$obj = null;
		if (isset($db_obj->$dbName) && is_object($db_obj->$dbName)) {
			if ($docId && isset($db_obj->$dbName->$docId) && is_object($db_obj->$dbName->$docId)) {
				$obj = $db_obj->$dbName->$docId;
			} else if ($method != "PUT" && !($method == "GET" && $docId == "*")) {
				return $this->sendError("missing");
			}
		} else if ($method != "PUT") {
			if (!$dbName || !isset($db_obj->$dbName)) {
				return $this->sendError("no_db_file");
			}
		} else {
			$db_obj->$dbName = null;
		}

		//execute
		switch ($method) {
			case "GET":
				if ($docId == "*") {
					$res_arr = [];
					foreach ($db_obj->$dbName as $key => $value) $res_arr[] = $key;
					$this->url_obj->send_json($res_arr);
					return true;
				}
				
				$obj->_id = $docId;
				$obj->_rev = 0;
				$this->url_obj->send_json($obj);
				
				return true;
			case "PUT":
				if ($db_obj->$dbName == null) {
					if ($docId == null) {
						$db_obj->$dbName = (object) [];
						$this->setFile($db_obj);
						return $this->sendData();
					} else {
						return $this->sendError("no_db_file");
					}
				}
				
				$db_obj->$dbName->$docId ??= (object) [];
				
				if ($jsonBody == null) return $this->sendError("missing_body");
				
				unset($jsonBody->_id);
				unset($jsonBody->_rev);

				$db_obj->$dbName->$docId = $jsonBody;
				$this->setFile($db_obj);
				
				return $this->sendData((object) [
					"id" => $docId,
					"rev" => 0
				]);
			case "DELETE":
				unset($db_obj->$dbName->$docId);
				$this->setFile($db_obj);
				return $this->sendData((object) [ "id" => $docId ]);
			default:
				return $this->sendError("method_not_allowed");
		}
	}
}
