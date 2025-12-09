
import fs from 'fs';
import {PDFParse} from 'pdf-parse';
import {PDFDocument, PDFTextField} from 'pdf-lib';

class InvoicePayment {
    supplier: string;
    invoiceNum: number;
    date: string;
    subtotal: number;
    gst: number;
    total: number;
    accountCode: number;
    description: string;
    email: string;

    setSupplier(name: string) {
        this.supplier = name;
    }
    setInvoiceNum(invoiceNum: number) {
        this.invoiceNum = invoiceNum;
    }
    setDate(date: string) {
        this.date = date;
    }
    setSubtotal(subtotal: number) {
        this.subtotal = subtotal;
    }
    setGst(gst: number) {
        this.gst = gst;
    }
    setTotal(total: number) {
        this.total = total;
    }
    setAccountCode(accountCode: number) {
        this.accountCode = accountCode;
    }

    setDescription(description: string) {
        this.description = description;
    }

    setEmail(email: string) {
        this.email = email;
    }
}
    
export default class InvoiceGenerator {

    private dimension: string = "7064-00";

    static async generateInvoiceDetails(accCode: number, supplier: string, description: string) {
        if (supplier === "Horizon Distributors") {
            const invoice: InvoicePayment = await InvoiceGenerator.createHorizonInvoice(accCode, description);
            console.log(invoice);
        }
    }

    static async createHorizonInvoice(accCode: number, description: string): Promise<InvoicePayment> { 
        const invoice = new InvoicePayment();
        // error handling
        const invoiceFile = await fs.readFileSync('../../Invoice_7919828 (1).pdf');
        const parser = new PDFParse({data: invoiceFile});

        const result = await parser.getText();
        const resultText = result.text;
        // console.log(resultText);
        const date = resultText.slice(225, 233);
        // console.log(date);
        const invoiceNum = +(resultText.slice(12, 19));
        // console.log(invoiceNum);

        const subtotalIndex = resultText.indexOf("Subtotal");
        const textFromSubtotal = resultText.slice(subtotalIndex + 20);
        const endOfSubtotal = textFromSubtotal.indexOf("\n") + subtotalIndex + 20;
        let tempTotal = resultText.slice(subtotalIndex+20, endOfSubtotal);
        const totalComma = tempTotal.indexOf(",");
        if (totalComma !== -1) {
            tempTotal = resultText.slice(subtotalIndex+20, subtotalIndex+20+totalComma) + resultText.slice(subtotalIndex+20+totalComma+1, endOfSubtotal);
        }
        const total = parseFloat(tempTotal);

        // text is kind o arbitrarily ound
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
        invoice.setDescription(description);
        invoice.setEmail("horizonar@horizondistributors.com");
        await this.createIPR(invoice);
        return invoice;
    }

    static async createIPR(invoice: InvoicePayment) {
        const pdfBytes = await fs.readFileSync("../../Invoice-Requisition-Form_Nov-2024_Fillable.pdf");
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        const formFields = form.getFields();
        formFields.forEach(field => {
            console.log(field.getName());
        })
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
        accCode.setText(invoice.accountCode.toString());
        invoiceDate.setText(invoice.date);
        dimension.setText("7064-00");
        gstAmount.setText(invoice.gst.toString());
        subtotal.setText(invoice.subtotal.toString());
        total.setText(invoice.total.toString());
        invNum.setText(invoice.invoiceNum.toString());
        payableTo.setText(invoice.supplier);
        // need to change!
        paymentPurpose.setText("Cafe purchases");
        initContactInfo.setText("treasurer@ubcsprouts.ca");
        // also should be given by user
        initName.setText("Helen Ma");
        amount.setText(invoice.subtotal.toString());
        eftCheck.check();


        // console.log(pdfDoc.getForm().getTextField('Text1'));
        //  parse a)nd put in invoice payment details
        //  persist inished ile to disk named invoicenum_suppliername.pdf
        //  mergepdfs()
        const pdfSavedBytes = await pdfDoc.save();
        fs.writeFile('Processed IPR.pdf', pdfSavedBytes, 'utf8', (err) => {
            if (err) {
              console.error('Error writing file:', err);
              return;
            }
            console.log('IPR file written successfully!');
          });
    }

    // mergePDfs() {
    // getpdf from 
    //  }
    // 


}

InvoiceGenerator.createHorizonInvoice(60015, "Cafe purchases").then((data) => InvoiceGenerator.createIPR(data).then(() => console.log("hi")));
