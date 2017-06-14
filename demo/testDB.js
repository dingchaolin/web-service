/**
 * Created by Administrator on 2017/6/14 0014.
 */
const db = require('../service/db-mssql');
let str = `10_TALKREC_000554359300_1`
//let sqlStr = `update DC_MR_DOCUMENT_INDEX_INPAT set status = 0  where MR_DOCUMENT_ID = '${str}' `;//更新status
//let sqlStr = "select * from ERROR_IPID";//查询
let sqlStr = "delete from ERROR_IPID";//查询
//let sqlStr = "select count(*) as num from DC_MR_DOCUMENT_INDEX_INPAT where status = 1  ";//更新status
db.query( sqlStr )((err,data)=>{
    console.log( err, JSON.stringify(data) )
})