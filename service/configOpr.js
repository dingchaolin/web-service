/**
 * Created by dcl on 2017/6/13 0013.
 */

function modifyConfig( limit, skip ){
    let config = { limit, skip };
    let dir = __dirname;
    dir = dir.substring( 0, dir.lastIndexOf("\\") );
    require("fs").writeFileSync( `${dir}/config/config.json`, JSON.stringify( config ) );
    return true;
}

function readConfig( path ){
    let dir = __dirname;
    dir = dir.substring( 0, dir.lastIndexOf("\\"));
    return JSON.parse( require("fs").readFileSync( `${dir}/config/config.json` ).toString() );
}

exports.modifyConfig = modifyConfig;
exports.readConfig = readConfig;
