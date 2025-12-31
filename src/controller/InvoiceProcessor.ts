const {PDFParse} = require('pdf-parse');
const {PDFDocument} = require('pdf-lib');
const fs = require('fs');
// import scribe from 'scribe.js-ocr';
// import {parse} from 'node-html-parser';
// import {XMLParser} from 'fast-xml-parser';
// import { DOMParser } from '@xmldom/xmldom'
// const path = require('node:path');


class InvoicePayment {
    supplier: string;
    invoiceNum: number;
    date: string;
    subtotal: number;
    gst: number;
    total: number;
    accountCode: number;
    email: string;
    purpose: string;
    treasurerName: string;

    private setSupplier(name: string) {
        this.supplier = name;
    }
    private setInvoiceNum(invoiceNum: number) {
        this.invoiceNum = invoiceNum;
    }
    private setDate(date: string) {
        this.date = date;
    }
    private setSubtotal(subtotal: number) {
        this.subtotal = subtotal;
    }
    private setGst(gst: number) {
        this.gst = gst;
    }
    private setTotal(total: number) {
        this.total = total;
    }
    private setAccountCode(accountCode: number) {
        this.accountCode = accountCode;
    }

    private setEmail(email: string) {
        this.email = email;
    }

    private setPaymentPurpose(purpose: string) {
        this.purpose = purpose;
    }

    private setName(name: string) {
        this.treasurerName = name;
    }

    private constructor() {
    }

    static createGeneralInvoice(supplierName: string, invoiceNum: number, date: string, gst: number, total: number, email: string, accCode: number, purpose: string, treasurerName: string): InvoicePayment {
        const invoice = new InvoicePayment();
        invoice.setAccountCode(accCode);
        invoice.setSupplier(supplierName);
        invoice.setInvoiceNum(invoiceNum);
        invoice.setDate(date);
        invoice.setSubtotal(total-gst);
        invoice.setGst(gst);
        invoice.setTotal(total);
        invoice.setPaymentPurpose(purpose);
        invoice.setEmail(email);
        invoice.setName(treasurerName);
        console.log(invoice);
        return invoice;
    }

    static async createHorizonInvoice(accCode: number, purpose: string, treasurerName: string): Promise<InvoicePayment> { 
        const invoice = new InvoicePayment();
        // error handling
        const invoiceFile = await fs.readFileSync("../uploads/Invoice.pdf");
        const parser = new PDFParse({data: invoiceFile});

        const result = await parser.getText();
        const resultText = result.text;
        const date = resultText.slice(225, 233);
        const invoiceNum = +(resultText.slice(12, 19));
        const subtotalIndex = resultText.indexOf("Subtotal");
        const textFromSubtotal = resultText.slice(subtotalIndex + 20);
        const endOfSubtotal = textFromSubtotal.indexOf("\n") + subtotalIndex + 20;
        let tempTotal = resultText.slice(subtotalIndex+20, endOfSubtotal);
        const totalComma = tempTotal.indexOf(",");
        if (totalComma !== -1) {
            tempTotal = resultText.slice(subtotalIndex+20, subtotalIndex+20+totalComma) + resultText.slice(subtotalIndex+20+totalComma+1, endOfSubtotal);
        }
        const total = parseFloat(tempTotal);

        // text is kind of arbitrarily found
        const containerGstIndex = resultText.indexOf("Container GST");
        const textFromContainerGST = resultText.slice(containerGstIndex + 15);
        const endOfContainerGSTIndex = textFromContainerGST.indexOf("\n") + containerGstIndex + 15;
        const containerGST = parseFloat(resultText.slice(containerGstIndex + 15, endOfContainerGSTIndex));

        const textFromProductGST = resultText.slice(endOfContainerGSTIndex + 1);
        const endOfProductGSTIndex = textFromProductGST.indexOf("\n") + endOfContainerGSTIndex + 1;
        const productGST = parseFloat(resultText.slice(endOfContainerGSTIndex + 1, endOfProductGSTIndex));

        const totalGST = containerGST + productGST;
        const subtotal = parseFloat((total - totalGST).toFixed(2));

        invoice.setAccountCode(accCode);
        invoice.setSupplier("Horizon Distributors");
        invoice.setInvoiceNum(invoiceNum);
        invoice.setDate(date);
        invoice.setSubtotal(subtotal);
        invoice.setGst(totalGST);
        invoice.setTotal(total);
        invoice.setPaymentPurpose(purpose);
        invoice.setEmail("horizonar@horizondistributors.com");
        invoice.setName(treasurerName);
        
        return invoice;
    }

} 
    
