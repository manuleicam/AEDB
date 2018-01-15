<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");

// connect
$m = new MongoClient();

// select a database
$db = $m->admin_database;

// select a collection (analogous to a relational database's table)
$collection = $db->wait_collection;

// find everything in the collection
$cursor = $collection->find()->sort(array('Time' => -1));

$data = array();
foreach ($cursor as $row) {
	$data[] = $row;
}

print json_encode($data);

?>