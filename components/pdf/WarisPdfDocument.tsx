import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils';
import { IndividualHeir, HEIR_LABELS, DISCLAIMER_TEXTS } from '@/lib/waris';
import { CalculationResult } from '@/lib/warisLogic';

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: '2.54cm',
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#334155', // slate-700
        lineHeight: 1.5,
    },
    // Header
    header: {
        marginBottom: 20,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#0d9488', // teal-600
        paddingBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f766e', // teal-700
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 9,
        color: '#64748b', // slate-500
    },
    // Section Utils
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0f766e',
        marginBottom: 8,
        backgroundColor: '#ccfbf1', // teal-50
        padding: '4 8',
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    // Harta Section
    hartaGrid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 10,
    },
    hartaCol: {
        flex: 1,
    },
    rowDotted: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0', // slate-200
        borderBottomStyle: 'dotted',
        paddingBottom: 2,
        alignItems: 'flex-end',
    },
    label: { fontSize: 9, color: '#475569' },
    value: { fontSize: 9, fontWeight: 'bold' },

    netSection: {
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    netLabel: { fontSize: 10, fontWeight: 'bold', color: '#334155' },
    netValue: { fontSize: 12, fontWeight: 'bold', color: '#0f766e' },

    // Status & Neraca Box
    statusBox: {
        backgroundColor: '#F3F4F6', // gray-100
        borderRadius: 6,
        padding: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 20,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        paddingBottom: 5,
    },
    statusBadge: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#0f766e',
        backgroundColor: '#ffffff',
        padding: '2 6',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#0d9488',
    },
    neracaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },

    // Ahli Waris Grid
    heirGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    heirCard: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
        padding: 8,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ccfbf1',
        color: '#0f766e',
        fontSize: 9,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#99f6e4',
    },
    avatarText: { fontWeight: 'bold' },

    // Table
    tableContainer: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f1f5f9', // slate-100
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        padding: 6,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: '6 8',
        alignItems: 'flex-start',
    },
    th: { fontSize: 9, fontWeight: 'bold', color: '#334155' },
    td: { fontSize: 9, color: '#334155' },

    colName: { width: '20%' },
    colRole: { width: '30%' },
    colShare: { width: '15%', textAlign: 'center' },
    colAmount: { width: '35%', textAlign: 'right' },

    roleSub: { fontSize: 7, color: '#d97706', marginTop: 2 }, // amber-600
    badgeOutline: {
        padding: '1 4',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        fontSize: 7,
        marginTop: 2,
        alignSelf: 'flex-start',
        color: '#64748b',
    },

    tableFooter: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#0f766e', // Accent
    },

    // Footer / Sig
    footer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    disclaimer: {
        width: '60%',
        fontSize: 7,
        color: '#94a3b8',
        textAlign: 'justify',
    },
    signature: {
        width: '30%',
        textAlign: 'center',
    },
    sigLine: {
        borderTopWidth: 1,
        borderTopColor: '#94a3b8',
        marginTop: 40,
        width: '100%',
    },
});

interface WarisPdfDocumentProps {
    data: {
        assets: string;
        tajhiz: string;
        debt: string;
        wasiat: string;
        gonoGini?: string;
    };
    heirs: IndividualHeir[];
    result: CalculationResult;
    deceasedGender: "L" | "P";
    calculationMode?: "SYAFII" | "KHI";
}

