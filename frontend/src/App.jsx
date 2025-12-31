import { useEffect } from 'react';
import './App.css';
import { useState } from 'react';


function App() {
  const [supplier, setSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch('http://localhost:3000/suppliers');
      const suppliersObj = await response.json();
      setSuppliers(suppliersObj);
    } catch(e) {
      alert("Connection to server failed, please try again later!")
      console.log(e);
    }
  }

  function handleSupplierChange(e) {
    if (e.target.value === "" || e.target.value == "-2") {
      setSupplier(e.target.value);
    } else {
      const supplierIndex = e.target.value;
      const supplier = suppliers[supplierIndex];
      setSupplier(supplier);
      console.log(supplier);
    }
  }

  return (
    <div className="App">
        <GreetingHeader />
        <div id="supplier-dropdown">
          <p>Supplier</p>
          <SupplierDropdown handleChange={handleSupplierChange} suppliers={suppliers}/>
        </div>
        {(supplier != null && supplier.name === "Horizon") ?
          <ProcessableSupplierForm supplier={supplier}/> :
          <GeneralSupplierForm supplier={supplier}/>
        }
    </div>
  );i
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
      <select required onChange={handleChange}>
        {/* weird values are set here lol */}
        <option value="">Select a supplier</option>
        {suppliersOptions}
        <option value={-2}>Other</option>
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
  const [name, setName] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [invoiceNum, setInvoiceNum] = useState(null);
  const [file, setFile] = useState(null);
  const [showInvNumChar, setshowInvNumChar] = useState(1);
  const [err, setErr] = useState(null);
  const [fileLink, setFileLink] = useState(null);
  const [supplierName, setSupplierName] = useState(null);

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  function handleInvoiceNumChange(e) {
    setInvoiceNum(e.target.value);
    console.log(invoiceNum);

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

  function handleInvNumKeyDown(e) {
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

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(supplier);
    if (supplier == "") {
      alert("Please choose a supplier")
    } else {
      setErr(null);
      console.log(accCode);
      const form = new FormData();
      form.append("invoiceNum", invoiceNum);
      form.append("date", date);
      form.append("gst", gst);
      form.append("total", total);
      if (supplier == "" || supplier == "-2") {
        form.append("supplierName", supplierName);
        form.append("email", email);
      } else {
        form.append("supplierName", supplier.name);
        form.append("email", supplier.email);
      }
      form.append("accCode", accCode);
      form.append("purpose", purpose);
      form.append("treasurerName", name);
      form.append("invoice", file);
      try {
        const uploadResponse = await fetch('http://localhost:3000/upload', {
          method: "POST",
          body: form,
        });
        const uploadResponseText = await uploadResponse.text();
        if (!uploadResponse.ok) {
          console.log(uploadResponseText);
          throw new Error(`Response status: ${uploadResponse.status}`);
        }
        const downloadResponse = await fetch('http://localhost:3000/download/' + invoiceNum);
        if (!downloadResponse.ok) {
          const downloadResponseText = await downloadResponse.text();
          console.log(downloadResponseText);
          throw new Error(`Response status: ${downloadResponse.status}`);
        }
        const blob = await downloadResponse.blob();
        const fileURL = URL.createObjectURL(blob);
        setFileLink(fileURL);
      } catch(e) {
        setErr("Error occurred, please try again later!");
        console.log(e);
      }
    }
  }


  return (
    <div className="form">
      {/* change name of this div? */}
      <div className="lhs">
        <form onSubmit={handleSubmit}> 
          {supplier == "-2" && 
            <>
            <p>Enter supplier name</p>
            <input type="text" required onChange={(e) => setSupplierName(e.target.value)}></input>
            <p>Supplier email</p>
            <input type="email" required onChange={handleEmailChange}></input>
            </>
          }
          {/* {loadSupplierEmail()} */}
          {/* <input value={email} required onChange={handleEmailChange}></input> */}
          <div className="form-subsection">
            <div className="col1">
              <p>Invoice date</p>
              <input onChange={handleInvoiceDate} type="date"></input>
            </div>
            <div className="col2"> 
            <p>Invoice Number</p>
              <input type='text' onKeyDown={handleInvNumKeyDown} onBeforeInput={beforeInputInvoiceCharHandler} onChange={handleInvoiceNumChange} required></input>
              {(!showInvNumChar) && <p>Numbers, letters, or dashes only!</p>}
            </div>
          </div>
          <div className='form-subsection'>
            <div className="col1">
              <p>Total invoice amount</p>
              <input id="invoice-amt" required type='number' onChange={handleTotal} step='0.01'></input>
            </div>
            <div className="col2">
              <p>GST amount</p>
              <input id="gst-amt"type='number' onChange={handleGSTAmount} step='0.01'></input>
            </div>
          </div>
          <p>Payment purpose</p>
          <input id="payment-purpose" required onChange={handlePurpose} maxLength="500" type='text'/> 
          <p>Sub-account code</p>
          <AccountDropdown handleChange={handleAccCode}/>
          <p>Treasurer name</p>
          <input required maxLength="500" onChange={handleName} type="text"></input>
          <p>Upload invoice</p>
          <input required onChange={handleFile} accept=".pdf" type="file"/>
          {supplier == "-2" && 
                <>
                  <p>Upload void cheque</p>
                  <FileUpload />
                </>
          }
          <button className='generate-btn'>Generate</button>
        </form>
      </div>
      <div className='rhs'>
        <InvoicePreviewer data={fileLink}/>
        {err !== null && <p>{err}</p>}
        {(supplier !== "-2" && supplier !== "") ?         
          <DownloadButton file={fileLink} supplier={supplier.name} invoiceNum={invoiceNum}/> :
          <DownloadButton file={fileLink} supplier={supplierName} invoiceNum={invoiceNum}/>
        }
      </div>
    </div>
  
  );
}


