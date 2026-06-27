import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, padding: 30, color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#f97316', marginBottom: 4 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 6, color: '#374151' },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 100, color: '#6b7280' },
  value: { flex: 1 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: '6 4', borderRadius: 2 },
  tableRow: { flexDirection: 'row', padding: '5 4', borderBottom: '0.5px solid #e5e7eb' },
  col1: { flex: 3 },
  col2: { width: 45, textAlign: 'center' },
  col3: { width: 55, textAlign: 'right' },
  col4: { width: 65, textAlign: 'right' },
  totalsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, padding: '3 4' },
  totalsLabel: { width: 120, textAlign: 'right', color: '#6b7280' },
  totalsValue: { width: 70, textAlign: 'right' },
  grandTotal: { borderTop: '1.5px solid #1a1a1a', paddingTop: 4, fontWeight: 'bold', fontSize: 10 },
  footer: { marginTop: 20, borderTop: '0.5px solid #e5e7eb', paddingTop: 10, color: '#9ca3af', fontSize: 8 },
})

interface LineItem {
  name: string
  hsnCode: string
  quantity: number
  unitPrice: number
  taxableValue: number
}

interface InvoiceProps {
  invoiceNumber: string
  invoiceDate: string
  seller: { name: string; address: string; gstin: string; state: string }
  buyer: { name: string; address: string; state: string; phone?: string | null }
  items: LineItem[]
  subtotal: number
  shipping: number
  discount: number
  taxAmount: number
  isInterState: boolean
  total: number
  paymentMethod: string
}

export function GstInvoiceDoc({
  invoiceNumber, invoiceDate, seller, buyer, items,
  subtotal, shipping, discount, taxAmount, isInterState, total, paymentMethod,
}: InvoiceProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>TAX INVOICE</Text>
          <Text style={{ fontSize: 9, color: '#6b7280' }}>GSTIN: 33AAUCM2609Q1ZT</Text>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>Mealicious Ventures Private Limited</Text>
            <Text style={{ color: '#6b7280', marginTop: 3, lineHeight: 1.3 }}>
              1/108, Elappankadu, Malankadu, Uthamasolapuram, Salem - 636010, Tamil Nadu, India
            </Text>
            <Text style={{ color: '#6b7280', marginTop: 3 }}>GSTIN: 33AAUCM2609Q1ZT</Text>
            <Text style={{ color: '#6b7280' }}>CIN: U10799TZ2025PTC037179</Text>
            <Text style={{ color: '#6b7280' }}>FSSAI: 22426193000120</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            <Text style={{ fontWeight: 'bold' }}>{buyer.name}</Text>
            <Text style={{ color: '#6b7280', marginTop: 2 }}>{buyer.address}</Text>
            <Text style={{ color: '#6b7280' }}>State: {buyer.state}</Text>
            {buyer.phone && <Text style={{ color: '#6b7280' }}>Phone: {buyer.phone}</Text>}
          </View>
          <View style={{ width: 140 }}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={styles.row}><Text style={styles.label}>Invoice No:</Text><Text style={styles.value}>{invoiceNumber}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Date:</Text><Text style={styles.value}>{invoiceDate}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Payment:</Text><Text style={styles.value}>{paymentMethod}</Text></View>
          </View>
        </View>

        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Item Description</Text>
            <Text style={styles.col2}>HSN</Text>
            <Text style={styles.col2}>Qty</Text>
            <Text style={styles.col3}>Unit Price</Text>
            <Text style={styles.col4}>Amount</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.col1}>{item.name}</Text>
              <Text style={styles.col2}>{item.hsnCode}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>₹{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.col4}>₹{item.taxableValue.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 10 }}>
          {[
            { label: 'Subtotal', value: subtotal },
            { label: 'Shipping', value: shipping },
            ...(discount > 0 ? [{ label: 'Discount', value: -discount }] : []),
          ].map(({ label, value }, i) => (
            <View key={i} style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>{label}</Text>
              <Text style={styles.totalsValue}>₹{value.toFixed(2)}</Text>
            </View>
          ))}
          <View style={[styles.totalsRow, styles.grandTotal]}>
            <Text style={styles.totalsLabel}>Grand Total</Text>
            <Text style={styles.totalsValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>This is a computer-generated invoice and does not require a signature.</Text>
          <Text style={{ marginTop: 4 }}>Thank you for shopping with Mealicious Ventures Private Limited!</Text>
        </View>
      </Page>
    </Document>
  )
}
