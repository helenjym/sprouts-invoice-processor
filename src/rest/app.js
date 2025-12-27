const express = require('express') ;
var cors = require('cors');
const multer = require('multer');
const app = express();
const port = 3000;
const { InvoicePayment, InvoicePaymentRequisition } = require( '../controller/InvoiceProcessor.ts');
const fs = require('fs'); 
// Changing filename to be the same for every uplffoad--any existing file gets replaced
const storage=multer.diskStorage({
    destination:(req,file,cb)=>cb(null,'../uploads'),
    filename:(req,file,cb)=>cb(null,'Invoice.pdf')
});
// validate file

const upload = multer({storage});

app.use(cors());
app.use(express.json());
app.get('/invoice', (req, res) => {
    res.send("Hello");
});

app.post('/upload', upload.single('invoice'), async (req, res) => {
    console.log(req.body, req.file)
    const invoiceNum = Number(req.body.invoiceNum);
    const gst = Number(req.body.gst);
    const total = Number(req.body.total);
    const accCode = Number(req.body.accCode);
    try {
        const invoicePayment = InvoicePayment.createGeneralInvoice(req.body.supplierName, invoiceNum, req.body.date, gst, total, req.body.email, accCode, req.body.purpose, req.body.treasurerName);
        const IPR = await InvoicePaymentRequisition.create(invoicePayment)
        const bytes = await IPR.attachInvoice();
        fs.writeFileSync("IPR_Merged.pdf", bytes, 'utf-8');
        const jsonData = JSON.stringify(invoicePayment);
        fs.writeFileSync("InvoicePayment.json", jsonData, 'utf-8');
        res.status(200).send("Upload successful");
    } catch(e) {
        console.log(e);
        res.status(500).send("Error occurred while uploading");
    }
});

app.get('/download/:iv', (req, res) => {
    try {
        const invoiceFile = fs.readFileSync("./InvoicePayment.json", "utf-8");
        const invoicePayment = JSON.parse(invoiceFile);
        if (invoicePayment.invoiceNum.toString() !== (req.params.iv)) {
            res.status(404).send("Requested invoice not found");
        } else {
            const mergedFile = fs.readFileSync("./IPR_Merged.pdf", "base64");
            const merged = Uint8Array.fromBase64(mergedFile);
            res.writeHead(200, {'Content-Length': Buffer.byteLength(merged),'Content-Type': 'application/pdf',});
            res.write(merged, 'utf8', () => {console.log("Sent");});
            res.end();
        }
    } catch(e) {
        console.log(e);
        res.status(500).send("Error occurred while downloading");
    }
});
    // console.log(req.body, req.file)
    // const invoiceNum = Number(req.body.invoiceNum);
    // const gst = Number(req.body.gst);
    // const total = Number(req.body.total);
    // const accCode = Number(req.body.accCode);
    // const invoicePayment = InvoicePayment.createGeneralInvoice(req.body.supplierName, invoiceNum, req.body.date, gst, total, req.body.email, accCode, req.body.purpose, req.body.treasurerName);
    // const data = InvoicePaymentRequisition.create(invoicePayment).then((IPR) => {
    // IPR.attachInvoice().then((bytes) => {
    //     return bytes;})
    // });
    // res.writeHead(200, {
    // 'Content-Length': Buffer.byteLength(data),
    // 'Content-Type': 'application/pdf',
    // });
    // res.write(data, 'utf8', () => {
    //     console.log("Lol");
    // });
    // res.end();

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});