// export default class InvoiceProcessor {


//     // Invoice Processor
//     // turns invoices or invoice details into a Invoice Payment object
//     // creates an IPR object rom Invoice Payment object
//     // IPR object merges ith invoice ile

//     // Invoice 

//     private dimension: string = "7064-00";

//     static async processInvoiceDetails(supplierName: string, invoiceNum: number, date: string, subtotal: number, gst: number, total: number, email: string, accCode: number, purpose: string, treasurerName: string, file: string) {
//         let invoice;
//         if (supplierName === "Horizon Distributors") {
//             invoice = await InvoiceProcessor.createHorizonInvoice(accCode, purpose, treasurerName);
//         } else {
//             invoice = InvoiceProcessor.createGeneralInvoice(supplierName, invoiceNum, date, subtotal, gst, total, email, accCode, purpose, treasurerName);
//         }
//         const IPR: PDFDocument = await FormProcessor.createIPR(invoice);
//         FormProcessor.merge(IPR, file);
//     }

//     static async processInvoiceFile(accCode: number, supplierName: string, purpose: string, treasurerName: string, file: string) {
//         let invoice;
//         if (supplierName === "Horizon Distributors") {
//             invoice = await InvoiceProcessor.createHorizonInvoice(accCode, purpose, treasurerName);
//         } 
//         const IPR: PDFDocument = await FormProcessor.createIPR(invoice);
//         FormProcessor.merge(IPR, file);
//     }




//     static async createGeneralInvoice(supplierName: string, invoiceNum: number, date: string, subtotal: number, gst: number, total: number, email: string, accCode: number, purpose: string, treasurerName: string) {
//         const invoice = new InvoicePayment();
//         invoice.setAccountCode(accCode);
//         invoice.setSupplier(supplierName);
//         invoice.setInvoiceNum(invoiceNum);
//         invoice.setDate(date);
//         invoice.setSubtotal(subtotal);
//         invoice.setGst(gst);
//         invoice.setTotal(total);
//         invoice.setPaymentPurpose(purpose);
//         invoice.setEmail(email);
//         invoice.setName(treasurerName);
//         return invoice;
//     }

//     static async createHorizonInvoice(accCode: number, purpose: string, treasurerName: string): Promise<InvoicePayment> { 
//         const invoice = new InvoicePayment();
//         // error handling
//         const invoiceFile = await fs.readFileSync('../../7917484_Horion.pdf');
//         const parser = new PDFParse({data: invoiceFile});

//         const result = await parser.getText();
//         const resultText = result.text;
//         const date = resultText.slice(225, 233);
//         const invoiceNum = +(resultText.slice(12, 19));
//         const subtotalIndex = resultText.indexOf("Subtotal");
//         const textFromSubtotal = resultText.slice(subtotalIndex + 20);
//         const endOfSubtotal = textFromSubtotal.indexOf("\n") + subtotalIndex + 20;
//         let tempTotal = resultText.slice(subtotalIndex+20, endOfSubtotal);
//         const totalComma = tempTotal.indexOf(",");
//         if (totalComma !== -1) {
//             tempTotal = resultText.slice(subtotalIndex+20, subtotalIndex+20+totalComma) + resultText.slice(subtotalIndex+20+totalComma+1, endOfSubtotal);
//         }
//         const total = parseFloat(tempTotal);

//         // text is kind of arbitrarily found
//         const containerGstIndex = resultText.indexOf("Container GST");
//         const textFromContainerGST = resultText.slice(containerGstIndex + 15);
//         const endOfContainerGSTIndex = textFromContainerGST.indexOf("\n") + containerGstIndex + 15;
//         const containerGST = parseFloat(resultText.slice(containerGstIndex + 15, endOfContainerGSTIndex));

//         const textFromProductGST = resultText.slice(endOfContainerGSTIndex + 1);
//         const endOfProductGSTIndex = textFromProductGST.indexOf("\n") + endOfContainerGSTIndex + 1;
//         const productGST = parseFloat(resultText.slice(endOfContainerGSTIndex + 1, endOfProductGSTIndex));

//         const totalGST = containerGST + productGST;
//         const subtotal = parseFloat((total - totalGST).toFixed(2));

//         invoice.setAccountCode(accCode);
//         invoice.setSupplier("Horizon Distributors");
//         invoice.setInvoiceNum(invoiceNum);
//         invoice.setDate(date);
//         invoice.setSubtotal(subtotal);
//         invoice.setGst(totalGST);
//         invoice.setTotal(total);
//         invoice.setPaymentPurpose(purpose);
//         invoice.setEmail("horizonar@horizondistributors.com");
//         invoice.setName(treasurerName);
//         return invoice;
//     }

