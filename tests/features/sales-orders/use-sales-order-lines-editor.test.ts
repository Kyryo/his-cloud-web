import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSalesOrderLinesEditor } from "@/features/sales-orders/hooks/use-sales-order-lines-editor";
import {
  addSalesOrderLine,
  updateSalesOrderLinePrice,
} from "@/features/sales-orders/services/sales-orders.service";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

vi.mock("@/features/sales-orders/services/sales-orders.service", () => ({
  addSalesOrderLine: vi.fn(),
  removeSalesOrderLine: vi.fn(),
  updateSalesOrderLine: vi.fn(),
  updateSalesOrderLinePrice: vi.fn(),
}));

const baseOrder: SalesOrder = {
  id: 4,
  name: "SO0004",
  date_order: "2026-06-24T10:00:00Z",
  state: "draft",
  invoice_status: "no",
  customer_id: 1,
  customer_uuid: "customer-uuid",
  customer_name: "Ada Lovelace",
  amount_untaxed: "0",
  amount_tax: "0",
  amount_total: "0",
  currency_code: "MWK",
  pricelist_id: null,
  pricelist_name: null,
  clinic_id: 1,
  clinic_name: "Main Clinic",
  visit_id: null,
  visit_uuid: null,
  provider_id: null,
  provider_name: null,
  insurance_scheme_id: null,
  insurance_scheme_name: null,
  insurance_company: null,
  insurance_number: null,
  insurance_number_prefix: null,
  authorization_number: null,
  lines: [],
};

