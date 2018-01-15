<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
ini_set('mongo.native_long', false);
ini_set('mongo.long_as_object', true);

// connect
$m = new MongoClient();

// select a database
$db = $m->admin_database;

// select a collection (analogous to a relational database's table)
$collection = $db->IO_collection;

// find everything in the collection
$cursor = $collection->aggregateCursor([
	[ '$group' => ['_id' => '$Date', 'writes' => ['$sum' => '$Physical_Writes'], 'reads' => ['$sum' => '$Physical_Reads'], 'blocks' => ['$sum' => '$Total_Block']]],
	['$sort' => ['_id' => -1]]
	]);
$data = array();
foreach ($cursor as $row) {
	$data[] = $row;
}

print json_encode($data);

?>