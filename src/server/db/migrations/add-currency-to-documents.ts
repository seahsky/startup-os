/**
 * Migration Script: Add Currency to Existing Documents
 *
 * This script adds the currency field to all existing documents that don't have it.
 * It uses the company's currency as the default value.
 *
 * Run with: npx tsx src/server/db/migrations/add-currency-to-documents.ts
 */

import { ObjectId } from 'mongodb';
import { getDatabase } from '../client';

async function migrateCurrency() {
  console.log('Starting currency migration...');

  try {
    const db = await getDatabase();

    // Get all companies
    const companies = await db.collection('companies').find({}).toArray();
    console.log(`Found ${companies.length} companies`);

    let totalUpdated = 0;

    for (const company of companies) {
      const companyId = company._id;
      const companyCurrency = company.currency || 'USD';

      console.log(`\nProcessing company: ${company.name} (${companyCurrency})`);

      // Update invoices without currency
      const invoicesResult = await db.collection('invoices').updateMany(
        {
          companyId: companyId,
          currency: { $exists: false }
        },
        {
          $set: { currency: companyCurrency }
        }
      );
      console.log(`  - Updated ${invoicesResult.modifiedCount} invoices`);
      totalUpdated += invoicesResult.modifiedCount;

      // Update quotations without currency
      const quotationsResult = await db.collection('quotations').updateMany(
        {
          companyId: companyId,
          currency: { $exists: false }
        },
        {
          $set: { currency: companyCurrency }
        }
      );
      console.log(`  - Updated ${quotationsResult.modifiedCount} quotations`);
      totalUpdated += quotationsResult.modifiedCount;

      // Update credit notes without currency
      const creditNotesResult = await db.collection('credit_notes').updateMany(
        {
          companyId: companyId,
          currency: { $exists: false }
        },
        {
          $set: { currency: companyCurrency }
        }
      );
      console.log(`  - Updated ${creditNotesResult.modifiedCount} credit notes`);
      totalUpdated += creditNotesResult.modifiedCount;

      // Update debit notes without currency
      const debitNotesResult = await db.collection('debit_notes').updateMany(
        {
          companyId: companyId,
          currency: { $exists: false }
        },
        {
          $set: { currency: companyCurrency }
        }
      );
      console.log(`  - Updated ${debitNotesResult.modifiedCount} debit notes`);
      totalUpdated += debitNotesResult.modifiedCount;
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`📊 Total documents updated: ${totalUpdated}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateCurrency()
    .then(() => {
      console.log('\n🎉 All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error:', error);
      process.exit(1);
    });
}

export { migrateCurrency };
