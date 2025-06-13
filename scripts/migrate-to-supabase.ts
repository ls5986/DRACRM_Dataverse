import { supabase } from '../dra-web-app/src/config/supabaseClient';
import { dataverseClient } from '../dra-web-app/src/services/dataverseClient';

async function migrateClients() {
  try {
    console.log('Fetching clients from Dataverse...');
    const clients = await dataverseClient.getAll('dra_clients');
    
    console.log(`Found ${clients.length} clients to migrate`);
    
    for (const client of clients) {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          first_name: client.dra_firstname,
          last_name: client.dra_lastname,
          email: client.dra_email,
          phone: client.dra_phone,
          address: client.dra_address,
          city: client.dra_city,
          state: client.dra_state,
          zip: client.dra_zip,
          enrollment_date: client.dra_enrollmentdate,
          status: client.dra_status?.toLowerCase() || 'active'
        })
        .select()
        .single();

      if (error) {
        console.error(`Error migrating client ${client.dra_firstname} ${client.dra_lastname}:`, error);
        continue;
      }

      console.log(`Migrated client: ${client.dra_firstname} ${client.dra_lastname}`);
    }
  } catch (error) {
    console.error('Error migrating clients:', error);
  }
}

async function migrateDebtAccounts() {
  try {
    console.log('Fetching debt accounts from Dataverse...');
    const debtAccounts = await dataverseClient.getAll('dra_debtaccounts');
    
    console.log(`Found ${debtAccounts.length} debt accounts to migrate`);
    
    for (const account of debtAccounts) {
      const { data, error } = await supabase
        .from('debt_accounts')
        .insert({
          client_id: account._dra_clientid_value,
          account_number: account.dra_accountnumber,
          creditor_name: account.dra_creditorname,
          original_balance: account.dra_originalbalance,
          current_balance: account.dra_currentbalance,
          interest_rate: account.dra_interestrate,
          status: account.dra_status || 'active'
        })
        .select()
        .single();

      if (error) {
        console.error(`Error migrating debt account ${account.dra_accountnumber}:`, error);
        continue;
      }

      console.log(`Migrated debt account: ${account.dra_accountnumber}`);
    }
  } catch (error) {
    console.error('Error migrating debt accounts:', error);
  }
}

async function migrateClientNotes() {
  try {
    console.log('Fetching client notes from Dataverse...');
    const notes = await dataverseClient.getAll('dra_clientnotes');
    
    console.log(`Found ${notes.length} client notes to migrate`);
    
    for (const note of notes) {
      const { data, error } = await supabase
        .from('client_notes')
        .insert({
          client_id: note._dra_clientid_value,
          note_text: note.dra_notetext,
          created_by: note._createdby_value || 'system'
        })
        .select()
        .single();

      if (error) {
        console.error(`Error migrating note for client ${note._dra_clientid_value}:`, error);
        continue;
      }

      console.log(`Migrated note for client: ${note._dra_clientid_value}`);
    }
  } catch (error) {
    console.error('Error migrating client notes:', error);
  }
}

async function migrateDeals() {
  try {
    console.log('Fetching deals from Dataverse...');
    const deals = await dataverseClient.getAll('dra_deals');
    
    console.log(`Found ${deals.length} deals to migrate`);
    
    for (const deal of deals) {
      const { data, error } = await supabase
        .from('deals')
        .insert({
          client_id: deal._dra_clientid_value,
          debt_account_id: deal._dra_debtaccountid_value,
          settlement_amount: deal.dra_settlementamount,
          status: deal.dra_status?.toLowerCase() || 'pending',
          settlement_date: deal.dra_settlementdate
        })
        .select()
        .single();

      if (error) {
        console.error(`Error migrating deal for client ${deal._dra_clientid_value}:`, error);
        continue;
      }

      console.log(`Migrated deal for client: ${deal._dra_clientid_value}`);
    }
  } catch (error) {
    console.error('Error migrating deals:', error);
  }
}

async function migrateCreditPulls() {
  try {
    console.log('Fetching credit pulls from Dataverse...');
    const creditPulls = await dataverseClient.getAll('dra_creditpulls');
    
    console.log(`Found ${creditPulls.length} credit pulls to migrate`);
    
    for (const pull of creditPulls) {
      const { data, error } = await supabase
        .from('credit_pulls')
        .insert({
          client_id: pull._dra_clientid_value,
          credit_score: pull.dra_creditscore,
          pull_date: pull.dra_pulldate,
          bureau: pull.dra_bureau?.toLowerCase() || 'equifax'
        })
        .select()
        .single();

      if (error) {
        console.error(`Error migrating credit pull for client ${pull._dra_clientid_value}:`, error);
        continue;
      }

      console.log(`Migrated credit pull for client: ${pull._dra_clientid_value}`);
    }
  } catch (error) {
    console.error('Error migrating credit pulls:', error);
  }
}

async function migrateAll() {
  console.log('Starting migration from Dataverse to Supabase...');
  
  try {
    await migrateClients();
    await migrateDebtAccounts();
    await migrateClientNotes();
    await migrateDeals();
    await migrateCreditPulls();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateAll(); 