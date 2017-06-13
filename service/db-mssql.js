/**
 * Created by dcl on 2017/6/13 0013.
 */

const mssql = require('mssql');
const zco = require("zco");
let db = {};
let config = {
    user: 'sa',
    password: 'Ewell@123',
    server: '192.168.17.221',
    database: 'CDRDB',
    port:1433,
    pool: {
        min: 0,
        max: 10,
        idleTimeoutMillis: 3000
    }
};


db.query = function ( sql ) {
    return zco( function*( next ){

        let [err, retCon] = yield mssql.connect( config, next );
        if( err || retCon ){
            throw new Error("数据库连接失败！");
        }
        let client = new mssql.Request();

        let [errQuery, result] = yield client.query( sql, next );

        let ret = {};
        if( errQuery ){
            ret.err = errQuery;
            ret.success = false;
            ret.sql = sql;
            ret.result = {};
        }else{
            ret.err = "";
            ret.success = true;
            ret.sql = "";
            ret.result = result;
        }

        mssql.close( );
        return ret;
    })
};

module.exports = db;