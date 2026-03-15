const { getColorName, colorMap } = require('./colors');

const testCases = [
    { name: 'Pure Black', hex: '#000000', expected: 'Black' },
    { name: 'Off Black / Dark Gray', hex: '#353535', expected: 'Dark Gray' },
    { name: 'Blackish 1', hex: '#111111', expected: 'Black' },
    { name: 'Blackish 2', hex: '#1a1a1a', expected: 'Black' },
    { name: 'Blackish Green', hex: '#102010', expected: 'Black' },
    { name: 'Navy 1', hex: '#000080', expected: 'Navy' },
    { name: 'Navy 2 (Dark blueish)', hex: '#263a57', expected: 'Navy' },
    { name: 'Brown 1', hex: '#8b4513', expected: 'Brown' },
    { name: 'Brown 2', hex: '#654321', expected: 'Brown' },
    { name: 'Brown 3 (Dark)', hex: '#3E2723', expected: 'Brown' },
    { name: 'Maroon', hex: '#800000', expected: 'Maroon' },
    { name: 'Teal', hex: '#008080', expected: 'Teal' },
    { name: 'Olive', hex: '#808000', expected: 'Olive' },
    { name: 'Charcoal', hex: '#404040', expected: 'Charcoal' },
    { name: 'Dark Green', hex: '#006400', expected: 'Dark Green' }
];

console.log("--- COLOR MATCHING TESTS ---");
testCases.forEach(tc => {
    const matched = getColorName(tc.hex);
    const pass = matched === tc.expected;
    console.log(`${pass ? '✅' : '❌'} ${tc.name} (${tc.hex}): Expected ${tc.expected}, Got ${matched}`);
});

console.log("\nCurrent Color Palette Length:", colorMap.length);
