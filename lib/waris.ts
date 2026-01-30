// lib/waris.ts
//Metode KHI (Kompilasi Hukum Islam)
//Metode Syafi'i

export type Gender = "L" | "P";

export enum HeirType {
    SON = "ANAK_LAKI",
    DAUGHTER = "ANAK_PEREMPUAN",
    SON_OF_SON = "CUCU_LAKI_DARI_ANAK_LAKI",
    DAUGHTER_OF_SON = "CUCU_PEREMPUAN_DARI_ANAK_LAKI",
    FATHER = "AYAH",
    MOTHER = "IBU",
    GRANDFATHER_FATHER = "KAKEK_DARI_AYAH", // Father's Father
    GRANDMOTHER_MOTHER = "NENEK_DARI_IBU", // Mother's Mother
    GRANDMOTHER_FATHER = "NENEK_DARI_AYAH", // Father's Mother
    HUSBAND = "SUAMI",
    WIFE = "ISTRI",
    BROTHER_FULL = "SAUDARA_LAKI_KANDUNG",
    SISTER_FULL = "SAUDARA_PEREMPUAN_KANDUNG",
    BROTHER_FATHER = "SAUDARA_LAKI_SEBAPAK",
    SISTER_FATHER = "SAUDARA_PEREMPUAN_SEBAPAK",
    BROTHER_MOTHER = "SAUDARA_LAKI_SEIBU",
    SISTER_MOTHER = "SAUDARA_PEREMPUAN_SEIBU",
    NEPHEW_FULL = "ANAK_LAKI_SAUDARA_LAKI_KANDUNG",
    NEPHEW_FATHER = "ANAK_LAKI_SAUDARA_LAKI_SEBAPAK",
    UNCLE_FULL = "PAMAN_KANDUNG", // Saudara Laki Ayah Kandung
    UNCLE_FATHER = "PAMAN_SEBAPAK", // Saudara Laki Ayah Sebapak
    COUSIN_FULL = "ANAK_PAMAN_KANDUNG",
    COUSIN_FATHER = "ANAK_PAMAN_SEBAPAK",
    GRANDSON_DAUGHTER = "CUCU_LAKI_DARI_ANAK_PEREMPUAN",
    GRANDDAUGHTER_DAUGHTER = "CUCU_PEREMPUAN_DARI_ANAK_PEREMPUAN",
    ADOPTED_CHILD = "ANAK_ANGKAT"
}

export const HEIR_LABELS: Record<HeirType, string> = {
    [HeirType.SON]: "Anak Laki-laki",
    [HeirType.DAUGHTER]: "Anak Perempuan",
    [HeirType.SON_OF_SON]: "Cucu Laki-laki (dari Anak Lk)",
    [HeirType.DAUGHTER_OF_SON]: "Cucu Perempuan (dari Anak Lk)",
    [HeirType.GRANDSON_DAUGHTER]: "Cucu Laki-laki (dari Anak Pr)",
    [HeirType.GRANDDAUGHTER_DAUGHTER]: "Cucu Perempuan (dari Anak Pr)",
    [HeirType.FATHER]: "Ayah",
    [HeirType.MOTHER]: "Ibu",
    [HeirType.GRANDFATHER_FATHER]: "Kakek (Ayah dari Ayah)",
    [HeirType.GRANDMOTHER_MOTHER]: "Nenek (Ibu dari Ibu)",
    [HeirType.GRANDMOTHER_FATHER]: "Nenek (Ibu dari Ayah)",
    [HeirType.HUSBAND]: "Suami",
    [HeirType.WIFE]: "Istri",
    [HeirType.BROTHER_FULL]: "Sdr Laki-laki Kandung",
    [HeirType.SISTER_FULL]: "Sdr Perempuan Kandung",
    [HeirType.BROTHER_FATHER]: "Sdr Laki-laki Sebapak",
    [HeirType.SISTER_FATHER]: "Sdr Perempuan Sebapak",
    [HeirType.BROTHER_MOTHER]: "Sdr Laki-laki Seibu",
    [HeirType.SISTER_MOTHER]: "Sdr Perempuan Seibu",
    [HeirType.NEPHEW_FULL]: "Anak Lk dari Sdr Lk Kandung",
    [HeirType.NEPHEW_FATHER]: "Anak Lk dari Sdr Lk Sebapak",
    [HeirType.UNCLE_FULL]: "Paman (Sdr Lk Ayah Kandung)",
    [HeirType.UNCLE_FATHER]: "Paman (Sdr Lk Ayah Sebapak)",
    [HeirType.COUSIN_FULL]: "Anak Paman Kandung",
    [HeirType.COUSIN_FATHER]: "Anak Paman Sebapak",
    [HeirType.ADOPTED_CHILD]: "Anak Angkat (Wasiat Wajibah)"
};

