/**
 * Created by Administrator on 2017/6/13 0013.
 */
let zco = require("zco");
let options = {};
options.url = `http://192.168.15.171:9080/htpdf/services/WebServicePDF`;
options.form = {
    ipid : "000024415700_1",
    functionId : "HospitalRecord",
    xmlStr: ""
};
const soap = require("soap");

let getPdf = function( options ){

    return zco.timeLimit( 60*1000, zco(function*( next ){

        let retObj = {
            success: true,
            fileName: [],
            errFileName: [],
            msg: "",
            err: ""
        };

        console.log( options )

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
        console.log( "开始请求")
        let [errGetPdf, xmlRet] = yield client.getPdf( options.form, next);
        console.log( errGetPdf )
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
        console.log( xmlRet )
        let xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
                        <soapenv:Body>
                            <getPdfResponse xmlns="http://pdf.haitaiinc.com">
                                <getPdfReturn>${xmlRet.getPdfReturn}</getPdfReturn>
                            </getPdfResponse>
                        </soapenv:Body>
                    </soapenv:Envelope>`;

        let $ = cheerio.load( xml );
        let PdfFlows = $("PdfFlows").children();
        let txt = "";
        if( PdfFlows.length == 0 ){

            txt = $("PdfFlow").text();
            let [errFs,fsData] = yield fs.writeFile(`${options.ipid}.pdf`, new Buffer(txt,"base64"), next);
            if( errFs || fsData ){
                retObj = {
                    success: false,
                    fileName: [],
                    errFileName: [`${options.ipid}.pdf`],
                    msg:"writeFile Error!",
                    err: errFs
                };
                console.log( `${options.ipid}.pdf 失败！`);
                return retObj;
            }
            retObj.fileName = [`${options.ipid}.pdf`];
            console.log( `${options.ipid}.pdf 成功！`);

        }else{

            let fileName = [];
            let errFileName = [];

            for( let i = 0, len = PdfFlows.length; i < len; i ++ ){

                let txt = PdfFlows[i].children[0].data ;
                let [errFs,fsData] = yield fs.writeFile(`${options.path}_${i}.pdf`, new Buffer(txt,"base64"), next);
                if( errFs || fsData ){
                    errFileName.push( `${options.ipid}_${i}.pdf` );
                    console.log( `${options.ipid}_${i}.pdf 失败！`);
                }else{
                    fileName.push( `${options.ipid}_${i}.pdf` );
                    console.log( `${options.ipid}_${i}.pdf 成功！`);
                }

            }
            retObj.fileName = fileName;
            retObj.errFileName = errFileName;
        }
        return retObj;

    } ));

}

getPdf( options )((err,data)=>{
    if( err ){
        console.log( err )
    }
    console.log( data);
})