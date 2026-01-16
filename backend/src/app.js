import express from 'express';
import Router from 'express';
import cors from 'cors';
import multer from 'multer';
const app = express();
const port = 8080;
import { InvoicePayment, InvoicePaymentRequisition } from '../controller/InvoiceProcessor.ts';
import fs from 'fs'; 
import pkg from 'express-validator';
const {body, validationResult, check} = pkg;

const router = Router();
app.use(cors());
app.use(express.json());


const createEmailChain = () => body('email').isEmail();
const storage=multer.diskStorage({
    destination:(req,file,cb)=>cb(null,'uploads'),
    fileFilter: (req, file, cb) => {
        if (file.fieldname !== "invoice" && file.fieldname !== "voidCheque") {
            cb(null,false);
        } else {
            cb(null, true);
        }
    },
    filename:(req,file,cb)=> {
        if (file.fieldname === "invoice") {
            cb(null,'Invoice.pdf')
        }
        if (file.fieldname === "voidCheque") {
            cb(null, 'VoidCheque.pdf')
        }
    }
});

// code adapted from https://medium.com/@sridhar_be/file-validations-using-magic-numbers-in-nodejs-express-server-d8fbb31a97e7
function validateUploadedFile(file) {
    if (file.size > 5*1024*1024) {
        return false;
    }    
    try {
        const fd = fs.openSync('uploads/Invoice.pdf');
        try {
            const buffer = Buffer.alloc(5);
            fs.readSync(fd, buffer, 0, 5, 0);
            const hexSignature = buffer.toString('hex').toUpperCase();
            const signature = '255044462D';
            fs.closeSync(fd)
            const isValid = (signature === hexSignature)
            return isValid; 
        } catch(err) {
            console.err(err);
            fs.closeSync(fd);
            return false;
        }
    } catch(e) {
        console.err(e);
        return false;
    }
}


const upload = multer({storage});

app.get('/invoice', (req, res) => {
    res.send("Hello");
});

app.post('/upload', upload.fields([
    {name: 'invoice', maxCount: 1},
    {name: 'voidCheque', maxCount: 1}
]), [
    check("supplierName").trim().notEmpty().matches(/^[A-Za-z0-9',&-\s]+$/)
    .isLength({max: 500}),
    createEmailChain(),
    check("date").isDate(),
    check("invoiceNum").trim().notEmpty().matches(/^[A-Za-z0-9-\s]+$/).isLength({max: 500}),
    check("purpose").trim().notEmpty().matches(/^[A-Za-z0-9',-./!\s]+$/).isLength({max: 500}),
    check("accCode").trim().notEmpty().matches(/^[0-9]+$/).isLength(5),
    check("gst").trim().notEmpty().matches(/^[0-9.]+$/).isLength({max: 500}),
    check("total").trim().notEmpty().matches(/^[0-9.]+$/).isLength({max: 500}),
    check("treasurerName").trim().notEmpty().matches(/^[A-Za-z\s]+$/)
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.err(errors.array);
        return res.status(400).json({errors: errors.array()});
    }
    if (req.files["invoice"] === undefined) {
        return res.status(400).send("No invoice uploaded");
    }
    if (!validateUploadedFile(req.files["invoice"][0])) {
        return res.status(400).send("Error in invoice file format");
    }
    const voidChequeAttached = (req.files["voidCheque"] !== undefined);
    if (voidChequeAttached) {
        const validVoidCheque = validateUploadedFile(req.files["voidCheque"][0]);
        if (!validVoidCheque) {
            return res.status(400).send("Error in void cheque file format");
        }
    }
    try {
        const gst = Number(req.body.gst);
        const total = Number(req.body.total);
        const accCode = Number(req.body.accCode);    
        const invoicePayment = InvoicePayment.createInvoicePayment(req.body.supplierName, req.body.invoiceNum, req.body.date, gst, total, req.body.email, accCode, req.body.purpose, req.body.treasurerName);
        const IPR = await InvoicePaymentRequisition.create(invoicePayment);
        // sending a file path is relative to the intiial call? oh wait that makes sense
        let bytes = await IPR.attachSupportingDoc("uploads/Invoice.pdf");
        if (voidChequeAttached) {
            bytes = await IPR.attachSupportingDoc("uploads/VoidCheque.pdf");
        }
        fs.writeFileSync("src/IPR_Merged.pdf"
            , bytes, 'utf-8');
        const jsonData = JSON.stringify(invoicePayment);
        fs.writeFileSync("src/InvoicePayment.json", jsonData, 'utf-8');
        res.status(200).send("Upload succesful");
    } catch(e) {
        console.err(e);
        res.status(500).send("Error occurred while uploading");
    }
});

app.post('/upload/:supplier', upload.single('invoice'), [check("purpose").trim().notEmpty().matches(/^[A-Za-z0-9',-./!\s]+[A-Za-z0-9',-./!\s]$/).isLength({max: 500}),
    check("accCode").trim().notEmpty().matches(/^[0-9]+$/).isLength(5),
    check("treasurerName").trim().notEmpty().matches(/^[A-Za-z\s]+$/)
], async (req, res) => {
    const accCode = Number(req.body.accCode);
    try {
        const invoicePayment = await InvoicePayment.createFromParseableInvoice(req.params.supplier, accCode, req.body.purpose, req.body.treasurerName);
        if (isNaN(invoicePayment.invoiceNum)) {
            res.status(500).send("Error occurred while uploading");
        } else {
            const IPR = await InvoicePaymentRequisition.create(invoicePayment);
            const bytes = await IPR.attachSupportingDoc("uploads/Invoice.pdf");
            fs.writeFileSync("src/IPR_Merged.pdf", bytes, 'utf-8');
            const jsonData = JSON.stringify(invoicePayment);
            fs.writeFileSync("src/InvoicePayment.json", jsonData, 'utf-8');
            res.status(200).send(invoicePayment.invoiceNum);
        }
    } catch(e) {
        console.err(e);
        res.status(500).send("Error occurred while uploading");
    }
});

app.get('/download/:iv', check("iv").trim().notEmpty().matches(/^[A-Za-z0-9-\s]+[A-Za-z0-9-]$/).isLength({max: 500})
, (req, res) => {
    try {
        const invoiceFile = fs.readFileSync("src/InvoicePayment.json", "utf-8");
        const invoicePayment = JSON.parse(invoiceFile);
        if (invoicePayment.invoiceNum.toString() !== (req.params.iv)) {
            res.status(404).send("Requested invoice not found");
        } else {
            const mergedFile = fs.readFileSync("src/IPR_Merged.pdf", "base64");
            const merged = Uint8Array.fromBase64(mergedFile);
            res.writeHead(200, {'Content-Length': Buffer.byteLength(merged),'Content-Type': 'application/pdf',});
            res.write(merged, 'utf8', () => {console.log("Sent");});
            res.end();
        }

    } catch(e) {
        console.err(e);
        res.status(500).send("Error occurred while downloading");
    }
});

app.get('/suppliers', (req, res) => {
    try {
        const suppliersFile = fs.readFileSync('data/suppliers.json', "utf-8");
        // returns a utf-8 character encoding of the json file
        const suppliers = JSON.parse(suppliersFile);
        res.json(suppliers);
    } catch(e) {
        console.err(e);
        res.status(500).send("Error occurred");
    }
})

app.listen(port, () => {
    console.log(`App listening on port: ${port}`);
});

export default app;

