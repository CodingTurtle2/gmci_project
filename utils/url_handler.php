<?php

class TurtlePathInfo {
	public static function create_default(string $filesDir) :TurtlePathInfo {
		$res = new TurtlePathInfo();
		$res->filesDir = $filesDir;
		$res->contentDir = "{$filesDir}content/";
		$res->homeFile = "{$res->contentDir}HOME";
		$res->notFoundFile = "{$res->contentDir}NOT-FOUND";
		return $res;
	}
	
	public string $filesDir;
	public string $contentDir;
	
	public string $homeFile;
	public string $notFoundFile;
}

class TurtleURLObject {
	public static function parse_url_mark(array $urlParts) :object {
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
	public static function create_from_server(bool $lowerCase = true, bool $alternativeURL = true) :TurtleURLObject {
		$urlParts = explode('?',  trim($_SERVER['REQUEST_URI'], '/'));
		$urlMark = TurtleURLObject::parse_url_mark($urlParts);
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
	public function get_body_json() :mixed {
		$res = json_decode($this->get_body_text());
		return json_last_error() === JSON_ERROR_NONE ? $res: null;
	}
	public function send_text(string $text) :void {
		$this->set_ext_header('txt');
		echo $text;
	}
	public function send_json(mixed $data) :void {
		$this->set_ext_header('json');
		echo json_encode($data);
	}
	
	//send custom content
	
	public function send_file(string $path) :void {
		$fileExt = pathinfo($path, PATHINFO_EXTENSION);
		$fileExt = strtolower(ltrim($fileExt, '.'));
		$this->set_ext_header($fileExt);
		
		if ($fileExt == "html") {
			if (!is_file($path)) echo 'File not found!';
			else echo $this->get_html_file($path);
		} else {
			if (!is_file($path)) echo '';
			else readfile($path);
		}
	}
	public function allow_ext_referer(string $ext) :bool {
		$types = $this->method_type;
		if (isFileExtImage($ext)) {
			foreach ($types as $i) if (str_starts_with($i, 'image/')) return true;
			return false;
		} else if ($ext == 'js') {
			if (sizeof($types) == 1 && $types[0] == "*/*") return true;
			return false;
		} else if ($ext == 'css') {
			foreach ($types as $i) if ($i == 'text/css') return true;
			return false;
		} else {
			return true;
		}
	}
	public function set_ext_header(string $ext) :void {
		if (isFileExtImage($ext)) {
			if ($ext === "ico") {
				header("Cache-Control: no-cache, must-revalidate, max-age=0");
				header("Content-Type: image/x-icon");
			} else {
				header("Content-Type: image/$ext");
			}
			return;
		}
		switch ($ext) {
			case 'html':
				header('Content-Type: text/html'); break;
			case 'json':
				header('Content-Type: application/json'); break;
			case 'css':
				header("Content-Type: text/css"); break;
			case 'js':
				header('Content-Type: application/javascript; charset=utf-8'); break;
			case 'md': case 'txt':
				header('Content-Type: text/plain'); break;
			case 'pdf':
				header("Content-Type: application/$ext"); break;
			default:
				header('Content-Type: text/html'); break;
		}
	}
	
	//execution
	
	private function get_html_file(string $file_path): string {
		return file_get_contents($file_path);
	}
	private function _get_path(string|null $path, string $filesDir = "") :string {
		if ($path == null || is_file($path)) return $path;
		if (is_file("$path.html")) return "$path.html";
			
		return $path;
	}
	public function handle_request(TurtlePathInfo $path_info): void {
		$referer = $_SERVER['HTTP_REFERER'] ?? '';

		$filePath = $path_info->contentDir . $this->url;
		if (strlen($this->url) == 0) $filePath = $path_info->homeFile;
				
		$filePath = $this->_get_path($filePath, $path_info->filesDir);
		if (!($this->allow_ext_referer(pathinfo($filePath, PATHINFO_EXTENSION)))) {
			$filePath = null;
		}
		
		if ($filePath == null || !is_file($filePath)) {
			http_response_code(404);
			$filePath = $this->_get_path($path_info->notFoundFile, $path_info->filesDir);
		}
		
		$this->send_file($filePath);
	}
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