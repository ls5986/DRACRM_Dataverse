import os
from dotenv import load_dotenv
import requests
import json
from datetime import datetime, timedelta
import msal

# Load environment variables
load_dotenv()

# Azure AD credentials from environment variables
tenant_id = os.getenv('TENANT_ID')
client_id = os.getenv('CLIENT_ID')
client_secret = os.getenv('CLIENT_SECRET')
dataverse_url = os.getenv('DATAVERSE_URL')

# Authentication configuration
config = {
    "tenant_id": tenant_id,
    "client_id": client_id,
    "client_secret": client_secret,
    "scope": ["https://trasandbox.crm.dynamics.com/.default"],
    "authority": "https://login.microsoftonline.com/" + tenant_id,
    "endpoint": dataverse_url + "/api/data/v9.2"
}

# Initialize MSAL client
app = msal.ConfidentialClientApplication(
    config["client_id"],
    authority=config["authority"],
    client_credential=config["client_secret"]
)

# Get access token
result = app.acquire_token_silent(config["scope"], account=None)
if not result:
    result = app.acquire_token_for_client(scopes=config["scope"])

if "access_token" not in result:
    print(f"Error getting token: {result.get('error_description', 'unknown error')}")
    exit()

# Set up headers for API calls
headers = {
    "Authorization": f"Bearer {result['access_token']}",
    "Content-Type": "application/json",
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    "Accept": "application/json"
}

def create_record(entity_name, data):
    url = f"{config['endpoint']}/{entity_name}"
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 204:
        return response.headers["OData-EntityId"].split("(")[1].strip(")'")
    else:
        print(f"Error creating {entity_name}: {response.text}")
        return None

# Create clients
print("Creating clients...")
client1_data = {
    "dra_firstname": "John",
    "dra_lastname": "Doe",
    "dra_email": "john.doe@example.com",
    "dra_phone": "555-0101",
    "dra_address": "123 Main St",
    "dra_city": "Anytown",
    "dra_state": "CA",
    "dra_zip": "90210",
    "statuscode": 1  # Active
}
client1_id = create_record("dra_client", client1_data)

client2_data = {
    "dra_firstname": "Jane",
    "dra_lastname": "Smith",
    "dra_email": "jane.smith@example.com",
    "dra_phone": "555-0102",
    "dra_address": "456 Oak Ave",
    "dra_city": "Somewhere",
    "dra_state": "NY",
    "dra_zip": "10001",
    "statuscode": 1  # Active
}
client2_id = create_record("dra_client", client2_data)

# Create debt accounts
print("Creating debt accounts...")
debtaccount1_data = {
    "dra_accountnumber": "ACC001",
    "dra_originalbalance": 15000.00,
    "dra_balance": 12000.00,
    "dra_creditor": "Credit Card Co",
    "dra_accounttype": 100000000,  # Credit Card
    "statuscode": 1,  # Active
    "dra_interestrate": 18.99,
    "_dra_client_value": client1_id
}
debtaccount1_id = create_record("dra_debtaccount", debtaccount1_data)

debtaccount2_data = {
    "dra_accountnumber": "ACC002",
    "dra_originalbalance": 25000.00,
    "dra_balance": 22000.00,
    "dra_creditor": "Bank of Loans",
    "dra_accounttype": 100000001,  # Personal Loan
    "statuscode": 1,  # Active
    "dra_interestrate": 12.5,
    "_dra_client_value": client2_id
}
debtaccount2_id = create_record("dra_debtaccount", debtaccount2_data)

# Create client notes
print("Creating client notes...")
note1_data = {
    "dra_subject": "Initial Contact",
    "dra_note": "Client interested in debt settlement program",
    "dra_type": 100000000,  # Communication
    "_dra_client_value": client1_id
}
create_record("dra_clientnote", note1_data)

note2_data = {
    "dra_subject": "Credit Report Review",
    "dra_note": "Credit score: 650, multiple late payments",
    "dra_type": 100000001,  # Credit Review
    "_dra_client_value": client2_id
}
create_record("dra_clientnote", note2_data)

# Create deals
print("Creating deals...")
deal1_data = {
    "dra_offeramount": 7200.00,
    "statuscode": 100000000,  # Accepted
    "dra_terms": "12 months",
    "dra_type": 100000000,  # Settlement
    "_dra_debtaccount_value": debtaccount1_id
}
create_record("dra_deal", deal1_data)

deal2_data = {
    "dra_offeramount": 13200.00,
    "statuscode": 100000001,  # Pending
    "dra_terms": "24 months",
    "dra_type": 100000000,  # Settlement
    "_dra_debtaccount_value": debtaccount2_id
}
create_record("dra_deal", deal2_data)

# Create credit pulls
print("Creating credit pulls...")
creditpull1_data = {
    "dra_score": 650,
    "dra_reportdate": datetime.now().isoformat(),
    "dra_provider": 100000000,  # Experian
    "_dra_client_value": client1_id
}
create_record("dra_creditpull", creditpull1_data)

creditpull2_data = {
    "dra_score": 645,
    "dra_reportdate": datetime.now().isoformat(),
    "dra_provider": 100000001,  # TransUnion
    "_dra_client_value": client2_id
}
create_record("dra_creditpull", creditpull2_data)

print("Sample data creation completed!") 