export default function AccountDropdown({handleChange}) {

    const accounts = [
      {code: 60015, name: "Cafe purchases"},
      {code: 60075, name: "Produce market purchases"},
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