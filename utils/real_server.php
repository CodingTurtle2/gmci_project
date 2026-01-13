<?php

function server_check() :bool {
	if (!is_online_server()) return true;
	return allow_server_access();
}

function is_online_server() :bool {
	$hostname = gethostname();
	return $hostname == 'www531.your-server.de';
}

function allow_server_access() :bool {
	date_default_timezone_set('Europe/Berlin');

	$currentDay = date('N');// Wochentag (1 = Montag, 7 = Sonntag)
	$currentTime = date('H');// Aktuelle Stunde im 24-Stunden-Format

	return
		($currentDay === '2') &&
		($currentTime >= '08' && $currentTime < '12')
	;
}