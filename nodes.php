<?php
    // Cronjob this file to get nodeList.json up to date.
    // This file exists because can't get jsons from external sources via JS because security headers
    $sources = array("https://iotasupport.com/providers.json","https://static.iota.org/providers.json");
    $nodeList = array();
    foreach($sources as $source) {
        $result = @file_get_contents($source);
        if($result){
            $nodes = JSON_DECODE($result);
            foreach($nodes as $node)
                array_push($nodeList,$node);
        }
    }
    $nodeList = array_unique($nodeList);
    $newNodeList = array();
    foreach($nodeList as $node) {
        $data = explode(":",$node);
        $nodeInfo = (object) [
            "node" => $data[0].":".$data[1],
            "port" => $data[2],
            "pow" => false,
            "wallet" => true
        ];
        array_push($newNodeList,$nodeInfo);
    }

    // custom
    $fieldCarriotaNode = (object) [
        "node" => "https://field.carriota.com",
        "port" => "443",
        "pow" => true,
        "wallet" => false
    ];
    array_push($newNodeList,$fieldCarriotaNode);

    // iota.dance/data/node-stats
    $result = @file_get_contents("https://iota.dance/data/node-stats");
    if($result) {
        $nodes = JSON_DECODE($result);
        $nodesDedup = array();
        foreach($nodes as $nodeInfo) {
            $band = false;
            foreach($nodes as $nodeInfo2) {
                if($nodeInfo2->node === $nodeInfo->node)
                    $band = true;
            }
            $nodeInfo->wallet = false;
            if($nodeInfo->health !== 1 && !$band)
                array_push($newNodeList,$nodeInfo);
        }
        $newNodeList = JSON_ENCODE($newNodeList,JSON_UNESCAPED_SLASHES);
        file_put_contents('nodeList.json',$newNodeList);
    }