function ProcessableSupplierForm({supplier, setSupplier}) {

  const [accCode, setAccCode] = useState(null);
  const [name, setName] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [file, setFile] = useState(null);
  const [fileLink, setFileLink] = useState(null);
  const [err, setErr] = useState(null);
  const [invoiceNum, setInvoiceNum]  = useState(null);

  async function handleProcessableSubmit(e) {
    e.preventDefault();
    setErr(null);
    console.log(accCode);
    const form = new FormData();
    const supplierName = supplier.name;
    form.append("accCode", accCode);
    form.append("purpose", purpose);
    form.append("treasurerName", name);
    form.append("invoice", file);
    try {
      const uploadResponse = await fetch('http://localhost:3000/upload/' + supplierName, {
        method: "POST",
        body: form,
      });
      const uploadResponseText = await uploadResponse.text();
      console.log(uploadResponseText);
      if (!uploadResponse.ok) {
        throw new Error(`Response status: ${uploadResponse.status}`);
      } else {
        setInvoiceNum(uploadResponseText);
        const downloadResponse = await fetch('http://localhost:3000/download/' + uploadResponseText);
        if (!downloadResponse.ok) {
          console.log(downloadResponse.statusText);
          throw new Error(`Response status: ${downloadResponse.status}`);
        }
        const blob = await downloadResponse.blob();
        const fileURL = URL.createObjectURL(blob);
        setFileLink(fileURL);
    }
    } catch(err) {
      setErr("Error occurred, please check inputs or try again later!");
      console.log(err);
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
          <p>Payment purpose</p>
          <input required onChange={handlePurpose} maxLength="500" type='text'/> 
          <p>Sub-account code</p>
          <AccountDropdown handleChange={handleAccCode}/>
          <p>Treasurer name</p>
          <input required maxLength="500" onChange={handleName} type="text"></input>
          <p>Upload invoice</p>
          <input required onChange={handleFile} accept=".pdf" type="file"/>
          <button className='generate-btn'>Generate</button>
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


function InvoicePreviewer({data}) {
  return (
    <iframe className="previewer" src={data} title="Completed invoice requistion form"></iframe >
  );
}

function DownloadButton({file, invoiceNum, supplier}) {
  // need to implement error handling
  return (
    <div className="download">
      <a href={file} download={invoiceNum + "_" + supplier + "_Merged"}>
        <button >
        Download PDF</button>
      </a>
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
    return <p>Good Morning, Sprouts treasurer </p>
  } else if (hour >= 12 && hour < 17) {
    return <p>Good Afternoon, Sprouts treasurer!</p>
  } else {
    return <p>Good Evening, Sprouts treasurer °‧ 𓆝 𓆟 𓆞 ·｡</p>
  }
}


export default App;
