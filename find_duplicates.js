//node find_duplicates.js path/to/your/file.json
const fs = require('fs');
const path = require('path');

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Please provide a JSON file path');
  console.log('Usage: node script.js path/to/file.json');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

try {
  // Read and parse the JSON file
  const rawData = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(rawData);

  console.log(`✅ Loaded ${data.length} items from ${path.basename(filePath)}`);
  console.log('='.repeat(80));

  // Find duplicates in text values (only those with length >= 60)
  const textMap = new Map();
  const duplicates = new Map();

  data
    .filter(item => item.type === 'type' && item.text && item.text.length >= 60)
    .forEach(item => {
      const text = item.text.trim();
      if (textMap.has(text)) {
        textMap.set(text, textMap.get(text) + 1);
        duplicates.set(text, textMap.get(text));
      } else {
        textMap.set(text, 1);
      }
    });

  // Display statistics
  const totalTypeEntries = data.filter(item => item.type === 'type').length;
  const longTextEntries = data.filter(item => item.type === 'type' && item.text && item.text.length >= 60).length;

  console.log(`📊 Statistics:`);
  console.log(`   Total 'type' entries: ${totalTypeEntries}`);
  console.log(`   Texts >= 60 chars: ${longTextEntries}`);
  console.log(`   Unique long texts: ${textMap.size}`);
  console.log(`   Duplicate groups: ${duplicates.size}`);
  console.log('='.repeat(80));

  if (duplicates.size === 0) {
    console.log('✅ No duplicates found in texts longer than 60 characters.');
  } else {
    console.log('📋 DUPLICATE TEXTS FOUND:');
    console.log('-'.repeat(80));
    
    let index = 1;
    // Sort duplicates by count (descending)
    const sortedDuplicates = Array.from(duplicates.entries())
      .sort((a, b) => b[1] - a[1]);

    sortedDuplicates.forEach(([text, count]) => {
      const preview = text.length > 150 ? text.substring(0, 150) + '...' : text;
      console.log(`${index}. Count: ${count} | Length: ${text.length} chars`);
      console.log(`   Preview: "${preview}"`);
      console.log('-'.repeat(80));
      index++;
    });

    // Save detailed report
    const reportDir = path.dirname(filePath);
    const reportPath = path.join(reportDir, `duplicates-report-${Date.now()}.txt`);
    
    const reportLines = [
      'DUPLICATE TEXT REPORT',
      '='.repeat(80),
      `Generated: ${new Date().toISOString()}`,
      `Source file: ${path.basename(filePath)}`,
      `Total duplicate groups: ${duplicates.size}`,
      '='.repeat(80),
      '',
      ...sortedDuplicates.map(([text, count], idx) => {
        return `[${idx + 1}] COUNT: ${count}\n${text}\n${'='.repeat(80)}`;
      })
    ];

    fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
    console.log(`\n📄 Full report saved to: ${reportPath}`);
  }

} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`❌ File not found: ${filePath}`);
  } else if (error instanceof SyntaxError) {
    console.error('❌ Invalid JSON format:', error.message);
  } else {
    console.error('❌ Error:', error.message);
  }
  process.exit(1);
}