/**
 * Tally Prime / Tally ERP 9 XML Voucher Serializer
 * Generates standard Tally-compliant XML sales vouchers with HSN and GST ledger breakdown.
 */

export interface TallyVoucherItem {
  itemName: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface TallySalesOrder {
  orderId: string;
  orderNumber: string;
  date: Date;
  customerName: string;
  customerGst?: string | null;
  state: string;
  isInterState: boolean;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  items: TallyVoucherItem[];
}

/**
 * Format Date to Tally Standard: YYYYMMDD
 */
function formatTallyDate(date: Date): string {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

/**
 * Serializes an array of sales orders into Tally Prime XML import format
 */
export function generateTallySalesXml(orders: TallySalesOrder[]): string {
  const vouchersXml = orders
    .map((order) => {
      const tallyDate = formatTallyDate(order.date);
      const partyName = order.customerName || "Cash Customer";
      const halfTax = Math.round(order.taxAmount / 2);

      // Inventory allocations
      const inventoryXml = order.items
        .map(
          (item) => `
        <ALLINVENTORYENTRIES.LIST>
          <STOCKITEMNAME>${escapeXml(item.itemName)}</STOCKITEMNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <RATE>${item.rate.toFixed(2)}/${item.unit || "PCS"}</RATE>
          <AMOUNT>-${item.amount.toFixed(2)}</AMOUNT>
          <ACTUALQTY>${item.quantity} ${item.unit || "PCS"}</ACTUALQTY>
          <BILLEDQTY>${item.quantity} ${item.unit || "PCS"}</BILLEDQTY>
          <BATCHALLOCATIONS.LIST>
            <GODOWNNAME>Central Warehouse</GODOWNNAME>
            <BATCHNAME>Primary Batch</BATCHNAME>
            <AMOUNT>-${item.amount.toFixed(2)}</AMOUNT>
            <ACTUALQTY>${item.quantity} ${item.unit || "PCS"}</ACTUALQTY>
            <BILLEDQTY>${item.quantity} ${item.unit || "PCS"}</BILLEDQTY>
          </BATCHALLOCATIONS.LIST>
        </ALLINVENTORYENTRIES.LIST>`
        )
        .join("");

      // Tax Ledger Entries (CGST + SGST or IGST)
      const taxLedgersXml = order.isInterState
        ? `
        <LEDGERENTRIES.LIST>
          <LEDGERNAME>IGST @ 18%</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>-${order.taxAmount.toFixed(2)}</AMOUNT>
        </LEDGERENTRIES.LIST>`
        : `
        <LEDGERENTRIES.LIST>
          <LEDGERNAME>CGST @ 9%</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>-${halfTax.toFixed(2)}</AMOUNT>
        </LEDGERENTRIES.LIST>
        <LEDGERENTRIES.LIST>
          <LEDGERNAME>SGST @ 9%</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>-${halfTax.toFixed(2)}</AMOUNT>
        </LEDGERENTRIES.LIST>`;

      return `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">
        <DATE>${tallyDate}</DATE>
        <EFFECTIVEDATE>${tallyDate}</EFFECTIVEDATE>
        <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
        <VOUCHERNUMBER>${order.orderNumber}</VOUCHERNUMBER>
        <REFERENCE>${order.orderId}</REFERENCE>
        <PARTYLEDGERNAME>${escapeXml(partyName)}</PARTYLEDGERNAME>
        <PARTYNAME>${escapeXml(partyName)}</PARTYNAME>
        <STATENAME>${escapeXml(order.state || "Madhya Pradesh")}</STATENAME>
        <COUNTRYOFRESIDENCE>India</COUNTRYOFRESIDENCE>
        ${order.customerGst ? `<PARTYGSTIN>${escapeXml(order.customerGst)}</PARTYGSTIN>` : ""}
        <BASICBUYERNAME>${escapeXml(partyName)}</BASICBUYERNAME>
        <ISINVOICE>Yes</ISINVOICE>
        
        <!-- Party Debit Entry -->
        <LEDGERENTRIES.LIST>
          <LEDGERNAME>${escapeXml(partyName)}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>${order.totalAmount.toFixed(2)}</AMOUNT>
        </LEDGERENTRIES.LIST>

        <!-- Inventory Breakdown -->
        ${inventoryXml}

        <!-- Sales Tax Breakdown -->
        ${taxLedgersXml}
      </VOUCHER>
    </TALLYMESSAGE>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Khatu Shyam Trading Co.</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${vouchersXml}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