//     // static async createIPR(invoice: InvoicePayment) {
//     //     const pdfBytes = await fs.readFileSync("../../Invoice-Requisition-Form_Nov-2024_Fillable.pdf");
//     //     const pdfDoc = await PDFDocument.load(pdfBytes);
//     //     const form = pdfDoc.getForm();
//     //     const formFields = form.getFields();
//     //     formFields.forEach(field => {
//     //         console.log(field.getName());
//     //     })
//     //     // text 9 is department name
//     //     // text 13 is EFT email payment notification

//     //     const clubName = form.getTextField("Text9");
//     //     const EFTNotifEmail = form.getTextField("Text13");
//     //     const invoiceDate = form.getTextField("Invoice Date");
//     //     const payableTo = form.getTextField("Payable to");
//     //     const accCode = form.getTextField("Account Code 5 digitsRow1");
//     //     const dimension = form.getTextField("Dimension 6 digitsRow1");
//     //     const amount = form.getTextField("AmountRow1");
//     //     const gstAmount = form.getTextField("GST Amount If Applicable000000");
//     //     const subtotal = form.getTextField("AmountSubtotal");
//     //     const total = form.getTextField("GST Amount If ApplicableTOTAL");
//     //     const invNum = form.getTextField("Invoice Number");
//     //     const paymentPurpose = form.getTextField("Purpose of payment");
//     //     const initContactInfo = form.getTextField("Initiators Contact Information");
//     //     const initName = form.getTextField("Initiated by");
//     //     const eftCheck = form.getCheckBox("Check Box10");
//     //     clubName.setText("UBC Sprouts");
//     //     EFTNotifEmail.setText(invoice.email);
//     //     accCode.setText(invoice.accountCode.toString());
//     //     invoiceDate.setText(invoice.date);
//     //     dimension.setText("7064-00");
//     //     gstAmount.setText(invoice.gst.toString());
//     //     subtotal.setText(invoice.subtotal.toString());
//     //     total.setText(invoice.total.toString());
//     //     invNum.setText(invoice.invoiceNum.toString());
//     //     payableTo.setText(invoice.supplier);
//     //     // need to change!
//     //     paymentPurpose.setText(invoice.purpose);
//     //     initContactInfo.setText("treasurer@ubcsprouts.ca");
//     //     // also should be given by user
//     //     initName.setText(invoice.treasurerName);
//     //     amount.setText(invoice.subtotal.toString());
//     //     eftCheck.check();


//     //     // console.log(pdfDoc.getForm().getTextField('Text1'));
//     //     //  parse a)nd put in invoice payment details
//     //     //  persist inished ile to disk named invoicenum_suppliername.pdf
//     //     //  mergepdfs()
//     //     // const pdfSavedBytes = await pdfDoc.save();
//     //     // fs.writeFile('Processed IPR.pdf', pdfSavedBytes, 'utf8', (err) => {
//     //     //     if (err) {
//     //     //       console.error('Error writing file:', err);
//     //     //       return;
//     //     //     }
//     //     //     console.log('IPR file written successfully!');
//     //     //   });
//     // }

    
// //     static async createInvoiceOCR() {
// //         const filename = '../../32338729_Discovery.pdf';
// //         try {
// //             const res = await scribe.extractText([filename], ['eng'], 'txt', {mode: "quality"});
// //             console.log(res);
// //         // const options = {
// //         //     ignoreAttributes: false,
// //         //     format: true,
// //         //     preserveOrder: true,
// //         //     allowBooleanAttributes: true
    
// //         // };
// //         } catch(err){


        
// //         // const parser = new XMLParser(options);
// //         // const json = parser.parse(res);
// //         // console.log(json[1].html[1].body)
// //         // let lines: {text: string, x0: number, y0: number, x1: number, y1: number}[] = [];
// //         // const doc = new DOMParser().parseFromString(res, 'text/xml');
// //         // const docLines = doc.getElementsByClassName("ocr_line");
// //         // let line: any;
// //         // let textChild: any;
// //         // console.log(docLines[0].childNodes[8]);
// //         // let text: string;
// //         // for (let i = 0; i <= (docLines.length - 1); i++) {
// //         //     console.log("n")
// //         //     const docLine = docLines[i];
// //         //     if (docLine.hasChildNodes()) {
// //         //         const numChildren = docLine.childNodes.length;
// //         //         for (let n = 0; n <= (numChildren - 1); n++) {
// //         //             if (docLine.childNodes[n].hasChildNodes()) {
// //         //                 console.log(docLine.childNodes[n].childNodes[0].nodeValue)
// //         //             }    
// //         //         }
// //         //     }
// //         // }
// //         // console.log(doc.getElementsByTagName("span"));
// //         // const text = parse(json.html.body.div[0])
// //         // return essentially an xml
// //         // console.log(json.html.body.div[0].span[0]);
// //         await scribe.terminate();
// //         // const root = parse(res);
// //         // console.log(root);

