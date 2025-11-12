/**
 * Migration Script: Convert legacy taxId field to country-specific taxIds
 *
 * This script migrates existing companies and customers from the old
 * taxId string field to the new country + taxIds structure.
 *
 * Usage:
 *   npx tsx src/scripts/migrateTaxIds.ts
 */

import type { MongoClient } from 'mongodb';
import { connectToDatabase } from '../server/db/client';
import { COUNTRY_TAX_CONFIGS } from '../lib/constants/countryTaxConfigs';
import { migrateLegacyTaxId } from '../lib/utils/taxIdHelpers';

interface MigrationStats {
  companiesProcessed: number;
  companiesUpdated: number;
  companiesFailed: number;
  customersProcessed: number;
  customersUpdated: number;
  customersFailed: number;
  errors: Array<{ id: string; error: string }>;
}

async function migrateCompanies(client: MongoClient): Promise<{
  processed: number;
  updated: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}> {
  const db = client.db();
  const companies = db.collection('companies');

  const stats = {
    processed: 0,
    updated: 0,
    failed: 0,
    errors: [] as Array<{ id: string; error: string }>,
  };

  console.log('\n📦 Migrating companies...');

  // Find all companies with legacy taxId field but no taxIds field
  const companiesWithLegacyTaxId = await companies
    .find({
      taxId: { $exists: true },
      $or: [{ taxIds: { $exists: false } }, { taxIds: {} }],
    })
    .toArray();

  console.log(`Found ${companiesWithLegacyTaxId.length} companies to migrate`);

  for (const company of companiesWithLegacyTaxId) {
    stats.processed++;

    try {
      // Determine country from address if available
      let country = company.country;

      if (!country && company.address?.country) {
        // Try to map country name to code
        country = mapCountryNameToCode(company.address.country);
      }

      // Default to US if we can't determine country
      if (!country || !(country in COUNTRY_TAX_CONFIGS)) {
        console.warn(
          `⚠️  Company ${company._id}: Unknown country "${country || company.address?.country}", defaulting to US`
        );
        country = 'US';
      }

      // Migrate the legacy taxId
      const taxIds = migrateLegacyTaxId(country, company.taxId);

      // Update the company
      const result = await companies.updateOne(
        { _id: company._id },
        {
          $set: {
            country,
            taxIds,
            updatedAt: new Date(),
          },
          $unset: { taxId: '' },
        }
      );

      if (result.modifiedCount > 0) {
        stats.updated++;
        console.log(
          `✅ Company ${company._id} (${company.name}): ${country} - ${Object.keys(taxIds).join(', ')}`
        );
      }
    } catch (error) {
      stats.failed++;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      stats.errors.push({
        id: company._id.toString(),
        error: errorMessage,
      });
      console.error(
        `❌ Failed to migrate company ${company._id}: ${errorMessage}`
      );
    }
  }

  return stats;
}

