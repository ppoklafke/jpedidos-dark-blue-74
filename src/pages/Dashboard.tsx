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
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
import { Eye, CheckCircle, DollarSign, ShoppingCart, Users, Package, X, BarChart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [kpis, setKpis] = useState({
    orders: 0,
    revenue: 0,
    customers: 0,
    products: 0,
    totalProductsSold: 0
  });

  const { orders, updateOrderStatus } = useOrders();
  const { clients } = useClients();
  const { products } = useProducts();
  const isMobile = useIsMobile();

  // Função para filtrar dados baseado no período selecionado
  const getFilteredOrders = () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Semana atual: domingo a sábado
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Semana passada: domingo a sábado da semana anterior
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let startDate: Date;
    let endDate: Date | null = null;
    
    switch (selectedPeriod) {
      case "today":
        startDate = startOfDay;
        break;
      case "thisWeek":
        startDate = startOfWeek;
        break;
      case "lastWeek":
        startDate = startOfLastWeek;
        endDate = endOfLastWeek;
        break;
      case "thisMonth":
        startDate = startOfMonth;
        break;
      default:
        startDate = startOfDay;
    }

    return orders.filter(order => {
      const orderDate = new Date(order.order_date);
      if (endDate) {
        return orderDate >= startDate && orderDate <= endDate;
      }
      return orderDate >= startDate;
    });
  };

  // Função para formatar o período selecionado
  const getFormattedPeriod = () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    switch (selectedPeriod) {
      case "today":
        return `Hoje - ${startOfDay.toLocaleDateString('pt-BR')}`;
      case "thisWeek":
        return `Esta Semana - ${startOfWeek.toLocaleDateString('pt-BR')} a ${endOfWeek.toLocaleDateString('pt-BR')}`;
      case "lastWeek":
        return `Semana Passada - ${startOfLastWeek.toLocaleDateString('pt-BR')} a ${endOfLastWeek.toLocaleDateString('pt-BR')}`;
      case "thisMonth":
        return `Este Mês - ${startOfMonth.toLocaleDateString('pt-BR')} a ${endOfMonth.toLocaleDateString('pt-BR')}`;
      default:
        return `Hoje - ${startOfDay.toLocaleDateString('pt-BR')}`;
    }
  };

  // Calcular KPIs baseado no período selecionado
  useEffect(() => {
    const filteredOrders = getFilteredOrders();
    const closedOrdersInPeriod = filteredOrders.filter(order => order.status === "Fechado");
    const revenueInPeriod = closedOrdersInPeriod.reduce((sum, order) => sum + order.total_amount, 0);
    
    // Calcular total de produtos vendidos no período
    const totalProductsSold = closedOrdersInPeriod.reduce((total, order) => {
      const orderTotal = order.order_items?.reduce((orderSum: number, item: any) => {
        return orderSum + item.quantity;
      }, 0) || 0;
      return total + orderTotal;
    }, 0);

    // Contar clientes únicos no período
    const uniqueClientIds = new Set(filteredOrders.map(order => order.client_id));
    
    setKpis({
      orders: closedOrdersInPeriod.length,
      revenue: revenueInPeriod,
      customers: uniqueClientIds.size,
      products: products.length,
      totalProductsSold: totalProductsSold
    });
  }, [orders, clients, products, selectedPeriod]);

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
                <SelectItem value="lastWeek">Semana Passada</SelectItem>
                <SelectItem value="thisMonth">Este Mês</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {/* Exibir período selecionado */}
            <div className="mb-6 p-3 bg-muted/50 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Período analisado:</p>
              <p className="font-medium">{getFormattedPeriod()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                * A semana é calculada de domingo a sábado
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pedidos Fechados</p>
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
                      <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                      <p className="text-2xl font-bold">{kpis.customers}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart className="h-8 w-8 text-warning" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Produtos Vendidos</p>
                      <p className="text-2xl font-bold">{kpis.totalProductsSold}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-8 w-8 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Produtos</p>
                      <p className="text-2xl font-bold">{kpis.products}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Pedido - Responsivo */}
        {isMobile ? (
          <Drawer open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DrawerContent className="max-h-[90vh] pb-4">
              <DrawerHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <DrawerTitle>Detalhes do Pedido</DrawerTitle>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              
              {selectedOrder && (
                <div className="px-4 overflow-y-auto flex-1 space-y-6">
                  {/* Informações do Cliente */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Informações do Cliente</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nome</label>
                        <p className="font-medium">{selectedOrder.clients?.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="font-medium text-sm">{selectedOrder.clients?.email || "Não informado"}</p>
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
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data</label>
                        <p className="font-medium">{formatDate(selectedOrder.order_date)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">
                          <Badge variant={selectedOrder.status === "Aberto" ? "secondary" : "default"}>
                            {selectedOrder.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nota Fiscal</label>
                        <div className="mt-1">
                          <Badge variant={selectedOrder.with_invoice ? "default" : "secondary"}>
                            {selectedOrder.with_invoice ? "Com NF" : "Sem NF"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Itens do Pedido</h3>
                    <div className="space-y-3">
                      {selectedOrder.order_items?.map((item: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Produto</label>
                            <p className="font-medium text-sm">{products.find(p => p.id === item.product_id)?.name || `Produto ID: ${item.product_id}`}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">Qtd</label>
                              <p className="font-medium">{item.quantity}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Valor Unit.</label>
                              <p className="font-medium text-xs">{formatCurrency(item.unit_price)}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Total</label>
                              <p className="font-medium text-xs">{formatCurrency(item.total_price)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Valor Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Valor Total:</span>
                      <span className="text-xl font-bold">{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer com ação */}
              {selectedOrder?.status === "Aberto" && (
                <DrawerFooter className="border-t pt-4">
                  <Button
                    onClick={() => {
                      setIsDetailsDialogOpen(false);
                      handleCloseOrder(selectedOrder.id);
                    }}
                    className="bg-gradient-primary hover:opacity-90 w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Fechar Pedido
                  </Button>
                </DrawerFooter>
              )}
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Detalhes do Pedido</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="space-y-6 overflow-y-auto flex-1 pr-2">
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
        )}

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