import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Order ID is required", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true, shopName: true, gstNumber: true } },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: { title: true, brand: true, sku: true, hsnCode: true, gstRate: true, unit: true },
            },
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const orderNumber = `KSTC-${order.id.slice(-8).toUpperCase()}`;
    const orderDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const formatCurrency = (amt: number) =>
      new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt);

    const subtotal = order.totalAmount - order.taxAmount + (order.discountAmount || 0);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Temporary Bill - ${orderNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #FAF8F2; color: #18231F; padding: 30px; font-size: 13px; }
    .bill-card { max-width: 820px; margin: 0 auto; background: #FFF; border: 1px solid #E5EEE8; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header-bar { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #0F8A63; }
    .logo-title { font-size: 22px; font-weight: 900; color: #0F8A63; text-transform: uppercase; letter-spacing: 0.5px; }
    .sub-brand { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 3px; }
    .warehouse-info { font-size: 11px; color: #555; line-height: 1.5; text-align: right; }
    
    .notice-banner { background: #FEF3C7; border: 2px dashed #D97706; color: #92400E; padding: 14px 18px; border-radius: 12px; margin: 24px 0; font-size: 12px; font-weight: 700; line-height: 1.5; text-align: center; }
    
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .meta-box h4 { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px; }
    .meta-box p { font-size: 13px; line-height: 1.5; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #FAF8F2; color: #18231F; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 12px; text-align: left; border-bottom: 2px solid #E5EEE8; }
    td { padding: 12px; border-bottom: 1px solid #E5EEE8; font-size: 12px; vertical-align: top; }
    .num { text-align: right; }
    
    .totals-area { display: flex; justify-content: flex-end; margin-bottom: 24px; }
    .totals-table { width: 320px; }
    .totals-table div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; }
    .totals-table .grand-total { border-top: 2px solid #0F8A63; margin-top: 8px; padding-top: 8px; font-size: 16px; font-weight: 900; color: #0F8A63; }
    
    .footer-note { border-top: 1px solid #E5EEE8; padding-top: 18px; font-size: 11px; color: #777; text-align: center; line-height: 1.5; }
    .actions-bar { text-align: center; margin-top: 24px; }
    .btn-print { background: #0F8A63; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; }
    
    @media print {
      body { background: white; padding: 0; }
      .bill-card { border: none; box-shadow: none; padding: 0; }
      .actions-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="bill-card">
    <div class="header-bar">
      <div>
        <div class="logo-title">Khatu Shyam Trading Co.</div>
        <div class="sub-brand">Authorized Wholesale Distributor</div>
        <div style="font-size: 11px; color: #666; margin-top: 4px;">Sentini Flopipes &bull; Polyworld Tanks &bull; Johnson Pedders</div>
      </div>
      <div class="warehouse-info">
        <strong>Central Warehouse Showroom:</strong><br>
        Vaibhav Enclave, Maharajpura<br>
        Gwalior, Madhya Pradesh 474005<br>
        Phone: +91 93404 86840 / +91 90749 12742<br>
        GSTIN: 23AABCK1234F1Z9
      </div>
    </div>

    <!-- MANDATORY TEMPORARY NOTICE -->
    <div class="notice-banner">
      ⚠️ NOTICE: THIS BILL IS SYSTEM GENERATED AND TEMPORARY.<br>
      Your official finalized Tax Invoice will be sent to your provided email-id or mobile number soon after stock dispatch from our warehouse.
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h4>Order &amp; Payment Details</h4>
        <p>
          <strong>Temporary Bill Ref:</strong> ${orderNumber}<br>
          <strong>Order Date:</strong> ${orderDate}<br>
          <strong>Payment Method:</strong> ${order.paymentMethod} (Sandbox / Verified)<br>
          <strong>Payment Status:</strong> ${order.paymentStatus}<br>
          <strong>Fulfillment Type:</strong> ${order.deliveryType === "PICKUP" ? "Warehouse Pickup" : "Local Delivery"}
        </p>
      </div>
      <div class="meta-box">
        <h4>Customer &amp; Delivery Destination</h4>
        <p>
          <strong>${order.user.shopName || order.user.name || "Customer"}</strong><br>
          ${order.user.gstNumber ? `GSTIN: ${order.user.gstNumber}<br>` : ""}
          Phone: ${order.user.phone || "N/A"}<br>
          Email: ${order.user.email}<br>
          ${order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}` : "Central Warehouse Delivery Point"}
        </p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px;">#</th>
          <th>Description of Items</th>
          <th style="width: 80px;">HSN</th>
          <th style="width: 70px;" class="num">Qty</th>
          <th style="width: 100px;" class="num">Unit Price</th>
          <th style="width: 100px;" class="num">Total (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${item.product.title}</strong><br>
            <span style="font-size: 11px; color: #666;">Brand: ${item.product.brand || "KSTC"} &bull; SKU: ${item.product.sku || "N/A"}</span>
          </td>
          <td>${item.product.hsnCode || "3917"}</td>
          <td class="num">${item.quantity} ${item.product.unit || "PCS"}</td>
          <td class="num">${formatCurrency(item.unitPrice)}</td>
          <td class="num"><strong>${formatCurrency(item.unitPrice * item.quantity)}</strong></td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals-area">
      <div class="totals-table">
        <div>
          <span>Item Subtotal:</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        ${
          order.discountAmount > 0
            ? `<div style="color: #0F8A63; font-weight: bold;">
                 <span>Consultant / Referral Discount:</span>
                 <span>-${formatCurrency(order.discountAmount)}</span>
               </div>`
            : ""
        }
        <div>
          <span>GST (18% Estimated):</span>
          <span>${formatCurrency(order.taxAmount)}</span>
        </div>
        <div>
          <span>Delivery / Freight:</span>
          <span style="color: #0F8A63; font-weight: bold;">FREE</span>
        </div>
        <div class="grand-total">
          <span>Amount Paid:</span>
          <span>${formatCurrency(order.totalAmount)}</span>
        </div>
      </div>
    </div>

    <div class="footer-note">
      This document confirms receipt of your order and payment authorization.<br>
      KSTC official tax invoice will be uploaded by our billing desk and dispatched via email / SMS.<br>
      For urgent inquiries, contact our Gwalior warehouse sales desk: +91 93404 86840.
    </div>

    <div class="actions-bar">
      <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    console.error("temporary-bill route error:", error);
    return new NextResponse("Failed to generate temporary bill", { status: 500 });
  }
}
