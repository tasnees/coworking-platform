console.log('🔍 Checking environment variables...');

// Load environment variables
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// List of required environment variables
const requiredVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('\n📋 Environment Variables:');
console.log('----------------------');

let allVarsPresent = true;

// Check each required variable
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const isPresent = value !== undefined && value !== '';
  
  console.log(`${varName}: ${isPresent ? '✅' : '❌'} ${isPresent ? 'Set' : 'Not set'}`);
  
  if (!isPresent) {
    allVarsPresent = false;
    console.log(`   Please set ${varName} in your .env.local file`);
  } else if (varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('KEY')) {
    // Don't log sensitive values
    console.log(`   Value: ${value.substring(0, 3)}... (hidden for security)`);
  } else {
    console.log(`   Value: ${value}`);
  }
});

console.log('\n🔍 Environment check complete!');
console.log(allVarsPresent ? '✅ All required variables are set' : '❌ Some required variables are missing');

if (!allVarsPresent) {
  console.log('\n📝 Please create or update your .env.local file with the required variables.');
  console.log('   You can use .env.local.example as a template.');
  process.exit(1);
}
