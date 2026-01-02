// Test script to verify graph feature files are present and correct
const fs = require('fs');
const path = require('path');

const checks = [
  // Frontend files
  { file: 'src/features/graph/types.ts', desc: 'Graph types' },
  { file: 'src/features/graph/hooks/useGraphData.ts', desc: 'Graph data hook' },
  { file: 'src/features/graph/components/GraphView.tsx', desc: 'Graph view component' },
  { file: 'src/features/graph/index.ts', desc: 'Graph feature index' },
  { file: 'src/app/pages/GraphPage.tsx', desc: 'Graph page' },
  
  // Backend files
  { file: 'src-tauri/src/services/graph_service.rs', desc: 'Graph service' },
  { file: 'src-tauri/src/commands/graph_commands.rs', desc: 'Graph commands' },
  { file: 'src-tauri/src/services/graph_service_tests.rs', desc: 'Service tests' },
  { file: 'src-tauri/src/commands/graph_commands_tests.rs', desc: 'Command tests' },
];

console.log('🔍 Verifying Graph Feature Implementation...\n');

let allPassed = true;

checks.forEach(check => {
  const fullPath = path.join(process.cwd(), check.file);
  const exists = fs.existsSync(fullPath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${check.desc}: ${check.file}`);
  if (!exists) allPassed = false;
});

console.log('\n📊 Summary:');
console.log(allPassed ? '✅ All files present!' : '❌ Some files missing!');

// Check for 'any' types in GraphView
const graphViewPath = path.join(process.cwd(), 'src/features/graph/components/GraphView.tsx');
if (fs.existsSync(graphViewPath)) {
  const content = fs.readFileSync(graphViewPath, 'utf8');
  const anyTypes = content.match(/: any[^\w]/g);
  console.log(`\n🔍 Type Safety Check:`);
  console.log(`   'any' types found: ${anyTypes ? anyTypes.length : 0}`);
  console.log(`   Status: ${anyTypes && anyTypes.length > 0 ? '❌ FAIL' : '✅ PASS'}`);
}

process.exit(allPassed ? 0 : 1);
