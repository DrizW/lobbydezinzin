import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('👑 Création du compte administrateur...');
  
  const adminEmail = "admin@lobbydezinzin.com";
  const adminPassword = "Admin123!"; // Mot de passe temporaire
  
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      if (existingAdmin.role === "ADMIN") {
        console.log('✅ Compte admin existe déjà:', adminEmail);
        console.log('🔑 Mot de passe:', adminPassword);
        return;
      } else {
        // Promouvoir l'utilisateur existant en admin
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: "ADMIN" }
        });
        console.log('⬆️  Utilisateur promu en administrateur:', adminEmail);
        return;
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Créer le compte admin
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        name: "Administrateur LobbyDeZinzin"
      }
    });

    console.log('🎉 Compte administrateur créé avec succès !');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Mot de passe:', adminPassword);
    console.log(`🆔 ID: ${adminUser.id}`);
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('   1. Connectez-vous immédiatement');
    console.log('   2. Changez le mot de passe');
    console.log('   3. Accédez au panel admin: /admin');
    console.log('   4. Créez des comptes de test Premium');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Créer également un utilisateur de test standard
async function createTestUser() {
  console.log('\n👤 Création d\'un utilisateur de test...');
  
  const testEmail = "test@lobbydezinzin.com";
  const testPassword = "Test123!";
  
  try {
    // Vérifier si l'utilisateur test existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (existingUser) {
      console.log('✅ Utilisateur test existe déjà:', testEmail);
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // Créer l'utilisateur test
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        role: "USER",
        name: "Utilisateur Test"
      }
    });

    console.log('✅ Utilisateur test créé:');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Mot de passe:', testPassword);
    console.log(`🆔 ID: ${testUser.id}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur test:', error);
  }
}

async function main() {
  console.log('🚀 Configuration des comptes pour LobbyDeZinzin\n');
  
  await createAdminUser();
  await createTestUser();
  
  console.log('\n🎯 Prochaines étapes:');
  console.log('   1. npm run dev');
  console.log('   2. Se connecter avec admin@lobbydezinzin.com');
  console.log('   3. Aller sur /admin pour gérer les abonnements');
  console.log('   4. Activer Premium pour l\'utilisateur test');
  console.log('   5. Tester le système complet');
  
  console.log('\n💡 URLs importantes:');
  console.log('   - Accueil: http://localhost:3000');
  console.log('   - Login: http://localhost:3000/login');
  console.log('   - Admin Panel: http://localhost:3000/admin');
  console.log('   - Dashboard: http://localhost:3000/dashboard');
}

main()
  .catch((e) => {
    console.error('Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });