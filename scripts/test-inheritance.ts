import { calculateInheritance, AssetsInput, FamilyStructure } from '../lib/inheritance';

// Scenario:
// Deceased: Husband (so Family gender is 'husband', meaning he died, spouse is wife)
// Family: Wife, 1 Son, 2 Daughters, Mother, Father.
// Assets: Harta Bawaan 100jt, Harta Bersama 200jt.
// Debt: 10jt.
// Funeral Cost: 5jt.

const assets: AssetsInput = {
    hartaBawaan: 100_000_000,
    hartaBersama: 200_000_000, // 50% = 100jt owned by deceased
    hutang: 10_000_000,
    biayaTajhis: 5_000_000,
    wasiat: 0
};

const family: FamilyStructure = {
    gender: 'husband', // The deceased is the Husband
    spouseAlive: true, // Wife is alive
    fatherAlive: true,
    motherAlive: true,
    sons: 1,
    daughters: 2,
    brothers: 0,
    sisters: 0
};

console.log('--- TEST SCENARIO ---');
console.log('Assets:', assets);
console.log('Family:', family);

const result = calculateInheritance(assets, family);

console.log('\n--- RESULT ---');
console.log(`Net Estate: Rp ${result.netEstate.toLocaleString('id-ID')}`);
console.log('Distributed Shares:');
result.shares.forEach(share => {
    console.log(`- ${share.heirName}: ${share.shareFraction} (${share.sharePercentage.toFixed(2)}%) = Rp ${share.shareAmount.toLocaleString('id-ID')} ${share.note ? '[' + share.note + ']' : ''}`);
});

console.log(`\nTotal Distributed: Rp ${result.totalDistributed.toLocaleString('id-ID')}`);
console.log(`Difference: Rp ${(result.netEstate - result.totalDistributed).toLocaleString('id-ID')}`);