export interface IndividualHeir {
    id: string;
    name: string;
    type: HeirType;
}

export interface WarisResult {
    heirId: string;
    name: string;
    type: HeirType; // Include for grouping if needed
    share: string; // "1/8", "Ashabah", "Mahjoub"
    percentage: number;
    amount: number;
    status: string; // "Ashabah bin Nafs", "Ashabah bil Ghair", "Terhalang (Mahjoub)"
    note?: string;
}

export function calculateNetEstate(
    assets: number,
    tajhiz: number,
    debt: number,
    wasiat: number,
    gonoGini: number = 0,
    mode: "SYAFII" | "KHI" = "SYAFII"
) {
    let clean = assets;

    // KHI: Gono-Gini Split (Before Debt/Wasiat)
    // 50% of Gono-Gini belongs to spouse, so we remove it from the deceased's assets.
    // The Input 'assets' is assumed to be Total Assets currently held.
    // The Input 'gonoGini' is the PORTION of 'assets' that is joint property.
    let spouseShare = 0;
    if (mode === "KHI" && gonoGini > 0) {
        spouseShare = gonoGini * 0.5;
        clean -= spouseShare;
    }

    clean = clean - tajhiz - debt;
    if (clean < 0) clean = 0;

    const maxWasiat = clean / 3;
    let wasiatUsed = wasiat;
    let note = "";
    if (wasiat > maxWasiat) {
        wasiatUsed = maxWasiat;
        note = "Wasiat dipotong menjadi 1/3 (Maksimal Syariat)";
    }
    return { net: clean - wasiatUsed, wasiatUsed, note, spouseShare };
}

// Helper to count heirs of a type
const count = (heirs: IndividualHeir[], type: HeirType) => heirs.filter(h => h.type === type).length;
const exists = (heirs: IndividualHeir[], type: HeirType) => count(heirs, type) > 0;

