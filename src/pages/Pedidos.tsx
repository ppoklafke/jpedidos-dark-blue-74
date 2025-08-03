import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrders, type OrderFormData } from "@/hooks/useOrders";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderForm } from "@/components/OrderForm";
import { Plus, Search, Edit, Eye, Trash2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Dados reais do Supabase

export default function Pedidos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const { orders, loading, createOrder, updateOrder, updateOrderStatus, deleteOrder } = useOrders();
  const { clients } = useClients();
  const { products } = useProducts();
  
  // Modal states
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  
  // Selected order states
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFormMode, setOrderFormMode] = useState<"create" | "edit">("create");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || order.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleAddOrder = () => {
    setSelectedOrder(null);
    setOrderFormMode("create");
    setIsOrderFormOpen(true);
  };

  const handleEditOrder = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setOrderFormMode("edit");
      setIsOrderFormOpen(true);
    }
  };

  const handleViewOrder = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsViewDialogOpen(true);
    }
  };

  const handleDeleteOrder = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleCloseOrder = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setIsCloseDialogOpen(true);
    }
  };

  const confirmDeleteOrder = async () => {
    if (selectedOrder) {
      await deleteOrder(selectedOrder.id);
      setIsDeleteDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  const confirmCloseOrder = async () => {
    if (selectedOrder) {
      await updateOrderStatus(selectedOrder.id, "Fechado");
      setIsCloseDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  // Convert database order to OrderForm format
  const convertToOrderFormData = (order: any) => {
    return {
      id: order.id,
      clientId: order.client_id || 0,
      date: new Date(order.order_date),
      status: order.status as "Aberto" | "Fechado",
      withInvoice: order.with_invoice || false,
      total: order.total_amount || 0,
      items: order.order_items?.map((item: any) => ({
        productId: item.product_id || 0,
        productName: products.find(p => p.id === item.product_id)?.name || "",
        quantity: item.quantity || 1,
        unitPrice: item.unit_price || 0,
        total: item.total_price || 0
      })) || []
    };
  };


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Pedidos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os seus pedidos
            </p>
          </div>
          <Button onClick={handleAddOrder} className="bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Pedidos ({filteredOrders.length})
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
                 {filteredOrders.map((order) => (
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
                       <Badge variant={order.status === "Aberto" ? "secondary" : "default"}>
                         {order.status}
                       </Badge>
                     </TableCell>
                     <TableCell className="text-right">
                       <div className="flex justify-end space-x-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleViewOrder(order.id)}
                         >
                           <Eye className="h-4 w-4" />
                         </Button>
                         
                         {order.status === "Aberto" && (
                           <>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleEditOrder(order.id)}
                             >
                               <Edit className="h-4 w-4" />
                             </Button>
                             <Button
                               variant="default"
                               size="sm"
                               onClick={() => handleCloseOrder(order.id)}
                             >
                               <CheckCircle className="h-4 w-4" />
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleDeleteOrder(order.id)}
                             >
                               <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                           </>
                         )}
                       </div>
                     </TableCell>
                   </TableRow>
                 ))}
                 {filteredOrders.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                       Nenhum pedido encontrado
                     </TableCell>
                   </TableRow>
                 )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Form Modal */}
        <OrderForm
          open={isOrderFormOpen}
          onOpenChange={setIsOrderFormOpen}
          order={selectedOrder ? convertToOrderFormData(selectedOrder) : undefined}
          mode={orderFormMode}
          onSubmit={async (data: OrderFormData, id?: number) => {
            if (orderFormMode === "edit" && id) {
              return await updateOrder(id, data);
            } else {
              return await createOrder(data);
            }
          }}
          clients={clients.map(c => ({ id: c.id, name: c.name }))}
          products={products.map(p => ({ id: p.id, description: p.name, unitPrice: p.price, status: "Ativo" }))}
        />

        {/* View Order Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data</label>
                    <p className="font-medium">{formatDate(selectedOrder.order_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                    <p className="font-medium">{selectedOrder.clients?.name}</p>
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
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Itens do Pedido</label>
                    <div className="mt-2 space-y-2">
                      {selectedOrder.order_items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>{products.find(p => p.id === item.product_id)?.name || `Produto ID: ${item.product_id}`}</span>
                          <span>Qtd: {item.quantity} x {formatCurrency(item.unit_price)} = {formatCurrency(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Valor Total</label>
                    <p className="text-2xl font-bold">{formatCurrency(selectedOrder.total_amount)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
               <AlertDialogDescription>
                 Tem certeza que deseja excluir este pedido? 
                 Esta ação não pode ser desfeita.
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteOrder} className="bg-destructive hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Close Order Confirmation Dialog */}
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