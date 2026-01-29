export type Heir = {
    id: string;
    role: string; // e.g., "Istri", "Ibu", "Anak Perempuan"
    baseShare: number; // Pecahan asli (0.125, 0.5, dll)
    baseShareText: string; // Teks pecahan asli ("1/8", "1/2")
    isSpouse: boolean;
    reason?: string;
};

export type CalculationResult = {
    finalHeirs: (Heir & {
        finalAmount: number;
        finalShareText: string;
        finalPercentage: number;
        faraidStatus: string; // [NEW] Added for detailed labels
        note?: string;
    })[];
    status: "Normal" | "Aul" | "Radd";
    totalHarta: number;
    explanationSteps: string[];
    asalMasalahInitial: number;
    asalMasalahFinal: number;
    neraca: {
        totalJatahAwal: number;
        selisih: number;
        statusNeraca: "PAS" | "SISA" | "KURANG";
    };
};

// Helper: Parse fraction string "1/6" -> number
const parseFractionValue = (frac: string): number => {
    if (frac === "Asabah") return 0; // Handled separately
    const parts = frac.split("/");
    if (parts.length === 2) return parseInt(parts[0]) / parseInt(parts[1]);
    return 0;
};

// Helper: GCD (Greatest Common Divisor)
const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
};

// Helper: LCM (Least Common Multiple)
const lcm = (a: number, b: number): number => {
    return (a * b) / gcd(a, b);
};

const getDenominator = (frac: string): number => {
    if (frac === "Asabah") return 1;
    const parts = frac.split("/");
    return parts.length === 2 ? parseInt(parts[1]) : 1;
};