async function migrateCustomers(client: MongoClient): Promise<{
  processed: number;
  updated: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}> {
  const db = client.db();
  const customers = db.collection('customers');

  const stats = {
    processed: 0,
    updated: 0,
    failed: 0,
    errors: [] as Array<{ id: string; error: string }>,
  };

  console.log('\n👥 Migrating customers...');

  // Find all customers with legacy taxId field but no taxIds field
  const customersWithLegacyTaxId = await customers
    .find({
      taxId: { $exists: true, $ne: null },
      $or: [{ taxIds: { $exists: false } }, { taxIds: {} }],
    })
    .toArray();

  console.log(`Found ${customersWithLegacyTaxId.length} customers to migrate`);

  for (const customer of customersWithLegacyTaxId) {
    stats.processed++;

    try {
      // Determine country from address if available
      let country = customer.country;

      if (!country && customer.address?.country) {
        // Try to map country name to code
        country = mapCountryNameToCode(customer.address.country);
      }

      // Default to US if we can't determine country
      if (!country || !(country in COUNTRY_TAX_CONFIGS)) {
        console.warn(
          `⚠️  Customer ${customer._id}: Unknown country "${country || customer.address?.country}", defaulting to US`
        );
        country = 'US';
      }

      // Migrate the legacy taxId
      const taxIds = migrateLegacyTaxId(country, customer.taxId);

      // Update the customer
      const result = await customers.updateOne(
        { _id: customer._id },
        {
          $set: {
            country,
            taxIds,
            updatedAt: new Date(),
          },
          $unset: { taxId: '' },
        }
      );

      if (result.modifiedCount > 0) {
        stats.updated++;
        console.log(
          `✅ Customer ${customer._id} (${customer.name}): ${country} - ${Object.keys(taxIds).join(', ')}`
        );
      }
    } catch (error) {
      stats.failed++;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      stats.errors.push({
        id: customer._id.toString(),
        error: errorMessage,
      });
      console.error(
        `❌ Failed to migrate customer ${customer._id}: ${errorMessage}`
      );
    }
  }

  return stats;
}

/**
 * Map common country names to ISO codes
 * Add more mappings as needed
 */
function mapCountryNameToCode(countryName: string): string | null {
  const mapping: Record<string, string> = {
    'United States': 'US',
    'United States of America': 'US',
    USA: 'US',
    'United Kingdom': 'GB',
    UK: 'GB',
    'Great Britain': 'GB',
    Germany: 'DE',
    France: 'FR',
    Australia: 'AU',
    Canada: 'CA',
    Singapore: 'SG',
    India: 'IN',
    China: 'CN',
    Japan: 'JP',
    Brazil: 'BR',
    Mexico: 'MX',
    Spain: 'ES',
    Italy: 'IT',
    Netherlands: 'NL',
    'New Zealand': 'NZ',
    'South Africa': 'ZA',
    Switzerland: 'CH',
    Ireland: 'IE',
    Sweden: 'SE',
    Belgium: 'BE',
    Poland: 'PL',
    'South Korea': 'KR',
    Malaysia: 'MY',
    'United Arab Emirates': 'AE',
    UAE: 'AE',
    Norway: 'NO',
    Denmark: 'DK',
    Austria: 'AT',
    Finland: 'FI',
    'Hong Kong': 'HK',
  };

  return mapping[countryName] || null;
}

async function main() {
  console.log('🚀 Starting Tax ID Migration\n');
  console.log('=' .repeat(60));

  try {
    // Connect to MongoDB
    const { client } = await connectToDatabase();
    console.log('✅ Connected to MongoDB');

    // Run migrations
    const companyStats = await migrateCompanies(client);
    const customerStats = await migrateCustomers(client);

    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary\n');

    console.log('Companies:');
    console.log(`  Processed: ${companyStats.processed}`);
    console.log(`  Updated:   ${companyStats.updated}`);
    console.log(`  Failed:    ${companyStats.failed}`);

    console.log('\nCustomers:');
    console.log(`  Processed: ${customerStats.processed}`);
    console.log(`  Updated:   ${customerStats.updated}`);
    console.log(`  Failed:    ${customerStats.failed}`);

    // Display errors if any
    const allErrors = [
      ...companyStats.errors.map((e) => ({ ...e, type: 'Company' })),
      ...customerStats.errors.map((e) => ({ ...e, type: 'Customer' })),
    ];

    if (allErrors.length > 0) {
      console.log('\n❌ Errors:');
      allErrors.forEach((error) => {
        console.log(`  ${error.type} ${error.id}: ${error.error}`);
      });
    }

    console.log('\n✅ Migration completed!');
    console.log('=' .repeat(60));

    const totalFailed = companyStats.failed + customerStats.failed;
    if (totalFailed > 0) {
      console.log(
        `\n⚠️  ${totalFailed} records failed to migrate. Please review the errors above.`
      );
      process.exit(1);
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();
