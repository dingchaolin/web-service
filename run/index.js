/**
 * Created by dcl on 2017/6/13 0013.
 */
const zco = require('zco');
const getPdf = require('../service/getPdf_service').getPdf;
const configOpr = require("../service/configOpr");
const db = require('../service/db-mssql');
const fs = require('fs');


function exec( ){
    return zco( function*( next ){

        let config = configOpr.readConfig( "" );
        let limit = config.limit;
        let skip = config.skip;

        let sqlStr = `select top  ${ limit } MR_DOCUMENT_ID, VISIT_DATE_TIME from DC_MR_DOCUMENT_INDEX_INPAT where MR_DOCUMENT_ID not in ( select top  ${ skip } MR_DOCUMENT_ID from DC_MR_DOCUMENT_INDEX_INPAT where status = 0) order by VISIT_DATE_TIME desc`;

        let [err, data ] = yield db.query( sqlStr );


        let rows = [];
        if( data.success &&
            data.result &&
            data.result.recordset &&
            data.result.recordset.length > 0 ){
            rows = data.result.recordset;
        }

        for( let i = 0, len = rows.length; i < len; i ++ ){


            let str = rows[i].MR_DOCUMENT_ID;

            let index = str.indexOf( "_" , str.indexOf( "_") + 1 );
            let dirName = str.substring( 0, index );
            let fileName = str.substring( index + 1, str.length );
            let [errExt,exist] = yield fs.exists(dirName,next);
            if( !exist ){
               let[err,mkErr] = yield fs.mkdir(dirName, next );
            }

            let ipid = fileName;

            let options = {};
            options.url = `http://192.168.15.171:9080/htpdf/services/WebServicePDF`;
            options.form = {
                ipid : ipid,
                functionId : "HospitalRecord",
                xmlStr: ""
            };
            let dir = __dirname;
            dir = dir.substring( 0, dir.lastIndexOf("\\") );
            options.path = `${dir}/${dirName}/${fileName}`;
            let [errGetPdf, resPdf] = yield getPdf( options );

            if( errGetPdf || (resPdf && !resPdf.success) ){

                //出错要存入库
                sqlStr = `insert into ERROR_IPID(ipid) values('${str}')`;
                let [err1,ret1] = yield db.query( sqlStr );

            }else{

                //更新状态
                sqlStr = `update  DC_MR_DOCUMENT_INDEX_INPAT set status = 1 where MR_DOCUMENT_ID = '${str}'`;

                let [err2,ret2] = yield db.query( sqlStr );


            }


        }
        limit = config.limit;
        skip = parseInt(skip) + parseInt( limit);
        configOpr.modifyConfig( limit, skip );

        return true;

    });
}


exports.exec = exec;