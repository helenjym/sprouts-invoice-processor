
import fs from 'fs';
import {PDFParse} from 'pdf-parse';

type Supplier  = {
    name: string;
    email: string;
}

class InvoicePayment {
    supplier: string;
    invoiceNum: number;
    date: string;
    subtotal: number;
    gst: number;
    total: number;
    accountCode: number;
    description: string;

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
}
    
export default class InvoiceGenerator {

    private suppliers: Supplier[] = [
        {name: "Discovery Organics", email: "accounting@discoveryorganics.ca"},
        {name: "Horizon Distributors", email: "horizonar@horizondistributors.com"},
        {name: "Westpoint Naturals", email: "accounting@discoveryorganics.ca"},
        {name: "Ecolab", email: "accounting@discoveryorganics.ca"},
        {name: "Cafe Etico", email: "accounting@discoveryorganics.ca"}
    ];

    private dimension: string = "7064-00";

    // generateInvoiceDetails(accCode: number, supplier: string, description: string) {
    //     if (supplier === "Horizon Distributors") {
    //         const invoice: InvoicePayment =  this.createHorizonInvoice(accCode, description);
    //         console.log(invoice);
    //     }
    // }

    static async createHorizonInvoice(accCode: number, description: string): Promise<InvoicePayment> { 
        const invoice = new InvoicePayment();
        // error handling
        const invoiceFile = await fs.readFileSync('../../7915271_Horizon.pdf');
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
        console.log(total);

        // text is kind o arbitrarily ound
        const containerGstIndex = resultText.indexOf("Container GST");
        const textFromContainerGST = resultText.slice(containerGstIndex + 15);
        const endOfContainerGSTIndex = textFromContainerGST.indexOf("\n") + containerGstIndex + 15;
        const containerGST = parseFloat(resultText.slice(containerGstIndex + 15, endOfContainerGSTIndex));
        console.log(containerGST);

        const textFromProductGST = resultText.slice(endOfContainerGSTIndex + 1);
        const endOfProductGSTIndex = textFromProductGST.indexOf("\n") + endOfContainerGSTIndex + 1;
        const productGST = parseFloat(resultText.slice(endOfContainerGSTIndex + 1, endOfProductGSTIndex));
        console.log(productGST);

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
        return invoice;
    }

    createIPR(invoice: InvoicePayment) {
        //  get signed IPR
        //  parse and put in invoice payment details
        //  persist inished ile to disk named invoicenum_suppliername.pdf
        //  mergepdfs()
    }

    // mergePDfs() {
    // getpdf from 
    //  }
    // 


}

InvoiceGenerator.createHorizonInvoice(60015, "Cafe purchases").then((data) => console.log(data));