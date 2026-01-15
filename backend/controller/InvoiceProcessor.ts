import 'pdf-parse/worker';
import {PDFParse} from 'pdf-parse';
import {PDFDocument} from 'pdf-lib';
import fs from 'fs';

export class InvoicePayment {
    supplier: string;
    invoiceNum: string;
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
    private setInvoiceNum(invoiceNum: string) {
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

    static createInvoicePayment(supplierName: string, invoiceNum: string, date: string, gst: number, total: number, email: string, accCode: number, purpose: string, treasurerName: string): InvoicePayment {
        const invoice = new InvoicePayment();
        invoice.setAccountCode(accCode);
        invoice.setSupplier(supplierName);
        invoice.setInvoiceNum(invoiceNum);
        invoice.setDate(date);
        const subtotal = parseFloat((total - gst).toFixed(2));
        invoice.setSubtotal(subtotal);
        invoice.setGst(gst);
        invoice.setTotal(total);
        invoice.setPaymentPurpose(purpose);
        invoice.setEmail(email);
        invoice.setName(treasurerName);
        console.log(invoice);
        return invoice;
    }

    // as a static method, does not have access to instance properties
    static async createFromParseableInvoice(supplierName: string, accCode: number, purpose: string, treasurerName: string): Promise<InvoicePayment> { 
        try {
            const invoice = new InvoicePayment();
            const invoiceFile = await fs.readFileSync("uploads/Invoice.pdf");
            const parser = new PDFParse({data: invoiceFile});
            const result = await parser.getText();
            const resultText = result.text;

            if (supplierName === "Horizon") {
                invoice.populateDetailsFromHorizonInvoice(resultText);
                invoice.setAccountCode(accCode);
                invoice.setPaymentPurpose(purpose);
                invoice.setName(treasurerName);
            }
            return invoice;
        } catch(e){
            console.log("Invoice processor: " + e.message);
            throw e;
        }
    }    
    
    private populateDetailsFromHorizonInvoice(invoiceText: string) {
        const date = invoiceText.slice(225, 233);
        const invoiceNum = invoiceText.slice(12, 19);
        const subtotalIndex = invoiceText.indexOf("Subtotal");
        const textFromSubtotal = invoiceText.slice(subtotalIndex + 20);
        const endOfSubtotal = textFromSubtotal.indexOf("\n") + subtotalIndex + 20;
        let tempTotal = invoiceText.slice(subtotalIndex+20, endOfSubtotal);
        const totalComma = tempTotal.indexOf(",");
        if (totalComma !== -1) {
            tempTotal = invoiceText.slice(subtotalIndex+20, subtotalIndex+20+totalComma) + invoiceText.slice(subtotalIndex+20+totalComma+1, endOfSubtotal);
        }
        const total = parseFloat(tempTotal);
        const containerGstIndex = invoiceText.indexOf("Container GST");
        const textFromContainerGST = invoiceText.slice(containerGstIndex + 15);
        const endOfContainerGSTIndex = textFromContainerGST.indexOf("\n") + containerGstIndex + 15;
        const containerGST = parseFloat(invoiceText.slice(containerGstIndex + 15, endOfContainerGSTIndex));

        const textFromProductGST = invoiceText.slice(endOfContainerGSTIndex + 1);
        const endOfProductGSTIndex = textFromProductGST.indexOf("\n") + endOfContainerGSTIndex + 1;
        const productGST = parseFloat(invoiceText.slice(endOfContainerGSTIndex + 1, endOfProductGSTIndex));

        const totalGST = containerGST + productGST;
        if (isNaN(totalGST) || isNaN(total)) {
            throw new Error("Could not parse GST or total from Horizon invoice");
        }
        const subtotal = parseFloat((total - totalGST).toFixed(2));

        this.setSupplier("Horizon Distributors");
        this.setInvoiceNum(invoiceNum);
        this.setDate(date);
        this.setSubtotal(subtotal);
        this.setGst(totalGST);
        this.setTotal(total);
        this.setEmail("horizonar@horizondistributors.com");
    }


}
    


export class InvoicePaymentRequisition {
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
            const pdfBytes = await fs.readFileSync("Invoice-Requisition-Form_Nov-2024_Fillable.pdf");
            const IPRFile = await PDFDocument.load(pdfBytes);
            IPRFile.removePage(1);
            const form = IPRFile.getForm();
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
            if (invoice.total !== null) {
                total.setText(invoice.total.toString());
            }
            if (invoice.gst !== null) {
                gstAmount.setText(invoice.gst.toString());
            }
            if (invoice.invoiceNum !== null) {
                invNum.setText(invoice.invoiceNum);
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

    async attachSupportingDoc(filepath): Promise<Uint8Array> {
        try {
            const pdfBytes = await fs.readFileSync(filepath);
            const IPRFile = await PDFDocument.load(this.File);
            const pdf = await PDFDocument.load(pdfBytes);
            const numFilePages = pdf.getPageCount();
            for (let i = 0; i < numFilePages; i++) {
                const [page] = await IPRFile.copyPages(pdf, [i]);
                IPRFile.addPage(page);
            }
            const fileBytes = await IPRFile.save();
            this.File = fileBytes;
            return fileBytes;
        } catch(e) {
            console.log("Invoice processor: " + e.message);
            throw e;
        }

    }

}