// --- LOGIC REASONING HELPER (AL-DALIL) ---
const getReason = (heir: Heir, allHeirs: Heir[]): string => {
    const role = heir.role;

    // Check presence of specific relatives
    const hasSon = allHeirs.some(h => h.role === "Anak Laki-laki");
    const hasDaughter = allHeirs.some(h => h.role === "Anak Perempuan");
    const hasFather = allHeirs.some(h => h.role === "Ayah");
    const hasMother = allHeirs.some(h => h.role === "Ibu");
    const hasGrandFather = allHeirs.some(h => h.role === "Kakek" || h.role === "Ayah dari Ayah" || h.role === "Ayah dari Ayah (Kakek)");

    // Counts
    const daughterCount = allHeirs.filter(h => h.role === "Anak Perempuan").length;
    const sisterCount = allHeirs.filter(h => h.role === "Saudara Perempuan Kandung" || h.role === "Sdr Perempuan Kandung" || h.role === "Saudari Kandung").length;
    const brotherCount = allHeirs.filter(h => h.role === "Saudara Laki-laki Kandung" || h.role === "Sdr Laki-laki Kandung" || h.role === "Saudara Kandung").length;

    // 1. KELOMPOK ANAK & CUCU (DESCENDANTS)
    if (role === "Anak Perempuan") {
        if (hasSon) return "Menjadi Asabah bi Ghair (Penerima Sisa) karena bersama Anak Laki-laki.";
        if (daughterCount >= 2) return "Mendapat 2/3 (Berserikat) karena jumlahnya lebih dari satu dan tidak ada Anak Laki-laki.";
        return "Mendapat 1/2 (Fardhu) karena sendirian dan tidak ada Anak Laki-laki.";
    }
    if (role === "Anak Laki-laki") {
        return "Mendapat sisa harta (Asabah) karena merupakan ahli waris laki-laki terdekat.";
    }
    if (role === "Cucu Laki-laki") {
        if (hasSon) return "Terhalang (Mahjub) oleh Anak Laki-laki.";
        return "Menjadi Asabah menggantikan posisi Anak Laki-laki.";
    }
    // DZAWIL ARHAM (Cucu dari Anak Perempuan)
    if (role.toLowerCase().includes("dari anak pr") || role.includes("dari Anak Pr") || role.includes("dari Anak Perempuan")) {
        return "Termasuk golongan Dzawil Arham (Kerabat Jauh) karena jalur nasab terhubung melalui perempuan (Anak Perempuan). Dalam hukum Faraid, golongan ini tidak menerima waris kecuali jika tidak ada sama sekali ahli waris utama.";
    }
    if (role === "Cucu Perempuan") {
        if (hasSon) return "Terhalang (Mahjub) oleh Anak Laki-laki.";
        if (daughterCount >= 2) return "Terhalang karena bagian 2/3 sudah habis oleh 2 Anak Perempuan.";
        if (daughterCount === 1) return "Mendapat 1/6 sebagai pelengkap 2/3 bersama Anak Perempuan.";
        return "Mendapat bagian Fardhu (1/2 atau 2/3) karena tidak ada Anak.";
    }

    // 2. KELOMPOK LELUHUR (ASCENDANTS)
    if (role.toLowerCase().includes("kakek") || role === "Ayah dari Ayah") {
        if (hasFather) return "Terhalang (Mahjub) oleh Ayah.";
        return "Menggantikan posisi Ayah (1/6 atau Asabah).";
    }
    if (role.toLowerCase().includes("nenek")) {
        if (hasMother) return "Terhalang (Mahjub) oleh Ibu.";
        return "Mendapat 1/6 (Sola atau dibagi rata sesama Nenek).";
    }
    if (role === "Ayah") {
        if (hasSon) return "Mendapat 1/6 karena ada Anak Laki-laki.";
        return "Mendapat 1/6 + Sisa (Asabah) karena tidak ada Anak Laki-laki.";
    }
    if (role === "Ibu") {
        // Cek keturunan atau saudara > 1
        // Note: Cucu helps reduce mother too
        const hasDescendants = hasSon || hasDaughter || allHeirs.some(h => h.role.includes("Cucu"));
        const siblingsTotal = allHeirs.filter(h => h.role.toLowerCase().includes("saudara") || h.role.toLowerCase().includes("sdr")).length;
        if (hasDescendants || siblingsTotal >= 2) return "Mendapat 1/6 karena ada Keturunan atau Saudara lebih dari satu.";
        return "Mendapat 1/3 karena tidak ada Keturunan dan Saudara sedikit.";
    }

    // 3. KELOMPOK SAUDARA (SIBLINGS)
    const isSibling = role.toLowerCase().includes("saudara") || role.toLowerCase().includes("sdr");
    if (isSibling) {
        if (hasSon || hasFather) return "Terhalang (Mahjub) oleh Anak Laki-laki atau Ayah."; // Hujub Hirman Total

        // Saudara Kandung
        if (role === "Saudara Laki-laki Kandung" || role === "Sdr Laki-laki Kandung") {
            return "Menjadi Asabah (Penerima Sisa) karena tidak ada Anak/Ayah.";
        }
        if (role === "Saudara Perempuan Kandung" || role === "Sdr Perempuan Kandung" || role === "Saudari Kandung") {
            if (hasDaughter) return "Menjadi Asabah ma'al Ghair (Bersama orang lain) karena ada Anak Perempuan.";
            if (brotherCount > 0) return "Menjadi Asabah bi Ghair karena ada Saudara Laki-laki.";
            if (sisterCount > 1) return "Mendapat 2/3 (berserikat) karena lebih dari satu.";
            return "Mendapat 1/2 karena sendirian dan tidak ada Anak/Ayah.";
        }

        // Saudara Sebapak
        if (role.includes("Sebapak")) {
            const hasFullBrother = allHeirs.some(h => h.role === "Saudara Laki-laki Kandung" || h.role === "Sdr Laki-laki Kandung");
            if (hasFullBrother) return "Terhalang (Mahjub) oleh Saudara Kandung Laki-laki.";
            // Sister logic complex (blocked by 2 full sisters unless asabah)
            const fullSisterCount = allHeirs.filter(h => h.role === "Saudara Perempuan Kandung" || h.role === "Sdr Perempuan Kandung" || h.role === "Saudari Kandung").length;
            if (role.includes("Perempuan") && fullSisterCount >= 2) return "Terhalang oleh 2 Saudara Perempuan Kandung (kecuali ada Asabah).";
            return "Menggantikan posisi Saudara Kandung.";
        }

        // Saudara Seibu (Kalalah)
        if (role.includes("Seibu")) {
            // Blocked by ANY Child, Grandchild, Father, Grandfather
            const hasGrandChild = allHeirs.some(h => h.role.includes("Cucu"));
            if (hasSon || hasDaughter || hasGrandChild || hasFather || hasGrandFather) {
                return "Terhalang (Mahjub) oleh Anak, Cucu, Ayah, atau Kakek.";
            }
            const seibuCount = allHeirs.filter(h => h.role.includes("Seibu")).length;
            if (seibuCount > 1) return "Mendapat 1/3 (dibagi rata) karena Kalalah jamak.";
            return "Mendapat 1/6 (sendiri) karena Kalalah Mufrad.";
        }
    }

    // 4. KELOMPOK PAMAN & SEPUPU (COLLATERALS)

    // Normalize logic for collaterals matches
    // Assuming heir.role matches one of the lower priorities

    if (role.includes("Paman") || role.includes("Sepupu") || role.includes("Keponakan")) {
        // Filter only potential blocking males
        const males = ["Anak Laki-laki", "Cucu Laki-laki", "Ayah", "Kakek", "Saudara Laki-laki Kandung", "Saudara Laki-laki Sebapak"];
        const hasCloserMale = allHeirs.some(h => males.includes(h.role));

        if (hasCloserMale) return "Terhalang oleh kerabat laki-laki yang lebih dekat (misal: Saudara/Ayah/Anak).";

        // Specific Blocks
        if (role === "Paman Sebapak" && allHeirs.some(h => h.role === "Paman Kandung")) return "Terhalang oleh Paman Kandung.";

        if (heir.baseShare === 0 || heir.baseShareText === "0") return "Terhalang oleh kerabat laki-laki yang lebih dekat.";
        return "Mendapat sisa harta (Asabah) karena tidak ada kerabat laki-laki yang lebih dekat.";
    }

    // Spouse
    if (role === "Suami") {
        if (hasSon || hasDaughter || allHeirs.some(h => h.role.includes("Cucu"))) return "Mendapat 1/4 karena ada Keturunan.";
        return "Mendapat 1/2 karena tidak ada Keturunan.";
    }
    if (role === "Istri") {
        if (hasSon || hasDaughter || allHeirs.some(h => h.role.includes("Cucu"))) return "Mendapat 1/8 karena ada Keturunan.";
        return "Mendapat 1/4 karena tidak ada Keturunan.";
    }

    return "Ahli waris yang berhak sesuai syariat.";
};

