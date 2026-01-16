import { useEffect } from 'react';
import './App.css';
import { useState } from 'react';


function App() {
  const [supplier, setSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [connectionError, setConnectionError] = useState(false);
  const [theme, setTheme] = useState("day");


  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL
        + "/suppliers");
      const suppliersObj = await response.json();
      setSuppliers(suppliersObj);
      setConnectionError(false);
    } catch(e) {
      setConnectionError(true);
      console.error(e);
    }
  }

  function handleSupplierChange(e) {
    if (e.target.value === "" || e.target.value == "Other") {
      setSupplier(e.target.value);
    } else {
      const supplierIndex = e.target.value;
      const supplier = suppliers[supplierIndex];
      setSupplier(supplier);
    }
  }
  function handleTheme() {
    if (theme === "day") {
      document.querySelector('body').setAttribute('data-theme', 'dark');
      setTheme("night");
    } else if (theme === "night") {
      document.querySelector('body').setAttribute('data-theme', 'light');
      setTheme("day");
    }
  }


  return (
    <div className="App">
        <div onClick={handleTheme} className='theme-option'><p className="theme-option-text">{(theme === "day") ?"night mode" : "day mode"}</p></div>
        {connectionError && <p className="connectionErrMessage">Connection to server failed :( please try again later</p>}
        <GreetingHeader />
        <div className="content">
          {/* <p id="form-header">Enter invoice details</p> */}
          <div id="supplier-dropdown">
            <label className="supplierDropdownLabel" htmlFor='supplierDropdown'>Supplier</label>
            <SupplierDropdown handleChange={handleSupplierChange} suppliers={suppliers}/>
            {/* {supplierErr && <p className="error-message">Please choose a supplier</p>} */}
          </div>
          {(supplier.name === "Horizon") ?
            <ProcessableSupplierForm supplier={supplier}/> :
            <GeneralSupplierForm supplier={supplier}/>
          }
        </div>
    </div>
  );
}

function SupplierDropdown({handleChange, suppliers}) {

  const suppliersOptions = suppliers.map((supplier, index) => 
    <option key={supplier.name} value={index}>{supplier.name}</option>
  );

  const other = {
    name: "Other",
    email: null
  }

  return (
    <div>
      <select name='supplierDropdown' required onChange={handleChange}>
        {/* weird values are set here lol */}
        <option value=""></option>
        {suppliersOptions}
        <option value="Other">Other</option>
      </select>
    </div>
  );
}

