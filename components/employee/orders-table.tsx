'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderActions } from '@/app/(admin)/admin/objednavky/order-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  createdAt: Date;
  requestedDeliveryDate: Date | null;
  paymentType: string;
  note: string | null;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
}

interface EmployeeOrdersTableProps {
  orders: Order[];
}

export function EmployeeOrdersTable({ orders }: EmployeeOrdersTableProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: string): BadgeProps['variant'] => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'CONFIRMED': return 'default';
      case 'BAKING': return 'default';
      case 'READY': return 'outline';
      case 'COMPLETED': return 'outline';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Čeká na schválení';
      case 'CONFIRMED': return 'Schváleno';
      case 'BAKING': return 'Ve výrobě';
      case 'READY': return 'Připraveno';
      case 'COMPLETED': return 'Dokončeno';
      case 'CANCELLED': return 'Zrušeno';
      default: return status;
    }
  };

  const getPaymentLabel = (type: string) => {
    switch (type) {
      case 'CASH_ON_DELIVERY': return 'Hotově / na místě';
      case 'ONLINE_CARD': return 'Online kartou';
      case 'INVOICE': return 'Faktura';
      default: return type;
    }
  };

  // Filtrování objednávek podle data dodání
  const filteredOrders = useMemo(() => {
    if (!selectedDate) return orders;

    return orders.filter((order) => {
      if (!order.requestedDeliveryDate) return false;
      const orderDate = new Date(order.requestedDeliveryDate)
        .toISOString()
        .split('T')[0];
      return orderDate === selectedDate;
    });
  }, [orders, selectedDate]);

  // Získání seznamu jedinečných dat dodání pro návrhy
  const deliveryDates = useMemo(() => {
    return Array.from(
      new Set(
        orders
          .filter((o) => o.requestedDeliveryDate)
          .map((o) => new Date(o.requestedDeliveryDate!).toISOString().split('T')[0])
      )
    ).sort();
  }, [orders]);

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Správa objednávek</h1>

        {/* Filtr */}
        <div className="mb-6 space-y-2">
          <label className="block text-sm font-medium">
            Filtrovat podle data dodání
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Vyberte datum"
              className="max-w-xs"
            />
            {selectedDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate('')}
              >
                <X className="w-4 h-4 mr-1" />
                Zrušit filtr
              </Button>
            )}
          </div>
          {deliveryDates.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              Dostupná data dodání: {deliveryDates.join(', ')}
            </div>
          )}
        </div>

        {/* Tabulka */}
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Číslo</TableHead>
                <TableHead>Zákazník</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead>Platba</TableHead>
                <TableHead>Na kdy</TableHead>
                <TableHead>Obsah</TableHead>
                <TableHead>Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/zamestnanec/objednavky/${order.id}`}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>{order.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getPaymentLabel(order.paymentType)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.requestedDeliveryDate ? (
                        new Date(order.requestedDeliveryDate).toLocaleDateString(
                          'cs-CZ'
                        )
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Neuvedeno
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Zobrazit
                      </Button>
                    </TableCell>
                    <TableCell>
                      <OrderActions
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {selectedDate
                      ? 'Žádné objednávky na toto datum'
                      : 'Žádné objednávky'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal s obsahem objednávky */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Objednávka č. {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.user.name} ({selectedOrder?.user.email})
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Základní info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Stav</p>
                  <Badge variant={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Na kdy</p>
                  <p className="font-medium">
                    {selectedOrder.requestedDeliveryDate
                      ? new Date(
                          selectedOrder.requestedDeliveryDate
                        ).toLocaleDateString('cs-CZ')
                      : 'Neuvedeno'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Platba</p>
                  <p className="font-medium">
                    {getPaymentLabel(selectedOrder.paymentType)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Objednáno</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString(
                      'cs-CZ'
                    )}
                  </p>
                </div>
              </div>

              {/* Položky objednávky */}
              <div>
                <h3 className="font-semibold mb-3">Obsah objednávky</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-muted rounded"
                    >
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Počet: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Poznámka */}
              {selectedOrder.note && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Poznámka</h3>
                  <p className="text-sm bg-muted p-3 rounded">
                    {selectedOrder.note}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
