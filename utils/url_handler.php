<?php

class TurtlePathInfo {
	public string $content;
}
class TurtleURLObject {
	public static function create_from_server(bool $lowerCase = true, bool $alternativeURL = true) :TurtleURLObject {
		$urlParts = explode('?',  trim($_SERVER['REQUEST_URI'], '/'));
		$urlMark = _parseUrlMark($urlParts);
		$request = str_replace("..", ".", $urlParts[0]);
		
		if ($lowerCase) $request = strtolower($request);
		if ($alternativeURL) $request = str_replace("-", "/", $request);
		
		$res = new TurtleURLObject($request, $urlMark);
		$res->method = $_SERVER['REQUEST_METHOD'];
		$res->method_type = explode(',', $_SERVER['HTTP_ACCEPT'] ?? '');
		return $res;
	}
	
	public string $url;
	public object $args;
	public function __construct(string $url, object $args) {
		$this->url = $url;
		$this->args = $args;
	}
	
	public string $method;
	public array $method_type;
	
	public function get_body_text() :string {
		$bodyContent = file_get_contents("php://input");
		return $bodyContent;
	}
	
	public function get_html_file(string $file_path): string {
		if (!file_exists($file_path)) {
			return "Not found!";
		} else {
			return file_get_contents($file_path);
		}
	}
	public function send_text(string $text) :void {
		header('Content-Type: text/plain');
		echo $text;
	}
	public function send_json(mixed $data) :void {
		header('Content-Type: application/json');
		echo json_encode($data);
	}
	public function send_image(string $path) :void {
		$fileExt = pathinfo($path, PATHINFO_EXTENSION);
		if ($fileExt === "ico") {
			header("Cache-Control: no-cache, must-revalidate, max-age=0");
			header("Content-Type: image/x-icon");
		} else {
			header("Content-Type: image/$fileExt");
		}
		readfile($path);
	}
	public function send_custom_file(string $path) :bool {
		$fileExt = pathinfo($path, PATHINFO_EXTENSION);
		if (isFileExtImage($fileExt)) {
			$this->send_image($path);
		} else if ($fileExt == "json") {
			$content = file_get_contents($path);
			if ($content == false) return false;
			header('Content-Type: application/json');
			echo $content;
		} else if ($fileExt == "txt") {
			$content = file_get_contents($path);
			if ($content == false) return false;
			$this->send_text($content);
		} else if ($fileExt == "js") {
			header('Content-Type: text/javascript; charset=utf-8');
			echo file_get_contents($path);
			return true;
		} else if ($fileExt == "css") {
			header("Content-Type: text/css");
			echo file_get_contents($path);
		} else if ($fileExt == "html") {
			echo $this->get_html_file($path);
		} else {
			return false;
		}
		return true;
	}
	
	public function is_image_request() :bool {
		foreach ($this->method_type as $type) {
			if (!str_starts_with($type, "image/")) return false;
		}
		return true;
	}
	
	public function handle_request(TurtlePathInfo $path_info): void {
		$referer = $_SERVER['HTTP_REFERER'] ?? '';

		$filePath = $path_info->content . $this->url;
		
		if (strlen($this->url) == 0) {
			$filePath = "{$path_info->content}START.html";
		}
		
		//-------------Image-Pages-------------------//
		else if (
			!empty($referer) && $this->is_image_request()
		) {
			if (file_exists($filePath)) {
				$this->send_image($filePath);
				return;
			} else {
				$filePath = NULL;
			}
		}
		
		//-------------HTML-Pages-------------------//
				
		if ($filePath === NULL || !file_exists($filePath)) {
			$filePath = "{$path_info->content}NOT-FOUND.html";
			http_response_code(404);
		}
		
		$this->send_custom_file($filePath);
	}
}

function _parseUrlMark($urlParts) :object {
	$res = (object) [];
	if (count($urlParts) == 1) return $res;
	foreach (explode('&', $urlParts[1]) as $part) {
		$arr = explode('=', $part, 2);
		$cnt = count($arr);
		switch ($cnt) {
			case 1:
				$res->{$arr[0]} = 1;
				break;
			case 2:
				$res->{$arr[0]} = $arr[1];
				break;
		}
	}
	return $res;
}
function isFileExtImage(string $fileExt) :bool {
	switch ($fileExt) {
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'ico':
		case 'gif':
			return true;
		default:
			return false;
	}
}