// //     }
// //     await scribe.terminate();
// // }


// }


class InvoicePaymentRequisition {
    private File: Uint8Array;
    private supplier: string;
    private invoiceNum: string;

    private constructor(File: Uint8Array) {
        this.File = File;
    }

    private setSupplier(supplier: string) {
        this.supplier = supplier;
    }

    private setInvoiceNum(invoiceNum: string) {
        this.invoiceNum = invoiceNum;
    }

    static async create(invoice: InvoicePayment): Promise<InvoicePaymentRequisition> {
        try {
            const pdfBytes = await fs.readFileSync("../Invoice-Requisition-Form_Nov-2024_Fillable.pdf");
            const IPRFile = await PDFDocument.load(pdfBytes);
            IPRFile.removePage(1);
            const form = IPRFile.getForm();
                    // text 9 is department name
                    // text 13 is EFT email payment notification
            const clubName = form.getTextField("Text9");
            const EFTNotifEmail = form.getTextField("Text13");
            const invoiceDate = form.getTextField("Invoice Date");
            const payableTo = form.getTextField("Payable to");
            const accCode = form.getTextField("Account Code 5 digitsRow1");
            const dimension = form.getTextField("Dimension 6 digitsRow1");
            const amount = form.getTextField("AmountRow1");
            const gstAmount = form.getTextField("GST Amount If Applicable000000");
            const subtotal = form.getTextField("AmountSubtotal");
            const total = form.getTextField("GST Amount If ApplicableTOTAL");
            const invNum = form.getTextField("Invoice Number");
            const paymentPurpose = form.getTextField("Purpose of payment");
            const initContactInfo = form.getTextField("Initiators Contact Information");
            const initName = form.getTextField("Initiated by");
            const eftCheck = form.getCheckBox("Check Box10");
            clubName.setText("UBC Sprouts");
            EFTNotifEmail.setText(invoice.email);
            if (invoice.accountCode !== null) {
            accCode.setText(invoice.accountCode.toString());
            }
            invoiceDate.setText(invoice.date);
            dimension.setText("7064-00");
            // if (invoice.subtotal) {
            // subtotal.setText(invoice.subtotal.toString());
            // }
            if (invoice.total !== null) {
            total.setText(invoice.total.toString());
            }
            if (invoice.gst !== null) {
            gstAmount.setText(invoice.gst.toString());
            }
            if (invoice.invoiceNum !== null) {
            invNum.setText(invoice.invoiceNum.toString());
            }
            payableTo.setText(invoice.supplier);
            paymentPurpose.setText(invoice.purpose);
            initContactInfo.setText("treasurer@ubcsprouts.ca");
            initName.setText(invoice.treasurerName);
            if (invoice.subtotal) {
                subtotal.setText(invoice.subtotal.toString());
                amount.setText(invoice.subtotal.toString());
            }
            eftCheck.check();
            const IPRBytes = await IPRFile.save();
            const IPR = new InvoicePaymentRequisition(IPRBytes);
            if (invoice.invoiceNum !== null) {
                IPR.setInvoiceNum(invoice.invoiceNum.toString());
            }
            IPR.setSupplier(invoice.supplier);
            return IPR;
        } catch(e) {
            console.log(e);
            throw e;
        }
    }

    async attachInvoice(): Promise<Uint8Array> {
        const pdfBytes = await fs.readFileSync("../uploads/Invoice.pdf");
        const IPRFile = await PDFDocument.load(this.File);
        const invoiceDoc = await PDFDocument.load(pdfBytes);
        const numInvoicePages = invoiceDoc.getPageCount();
        for (let i = 0; i < numInvoicePages; i++) {
            const [page] = await IPRFile.copyPages(invoiceDoc, [i]);
            IPRFile.addPage(page);
        }
        const attachInvoiceFileBytes = await IPRFile.save();
        return attachInvoiceFileBytes;
    }
}

// InvoicePayment.createHorizonInvoice(60015, "purchases", "Helen", "bob").then((data) => console.log(data));

module.exports.InvoicePayment = InvoicePayment;
module.exports.InvoicePaymentRequisition = InvoicePaymentRequisition;

