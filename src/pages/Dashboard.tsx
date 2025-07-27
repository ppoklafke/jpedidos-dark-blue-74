import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, CheckCircle, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";

// Dados reais do Supabase

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [kpis, setKpis] = useState({
    orders: 0,
    revenue: 0,
    customers: 0,
    products: 0
  });

  const { orders, updateOrderStatus } = useOrders();
  const { clients } = useClients();
  const { products } = useProducts();

  // Calcular KPIs baseado nos dados reais
  useEffect(() => {
    const openOrders = orders.filter(order => order.status === "Aberto");
    const revenue = openOrders.reduce((sum, order) => sum + order.total_amount, 0);
    
    setKpis({
      orders: openOrders.length,
      revenue: revenue,
      customers: clients.length,
      products: products.length
    });
  }, [orders, clients, products]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewDetails = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsDetailsDialogOpen(true);
    }
  };

  const handleCloseOrder = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsCloseDialogOpen(true);
    }
  };

  const confirmCloseOrder = async () => {
    if (selectedOrder) {
      await updateOrderStatus(selectedOrder.id, "Fechado");
      setIsCloseDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus pedidos e análises de vendas
          </p>
        </div>

        {/* Pedidos Abertos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Pedidos Abertos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Nota Fiscal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.filter(order => order.status === "Aberto").map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{formatDate(order.order_date)}</TableCell>
                    <TableCell>{order.clients?.name}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={order.with_invoice ? "default" : "secondary"}>
                        {order.with_invoice ? "Com NF" : "Sem NF"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Painel de Análise */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Análise de Desempenho</CardTitle>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="thisWeek">Esta Semana</SelectItem>
                <SelectItem value="thisMonth">Este Mês</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pedidos</p>
                      <p className="text-2xl font-bold">{kpis.orders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-8 w-8 text-success" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Faturamento</p>
                      <p className="text-2xl font-bold">{formatCurrency(kpis.revenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-info" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                      <p className="text-2xl font-bold">{kpis.customers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-8 w-8 text-warning" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Produtos</p>
                      <p className="text-2xl font-bold">{kpis.products}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Pedido */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Informações do Cliente */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações do Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nome</label>
                      <p className="font-medium">{selectedOrder.clients?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="font-medium">{selectedOrder.clients?.email || "Não informado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                      <p className="font-medium">{selectedOrder.clients?.phone || "Não informado"}</p>
                    </div>
                  </div>
                </div>

                {/* Informações do Pedido */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações do Pedido</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data</label>
                      <p className="font-medium">{formatDate(selectedOrder.order_date)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <Badge variant={selectedOrder.status === "Aberto" ? "secondary" : "default"}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nota Fiscal</label>
                      <Badge variant={selectedOrder.with_invoice ? "default" : "secondary"}>
                        {selectedOrder.with_invoice ? "Com NF" : "Sem NF"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Itens do Pedido</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Valor Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items?.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{products.find(p => p.id === item.product_id)?.name || `Produto ID: ${item.product_id}`}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell>{formatCurrency(item.total_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Valor Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Valor Total:</span>
                    <span className="text-2xl font-bold">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>

                {/* Ações */}
                {selectedOrder.status === "Aberto" && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setIsDetailsDialogOpen(false);
                        handleCloseOrder(selectedOrder.id);
                      }}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Fechar Pedido
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Confirmação para Fechar Pedido */}
        <AlertDialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Fechar Pedido</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja fechar este pedido? 
                Pedidos fechados não podem ser editados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmCloseOrder}>
                Fechar Pedido
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}