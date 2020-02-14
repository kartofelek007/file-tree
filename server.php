<?php
//folders or files names to ignore
$namesToIgnore = Array('XXX');

function fillArrayWithFileNodes( DirectoryIterator $dir )
{
    global $namesToIgnore;

    $data = [];

    foreach ( $dir as $node )
    {
        if (in_array($node, $namesToIgnore)) continue;

        if ( $node->isDir() && !$node->isDot() )
        {
            $path = $node->getPath();
			$path = $path .'\\'. $node->getFilename();
            $path = str_replace("\\", '/', $path);

            $data[$node->getFilename()] = [
                    'type' => 'folder',
                    'name' => $node->getFilename(),
                    'path' => $path,
                    'files' => fillArrayWithFileNodes( new DirectoryIterator( $node->getPathname() ) ),
                    'show' => in_array($node->getFilename(), ["css"]),
            ];
        }
        else if ( $node->isFile() && !$node->isDot() )
        {
            $path = $node->getPath();
			$path = $path .'\\'. $node->getFilename();
            $path = str_replace("\\", '/', $path);


            $data[] = [
                'type' => 'file',
                'name' => $node->getFilename(),
                'path' => $path,
                'files' => false,
                'ext' => pathinfo($path, PATHINFO_EXTENSION),
                'checked' => in_array($node->getFilename(), ["style.min.css", "style.min.css.map", "bundle.min.js", "bundle.min.js.map", "script.min.js", "script.min.js.map", "three.min.js"])
            ];
        }
    }
    return $data;
}

$tree = fillArrayWithFileNodes( new DirectoryIterator( './dist' ) );
echo json_encode($tree);
?>