/**
 * Created by dcl on 2017/6/12 0012.
 */

const zco = require("zco");
const soap = require("soap");
const fs = require('fs');
const cheerio = require("cheerio");



let options = {};
options.url = `http://192.168.15.171:9080/htpdf/services/WebServicePDF`;
options.form = {
    ipid : "000024400500_29",
    functionId : "HospitalRecord",
    xmlStr: ""
};


let getPdf = function( options ){

    return zco.timeLimit( 10*1000, zco(function*( next ){

        let retObj = {
            success: true,
            fileName: [],
            errFileName: [],
            msg: "",
            err: ""
        };

        let [err,client] = yield soap.createClient( `${options.url}?wsdl`, next );
        if( err ){
            retObj = {
                success: false,
                fileName: [],
                errFileName: [],
                msg:"createClient Error!",
                err: err
            };
            return retObj;
        }

        let [errGetPdf, xmlRet] = yield client.getPdf(options.form, next);
        if( errGetPdf ){
            retObj = {
                success: false,
                fileName: [],
                errFileName: [],
                msg:"getPdf Error!",
                err: errGetPdf
            };
            return retObj;
        }

        let xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
                        <soapenv:Body>
                            <getPdfResponse xmlns="http://pdf.haitaiinc.com">
                                <getPdfReturn>${xmlRet.getPdfReturn}</getPdfReturn>
                            </getPdfResponse>
                        </soapenv:Body>
                    </soapenv:Envelope>`;

        let $ = cheerio.load( xml );

        let txt = "";
        txt = $("PdfFlow").text();
        let [errFs,fsData] = yield fs.writeFile(`${options.path}.pdf`, new Buffer(txt,"base64"), next);
        if( errFs || fsData ){
            retObj = {
                success: false,
                fileName: [],
                errFileName: [`${options.path}.pdf`],
                msg:"writeFile Error!",
                err: errFs
            };
            let date = new Date().toLocaleString();
            console.log( `${options.path}.pdf 失败, ${date}`);
            return retObj;
        }
        let date = new Date().toLocaleString();
        retObj.fileName = [`${options.path}.pdf`];
        console.log( `${options.path}.pdf 成功, ${date}`);
        return retObj;

    } ));

}



exports.getPdf = getPdf;