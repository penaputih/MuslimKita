import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { formatCurrency } from '@/lib/utils';
import { IndividualHeir, HEIR_LABELS } from '@/lib/waris';
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
    };
    heirs: IndividualHeir[];
    result: CalculationResult;
    deceasedGender: "L" | "P";
}

export function WarisPdfDocument({ data, heirs, result, deceasedGender }: WarisPdfDocumentProps) {
    const parseVal = (val: string) => parseInt(val.replace(/\D/g, "") || "0");
    const numAssets = parseVal(data.assets);
    const numTajhiz = parseVal(data.tajhiz);
    const numDebt = parseVal(data.debt);
    const numWasiat = parseVal(data.wasiat);

    const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

    // Prepare Rows
    const rows = heirs.map((inputHeir) => {
        const matched = result.finalHeirs.find(r => r.id === inputHeir.id);
        let reasonText = matched?.note || "";
        const isAsabah = matched?.finalShareText?.includes("Sisa") || matched?.baseShareText === "Asabah";

        if (!reasonText && isAsabah) {
            reasonText = "Sisa (Asabah)";
        }

        return {
            ...inputHeir,
            role: HEIR_LABELS[inputHeir.type],
            share: matched?.finalShareText || "-",
            amount: matched?.finalAmount || 0,
            status: matched?.faraidStatus || "Ashabul Furud",
            note: reasonText,
            isAsabah
        };
    });

    const totalDistributed = rows.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>LAPORAN PEMBAGIAN WARIS ISLAM</Text>
                    <Text style={styles.subtitle}>
                        Dicetak otomatis oleh Aplikasi DISA - Daarussyifa Islamic Super App pada {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </Text>
                </View>

                {/* SECTION 1: HARTA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. HARTA PENINGGALAN (TIRKAH)</Text>
                    <View style={styles.hartaGrid}>
                        <View style={styles.hartaCol}>
                            <View style={styles.rowDotted}>
                                <Text style={styles.label}>Total Aset</Text>
                                <Text style={styles.value}>{formatCurrency(numAssets)}</Text>
                            </View>
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
                        <Text style={styles.label}>Total Telah Terbagi</Text>
                        <Text style={styles.value}>{formatCurrency(totalDistributed)}</Text>
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
                <View style={styles.section}>
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

                                <Text style={[styles.td, styles.colAmount, { fontWeight: 'bold' }]}>
                                    {formatCurrency(row.amount)}
                                </Text>
                            </View>
                        ))}

                        {/* Footer Table */}
                        <View style={styles.tableFooter}>
                            <Text style={[styles.th, { width: '65%', textAlign: 'right', paddingRight: 10 }]}>TOTAL NOMINAL TERBAGI</Text>
                            <Text style={[styles.th, { width: '35%', textAlign: 'right', fontSize: 10 }]}>{formatCurrency(totalDistributed)}</Text>
                        </View>
                    </View>
                </View>

                {/* SECTION 5: FOOTER */}
                <View style={styles.footer}>
                    <View style={styles.disclaimer}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>DISCLAIMER:</Text>
                        <Text>
                            Perhitungan ini menggunakan kaidah Fiqh Mawaris Mazhab Syafi'i standar. Angka yang tertera adalah hasil ijtihad sistem berdasarkan input Anda. Mohon konsultasikan kembali dengan Asatidz atau ulama setempat untuk penetapan final dan eksekusi pembagian.
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
