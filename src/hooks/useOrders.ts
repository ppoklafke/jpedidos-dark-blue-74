import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  client_id: number;
  order_date: string;
  status: string;
  with_invoice: boolean;
  total_amount: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  clients?: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

export interface OrderFormData {
  clientId: number;
  date: Date;
  status: "Aberto" | "Fechado";
  withInvoice: boolean;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  total: number;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          ),
          order_items (
            *
          )
        `)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar pedidos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData: OrderFormData) => {
    try {
      // Criar o pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          client_id: orderData.clientId,
          order_date: orderData.date.toISOString().split('T')[0],
          status: orderData.status,
          with_invoice: orderData.withInvoice,
          total_amount: orderData.total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar os itens do pedido
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Buscar o pedido completo com relacionamentos
      const { data: completeOrder, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          ),
          order_items (
            *
          )
        `)
        .eq('id', order.id)
        .single();

      if (fetchError) throw fetchError;

      setOrders(prev => [completeOrder, ...prev]);
      toast({
        title: "Pedido criado!",
        description: "Pedido foi criado com sucesso.",
      });
      
      return { success: true, data: completeOrder };
    } catch (error: any) {
      toast({
        title: "Erro ao criar pedido",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateOrder = async (id: number, orderData: OrderFormData) => {
    try {
      // Atualizar o pedido
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          client_id: orderData.clientId,
          order_date: orderData.date.toISOString().split('T')[0],
          status: orderData.status,
          with_invoice: orderData.withInvoice,
          total_amount: orderData.total,
        })
        .eq('id', id);

      if (orderError) throw orderError;

      // Remover itens antigos
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (deleteError) throw deleteError;

      // Criar novos itens
      const orderItems = orderData.items.map(item => ({
        order_id: id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Buscar pedido atualizado
      await fetchOrders();
      
      toast({
        title: "Pedido atualizado!",
        description: "Pedido foi atualizado com sucesso.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar pedido",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateOrderStatus = async (id: number, status: "Aberto" | "Fechado") => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status } : order
      ));
      
      toast({
        title: "Status atualizado",
        description: `Pedido ${status === "Fechado" ? "fechado" : "reaberto"} com sucesso.`,
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      // Primeiro deletar os itens do pedido
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      if (itemsError) throw itemsError;

      // Depois deletar o pedido
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (orderError) throw orderError;

      setOrders(prev => prev.filter(order => order.id !== id));
      toast({
        title: "Pedido removido",
        description: "Pedido foi removido com sucesso.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao remover pedido",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    refetch: fetchOrders
  };
};