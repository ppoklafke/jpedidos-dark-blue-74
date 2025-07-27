import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  description: string;
  unit: string;
  unitPrice: number;
  status: "Ativo" | "Inativo";
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: ProductFormData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.description,
          description: productData.description,
          price: productData.unitPrice,
          stock_quantity: 0
        })
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => [...prev, data]);
      toast({
        title: "Produto criado!",
        description: `${productData.description} foi adicionado com sucesso.`,
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateProduct = async (id: number, productData: ProductFormData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.description,
          description: productData.description,
          price: productData.unitPrice,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProducts(prev => prev.map(product => 
        product.id === id ? data : product
      ));
      
      toast({
        title: "Produto atualizado!",
        description: `${productData.description} foi atualizado com sucesso.`,
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== id));
      toast({
        title: "Produto removido",
        description: "Produto foi removido com sucesso.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao remover produto",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  return {
    products,
    loading,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  };
};