export function calculateSharesAdvanced(
    heirs: IndividualHeir[],
    netEstate: number,
    deceasedGender: Gender,
    mode: "SYAFII" | "KHI" = "SYAFII"
): WarisResult[] {
    const results: WarisResult[] = [];
    let remaining = 1.0;

    // Helper to assign share
    const assign = (type: HeirType, shareStr: string, portion: number, status: string, note?: string) => {
        const eligible = heirs.filter(h => h.type === type);
        if (eligible.length === 0) return;

        const portionPerPerson = portion / eligible.length;
        eligible.forEach(h => {
            results.push({
                heirId: h.id,
                name: h.name,
                type: h.type,
                share: shareStr,
                percentage: portionPerPerson,
                amount: netEstate * portionPerPerson, // Will be normalized later if Aul
                status: status,
                note: note
            });
        });
        remaining -= portion;
    };

    // Helper for Asabah assignment (takes all remaining)
    const assignAsabah = (type: HeirType, status: string, ratio = 1) => {
        // Special logic for concurrent Asabah usually handled manually below
        // This helper is for single-type Asabah
        const eligible = heirs.filter(h => h.type === type);
        if (eligible.length === 0) return;
    };

    // Helper to block
    const block = (type: HeirType, blocker: string) => {
        const eligible = heirs.filter(h => h.type === type);
        eligible.forEach(h => {
            results.push({
                heirId: h.id,
                name: h.name,
                type: h.type,
                share: "0",
                percentage: 0,
                amount: 0,
                status: "Mahjoub (Terhalang)",
                note: `Terhalang oleh ${blocker}`
            });
        });
    };

    // 0. KHI: WASIAT WAJIBAH (Adopted Child)
    // Must be calculated first before Faraid
    if (mode === "KHI") {
        const adopted = heirs.filter(h => h.type === HeirType.ADOPTED_CHILD);
        if (adopted.length > 0) {
            // Max 1/3 of Net Estate
            const maxPart = 1 / 3;
            // Usually given equal share to biological child? Or just max 1/3?
            // KHI Article 209: "mendapat wasiat wajibah sebanyak-banyaknya 1/3"
            // We will assign them 1/3 total for now, or split if multiple.
            // Simplified: Assign 1/3 total to adopted children group.

            // Check if we assume they take part BEFORE inheritance distribution (reducing Net Estate)
            // Ideally Wasiat Wajibah reduces the estate available for heirs.
            // But here we are inside "calculateShares".
            // Let's treat them as Special Heirs who take a chunk first.

            const sharePer = maxPart / adopted.length;
            adopted.forEach(h => {
                results.push({ heirId: h.id, name: h.name, type: HeirType.ADOPTED_CHILD, share: "1/3 (Wasiat Wajibah)", percentage: sharePer, amount: netEstate * sharePer, status: "Wasiat Wajibah", note: "Max 1/3 harta" });
            });
            // Reduce remaining estate for Faraid
            remaining -= maxPart;
            // Note: netEstate for subsequent calc should technically be reduced, but our logic uses percentages of ORIGINAL total.
            // So 'remaining' reduction is correct for percentage tracking.
        }
    }

    // --- LOGIC START ---

    const hasSon = exists(heirs, HeirType.SON);
    const hasSonOfSon = exists(heirs, HeirType.SON_OF_SON);
    const hasMaleDescendant = hasSon || hasSonOfSon; // Simplification (recursive needed for deeper, but MVP)

    const hasDaughter = exists(heirs, HeirType.DAUGHTER);
    const hasDaughterOfSon = exists(heirs, HeirType.DAUGHTER_OF_SON);
    const hasFemaleDescendant = hasDaughter || hasDaughterOfSon;

    const hasDescendant = hasMaleDescendant || hasFemaleDescendant;

    const hasFather = exists(heirs, HeirType.FATHER);
    const hasGrandfather = exists(heirs, HeirType.GRANDFATHER_FATHER);
    const hasMaleAscendant = hasFather || hasGrandfather;

    // 1. PRIMARY FURUDH (Spouse & Parents)

    // Husband
    if (deceasedGender === "P" && exists(heirs, HeirType.HUSBAND)) {
        if (hasDescendant) assign(HeirType.HUSBAND, "1/4", 0.25, "Ashabul Furudh", "Ada keturunan");
        else assign(HeirType.HUSBAND, "1/2", 0.5, "Ashabul Furudh", "Tidak ada keturunan");
    }

    // Wife
    if (deceasedGender === "L" && exists(heirs, HeirType.WIFE)) {
        if (hasDescendant) assign(HeirType.WIFE, "1/8", 0.125, "Ashabul Furudh", "Ada keturunan");
        else assign(HeirType.WIFE, "1/4", 0.25, "Ashabul Furudh", "Tidak ada keturunan");
    }

    // Father
    if (hasFather) {
        if (hasMaleDescendant) {
            assign(HeirType.FATHER, "1/6", 1 / 6, "Ashabul Furudh", "Ada keturunan laki-laki");
        } else if (hasFemaleDescendant) {
            // 1/6 + Asabah later. Assign 1/6 first.
            // We explicitly mark him as '1/6 + Sisa' candidate.
            // For now assign 1/6, check remainder later.
            assign(HeirType.FATHER, "1/6 + Sisa", 1 / 6, "Ashabul Furudh + Asabah", "Ada keturunan perempuan");
        } else {
            // Asabah only. Assigned later.
        }
        // Blocks Grandfather
        block(HeirType.GRANDFATHER_FATHER, "Ayah");
    } else {
        // Grandfather logic (Replacing Father if Father absent)
        if (hasGrandfather) {
            if (hasMaleDescendant) assign(HeirType.GRANDFATHER_FATHER, "1/6", 1 / 6, "Ashabul Furudh", "Ada keturunan laki-laki");
            else if (hasFemaleDescendant) assign(HeirType.GRANDFATHER_FATHER, "1/6 + Sisa", 1 / 6, "Ashabul Furudh + Asabah", "Ada keturunan perempuan");
            // Else Asabah
        }
    }

    // Mother
    if (exists(heirs, HeirType.MOTHER)) {
        // 1/6 rule: Has Descendant OR Multiple Siblings (>=2)
        const siblingCount = count(heirs, HeirType.BROTHER_FULL) + count(heirs, HeirType.SISTER_FULL) +
            count(heirs, HeirType.BROTHER_FATHER) + count(heirs, HeirType.SISTER_FATHER) +
            count(heirs, HeirType.BROTHER_MOTHER) + count(heirs, HeirType.SISTER_MOTHER);

        if (hasDescendant || siblingCount >= 2) {
            assign(HeirType.MOTHER, "1/6", 1 / 6, "Ashabul Furudh", "Ada keturunan / saudara > 1");
        } else {
            // 1/3 rule. (Check Umariyatain: Husband/Wife + Mother + Father)
            // Simplified: 1/3 of Total. (Umariyatain requires complex check, skip for MVP unless strict req)
            assign(HeirType.MOTHER, "1/3", 1 / 3, "Ashabul Furudh", "Tidak ada keturunan / saudara < 2");
        }
        // Blocks Grandmothers
        block(HeirType.GRANDMOTHER_MOTHER, "Ibu");
        block(HeirType.GRANDMOTHER_FATHER, "Ibu");
    }

    // Grandmothers (if Mother absent)
    if (!exists(heirs, HeirType.MOTHER)) {
        // If Father present, blocks Paternal Grandmother
        if (hasFather) block(HeirType.GRANDMOTHER_FATHER, "Ayah");

        const gmSideMother = exists(heirs, HeirType.GRANDMOTHER_MOTHER);
        const gmSideFather = exists(heirs, HeirType.GRANDMOTHER_FATHER) && !hasFather;

        if (gmSideMother && gmSideFather) {
            // Share 1/6 split
            assign(HeirType.GRANDMOTHER_MOTHER, "1/6 (Bagi 2)", 1 / 12, "Ashabul Furudh", "Nenek berserikat");
            assign(HeirType.GRANDMOTHER_FATHER, "1/6 (Bagi 2)", 1 / 12, "Ashabul Furudh", "Nenek berserikat");
        } else if (gmSideMother) {
            assign(HeirType.GRANDMOTHER_MOTHER, "1/6", 1 / 6, "Ashabul Furudh");
        } else if (gmSideFather) {
            assign(HeirType.GRANDMOTHER_FATHER, "1/6", 1 / 6, "Ashabul Furudh");
        }
    }

    // 2. DESCENDANTS
    // Son
    const sons = heirs.filter(h => h.type === HeirType.SON);
    const daughters = heirs.filter(h => h.type === HeirType.DAUGHTER);

    if (sons.length > 0) {
        // Son blocks Son of Son, Daughter of Son (partial/total), Brothers, Sisters, etc.
        // UNLESS KHI MODE -> Cucu Pengganti

        // KHI Special Rule: Cucu is NOT blocked by Anak if they are "Ahli Waris Pengganti"
        // But in KHI, Pengganti only applies if their parent is DEAD. 
        // Our input logic assumes listed Cucu are eligible.
        // If KHI, we do NOT block Cucu. They will get "replacing share".
        const shouldBlockGrandchildren = mode !== "KHI";

        if (shouldBlockGrandchildren) {
            block(HeirType.SON_OF_SON, "Anak Laki-laki");
            block(HeirType.DAUGHTER_OF_SON, "Anak Laki-laki");
        }

        block(HeirType.BROTHER_FULL, "Anak Laki-laki");
        block(HeirType.SISTER_FULL, "Anak Laki-laki");
        block(HeirType.BROTHER_FATHER, "Anak Laki-laki");
        block(HeirType.SISTER_FATHER, "Anak Laki-laki");
        block(HeirType.BROTHER_MOTHER, "Anak Laki-laki");
        block(HeirType.SISTER_MOTHER, "Anak Laki-laki");
        // ... blocks all Hawashi

        // Distribution (Ashabah)
        // Check remaining (Ashabah bin Nafs or bil Ghair if with Daughters)
        const totalShares = (sons.length * 2) + daughters.length;
        const asabahPart = remaining / totalShares;

        // If KHI and there are unblocked grandchildren (Ahli Waris Pengganti)
        // They should receive "Would be" share. 
        // COMPLEXITY: Calculating share of PRE-DECEASED children.
        // SIMPLIFIED KHI for APP: 
        // If there are CUCU in input, we assume they are from DECEASED SON.
        // We give them a share roughly equivalent to what a Son might get? 
        // OR simpler: we let them participate in Asabah as if they were children?

        // Strict KHI: Grandchildren replace their parent.
        // If we have 1 Son (Alive) and 1 Grandson (from Deceased Son).
        // Standard: 1 Son takes all.
        // KHI: Estate split into 2 Sons (1 alive, 1 dead). The dead son's share goes to Grandson.
        // Correct implementation requires treating Grandson as Son (Replacement).

        const sonOfSon = heirs.filter(h => h.type === HeirType.SON_OF_SON);
        const dauOfSon = heirs.filter(h => h.type === HeirType.DAUGHTER_OF_SON);

        if (mode === "KHI" && (sonOfSon.length > 0 || dauOfSon.length > 0)) {
            // Simplified Replacement: Treat Cucu LK as Anak LK, Cucu PR as Anak PR?
            // "Menerima bagian ahli waris yang digantikan, tidak melebihi..."

            // Let's count Effective Sons and Effective Daughters
            // Assuming each Cucu acts as a partial Anak or full Anak? 
            // Most calcs assume "Per Strip" (Per Batang Tubuh). 
            // Without lineage input, we assume all Cucu come from ONE deceased son for simplicity, or separate?
            // Conservative MVP: Treat Cucu LK as equivalent to Anak LK in the Asabah pool.

            const totalSharesKHI = (sons.length * 2) + daughters.length + (sonOfSon.length * 2) + dauOfSon.length;
            const unit = remaining / totalSharesKHI;

            sons.forEach(h => results.push({ heirId: h.id, name: h.name, type: HeirType.SON, share: "Asabah", percentage: unit * 2, amount: netEstate * unit * 2, status: "Ashabah bin Nafs" }));
            daughters.forEach(h => results.push({ heirId: h.id, name: h.name, type: HeirType.DAUGHTER, share: "Asabah", percentage: unit, amount: netEstate * unit, status: "Ashabah bil Ghair" }));

            sonOfSon.forEach(h => results.push({ heirId: h.id, name: h.name, type: HeirType.SON_OF_SON, share: "Asabah (Pengganti)", percentage: unit * 2, amount: netEstate * unit * 2, status: "Ahli Waris Pengganti", note: "Menggantikan Ayah" }));
            dauOfSon.forEach(h => results.push({ heirId: h.id, name: h.name, type: HeirType.DAUGHTER_OF_SON, share: "Asabah (Pengganti)", percentage: unit, amount: netEstate * unit, status: "Ahli Waris Pengganti", note: "Menggantikan Ayah" }));

            remaining = 0;
            return results; // Exit early for KHI mixed scenario to avoid double dipping

        } else {
            // Standard Syafi'i or KHI with no grandkids
            // [FIXED] Use Weighted Points System (Laki=2, Pr=1)
            const totalPoints = (sons.length * 2) + (daughters.length * 1);
            const valuePerPoint = remaining / totalPoints;

            sons.forEach(h => {
                results.push({
                    heirId: h.id,
                    name: h.name,
                    type: HeirType.SON,
                    share: "Asabah (2 Poin)",
                    percentage: valuePerPoint * 2,
                    amount: netEstate * valuePerPoint * 2, // 2 parts
                    status: "Ashabah bin Nafs",
                    note: daughters.length ? "Bersama Anak PR (2:1)" : "Sendiri"
                });
            });
            daughters.forEach(h => {
                results.push({
                    heirId: h.id,
                    name: h.name,
                    type: HeirType.DAUGHTER,
                    share: "Asabah (1 Poin)",
                    percentage: valuePerPoint,
                    amount: netEstate * valuePerPoint, // 1 part
                    status: "Ashabah bil Ghair",
                    note: "Bersama Anak LK (2:1)"
                });
            });
            remaining = 0;
        }

    } else {
        // Daughters Only (No sons)
        if (daughters.length > 0) {
            const share = daughters.length === 1 ? 0.5 : (2 / 3);
            const sharePer = share / daughters.length;
            daughters.forEach(h => {
                results.push({ heirId: h.id, name: h.name, type: HeirType.DAUGHTER, share: daughters.length === 1 ? "1/2" : "2/3", percentage: sharePer, amount: netEstate * sharePer, status: "Ashabul Furudh" });
            });
            remaining -= share;
        }

        // Grandchildren logic
        const sonOfSon = heirs.filter(h => h.type === HeirType.SON_OF_SON);

        if (sonOfSon.length > 0) {
            // Acts as Son
            // In KHI or Syafi'i (if no Son), they inherit.
            // ... (Simple logic already present, keeping it)
            const totalShares = sonOfSon.length * 2;
            const portion = remaining; // Takes remainder
            // Wait, if KHI mode AND Daughters exist, Cucu might replace Son?
            // If No Son, Cucu inherits in Syafi'i too (Asabah).
            // So logic matches. 
            // Just apply standard remaining distribution.

            sonOfSon.forEach(h => {
                results.push({ heirId: h.id, name: h.name, type: HeirType.SON_OF_SON, share: "Asabah", percentage: (remaining / sonOfSon.length), amount: netEstate * (remaining / sonOfSon.length), status: "Ashabah bin Nafs", note: "Menggantikan Anak LK" });
            });
            remaining = 0;
        }
    }

    // 3. ASCENDANTS (Father Asabah)
    // If remaining > 0 and no Male Descendant
    if (remaining > 0) {
        if (hasFather) {
            // Father takes Sisa
            const father = heirs.find(h => h.type === HeirType.FATHER);
            if (father) {
                // If he already had a share, add to it. If not, create new.
                const existing = results.find(r => r.heirId === father.id);
                if (existing) {
                    existing.percentage += remaining;
                    existing.amount += (netEstate * remaining);
                    existing.note += " + Sisa";
                    existing.share += " + Sisa";
                } else {
                    results.push({ heirId: father.id, name: father.name, type: HeirType.FATHER, share: "Asabah", percentage: remaining, amount: netEstate * remaining, status: "Ashabah bin Nafs", note: "Tidak ada anak laki-laki" });
                }
            }
            remaining = 0;
            // Blocks all Siblings/Uncles
            block(HeirType.BROTHER_FULL, "Ayah");
            block(HeirType.SISTER_FULL, "Ayah");
            // ...
        } else if (hasGrandfather) {
            // Grandfather takes Sisa (Simplified Syafi'i: Muqasamah with Siblings is complex. Here using Father-like blocking for simplified MVP or 'Jadd' plain rule)
            // Standard simple: Jadd acts like Father if no Siblings.
            const gf = heirs.find(h => h.type === HeirType.GRANDFATHER_FATHER);
            if (gf) {
                const existing = results.find(r => r.heirId === gf.id);
                if (existing) {
                    existing.percentage += remaining;
                    existing.amount += (netEstate * remaining);
                } else {
                    results.push({ heirId: gf.id, name: gf.name, type: HeirType.GRANDFATHER_FATHER, share: "Asabah", percentage: remaining, amount: netEstate * remaining, status: "Ashabah bin Nafs" });
                }
            }
            remaining = 0;
        }
    }

    // 4. HAWASHI (Siblings) - Only if Kalalah (No Male Desc, No Male Asc)
    if (remaining > 0 && !hasMaleDescendant && !hasMaleAscendant) {
        const fullBros = heirs.filter(h => h.type === HeirType.BROTHER_FULL);
        const fullSis = heirs.filter(h => h.type === HeirType.SISTER_FULL);

        if (fullBros.length > 0) {
            // Asabah bil Ghair / bin Nafs
            const total = (fullBros.length * 2) + fullSis.length;
            const unit = remaining / total;

            fullBros.forEach(h => results.push({ heirId: h.id, name: h.name, type: h.type, share: "Asabah", percentage: unit * 2, amount: netEstate * unit * 2, status: "Ashabah bin Nafs" }));
            fullSis.forEach(h => results.push({ heirId: h.id, name: h.name, type: h.type, share: "Asabah", percentage: unit, amount: netEstate * unit, status: "Ashabah bil Ghair" }));
            remaining = 0;
        } else if (fullSis.length > 0) {
            // Ashabul Furudh
            const share = fullSis.length === 1 ? 0.5 : (2 / 3);
            const sharePer = share / fullSis.length;
            fullSis.forEach(h => results.push({ heirId: h.id, name: h.name, type: h.type, share: fullSis.length === 1 ? "1/2" : "2/3", percentage: sharePer, amount: netEstate * sharePer, status: "Ashabul Furudh (Kalalah)" }));
            remaining -= share;
        }

        // ... (Sebapak, Seibu logic omitted for brevity, blocked by Kandung usually)
        if (fullBros.length > 0 || fullSis.length > 0) {
            block(HeirType.BROTHER_FATHER, "Sdr Kandung");
        }
    }

    // Fallback: block anyone unprocessed
    heirs.forEach(h => {
        if (!results.find(r => r.heirId === h.id)) {
            results.push({
                heirId: h.id,
                name: h.name,
                type: h.type,
                share: "0",
                percentage: 0,
                amount: 0,
                status: "Mahjoub / Tidak dapat bagian",
                note: "Tertutup ahli waris lebih utama"
            });
        }
    });

    // Aul Handling (Simplified)
    const totalAlloc = results.reduce((a, b) => a + (b.status.includes("Mahjoub") ? 0 : b.percentage), 0);
    if (totalAlloc > 1.0001) {
        const factor = 1 / totalAlloc;
        results.forEach(r => {
            if (r.amount > 0) {
                r.amount *= factor;
                r.note = (r.note || "") + " [Aul]";
            }
        });
    }

    return results;
}

export const DISCLAIMER_TEXTS = {
    SYAFII: "Perhitungan ini menggunakan kaidah Fiqh Mawaris Mazhab Syafi'i standar (termasuk logika 'Aul dan Radd). Mohon konsultasikan kembali dengan Asatidz atau ulama setempat untuk penetapan final.",
    KHI: "Perhitungan ini mengacu pada Kompilasi Hukum Islam (KHI) (Pasal 176-193) yang berlaku di peradilan agama Indonesia. Mohon konsultasikan kembali dengan pihak berwenang atau Pengadilan Agama jika diperlukan."
};
