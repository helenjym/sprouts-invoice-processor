import './App.css';
import { useState } from 'react';

function App() {

  const [supplier, setSupplier] = useState(null);
  const [accCode, setAccCode] = useState(null);
  const [date, setDate] = useState(null);
  const [gst, setGST] = useState(null);
  const [total, setTotal] = useState(null);
  const [email, setEmail] = useState(null);
  const [name, setName] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [invoiceNum, setInvoiceNum] = useState(null);
  const [file, setFile] = useState(null);
  const [fileLink, setFileLink] = useState(null);

  // async function processInvoice(accCode, purpose, treasurerName, file) {
  //   const invoice = await InvoicePayment.createHorizonInvoice(accCode, purpose, treasurerName, file);
  //   const IPR = await InvoicePaymentRequisition.create(invoice);
  //   await IPR.attachInvoice(file);
  //   await IPR.download();
  // }
  function handleSupplierChange(e) {
    if (e.target.value === "Select a supplier") {
      setSupplier(null)
    } else {
      setSupplier(e.target.value);
    }
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handleInvoiceNumChange(e) {
    setInvoiceNum(e.target.value);
  }

  function handleInvoiceDate(e) {
    setDate(e.target.value);
  }

  function handleTotal(e) {
    setTotal(e.target.value);
  }

  function handleGSTAmount(e) {
    setGST(e.target.value);
  }

  function handleAccCode(e) {
    setAccCode(e.target.value);
  }

  function handlePurpose(e) {
    setPurpose(e.target.value);
  }

  function handleName(e) {
    setName(e.target.value);
  }

  function handleFile(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmit(e) {
    console.log(accCode);
    const form = new FormData();
    form.append("supplierName", supplier);
    form.append("invoiceNum", invoiceNum);
    form.append("date", date);
    form.append("gst", gst);
    form.append("total", total);
    form.append("email", email);
    form.append("accCode", accCode);
    form.append("purpose", purpose);
    form.append("treasurerName", name);
    form.append("invoice", file);
    // handle errors
    const response = await fetch('http://localhost:3000/upload', {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    // const getResponse = await fetch('http://localhost:3000/download');
    // if (!getResponse.ok) {
    //   throw new Error(`Response status: ${getResponse.status}`);
    // }
    const blob = await response.blob();
    // const data = blob.arrayBuffer().then((bytes) => {return bytes})
    const fileURL = URL.createObjectURL(blob);
    console.log(fileURL);
    setFileLink(fileURL);
  }

  function handleDownload(e) {
  }

  return (
    <div className="App">
      <div className='lhs'>
        <a href={fileLink}>Hello</a>
        <h1>Hello, my dear treasurer :3</h1>
        <p>Supplier</p>
        <SupplierDropdown handleChange={handleSupplierChange}/>
        {supplier === "Other" && 
            <>
            <p>Enter supplier name</p>
            <input type="text"></input>
            </>
        }
        <p>Supplier email</p>
        <input onChange={handleEmailChange}type='email'></input>
        <p>Invoice number</p>
        <input onChange={handleInvoiceNumChange} type='number'></input>
        <p>Invoice date</p>
        <input onChange={handleInvoiceDate} type="date"></input>
        <p>Total invoice amount</p>
        <input type='number' onChange={handleTotal}step='0.01'></input>
        <p>GST amount</p>
        <input type='number' onChange={handleGSTAmount} step='0.01'></input>
        <p>Sub-account code</p>
        <AccountDropdown handleChange={handleAccCode}/>
        <p>Payment purpose</p>
        <input onChange={handlePurpose} type='text'/>
        <p>Treasurer name</p>
        <input onChange={handleName} type="text"></input>
        <p>Upload invoice</p>
        <input onChange={handleFile} accept=".pdf" type="file"/>
        {supplier === "Other" && 
              <>
                <p>Upload void cheque</p>
                <FileUpload />
              </>
        }
        <button onClick={handleSubmit}>Generate</button>
      </div>
      <div className='rhs'>
        <InvoicePreviewer data={fileLink}/>
        <DownloadButton handleDownload={handleDownload} />
      </div>
    </div>
  );
}

function SupplierDropdown({handleChange}) {

  const suppliers = [
    {name: "Discovery"},
    {name: "Horizon"},
    {name: "Ecolab Co."},
    {name: "Cafe Etico"},
    {name: "Westpoint Naturals"},
    {name: "Other"}
  ];

  const suppliersOptions = suppliers.map(supplier => 
    <option>{supplier.name}</option>
  );

  return (
    <div>
      <select onChange={handleChange}>
        <option>Select a supplier</option>
        {suppliersOptions}
      </select>
    </div>
  );
}

function FileUpload() {
  return(
    <input type="file"/>
  );
}

function AccountDropdown({handleChange}) {

  const accounts = [
    {code: 60015, name: "Cafe purchases"},
    {code: 60075, name: "Produce market purchases"},
  ];

  const accountOptions = accounts.map(account => 
    <option value={account.code}>{account.code + " " + account.name}</option>
  );

  return (
    <div>
      <select onChange={handleChange}>
        <option value={null}>Select an account</option>
        {accountOptions}
      </select>
    </div>
  );
}

function DescriptionInput() {
  return (
    <div>
      <input type='text'/>
    </div>
  );
}

function SubmitButton(handleSubmit) {
  return (
    <button onClick={handleSubmit} className="submit">Generate payment requisition</button>
  )
}

function InvoicePreviewer({data}) {
  return (
    <iframe class="pdf" data={data} title="Completed invoice requistion form"></iframe>
  );
}

function DownloadButton(handleDownload) {
  // on click
  // veriy inputs
  // get input rom supplier dropdown and download invoice and IPR
  // list of emails and suppliers
  // dimension - 7064-00
  // if ("Horon") {
  // process hroion
  // extract ields and create javasript object
  // invoice object: Invoice number, date, subtotal, GST amount, total, supplier name, purpose of payment, account code}

  // take signed IPR template
  // insert fields from javascript invoice object
  // return pdf
  // merge with invoice document
  // download and name "invoicenumber_supplier"
  return (
  <button className="download">Download PDF</button>
  );
}

export default App;