// --- FARAID STATUS HELPER ---
const getFaraidStatus = (heir: Heir, allHeirs: Heir[], shareText: string, amount: number): string => {
    // 1. Mahjub (Prioritas Utama)
    if (amount === 0 && (shareText === "0" || shareText === "Mahjub" || shareText.toLowerCase().includes("terhalang"))) {
        return "Mahjub (Terhalang)";
    }

    // 2. Dzawil Arham
    if (heir.role.toLowerCase().includes("dzawil arham") || shareText.includes("Dzawil Arham")) {
        return "Dzawil Arham";
    }

    const role = heir.role;
    const isFemale = ["Anak Perempuan", "Cucu Perempuan", "Ibu", "Nenek", "Istri", "Saudara Perempuan", "Saudari"].some(k => role.includes(k));

    // 3. Ashabah
    if (shareText.includes("Asabah") || shareText.includes("Sisa")) {
        // A. Ashabah bin Nafs (Male Residuaries)
        const binNafsRoles = [
            "Anak Laki-laki", "Cucu Laki-laki", "Ayah", "Kakek",
            "Saudara Laki-laki", "Paman", "Anak Laki-laki Saudara", "Anak Paman"
        ];
        if (binNafsRoles.some(r => role.includes(r))) {
            return "Ashabah bin Nafs";
        }

        // B. Ashabah bil Ghair (Female with Male counterpart)
        if (role === "Anak Perempuan" && allHeirs.some(h => h.role === "Anak Laki-laki")) return "Ashabah bil Ghair";
        if (role === "Cucu Perempuan" && allHeirs.some(h => h.role === "Cucu Laki-laki")) return "Ashabah bil Ghair";
        if (role.includes("Saudara Perempuan") || role.includes("Saudari")) {
            // Check for Brother of same strength
            if (role.includes("Kandung") && allHeirs.some(h => h.role === "Saudara Laki-laki Kandung" || h.role === "Sdr Laki-laki Kandung")) return "Ashabah bil Ghair";
            if (role.includes("Sebapak") && allHeirs.some(h => h.role === "Saudara Laki-laki Sebapak")) return "Ashabah bil Ghair";
        }

        // C. Ashabah ma'al Ghair (Sister with Daughter)
        if ((role.includes("Saudara Perempuan") || role.includes("Saudari")) && !allHeirs.some(h => h.role.includes("Saudara Laki-laki"))) {
            if (allHeirs.some(h => h.role === "Anak Perempuan" || h.role === "Cucu Perempuan")) {
                return "Ashabah ma'al Ghair";
            }
        }

        // Fallback for generic usage
        return "Ashabah";
    }

    // 4. Ashabul Furud (Fixed Share)
    // Check known fixed fractions
    const furudValues = ["1/2", "1/4", "1/8", "2/3", "1/3", "1/6"];
    if (furudValues.some(v => shareText.includes(v)) || !isNaN(parseFloat(shareText))) {
        return "Ashabul Furud";
    }

    return "Ashabul Furud"; // Default fallback
};

