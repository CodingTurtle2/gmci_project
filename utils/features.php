<?php

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

function res_mixed(bool $success, mixed $data = null, string $except = null) :object {
	return $success ? res_ok($data): res_err($data ?? $except);
}
function res_ok(mixed $data = null) :object {
	return (object) [
		"type" => "success",
		"data" => $data
	];
}
function res_err(string|null $message = null) :object {
	return (object) [
		"type" => "error",
		"message" => $message
	];
}