describe("useSalesOrderLinesEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists a new line when the draft has a product_uuid", async () => {
    const updatedOrder: SalesOrder = {
      ...baseOrder,
      lines: [
        {
          id: 99,
          name: "Consultation",
          product_id: 12,
          product_name: "Consultation",
          quantity: "1.0000",
          price_unit: "10.0000",
          price_total: "10.00",
        },
      ],
    };

    vi.mocked(addSalesOrderLine).mockResolvedValueOnce(updatedOrder);

    const onOrderUpdated = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSalesOrderLinesEditor({
        order: baseOrder,
        canEdit: true,
        onOrderUpdated,
        onError,
      }),
    );

    act(() => {
      result.current.addLine();
    });

    const lineKey = result.current.draftLines[0]?.key;
    expect(lineKey).toBeTruthy();

    act(() => {
      result.current.updateLine(lineKey, {
        product_uuid: "11111111-1111-1111-1111-111111111111",
        productName: "Consultation",
        quantity: "1",
        price_unit: "10",
        priceUnitOverridden: true,
        isNew: false,
      });
    });

    await act(async () => {
      await result.current.saveChanges();
    });

    await waitFor(() => {
      expect(addSalesOrderLine).toHaveBeenCalledWith(4, {
        product_uuid: "11111111-1111-1111-1111-111111111111",
        quantity: "1.0000",
        price_unit: "10.0000",
      });
    });

    expect(onError).not.toHaveBeenCalled();
    expect(onOrderUpdated).toHaveBeenCalledWith(updatedOrder);
    expect(result.current.draftLines).toHaveLength(1);
    expect(result.current.draftLines[0]?.product_id).toBe(12);
  });

  it("persists a new line without requiring an explicit row confirm", async () => {
    const updatedOrder: SalesOrder = {
      ...baseOrder,
      lines: [
        {
          id: 99,
          name: "Consultation",
          product_id: 12,
          product_name: "Consultation",
          quantity: "1.0000",
          price_unit: "10.0000",
          price_total: "10.00",
        },
      ],
    };

    vi.mocked(addSalesOrderLine).mockResolvedValueOnce(updatedOrder);

    const onOrderUpdated = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSalesOrderLinesEditor({
        order: baseOrder,
        canEdit: true,
        onOrderUpdated,
        onError,
      }),
    );

    act(() => {
      result.current.addLine();
    });

    const lineKey = result.current.draftLines[0]?.key;
    expect(lineKey).toBeTruthy();
    expect(result.current.draftLines[0]?.isNew).toBe(true);

    act(() => {
      result.current.updateLine(lineKey, {
        product_uuid: "11111111-1111-1111-1111-111111111111",
        productName: "Consultation",
        quantity: "1",
        price_unit: "10",
        priceUnitOverridden: true,
      });
    });

    await act(async () => {
      await result.current.saveChanges();
    });

    await waitFor(() => {
      expect(addSalesOrderLine).toHaveBeenCalledWith(4, {
        product_uuid: "11111111-1111-1111-1111-111111111111",
        quantity: "1.0000",
        price_unit: "10.0000",
      });
    });

    expect(onError).not.toHaveBeenCalled();
    expect(onOrderUpdated).toHaveBeenCalledWith(updatedOrder);
  });

  it("surfaces an error when a line has no product reference", async () => {
    const onOrderUpdated = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSalesOrderLinesEditor({
        order: baseOrder,
        canEdit: true,
        onOrderUpdated,
        onError,
      }),
    );

    act(() => {
      result.current.addLine();
    });

    const lineKey = result.current.draftLines[0]?.key;
    expect(lineKey).toBeTruthy();

    act(() => {
      result.current.updateLine(lineKey, {
        productName: "Consultation",
        quantity: "1",
        price_unit: "10",
        isNew: false,
      });
    });

    await act(async () => {
      await result.current.saveChanges();
    });

    expect(onError).toHaveBeenCalledWith(
      "Each line item must have a product selected.",
    );
    expect(addSalesOrderLine).not.toHaveBeenCalled();
    expect(onOrderUpdated).not.toHaveBeenCalled();
  });

  it("blocks save when a co-payment line split no longer matches the edited total", async () => {
    const orderWithCoPaymentLine: SalesOrder = {
      ...baseOrder,
      lines: [
        {
          id: 55,
          name: "Consultation",
          product_id: 12,
          product_name: "Consultation",
          quantity: "1.0000",
          price_unit: "100.0000",
          price_total: "100.00",
          client_due: "20.00",
          insurer_due: "80.00",
          pricing_rule_snapshot: { rule_types: ["CO_PAYMENT"] },
        },
      ],
    };

    const onOrderUpdated = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSalesOrderLinesEditor({
        order: orderWithCoPaymentLine,
        canEdit: true,
        onOrderUpdated,
        onError,
      }),
    );

    const lineKey = result.current.draftLines[0]?.key;
    expect(lineKey).toBeTruthy();

    act(() => {
      result.current.updateLine(lineKey, { price_unit: "120" });
    });

    expect(result.current.splitMismatchKeys.size).toBe(1);

    await act(async () => {
      await result.current.saveChanges();
    });

    expect(onError).toHaveBeenCalledWith(
      "Please fix the client/insurance amount mismatch before continuing.",
    );
    expect(updateSalesOrderLinePrice).not.toHaveBeenCalled();
    expect(onOrderUpdated).not.toHaveBeenCalled();
  });

  it("includes adjusted split values in the price update payload", async () => {
    const orderWithCoPaymentLine: SalesOrder = {
      ...baseOrder,
      lines: [
        {
          id: 55,
          name: "Consultation",
          product_id: 12,
          product_name: "Consultation",
          quantity: "1.0000",
          price_unit: "100.0000",
          price_total: "100.00",
          client_due: "20.00",
          insurer_due: "80.00",
          pricing_rule_snapshot: { rule_types: ["CO_PAYMENT"] },
        },
      ],
    };

    const updatedOrder: SalesOrder = {
      ...orderWithCoPaymentLine,
      lines: [
        {
          ...orderWithCoPaymentLine.lines![0]!,
          price_unit: "120.0000",
          price_total: "120.00",
          client_due: "40.00",
          insurer_due: "80.00",
        },
      ],
    };

    vi.mocked(updateSalesOrderLinePrice).mockResolvedValueOnce(updatedOrder);

    const onOrderUpdated = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSalesOrderLinesEditor({
        order: orderWithCoPaymentLine,
        canEdit: true,
        onOrderUpdated,
        onError,
      }),
    );

    const lineKey = result.current.draftLines[0]?.key;
    expect(lineKey).toBeTruthy();

    act(() => {
      result.current.updateLine(lineKey, {
        price_unit: "120",
        adjustedClientDue: "40",
        adjustedInsurerDue: "80",
      });
    });

    await act(async () => {
      await result.current.saveChanges();
    });

    await waitFor(() => {
      expect(updateSalesOrderLinePrice).toHaveBeenCalledWith(4, 55, {
        price_unit: "120.0000",
        client_due: "40.00",
        insurer_due: "80.00",
      });
    });

    expect(onError).not.toHaveBeenCalled();
    expect(onOrderUpdated).toHaveBeenCalledWith(updatedOrder);
  });

  it("saves a reconciled split immediately via saveLineSplitAdjustment", async () => {
    const orderWithCoPaymentLine: SalesOrder = {
      ...baseOrder,
      lines: [
        {
          id: 55,
          name: "Consultation",
          product_id: 12,
          product_name: "Consultation",
          quantity: "1.0000",
          price_unit: "100.0000",
          price_total: "100.00",
          client_due: "20.00",
          insurer_due: "80.00",
          pricing_rule_snapshot: { rule_types: ["CO_PAYMENT"] },
        },
      ],
    };

    const updatedOrder: SalesOrder = {
      ...orderWithCoPaymentLine,
      amount_total: "120.00",
      lines: [
        {
          ...orderWithCoPaymentLine.lines![0]!,
          price_unit: "120.0000",
          price_total: "120.00",
          client_due: "40.00",
          insurer_due: "80.00",
        },
      ],
    };

    vi.mocked(updateSalesOrderLinePrice).mockResolvedValueOnce(updatedOrder);

    const onOrderUpdated = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useSalesOrderLinesEditor({
        order: orderWithCoPaymentLine,
        canEdit: true,
        onOrderUpdated,
        onError,
      }),
    );

    const lineKey = result.current.draftLines[0]?.key;
    expect(lineKey).toBeTruthy();

    act(() => {
      result.current.updateLine(lineKey, { price_unit: "120" });
    });

    expect(result.current.splitMismatchKeys.size).toBe(1);

    let saved = false;
    await act(async () => {
      saved = await result.current.saveLineSplitAdjustment(lineKey, {
        adjustedClientDue: "40",
        adjustedInsurerDue: "80",
      });
    });

    expect(saved).toBe(true);
    expect(updateSalesOrderLinePrice).toHaveBeenCalledWith(4, 55, {
      price_unit: "120.0000",
      client_due: "40.00",
      insurer_due: "80.00",
    });
    expect(onOrderUpdated).toHaveBeenCalledWith(updatedOrder);
    expect(result.current.splitMismatchKeys.size).toBe(0);
    expect(onError).not.toHaveBeenCalled();
  });
});
