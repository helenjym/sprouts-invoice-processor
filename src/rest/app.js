const express = require('express') ;
var cors = require('cors');
const multer = require('multer');
const app = express();
const port = 3000;
const { InvoicePayment, InvoicePaymentRequisition } = require( '../controller/InvoiceProcessor.ts');

// Changing filename to be the same for every upload--any existing file gets replaced
const storage=multer.diskStorage({
    destination:(req,file,cb)=>cb(null,'../../uploads'),
    filename:(req,file,cb)=>cb(null,'Invoice.pdf')
})

const upload = multer({storage});

app.use(cors());
app.use(express.json());
app.get('/invoice', (req, res) => {
    res.send("Hello");
});

app.post('/upload', upload.single('invoice'), (req, res) => {
    console.log(req.body, req.file)
    const invoiceNum = Number(req.body.invoiceNum);
    const gst = Number(req.body.gst);
    const total = Number(req.body.total);
    const accCode = Number(req.body.accCode);
    const invoicePayment = InvoicePayment.createGeneralInvoice(req.body.supplierName, invoiceNum, req.body.date, gst, total, req.body.email, accCode, req.body.purpose, req.body.treasurerName);
    InvoicePaymentRequisition.create(invoicePayment).then((IPR) => {
        IPR.attachInvoice().then((bytes) => {
            res.writeHead(200, {
                'Content-Length': Buffer.byteLength(bytes),
                'Content-Type': 'application/pdf',
                });
                res.write(bytes, 'utf8', () => {
                    console.log("Sent");
                });
                res.end();})
        }
    );

});

app.get('/download', (req, res) => {
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
})

app.listen(port, () => {
    console.log('App listening on port ${port}');
});


