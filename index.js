/**
 * Created by dcl on 2017/6/13 0013.
 */

const exec = require('./run/index').exec;
const zco = require('zco');
const db = require('./service/db-mssql');
const configOpr = require("./service/configOpr");


function start(){

    return zco(function*( next ){

        let config = configOpr.readConfig( "" );
        let skip = config.skip;

        let sqlStr = `select count(1) as num from DC_MR_DOCUMENT_INDEX_INPAT`;
        let [err, data ] = yield db.query( sqlStr );

        let totalCount = parseInt( data.result.recordset[0].num|| 2350842 ) ;
        while( totalCount > skip ){
            let [errExec, dataExec] = yield exec();

            config = configOpr.readConfig( "" );
            console.log( config, totalCount )
            skip = config.skip;
            let date = new Date().toLocaleString();
            console.log(`${skip}条已经处理完毕,${ date }`);
            if( totalCount < parseInt(skip) ){
                console.log( "所有处理完毕！" );
                break;
            }

        }

        return dataExec;//{msg:"finish!"};

    });
}



start()( (err,data) =>{
    console.log( err )
    console.log( JSON.stringify(data) );
})