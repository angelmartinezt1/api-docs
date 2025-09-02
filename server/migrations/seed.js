import { runQuery, getOne } from '../db.js';
import { newId, nowIso } from '../lib/utils.js';

/**
 * Seed script to insert sample microservices data
 */
async function seedDatabase() {
    console.log('🌱 Seeding database with sample data...');
    
    try {
        // Check if data already exists
        const existing = await getOne('SELECT COUNT(*) as count FROM microservices');
        if (existing.count > 0) {
            console.log('⚠️  Database already contains data. Skipping seed.');
            return;
        }

        const now = nowIso();
        
        // Sample microservices data
        const microservices = [
            {
                id: newId(),
                name: 'orders',
                description: 'Administrative API for order management and administration tasks across all stores',
                owner_dev_name: 'Carlos Rodriguez',
                api_type: 'Admin',
                version: '1.0.0',
                status: 'active',
                spec_filename: 'Admin-orders-1.0.0-20250902.json',
                tags: 'orders,admin,management',
                created_at: now,
                updated_at: now
            },
            {
                id: newId(),
                name: 'users',
                description: 'Public-facing API for user registration, authentication, and profile management in customer portal',
                owner_dev_name: 'Ana Martinez',
                api_type: 'Portal',
                version: '1.0.0',
                status: 'active',
                spec_filename: 'Portal-users-1.0.0-20250902.json',
                tags: 'users,authentication,portal,public',
                created_at: now,
                updated_at: now
            },
            {
                id: newId(),
                name: 'notifications',
                description: 'Webhook endpoints for receiving and processing real-time notifications from external systems',
                owner_dev_name: 'Miguel Santos',
                api_type: 'Webhook',
                version: '1.0.0',
                status: 'active',
                spec_filename: 'Webhook-notifications-1.0.0-20250902.json',
                tags: 'webhooks,notifications,external,realtime',
                created_at: now,
                updated_at: now
            }
        ];

        // Insert sample data
        for (const service of microservices) {
            await runQuery(`
                INSERT INTO microservices (
                    id, name, description, owner_dev_name, api_type, version, 
                    status, spec_filename, tags, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                service.id, service.name, service.description, service.owner_dev_name,
                service.api_type, service.version, service.status, service.spec_filename,
                service.tags, service.created_at, service.updated_at
            ]);
            
            console.log(`✅ Inserted microservice: ${service.api_type}/${service.name}`);
        }

        console.log(`🎉 Successfully seeded ${microservices.length} microservices`);
        console.log('📊 Sample data includes:');
        console.log('   - Admin: orders management API');
        console.log('   - Portal: user authentication API');
        console.log('   - Webhook: notifications receiver API');
        
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase()
        .then(() => {
            console.log('🌱 Seed completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Seed failed:', error);
            process.exit(1);
        });
}

export default seedDatabase;