function GeneralSupplierForm({supplier}) {
  const [accCode, setAccCode] = useState(null);
  const [date, setDate] = useState(null);
  const [gst, setGST] = useState(0.00);
  const [total, setTotal] = useState(null);
  const [email, setEmail] = useState(null);
  const [treasurerName, setTreasurerName] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [invoiceNum, setInvoiceNum] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [voidCheque, setVoidCheque] = useState(null);
  const [showInvNumChar, setshowInvNumChar] = useState(1);
  const [err, setErr] = useState(null);
  const [fileLink, setFileLink] = useState("/previewerDefault.html");
  const [supplierName, setSupplierName] = useState(null);
  

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
    setTreasurerName(e.target.value);
  }

  function handleInvoice(e) {
    setInvoice(e.target.files[0]);
  }

  function handleVoidCheque(e) {
    setVoidCheque(e.target.files[0]);
  }

  function handleInvNumKeyDown(e) {
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
    }
  }
  async function validateFile(blob) {
    if (blob.size > 5*1024*1024) {
      return false;
    }
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);      
      const signatureBytes = bytes.slice(0, 5);
      const signature = signatureBytes.toHex().toUpperCase();
      const PDFsignature = '255044462D';
      const isValid = (signature === PDFsignature);
      return isValid;

  }


  async function handleSubmit(e) {
    e.preventDefault();
    if (supplier === "") {
      return alert("Please choose a supplier")
    } else {
      setErr(null);
      const form = new FormData();
      form.append("invoiceNum", invoiceNum);
      form.append("date", date);
      form.append("gst", gst);
      form.append("total", total);
      if (supplier == "Other") {
        form.append("supplierName", supplierName);
        form.append("email", email);
      } else {
        form.append("supplierName", supplier.name);
        form.append("email", supplier.email);
      }
      form.append("accCode", accCode);
      form.append("purpose", purpose);
      form.append("treasurerName", treasurerName);
      form.append("invoice", invoice);
      if (voidCheque !== null && supplier === "Other") {
        form.append("voidCheque", voidCheque);
      }
      try {
        const uploadResponse = await fetch(import.meta.env.VITE_BACKEND_URL + "/upload", {
          method: "POST",
          body: form,
        });
        if (!uploadResponse.ok) {
          const uploadResponseText = await uploadResponse.text();
          throw new Error("File upload error");
        }
        const downloadResponse = await fetch(import.meta.env.VITE_BACKEND_URL + '/download/' + invoiceNum);
        if (!downloadResponse.ok) {
          const downloadResponseText = await downloadResponse.text();
          throw new Error("File download error");
        }
        const blob = await downloadResponse.blob();
        const validFile = await validateFile(blob);
        if (!validFile) {
          throw new Error("File download error");
        }
        const fileURL = URL.createObjectURL(blob);
        setFileLink(fileURL);
      } catch(e) {
        setErr("Error occurred: " + e.message);
        console.error(e);
        return;
      }
    }
  }


  return (
    <div className="form">
      {/* change name of this div? */}
      <div className="lhs">
        <form onSubmit={handleSubmit}> 
          {supplier == "Other" && 
            <>
            <div className="form-row">
              <label htmlFor='supplierName'>Enter supplier name</label>
              <input  name='supplierName' type="text" required onChange={(e) => setSupplierName(e.target.value)}></input>
            </div>            
            <div className="form-row">
              <label htmlFor='supplierEmail'>Supplier email</label>
              <input name='supplierEmail'type="email" required onChange={handleEmailChange}></input>
            </div>
            </>
          }
          {/* {loadSupplierEmail()} */}
          {/* <input value={email} required onChange={handleEmailChange}></input> */}
          <div className="form-row">
            <div className='form-multiCol-row'>
              <div className="col1">
                <label htmlFor='invDate'>Invoice date</label>
                <input name='invDate' onChange={handleInvoiceDate} type="date"></input>
              </div>
              <div className="col2"> 
                <label htmlFor='invNum'>Invoice number</label>
                <input name='invNum' type='text' onKeyDown={handleInvNumKeyDown} onBeforeInput={beforeInputInvoiceCharHandler} onChange={handleInvoiceNumChange} required></input>
                {(!showInvNumChar) && <p>Numbers, letters, or dashes only!</p>}
              </div>
            </div>
          </div>
          <div className='form-row'>
            <div className='form-multiCol-row'>
                <div className="col1">
                  <label htmlFor='invAmt'>Total invoice amount</label>
                  <input name='invAmt' id="invoice-amt" required type='number' onChange={handleTotal} step='0.01'></input>
                </div>
                <div className="col2">
                  <label htmlFor='gstAmt'>GST amount</label>
                  <input required name='gstAmt' id="gst-amt"type='number' onChange={handleGSTAmount} step='0.01'></input>
                </div>
            </div>
          </div>
          <div className='form-row'>
            <label htmlFor='paymentPurpose'>Payment purpose</label>
            <textarea name='paymentPurpose' id="payment-purpose" required onChange={handlePurpose} maxLength="150" type='text'/>
          </div>
          <div className='form-row'>
            <label className="accountDropdownLabel" htmlFor='subaccountCode'>Sub-account code</label>
            <AccountDropdown handleChange={handleAccCode}/>
          </div>
          <div className='form-row'>
            <label htmlFor='treasurerName'>Treasurer name</label>
            <input name='treasurerName' required maxLength="500" onChange={handleName} type="text"></input>
          </div>
          <div className='form-row'>
            <label htmlFor='invoice'>Invoice File (must be under 5MB)</label>
            <input name='invoice' accept=".pdf"required onChange={handleInvoice} type="file"/>
          </div>
          {supplier == "Other" && 
                <div className='form-row'>
                  <label className="voidChequeLabel" htmlFor='voidCheque'>Upload void cheque (must be under 5MB)</label>
                  <input name='voidCheque' onChange={handleVoidCheque} required type='file' accept=".pdf"></input>
                </div>
          }
          <div className='form-row' id='submit-row'>
            <button className='generate-btn'>Generate!</button>
          </div>
        </form>
      </div>
      <div className='rhs'>
        <InvoicePreviewer data={fileLink}/>
        {err !== null && <p>{err}</p>}
        {(supplier !== "Other" && supplier !== "") ?         
          <DownloadButton file={fileLink} supplier={supplier.name} invoiceNum={invoiceNum}/> :
          <DownloadButton file={fileLink} supplier={supplierName} invoiceNum={invoiceNum}/>
        }
      </div>
    </div>
  
  );
}