export function calculateFaraid(heirs: Heir[], totalHarta: number): CalculationResult {
    const steps: string[] = [];
    steps.push(`Menghitung total harta: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(totalHarta)}.`);

    // Pre-process: Apply Reasoning to all input heirs
    // This runs before anything else so we have the reasons ready
    const heirsWithReason = heirs.map(h => ({
        ...h,
        reason: getReason(h, heirs)
    }));

    // --- PHASE 1: Determine Base Shares (Collective Share Logic) ---

    // Special Check for Dzawil Arham to fix their ShareText if needed
    heirsWithReason.forEach(h => {
        if (h.reason?.includes("Dzawil Arham")) {
            h.baseShare = 0;
            h.baseShareText = "0 (Dzawil Arham)";
        }
    });

    // Group heirs by role to check for collectives
    const daughters = heirsWithReason.filter(h => h.role === "Anak Perempuan");
    const sisters = heirsWithReason.filter(h => h.role === "Saudara Perempuan Kandung" || h.role === "Sdr Perempuan Kandung" || h.role === "Saudari Kandung");

    // Map heirs to "ProcessedHeir" with potentially adjusted base shares
    let processedHeirs = heirsWithReason.map(h => ({ ...h, shareValue: h.baseShare, shareText: h.baseShareText }));

    // Fix: Anak Perempuan Berserikat
    if (daughters.length >= 2) {
        const collectiveShare = 2 / 3;
        const sharePerPerson = collectiveShare / daughters.length;
        steps.push(`Terdapat ${daughters.length} Anak Perempuan. Bagian 2/3 dibagi rata: ${(2 / 3).toFixed(3)} ÷ ${daughters.length} = ${sharePerPerson.toFixed(4)} per orang.`);

        processedHeirs = processedHeirs.map(h => {
            if (h.role === "Anak Perempuan") {
                return { ...h, shareValue: sharePerPerson, shareText: "2/3 (Berserikat)" };
            }
            return h;
        });
    }

    // Fix: Saudara Perempuan Berserikat
    if (sisters.length >= 2) {
        const collectiveShare = 2 / 3;
        // Check if input gave them collective or individual... assumes individual inputs for now
        // Force the share per person
        if (sisters[0].baseShareText.includes("2/3") || sisters[0].baseShare > 0.6) {
            // If calculateSharesAdvanced already gave 2/3 to EACH, we fix it.
            // If it gave 1/2 then we assume logic there handled it, but here strict.
            // Let's assume input reflects standard knowledge: >1 sister = 2/3.
            const sharePerPerson = collectiveShare / sisters.length;
            steps.push(`Terdapat ${sisters.length} Saudara Perempuan. Bagian 2/3 dibagi rata.`);
            processedHeirs = processedHeirs.map(h => {
                if (h.role === "Saudara Perempuan Kandung" || h.role === "Sdr Perempuan Kandung" || h.role === "Saudari Kandung") {
                    return { ...h, shareValue: sharePerPerson, shareText: "2/3 (Berserikat)" };
                }
                return h;
            });
        }
    }

    // --- PHASE 2: Calculate Sigma (Total Share) ---

    // Check Asabah Presence
    const asabahHeirs = processedHeirs.filter(h => h.shareText.includes("Asabah"));
    const furudhHeirs = processedHeirs.filter(h => !h.shareText.includes("Asabah"));

    // Calculate Asal Masalah (LCM of denominators) for Furudh only
    let asalMasalah = 1;
    furudhHeirs.forEach(h => {
        let denom = getDenominator(h.baseShareText);
        asalMasalah = lcm(asalMasalah, denom);
    });

    // Total used by Furudh
    let totalShare = furudhHeirs.reduce((sum, h) => sum + h.shareValue, 0);

    // Floating point tolerance
    const isOne = Math.abs(totalShare - 1.0) < 0.0001;
    const isMoreThanOne = totalShare > 1.0001;

    let status: "Normal" | "Aul" | "Radd" = "Normal";
    let finalHeirsResult: any[] = [];
    let asalMasalahFinal = asalMasalah;

    // --- PHASE 3: Condition Check (Aul vs Radd vs Normal) ---

    if (asabahHeirs.length > 0) {
        // HAS ASABAH
        if (isMoreThanOne) {
            status = "Aul";
            // Proceed to Aul logic (Asabah gets 0)
            steps.push(`Total bagian Ashabul Furudh (${totalShare.toFixed(2)}) melebihi 1, Asabah tidak mendapatkan sisa. Berlaku 'Aul.`);

            finalHeirsResult = processedHeirs.map(h => {
                const newShare = h.shareValue / totalShare;
                return {
                    ...h,
                    finalPercentage: newShare,
                    finalShareText: h.shareText.includes("Asabah") ? "0 (Habis)" : `${(newShare * 100).toFixed(1)}%`,
                    finalAmount: newShare * totalHarta,
                    note: h.shareText.includes("Asabah") ? "Tidak kebagian" : "Terkena 'Aul"
                };
            });

        } else {
            status = "Normal";
            const remainder = 1 - totalShare;
            steps.push(`Total Ashabul Furudh: ${totalShare.toFixed(2)}. Sisa ${remainder.toFixed(2)} untuk Asabah.`);

            const asabahShare = remainder / asabahHeirs.length;

            finalHeirsResult = [
                ...furudhHeirs.map(h => ({
                    ...h,
                    finalPercentage: h.shareValue,
                    finalShareText: h.shareText,
                    finalAmount: h.shareValue * totalHarta,
                    note: "Sesuai Furudh"
                })),
                ...asabahHeirs.map(h => ({
                    ...h,
                    finalPercentage: asabahShare,
                    finalShareText: "Sisa",
                    finalAmount: asabahShare * totalHarta,
                    note: "Asabah (Sisa)"
                }))
            ];
        }
    } else {
        // NO ASABAH
        if (isOne) {
            status = "Normal";
            steps.push("Total bagian pas (1). Pembagian Normal.");
            finalHeirsResult = processedHeirs.map(h => ({
                ...h,
                finalPercentage: h.shareValue,
                finalShareText: h.shareText,
                finalAmount: h.shareValue * totalHarta
            }));
        } else if (isMoreThanOne) {
            // 'AUL CASE
            status = "Aul";
            steps.push(`Total bagian (${totalShare.toFixed(2)}) melebihi 1. Berlaku 'Aul (Defisit).`);
            steps.push("Bagian setiap ahli waris dikurangi secara proporsional.");

            finalHeirsResult = processedHeirs.map(h => {
                const newShare = h.shareValue / totalShare;
                return {
                    ...h,
                    finalPercentage: newShare,
                    finalShareText: `${(newShare * 100).toFixed(1)}%`,
                    finalAmount: newShare * totalHarta,
                    note: "Terkena 'Aul"
                };
            });
        } else {
            // Case: Total < 1 (Residue exists) WITH FATHER CHECK
            const fatherHeir = processedHeirs.find(h => h.role === "Ayah");

            if (fatherHeir) {
                status = "Normal";
                steps.push(`Total bagian Ashabul Furudh (${totalShare.toFixed(2)}) kurang dari 1.`);
                steps.push("Karena ada Ayah, maka Ayah berhak mengambil SELURUH SISA harta (Ta'shib) setelah bagian Ashabul Furudh lain dibagikan.");

                const remainder = 1 - totalShare;

                finalHeirsResult = processedHeirs.map(h => {
                    if (h.role === "Ayah") {
                        const newShare = h.shareValue + remainder;
                        const cleanBase = h.shareText.replace(/ \+ (Sisa|Asabah)/gi, "").trim();
                        return {
                            ...h,
                            finalPercentage: newShare,
                            finalShareText: `${cleanBase} + Asabah`,
                            finalAmount: newShare * totalHarta,
                            note: "Mendapat Sisa (Asabah)"
                        };
                    } else {
                        return {
                            ...h,
                            finalPercentage: h.shareValue,
                            finalShareText: h.shareText,
                            finalAmount: h.shareValue * totalHarta
                        };
                    }
                });

            } else {
                // RADD CASE (No Father)
                status = "Radd";
                steps.push(`Total bagian (${totalShare.toFixed(2)}) kurang dari 1 dan tidak ada Asabah/Ayah. Berlaku Radd (Surplus).`);

                const spouseHeirs = processedHeirs.filter(h => h.isSpouse);
                const bloodHeirs = processedHeirs.filter(h => !h.isSpouse);

                if (spouseHeirs.length > 0) {
                    steps.push("Pasangan (Suami/Istri) tidak menerima Radd. Bagiannya TETAP.");
                    steps.push("Sisa harta dibagikan hanya kepada Ahli Waris Nasab secara proporsional.");

                    const spouseShareTotal = spouseHeirs.reduce((sum, h) => sum + h.shareValue, 0);
                    const remainder = 1 - spouseShareTotal;
                    const bloodBaseTotal = bloodHeirs.reduce((sum, h) => sum + h.shareValue, 0);

                    const processedSpouse = spouseHeirs.map(h => ({
                        ...h,
                        finalPercentage: h.shareValue,
                        finalAmount: h.shareValue * totalHarta,
                        finalShareText: h.shareText,
                        note: "Tetap (Tidak Radd)"
                    }));

                    const processedBlood = bloodHeirs.map(h => {
                        const ratio = h.shareValue / bloodBaseTotal;
                        const finalShare = ratio * remainder;
                        return {
                            ...h,
                            finalPercentage: finalShare,
                            finalAmount: finalShare * totalHarta,
                            finalShareText: `${(finalShare * 100).toFixed(1)}%`,
                            note: "Mendapat Radd"
                        };
                    });

                    finalHeirsResult = [...processedSpouse, ...processedBlood];

                } else {
                    steps.push("Semua sisa harta dikembalikan kepada ahli waris sebanding dengan bagian aslinya.");
                    finalHeirsResult = processedHeirs.map(h => {
                        const newShare = h.shareValue / totalShare;
                        return {
                            ...h,
                            finalPercentage: newShare,
                            finalShareText: `${(newShare * 100).toFixed(1)}%`,
                            finalAmount: newShare * totalHarta,
                            note: "Mendapat Radd"
                        };
                    });
                }
            }
        }
    }

    // --- NERACA CALCULATION ---
    const totalJatahAwal = furudhHeirs.reduce((sum, h) => sum + (h.shareValue * totalHarta), 0);
    const selisih = totalHarta - totalJatahAwal;

    let statusNeraca: "PAS" | "SISA" | "KURANG" = "PAS";
    if (selisih > 1) statusNeraca = "SISA";
    else if (selisih < -1) statusNeraca = "KURANG";
    // else PAS

    // Recalculate diff for final adjustment if needed
    const currentSum = finalHeirsResult.reduce((sum, h) => sum + h.finalAmount, 0);
    const finalDiff = totalHarta - currentSum;
    if (Math.abs(finalDiff) > 1 && finalHeirsResult.length > 0) {
        finalHeirsResult[finalHeirsResult.length - 1].finalAmount += finalDiff;
    }

    // --- FINAL STATUS ASSIGNMENT ---
    const finalHeirsWithStatus = finalHeirsResult.map(h => ({
        ...h,
        faraidStatus: getFaraidStatus(h, heirs, h.finalShareText, h.finalAmount)
    }));

    return {
        finalHeirs: finalHeirsWithStatus,
        status,
        totalHarta,
        explanationSteps: steps,
        asalMasalahInitial: asalMasalah,
        asalMasalahFinal: status === "Aul" ? Math.round(asalMasalah * 1.5) : asalMasalah, // Dummy approximate
        neraca: {
            totalJatahAwal,
            selisih,
            statusNeraca
        }
    };
}