export function WarisPdfDocument({ data, heirs, result, deceasedGender, calculationMode = "SYAFII" }: WarisPdfDocumentProps) {
    const parseVal = (val: string) => parseInt(val?.replace(/\D/g, "") || "0");
    const numAssets = parseVal(data.assets);
    const numTajhiz = parseVal(data.tajhiz);
    const numDebt = parseVal(data.debt);
    const numWasiat = parseVal(data.wasiat);
    const numGonoGini = parseVal(data.gonoGini || "0");

    const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    // Prepare Rows
    const rows = heirs.map((inputHeir) => {
        const matched = result.finalHeirs.find(r => r.id === inputHeir.id);
        let reasonText = matched?.note || "";
        const isAsabah = matched?.finalShareText?.includes("Sisa") || matched?.baseShareText === "Asabah";

        if (!reasonText && isAsabah) {
            reasonText = "Sisa (Asabah)";
        }

        // Gono-Gini Logic for Spouse
        const isSpouse = matched?.role === "Istri" || matched?.role === "Suami";
        const gonoShare = (isSpouse && calculationMode === "KHI" && numGonoGini > 0) ? numGonoGini * 0.5 : 0;

        return {
            ...inputHeir,
            role: HEIR_LABELS[inputHeir.type],
            share: matched?.finalShareText || "-",
            amount: matched?.finalAmount || 0,
            status: matched?.faraidStatus || "Ashabul Furud",
            note: reasonText,
            isAsabah,
            gonoShare, // Added for Table
            totalReceive: (matched?.finalAmount || 0) + gonoShare
        };
    });

    const totalDistributed = rows.reduce((acc, curr) => acc + curr.totalReceive, 0);
    // Note: totalDistributed in PDF footer usually refers to Waris Distributed. 
    // But now with GonoGini, the logic implies simple addition. 
    // However, technically GonoGini is NOT "Waris". 
    // Let's keep totalDistributed as Waris Only for the footer matching Net Estate, 
    // or separate it. The UI WarisResult keeps Total Terbagi as Waris Only.
    // Let's stick to Waris Only for "Total Nominal Terbagi" to match Net Estate, 
    // OR explicitly label it.
    // User Requirement: "Grand Total: Display the sum of both values clearly." (Inside the cell).
    // For the footer "Total Nominal Terbagi", if we include GonoGini it won't match "Harta Bersih".
    // Let's calculate total distributed WARIS only for the footer check.
    const totalWarisDistributed = rows.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>LAPORAN PEMBAGIAN WARIS ISLAM</Text>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f766e', marginBottom: 2 }}>
                        Metode: {calculationMode === "KHI" ? "Kompilasi Hukum Islam (KHI) - Indonesia" : "Mazhab Syafi'i (Standar)"}
                    </Text>
                    <Text style={styles.subtitle}>
                        Dicetak otomatis oleh Aplikasi DISA - Daarussyifa Islamic Super App pada {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </Text>
                </View>

                {/* SECTION 1: HARTA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. HARTA PENINGGALAN (TIRKAH)</Text>
                    <View style={styles.hartaGrid}>
                        <View style={styles.hartaCol}>
                            {/* KHI Gono-Gini Breakdown */}
                            {calculationMode === "KHI" && numGonoGini > 0 ? (
                                <>
                                    <View style={styles.rowDotted}>
                                        <Text style={styles.label}>Total Aset (Suami+Istri)</Text>
                                        <Text style={styles.value}>{formatCurrency(numAssets)}</Text>
                                    </View>
                                    <View style={styles.rowDotted}>
                                        <Text style={{ ...styles.label, fontStyle: 'italic' }}>Total Harta Bersama (Gono-Gini)</Text>
                                        <Text style={{ ...styles.value, fontStyle: 'italic' }}>{formatCurrency(numGonoGini)}</Text>
                                    </View>
                                    <View style={styles.rowDotted}>
                                        <Text style={{ ...styles.label, color: '#dc2626' }}>(-) Hak Pasangan (50%)</Text>
                                        <Text style={{ ...styles.value, color: '#dc2626' }}>({formatCurrency(numGonoGini * 0.5)})</Text>
                                    </View>
                                    <View style={styles.rowDotted}>
                                        <Text style={{ ...styles.label, fontWeight: 'bold', color: '#0f766e' }}>Aset Waris (Milik Mayit)</Text>
                                        <Text style={{ ...styles.value, color: '#0f766e' }}>{formatCurrency(numAssets - (numGonoGini * 0.5))}</Text>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.rowDotted}>
                                    <Text style={styles.label}>Total Aset</Text>
                                    <Text style={styles.value}>{formatCurrency(numAssets)}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.hartaCol}>
                            <View style={styles.rowDotted}>
                                <Text style={styles.label}>Biaya Tajhiz</Text>
                                <Text style={styles.value}>{formatCurrency(numTajhiz)}</Text>
                            </View>
                            <View style={styles.rowDotted}>
                                <Text style={styles.label}>Hutang</Text>
                                <Text style={styles.value}>{formatCurrency(numDebt)}</Text>
                            </View>
                            <View style={styles.rowDotted}>
                                <Text style={styles.label}>Wasiat</Text>
                                <Text style={styles.value}>{formatCurrency(numWasiat)}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.netSection}>
                        <Text style={styles.netLabel}>HARTA BERSIH (NET)</Text>
                        <Text style={styles.netValue}>{formatCurrency(result.totalHarta)}</Text>
                    </View>
                </View>

                {/* SECTION 2: NERACA */}
                <View style={styles.statusBox}>
                    <View style={styles.statusHeader}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>RINGKASAN STATUS</Text>
                        <Text style={styles.statusBadge}>
                            KONDISI: {result.status.toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.neracaRow}>
                        <Text style={styles.label}>Total Harta Bersih</Text>
                        <Text style={styles.value}>{formatCurrency(result.totalHarta)}</Text>
                    </View>
                    <View style={styles.neracaRow}>
                        <Text style={styles.label}>Total Telah Terbagi (Waris)</Text>
                        <Text style={styles.value}>{formatCurrency(totalWarisDistributed)}</Text>
                    </View>
                    <View style={{ ...styles.neracaRow, marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                        <Text style={styles.label}>Selisih / Sisa</Text>
                        <Text style={{ ...styles.value, color: result.neraca.selisih !== 0 ? '#d97706' : '#059669' }}>
                            {result.neraca.selisih === 0 ? "PAS / HABIS" : formatCurrency(result.neraca.selisih)}
                        </Text>
                    </View>
                </View>

                {/* SECTION 3: AHLI WARIS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. DAFTAR AHLI WARIS ({deceasedGender === "L" ? "Mayit: Laki-laki" : "Mayit: Perempuan"})</Text>
                    <View style={styles.heirGrid}>
                        {heirs.map((h, i) => (
                            <View key={i} style={styles.heirCard}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>{getInitials(h.name).substring(0, 1)}</Text>
                                </View>
                                <View>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{h.name}</Text>
                                    <Text style={{ fontSize: 8, color: '#64748b' }}>{HEIR_LABELS[h.type]}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* SECTION 4: TABEL */}
                <View style={styles.section} break>
                    <Text style={styles.sectionTitle}>4. HASIL PEMBAGIAN WARIS</Text>
                    <View style={styles.tableContainer}>
                        {/* Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.th, styles.colName]}>NAMA</Text>
                            <Text style={[styles.th, styles.colRole]}>KEDUDUKAN & STATUS</Text>
                            <Text style={[styles.th, styles.colShare]}>BAGIAN</Text>
                            <Text style={[styles.th, styles.colAmount]}>NOMINAL</Text>
                        </View>
                        {/* Body */}
                        {rows.map((row) => (
                            <View key={row.id} style={styles.tableRow}>
                                <Text style={[styles.td, styles.colName, { fontWeight: 'bold' }]}>{row.name}</Text>

                                <View style={styles.colRole}>
                                    <Text style={[styles.td]}>{row.role}</Text>
                                    {row.note ? <Text style={styles.roleSub}>{row.note}</Text> : null}
                                    <Text style={[
                                        styles.badgeOutline,
                                        row.status.includes("Ashabah") ? { fontStyle: 'italic', color: '#64748b', borderColor: '#94a3b8' } : {}
                                    ]}>
                                        {row.status}
                                    </Text>
                                </View>

                                <Text style={[styles.td, styles.colShare]}>{row.share}</Text>

                                <View style={styles.colAmount}>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold', textAlign: 'right' }}>
                                        {formatCurrency(row.amount)}
                                    </Text>
                                    {/* Gono Gini Breakdown */}
                                    {row.gonoShare > 0 && (
                                        <View style={{ marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#e2e8f0', borderStyle: 'dotted', alignItems: 'flex-end' }}>
                                            <Text style={{ fontSize: 7, color: '#64748b' }}>+ Hak Gono-Gini (50%): {formatCurrency(row.gonoShare)}</Text>
                                            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#059669', marginTop: 1 }}>
                                                TOTAL: {formatCurrency(row.totalReceive)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}

                        {/* Footer Table */}
                        <View style={styles.tableFooter}>
                            <Text style={[styles.th, { width: '65%', textAlign: 'right', paddingRight: 10 }]}>TOTAL NOMINAL WARIS TERBAGI</Text>
                            <Text style={[styles.th, { width: '35%', textAlign: 'right', fontSize: 10 }]}>{formatCurrency(totalWarisDistributed)}</Text>
                        </View>
                    </View>
                </View>

                {/* SECTION 5: FOOTER */}
                <View style={styles.footer}>
                    <View style={styles.disclaimer}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>DISCLAIMER:</Text>
                        <Text>
                            {DISCLAIMER_TEXTS[calculationMode]}
                        </Text>
                    </View>
                    <View style={styles.signature}>
                        <Text style={{ fontSize: 9 }}>Mengetahui,</Text>
                        <View style={styles.sigLine} />
                        <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>(Tanda Tangan)</Text>
                    </View>
                </View>

            </Page>
        </Document>
    );
}
