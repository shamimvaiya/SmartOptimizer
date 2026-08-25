import { systemTestSuite } from './src/utils/systemTestSuite';

async function run() {
  console.log('=== VISUAL MACRO STUDIO PHASE 4 COMPREHENSIVE TEST SUITE ===\n');
  const result = await systemTestSuite.runAllTests();

  console.log(`\nTEST SUMMARY:`);
  console.log(`Total Tests Run : ${result.total}`);
  console.log(`Passed           : ${result.passed}`);
  console.log(`Failed           : ${result.failed}\n`);

  console.log('DETAILED BREAKDOWN:');
  for (const r of result.results) {
    const icon = r.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${icon} [${r.category}] ${r.name} (${r.durationMs}ms)`);
    if (r.details) console.log(`    Details: ${r.details}`);
    if (r.error) console.log(`    Error  : ${r.error}`);
  }

  if (result.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
