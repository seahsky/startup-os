import { ObjectId } from 'mongodb';
import { connectToDatabase } from './client';
import type { Company, Customer, Product } from '@/lib/types/document';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    const { db } = await connectToDatabase();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      db.collection('companies').deleteMany({}),
      db.collection('customers').deleteMany({}),
      db.collection('products').deleteMany({}),
      db.collection('quotations').deleteMany({}),
      db.collection('invoices').deleteMany({}),
      db.collection('credit_notes').deleteMany({}),
      db.collection('debit_notes').deleteMany({}),
      db.collection('pdf_templates').deleteMany({}),
      db.collection('users').deleteMany({}),
    ]);

    // Create default company
    console.log('🏢 Creating company...');
    const company: Company = {
      _id: new ObjectId('507f1f77bcf86cd799439011'),
      name: 'Demo Company Ltd',
      email: 'hello@democompany.com',
      phone: '+1 (555) 123-4567',
      address: {
        street: '123 Business Street',
        city: 'San Francisco',
        state: 'CA',
        country: 'United States',
        zipCode: '94102',
      },
      taxId: 'TAX-123456789',
      currency: 'USD',
      settings: {
        invoicePrefix: 'INV-',
        quotationPrefix: 'QUO-',
        creditNotePrefix: 'CN-',
        debitNotePrefix: 'DN-',
        nextInvoiceNumber: 1001,
        nextQuotationNumber: 1001,
        nextCreditNoteNumber: 1001,
        nextDebitNoteNumber: 1001,
        defaultTaxRate: 10,
        paymentTerms: 'Net 30',
        defaultDueDays: 30,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('companies').insertOne(company);

    // Create sample customers
    console.log('👥 Creating customers...');
    const customers: Customer[] = [
      {
        _id: new ObjectId(),
        companyId: company._id,
        name: 'Acme Corporation',
        email: 'billing@acmecorp.com',
        phone: '+1 (555) 234-5678',
        address: {
          street: '456 Corporate Ave',
          city: 'New York',
          state: 'NY',
          country: 'United States',
          zipCode: '10001',
        },
        taxId: 'TAX-ACME-001',
        contactPerson: 'John Smith',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        companyId: company._id,
        name: 'TechStart Inc',
        email: 'accounts@techstart.io',
        phone: '+1 (555) 345-6789',
        address: {
          street: '789 Innovation Drive',
          city: 'Austin',
          state: 'TX',
          country: 'United States',
          zipCode: '73301',
        },
        taxId: 'TAX-TECH-002',
        contactPerson: 'Sarah Johnson',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        companyId: company._id,
        name: 'Global Solutions Ltd',
        email: 'finance@globalsolutions.com',
        phone: '+1 (555) 456-7890',
        address: {
          street: '321 Enterprise Blvd',
          city: 'Chicago',
          state: 'IL',
          country: 'United States',
          zipCode: '60601',
        },
        contactPerson: 'Michael Brown',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection('customers').insertMany(customers);

    // Create sample products
    console.log('📦 Creating products...');
    const products: Product[] = [
      {
        _id: new ObjectId(),
        companyId: company._id,
        name: 'Web Development Services',
        description: 'Professional web development and design services',
        sku: 'WEB-DEV-001',
        unitPrice: 150,
        taxRate: 10,
        unit: 'hours',
        category: 'Services',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        companyId: company._id,
        name: 'Mobile App Development',
        description: 'iOS and Android mobile application development',
        sku: 'MOB-DEV-002',
        unitPrice: 175,
        taxRate: 10,
        unit: 'hours',
        category: 'Services',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        companyId: company._id,
        name: 'Consulting Services',
        description: 'Technical consulting and strategy sessions',
        sku: 'CONS-003',
        unitPrice: 200,
        taxRate: 10,
        unit: 'hours',
        category: 'Consulting',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        companyId: company._id,
        name: 'Project Management',
        description: 'End-to-end project management services',
        sku: 'PM-004',
        unitPrice: 125,
        taxRate: 10,
        unit: 'hours',
        category: 'Services',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: new ObjectId(),
        companyId: company._id,
        name: 'UI/UX Design',
        description: 'User interface and user experience design',
        sku: 'UIUX-005',
        unitPrice: 140,
        taxRate: 10,
        unit: 'hours',
        category: 'Design',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection('products').insertMany(products);

    // Create default user
    console.log('👤 Creating user...');
    await db.collection('users').insertOne({
      _id: new ObjectId('507f1f77bcf86cd799439012'),
      companyId: company._id,
      email: 'admin@democompany.com',
      name: 'Admin User',
      role: 'admin',
      passwordHash: 'dummy-hash', // In production, use proper password hashing
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Database seeded successfully!');
    console.log(`   - Company: ${company.name}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log('\n📝 You can now start creating quotations and invoices!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
