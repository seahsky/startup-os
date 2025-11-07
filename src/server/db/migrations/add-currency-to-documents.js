/**
 * MongoDB Shell Migration Script: Add Currency to Existing Documents
 *
 * This script adds the currency field to all existing documents that don't have it.
 * It uses the company's currency as the default value.
 *
 * Usage:
 * 1. Connect to your MongoDB database:
 *    mongosh "mongodb://localhost:27017/your-database-name"
 *
 * 2. Run this script:
 *    load('./src/server/db/migrations/add-currency-to-documents.js')
 *
 * Or paste the entire script directly into the MongoDB shell.
 */

(function migrateCurrency() {
  print('Starting currency migration...\n');

  try {
    // Get all companies
    const companies = db.companies.find({}).toArray();
    print('Found ' + companies.length + ' companies\n');

    let totalUpdated = 0;

    companies.forEach(function(company) {
      const companyId = company._id;
      const companyCurrency = company.currency || 'USD';

      print('Processing company: ' + company.name + ' (' + companyCurrency + ')');

      // Update invoices without currency
      const invoicesResult = db.invoices.updateMany(
        {
          companyId: companyId,
          currency: { $exists: false }
        },
        {
          $set: { currency: companyCurrency }
        }
      );
      print('  - Updated ' + invoicesResult.modifiedCount + ' invoices');
      totalUpdated += invoicesResult.modifiedCount;

      // Update quotations without currency
      const quotationsResult = db.quotations.updateMany(
        {
          companyId: companyId,
          currency: { $exists: false }
        },
        {
          $set: { currency: companyCurrency }
        }
      );
      print('  - Updated ' + quotationsResult.modifiedCount + ' quotations');
      totalUpdated += quotationsResult.modifiedCount;

      // Update credit notes without currency
      const creditNotesResult = db.credit_notes.updateMany(
        {
          companyId: companyId,
          currency: { $exists: false }
        },
        {
          $set: { currency: companyCurrency }
        }
      );
      print('  - Updated ' + creditNotesResult.modifiedCount + ' credit notes');
      totalUpdated += creditNotesResult.modifiedCount;

      // Update debit notes without currency
      const debitNotesResult = db.debit_notes.updateMany(
        {
          companyId: companyId,
          currency: { $exists: false }
        },
        {
          $set: { currency: companyCurrency }
        }
      );
      print('  - Updated ' + debitNotesResult.modifiedCount + ' debit notes');
      totalUpdated += debitNotesResult.modifiedCount;

      print('');
    });

    print('✅ Migration completed successfully!');
    print('📊 Total documents updated: ' + totalUpdated);

    return {
      success: true,
      totalUpdated: totalUpdated
    };

  } catch (error) {
    print('❌ Migration failed: ' + error);
    throw error;
  }
})();
