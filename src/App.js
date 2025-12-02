import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className='lhs'>
        <h1>Hello, my dear treasurer :3</h1>
        <p>Select supplier</p>
        <SupplierDropdown />
        <p>Upload Invoice</p>
        <FileUpload />
        <p>Upload Signed IPR</p>
        <FileUpload />
        {/* <p>Enter Description</p>
        <DescriptionInput /> */}
        <p>Select Account Code</p>
        <AccountDropdown />
        <SubmitButton />
      </div>
      <div className='rhs'>
        <InvoicePreviewer />
        <DownloadButton />
      </div>
    </div>
  );
}


function SupplierDropdown() {

  const suppliers = [
    {name: "Discovery"},
    {name: "Horizon"},
    {name: "Ecolab"}
  ];

  const suppliersOptions = suppliers.map(supplier => 
    <option>{supplier.name}</option>
  );

  return (
    <div>
      <select>
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

function AccountDropdown() {

  const accounts = [
    {code: 60015, name: "Cafe purchases"},
    {code: 60075, name: "Produce market purchases"},
  ];

  const accountOptions = accounts.map(account => 
    <option>{account.code + " " + account.name}</option>
  );

  return (
    <div>
      <select>
        <option>Select an account</option>
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

function SubmitButton() {
  return (
    <button className="submit">Generate invoice payment requisition</button>
  )
}

function InvoicePreviewer() {
  return (
    <iframe class="pdf" title="Completed invoice requistion form"></iframe>
  );
}

function DownloadButton() {
  // on click
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
