import './App.css';
import { useState } from 'react';

function App() {

  const [supplier, setSupplier] = useState(null);
  const [accCode, setAccCode] = useState(null);
  const [date, setDate] = useState(null);
  const [gst, setGST] = useState(0.00);
  const [total, setTotal] = useState(null);
  const [email, setEmail] = useState(null);
  const [name, setName] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [invoiceNum, setInvoiceNum] = useState(null);
  const [file, setFile] = useState(null);
  const [fileLink, setFileLink] = useState(null);
  const [showInvNumChar, setshowInvNumChar] = useState(1);
  const [showInvoiceAmount, setShowGSTAmountInput] = useState(1);

  // async function processInvoice(accCode, purpose, treasurerName, file) {
  //   const invoice = await InvoicePayment.createHorizonInvoice(accCode, purpose, treasurerName, file);
  //   const IPR = await InvoicePaymentRequisition.create(invoice);
  //   await IPR.attachInvoice(file);
  //   await IPR.download();
  // }
  function handleSupplierChange(e) {
    if (e.target.value === "Select a supplier" || e.target.value === "Other") {
      setSupplier(null);
    } else {
      const supplier = e.target.value;
      setSupplier(supplier);
    }
  }

  function handleSupplierNameChange(e) {
    setSupplier(e.target.value);
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
    if (e.target.value !== "") {
      const accCode = e.target.value;
      setAccCode(accCode);  
    } else {
      setAccCode(null);
    }
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
    e.preventDefault();
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
    const uploadResponse = await fetch('http://localhost:3000/upload', {
      method: "POST",
      body: form,
    });
    if (!uploadResponse.ok) {
      throw new Error(`Response status: ${uploadResponse.status}`);
    }

    const downloadResponse = await fetch('http://localhost:3000/download/' + invoiceNum);
    if (!downloadResponse.ok) {
      throw new Error(`Response status: ${downloadResponse.status}`);
    }
    const blob = await downloadResponse.blob();
    // const data = blob.arrayBuffer().then((bytes) => {return bytes})
    const fileURL = URL.createObjectURL(blob);
    console.log(fileURL);
    setFileLink(fileURL);
  }

  function handleInvNumKeyChange(e) {
    console.log(e.key);
    const existing = e.target.value;
    // e.preventDefault();
    const pattern = /^[a-zA-Z0-9-]/;
    const key = e.key;
    const match = pattern.test(key);
    if (!match && (key !== "Backspace") && (key !== "Enter")) {
      setshowInvNumChar(0);
    } else {
      setshowInvNumChar(1);
    }
  }
  function beforeInputInvoiceCharHandler(e) {
    if (!showInvNumChar) {
      e.preventDefault();
      // showInvNumChar = 1;
    }
  }


  return (
    <div className="App">
      <div className='lhs'>
        <GreetingHeader />
        <form onSubmit={handleSubmit}> 
          <p>Supplier</p>
          <SupplierDropdown handleChange={handleSupplierChange}/>
          {supplier === "Other" && 
              <>
              <p>Enter supplier name</p>
              <input type="text"></input>
              </>
          }
          <p>Supplier email</p>
          <input required onChange={handleEmailChange}type='email'></input>
          <p>Invoice number</p>
          <input required onBeforeInput={beforeInputInvoiceCharHandler} onKeyDown={handleInvNumKeyChange} pattern="[0-9]*" maxLength="15" onChange={handleInvoiceNumChange} type='text'></input>
          {!showInvNumChar && 
            <p>Numbers, letters, or dashes only!</p>
          }
          <p>Invoice date</p>
          <input onChange={handleInvoiceDate} type="date"></input>
          <p>Total invoice amount</p>
          <input required type='number' onChange={handleTotal}step='0.01'></input>
          <p>GST amount</p>
          <input type='number' onChange={handleGSTAmount} step='0.01'></input>
          <p>Sub-account code</p>
          <AccountDropdown handleChange={handleAccCode}/>
          <p>Payment purpose</p>
          <input required onChange={handlePurpose} maxLength="500" type='text'/> 
          <p>Treasurer name</p>
          <input required maxLength="500" onChange={handleName} type="text"></input>
          <p>Upload invoice</p>
          <input required onChange={handleFile} accept=".pdf" type="file"/>
          {supplier === "Other" && 
                <>
                  <p>Upload void cheque</p>
                  <FileUpload />
                </>
          }
          <button>Generate</button>
        </form>
      </div>
      <div className='rhs'>
        <InvoicePreviewer data={fileLink}/>
        <DownloadButton file={fileLink} supplier={supplier} invoiceNum={invoiceNum}/>
      </div>
    </div>
  );
}

function SupplierDropdown({handleChange}) {

  const suppliers = [
     "Discovery Organics", "Horizon", "Ecolab Co.", "Cafe Etico", "Westpoint Naturals","Other"
  ];

  const suppliersOptions = suppliers.map(supplier => 
    <option key={supplier} value={supplier}>{supplier}</option>
  );

  return (
    <div>
      <select required onChange={handleChange}>
        <option value=''>Select a supplier</option>
        {suppliersOptions}
      </select>
    </div>
  );
}


function KnownSupplierForm() {

  return (
    <> 
      <p>Sub-account code</p>
      <AccountDropdown handleChange={handleAccCode}/>
      <p>Payment purpose</p>
      <input required onChange={handlePurpose} maxLength="500" type='text'/> 
      <p>Treasurer name</p>
      <input required maxLength="500" onChange={handleName} type="text"></input>
      <p>Upload invoice</p>
      <input required onChange={handleFile} accept=".pdf" type="file"/>
      <button>Generate</button>
    </>
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
    <option key={account.code} value={account.code}>{account.code + " " + account.name}</option>
  );

  return (
    <div>
      <select required onChange={handleChange}>
        <option value=''>Select an account</option>
        {accountOptions}
      </select>
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
    <iframe className="pdf" src={data} title="Completed invoice requistion form"></iframe >
  );
}

function DownloadButton({file, invoiceNum , supplier}) {
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
    <a href={file} download={invoiceNum + "_" + supplier + "_Merged"}>
      <button className="download">
      Download PDF</button>
    </a>
  );
}

function GreetingHeader() {
  function getTime() {
    const ms =  new Date();
    const hour = ms.getHours();
    return hour;
  }
  const hour = getTime();
  if (hour >= 4 && hour <= 12) {
    return <h1>Good Morning, Sprouts treasurer!</h1>
  } else if (hour > 12 && hour < 17) {
    return <h1>Good Afternoon, Sprouts treasurer!</h1>
  } else {
    return <h1>Good Evening, Sprouts treasurer!</h1>
  }
}


export default App;