function ProcessableSupplierForm({supplier}) {

  const [accCode, setAccCode] = useState(null);
  const [name, setName] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [file, setFile] = useState(null);
  const [fileLink, setFileLink] = useState("/previewerDefault.html");
  const [err, setErr] = useState(null);
  const [invoiceNum, setInvoiceNum]  = useState(null);


  async function handleProcessableSubmit(e) {
    e.preventDefault();
    setErr(null);
    const form = new FormData();
    const supplierName = supplier.name;
    form.append("accCode", accCode);
    form.append("purpose", purpose);
    form.append("treasurerName", name);
    form.append("invoice", file);
    try {
      const uploadResponse = await fetch(import.meta.env.VITE_BACKEND_URL
        + "/upload/" + supplierName, {
        method: "POST",
        body: form,
      });
      const uploadResponseText = await uploadResponse.text();
      if (!uploadResponse.ok) {
        throw new Error(`Response status: ${uploadResponse.status}`);
      } else {
        setInvoiceNum(uploadResponseText);
        const downloadResponse = await fetch(import.meta.env.VITE_BACKEND_URL          + '/download/' + uploadResponseText);
        if (!downloadResponse.ok) {
          console.error(downloadResponse.statusText);
          throw new Error(`Response status: ${downloadResponse.status}`);
        }
        const blob = await downloadResponse.blob();
        const fileURL = URL.createObjectURL(blob);
        setFileLink(fileURL);
    }
    } catch(err) {
      setErr("Error occurred, please check inputs or try again later!");
      console.error(err);
    }
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


  return (
    <div className="form">
      <div className="lhs">
        <form onSubmit={handleProcessableSubmit}> 
          <div className="form-row">
            <label>Payment purpose</label>
            <textarea name='paymentPurpose' id="payment-purpose" required onChange={handlePurpose} maxLength="500" type='text'/>
          </div>
          <div className="form-row">
            <label className="accountDropdownLabel">Sub-account code</label>
            <AccountDropdown handleChange={handleAccCode}/>
          </div>
          <div className="form-row">
            <label>Treasurer name</label>
            <input name='treasurerName'required maxLength="500" onChange={handleName} type="text"></input>
          </div>
          <div className='form-row'>
            <div className="invoice-file-text">
              <label className="invoiceFileLabel">Invoice file (must be under 5MB)</label>
              <p className="invoiceFileInfoMsg">For the invoice to be parsed succesfully, please submit only native PDFs (not a scan!)</p>
            </div>
            <input name='invoice' required onChange={handleFile} accept=".pdf" type="file"/>
          </div>
          <div className='form-row'>
            <button className='generate-btn'>Generate</button>
          </div>
        </form>
      </div>
      <div className='rhs'>
        <InvoicePreviewer data={fileLink}/>
        {err !== null && <p>{err}</p>}
        <DownloadButton file={fileLink} supplier={supplier.name} invoiceNum={invoiceNum}/>
      </div>
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
    {code: 70028, name: "Merchandise expense"}
  ];

  const accountOptions = accounts.map(account => 
    <option key={account.code} value={account.code}>{account.code + " " + account.name}</option>
  );

  return (
    <div>
      <select name='subaccountCode' required onChange={handleChange}>
        <option value=''></option>
        {accountOptions}
      </select>
    </div>
  );
}


function InvoicePreviewer({data}) {
  return (
      <iframe className="previewer" src={data} title="Completed invoice requisition form" allowFullScreen={true}></iframe >
    // <iframe className="previewer" src={data} title="Completed invoice requisition form" allowFullScreen={true}></iframe >
  );
}

function showDownloadError() {
  setDownloadError(1);
}

function DownloadButton({file, invoiceNum, supplier}) {

  const [downloadError, setDownloadError] = useState(false);

  return (
    <div className="download">
      {(file === "/previewerDefault.html") ?  
      <>
        <button className="download-btn" onClick={() => {setDownloadError(true)}}>Download PDF &#128140;</button>
      </> :
      <a href={file} download={invoiceNum + "_" + supplier + "_Merged"}>
        <button onClick={() => {setDownloadError(false)}} className="download-btn">
        Download PDF &#128140;</button>
      </a>
    }
    {(downloadError && file === "/previewerDefault.html") && <p className="rhs-error-msg">No invoice uploaded!</p>}
    </div>
  );
}

function GreetingHeader() {
  function getTime() {
    const ms =  new Date();
    const hour = ms.getHours();
    return hour;
  }
  const hour = getTime();
  if (hour >= 4 && hour < 12) {
    return <p className="header">Good Morning, Sprouts Treasurer &#127793;</p>
  } else if (hour >= 12 && hour < 17) {
    return <p className="header">Good Afternoon, Sprouts Treasurer &#127793;</p>
  } else {
    return <p className="header">Good Evening, Sprouts Treasurer &#127793;</p>
  }
}


export default App;
