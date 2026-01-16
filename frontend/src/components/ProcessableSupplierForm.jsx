export default function ProcessableSupplierForm({supplier}) {

  const [accCode, setAccCode] = useState(null);
  const [name, setName] = useState(null);
  const [purpose, setPurpose] = useState(null);
  const [file, setFile] = useState(null);
  const [fileLink, setFileLink] = useState("src/previewerDefault.html");
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
      const uploadResponse = await fetch(import.meta.env.VITE_BACKEND_URL + "/upload/" + supplierName, {
        method: "POST",
        body: form,
      });
      const uploadResponseText = await uploadResponse.text();
      if (!uploadResponse.ok) {
        throw new Error(`Response status: ${uploadResponse.status}`);
      } else {
        setInvoiceNum(uploadResponseText);
        const downloadResponse = await fetch(import.meta.env.VITE_BACKEND_URL + "/download/" + uploadResponseText);
        if (!downloadResponse.ok) {
          console.err(downloadResponse.statusText);
          throw new Error(`Response status: ${downloadResponse.status}`);
        }
        const blob = await downloadResponse.blob();
        const fileURL = URL.createObjectURL(blob);
        setFileLink(fileURL);
    }
    } catch(err) {
      setErr("Error occurred, please check inputs or try again later!");
      console.err(err);
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