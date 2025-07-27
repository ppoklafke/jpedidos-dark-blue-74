import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: number;
  name: string;
  cpf_cnpj: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  name: string;
  document: string;
  type: "PF" | "PJ";
  fantasyName?: string;
  stateRegistration?: string;
  phone: string;
  email: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  observations?: string;
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: ClientFormData) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: clientData.name,
          cpf_cnpj: clientData.document,
          email: clientData.email,
          phone: clientData.phone,
          street: clientData.address.street,
          number: clientData.address.number,
          complement: clientData.address.complement,
          neighborhood: clientData.address.neighborhood,
          city: clientData.address.city,
          state: clientData.address.state,
          zip_code: clientData.address.zipCode,
        })
        .select()
        .single();

      if (error) throw error;

      setClients(prev => [...prev, data]);
      toast({
        title: "Cliente criado!",
        description: `${clientData.name} foi adicionado com sucesso.`,
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const updateClient = async (id: number, clientData: ClientFormData) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          cpf_cnpj: clientData.document,
          email: clientData.email,
          phone: clientData.phone,
          street: clientData.address.street,
          number: clientData.address.number,
          complement: clientData.address.complement,
          neighborhood: clientData.address.neighborhood,
          city: clientData.address.city,
          state: clientData.address.state,
          zip_code: clientData.address.zipCode,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setClients(prev => prev.map(client => 
        client.id === id ? data : client
      ));
      
      toast({
        title: "Cliente atualizado!",
        description: `${clientData.name} foi atualizado com sucesso.`,
      });
      
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  const deleteClient = async (id: number) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.filter(client => client.id !== id));
      toast({
        title: "Cliente removido",
        description: "Cliente foi removido com sucesso.",
      });
      
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients
  };
};